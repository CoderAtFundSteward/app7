from typing import Any

import httpx
from datetime import UTC, datetime, timedelta
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from app.auth.quickbooks import (
    QuickBooksSettings,
    build_quickbooks_connect_url,
    create_oauth_state,
)
from app.auth.member_auth import AuthMember, require_auth
from app.database.supabase import get_supabase_client
from app.models.schemas import (
    QuickBooksConnectURLResponse,
    QuickBooksSetupStatusResponse,
)
from app.services.quickbooks_service import (
    MemberQBConnectionNotFoundError,
    QBRateLimitError,
    QBReconnectRequiredError,
    get_bills,
    get_invoices,
    get_payments,
    get_profit_and_loss_summary,
    disconnect_quickbooks,
    sync_and_cache_transactions,
)

router = APIRouter()
settings = QuickBooksSettings()
logger = logging.getLogger("membership-api")

_SCOPE = "com.intuit.quickbooks.accounting"
_OAUTH_AUTHORITY = "https://appcenter.intuit.com/connect/oauth2"


def _mask_client_id(client_id: str) -> str:
    cid = client_id.strip()
    if not cid:
        return "(missing)"
    if len(cid) <= 12:
        return f"{cid[:4]}…(length {len(cid)})"
    return f"{cid[:8]}…{cid[-4:]}"


def _first_frontend_url(raw: str) -> str:
    first = (raw.split(",")[0] or "").strip().rstrip("/")
    return first if first else "(missing)"


def _raise_service_error(error: Exception) -> None:
    if isinstance(error, MemberQBConnectionNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    if isinstance(error, QBRateLimitError):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="QuickBooks API rate limit hit. Please retry shortly.",
        ) from error
    if isinstance(error, QBReconnectRequiredError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="QuickBooks token refresh failed or expired. Please reconnect your account.",
        ) from error
    raise error


@router.get("/connect/url", response_model=QuickBooksConnectURLResponse)
def get_connect_url(auth_member: AuthMember = Depends(require_auth)) -> QuickBooksConnectURLResponse:
    if not (settings.qb_client_id or "").strip() or not (settings.qb_client_secret or "").strip():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "QuickBooks OAuth is not configured on the server. "
                "Set QB_CLIENT_ID and QB_CLIENT_SECRET in the backend environment."
            ),
        )
    state = f"{auth_member['id']}:{create_oauth_state()}"
    url = build_quickbooks_connect_url(settings, state)
    return QuickBooksConnectURLResponse(url=url, state=state)


@router.get("/setup-status", response_model=QuickBooksSetupStatusResponse)
def quickbooks_setup_status(
    _auth: AuthMember = Depends(require_auth),
) -> QuickBooksSetupStatusResponse:
    """Return non-secret OAuth settings so you can compare with developer.intuit.com (Keys & credentials)."""
    cid = (settings.qb_client_id or "").strip()
    has_secret = bool((settings.qb_client_secret or "").strip())
    redir = (settings.qb_redirect_uri or "").strip()
    env = (settings.qb_environment or "sandbox").strip()
    frontend = _first_frontend_url(settings.frontend_url or "")

    intuit_portal_checks = [
        f"Redirect URI on the Intuit app must exactly match this server value "
        f"(scheme, host, path; no extra slash): {redir or '(not set)'}",
        f"Environment: server QB_ENVIRONMENT is {env!r}. Use a Sandbox company + "
        "Development keys for sandbox; Production app + live QBO company when QB_ENVIRONMENT is production.",
        f"Scopes: this app requests {_SCOPE}. In Intuit Developer, enable QuickBooks Online API under "
        "the app capabilities that grant accounting access for your app type.",
        "Paste Client ID and Client Secret from the same Intuit app into Railway as QB_CLIENT_ID and QB_CLIENT_SECRET.",
        "After OAuth, users are redirected using FRONTEND_URL (first origin if comma-separated). "
        f"Effective base for success/error redirects: {frontend}",
    ]

    return QuickBooksSetupStatusResponse(
        oauth_client_configured=bool(cid and has_secret),
        has_client_secret=has_secret,
        qb_environment=env,
        redirect_uri=redir or "(not set)",
        client_id_masked=_mask_client_id(cid),
        oauth_authorize_host=_OAUTH_AUTHORITY,
        expected_scope=_SCOPE,
        frontend_base_url=frontend,
        intuit_portal_checks=intuit_portal_checks,
    )


@router.get("/callback")
def quickbooks_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    realm_id: str | None = Query(default=None, alias="realmId"),
) -> RedirectResponse:
    frontend_url = settings.frontend_url.rstrip("/")
    if not code or not state or not realm_id:
        logger.warning(
            "QuickBooks callback missing required params: code=%s state=%s realm_id=%s",
            bool(code),
            bool(state),
            bool(realm_id),
        )
        return RedirectResponse(
            url=f"{frontend_url}/dashboard/quickbooks?error=true", status_code=302
        )

    try:
        member_id = state.split(":", 1)[0]
        auth = (settings.qb_client_id, settings.qb_client_secret)
        token_response = httpx.post(
            "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
            auth=auth,
            data={"grant_type": "authorization_code", "code": code, "redirect_uri": settings.qb_redirect_uri},
            headers={"Accept": "application/json"},
            timeout=30.0,
        )
        if token_response.is_error:
            logger.error(
                "QuickBooks token exchange failed: status=%s body=%s member_id=%s realm_id=%s",
                token_response.status_code,
                token_response.text,
                member_id,
                realm_id,
            )
            token_response.raise_for_status()
        token_data = token_response.json()

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = int(token_data.get("expires_in", 3600))
        if not access_token or not refresh_token:
            logger.error(
                "QuickBooks token response missing tokens: member_id=%s realm_id=%s body=%s",
                member_id,
                realm_id,
                token_data,
            )
            return RedirectResponse(
                url=f"{frontend_url}/dashboard/quickbooks?error=true", status_code=302
            )

        company_name: str | None = None
        api_base = (
            "https://quickbooks.api.intuit.com"
            if settings.qb_environment == "production"
            else "https://sandbox-quickbooks.api.intuit.com"
        )
        company_info_url = f"{api_base}/v3/company/{realm_id}/companyinfo/{realm_id}"
        info_response = httpx.get(
            company_info_url,
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            timeout=30.0,
        )
        if info_response.is_success:
            company_name = (
                info_response.json()
                .get("CompanyInfo", {})
                .get("CompanyName")
            )
        else:
            logger.warning(
                "QuickBooks company info fetch failed (continuing): status=%s body=%s member_id=%s realm_id=%s",
                info_response.status_code,
                info_response.text,
                member_id,
                realm_id,
            )

        expires_at = datetime.now(UTC) + timedelta(seconds=expires_in)
        supabase = get_supabase_client()
        existing = (
            supabase.table("quickbooks_connections")
            .select("id")
            .eq("member_id", member_id)
            .eq("realm_id", realm_id)
            .limit(1)
            .execute()
        )
        payload = {
            "member_id": member_id,
            "realm_id": realm_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_expires_at": expires_at.isoformat(),
            "is_active": True,
            "company_name": company_name,
        }
        rows = existing.data or []
        if rows:
            (
                supabase.table("quickbooks_connections")
                .update(payload)
                .eq("id", rows[0]["id"])
                .execute()
            )
        else:
            supabase.table("quickbooks_connections").insert(payload).execute()

        logger.info(
            "QuickBooks callback success for member_id=%s realm_id=%s company_name=%s",
            member_id,
            realm_id,
            company_name,
        )
        return RedirectResponse(
            url=f"{frontend_url}/dashboard/quickbooks?connected=true", status_code=302
        )
    except Exception:
        logger.exception("QuickBooks callback failed")
        return RedirectResponse(
            url=f"{frontend_url}/dashboard/quickbooks?error=true", status_code=302
        )


@router.get("/invoices")
def list_invoices(
    max_results: int = Query(default=50, ge=1, le=500),
    auth_member: AuthMember = Depends(require_auth),
) -> list[dict[str, Any]]:
    try:
        return get_invoices(auth_member["id"], max_results=max_results)
    except Exception as exc:
        _raise_service_error(exc)


@router.get("/payments")
def list_payments(
    max_results: int = Query(default=50, ge=1, le=500),
    auth_member: AuthMember = Depends(require_auth),
) -> list[dict[str, Any]]:
    try:
        return get_payments(auth_member["id"], max_results=max_results)
    except Exception as exc:
        _raise_service_error(exc)


@router.get("/bills")
def list_bills(
    max_results: int = Query(default=50, ge=1, le=500),
    auth_member: AuthMember = Depends(require_auth),
) -> list[dict[str, Any]]:
    try:
        return get_bills(auth_member["id"], max_results=max_results)
    except Exception as exc:
        _raise_service_error(exc)


@router.get("/summary")
def get_summary(auth_member: AuthMember = Depends(require_auth)) -> dict[str, float]:
    try:
        return get_profit_and_loss_summary(auth_member["id"])
    except Exception as exc:
        _raise_service_error(exc)


@router.post("/sync")
def sync_transactions(auth_member: AuthMember = Depends(require_auth)) -> dict[str, str]:
    try:
        sync_and_cache_transactions(auth_member["id"])
        return {"status": "ok", "message": "QuickBooks transactions synced and cached."}
    except Exception as exc:
        _raise_service_error(exc)


@router.post("/disconnect", status_code=status.HTTP_204_NO_CONTENT)
def disconnect(auth_member: AuthMember = Depends(require_auth)) -> None:
    try:
        disconnect_quickbooks(auth_member["id"])
    except Exception as exc:
        _raise_service_error(exc)
