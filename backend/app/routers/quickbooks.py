from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth.quickbooks import (
    QuickBooksSettings,
    build_quickbooks_connect_url,
    create_oauth_state,
)
from app.auth.member_auth import AuthMember, require_auth
from app.models.schemas import (
    QuickBooksConnectURLResponse,
    QuickBooksConnectionStatus,
    QuickBooksOAuthCallbackResponse,
)
from app.services.quickbooks_service import (
    MemberQBConnectionNotFoundError,
    QBRateLimitError,
    QBReconnectRequiredError,
    get_bills,
    get_invoices,
    get_payments,
    get_profit_and_loss_summary,
    sync_and_cache_transactions,
)

router = APIRouter()
settings = QuickBooksSettings()


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
def get_connect_url() -> QuickBooksConnectURLResponse:
    state = create_oauth_state()
    url = build_quickbooks_connect_url(settings, state)
    return QuickBooksConnectURLResponse(url=url, state=state)


@router.get("/callback", response_model=QuickBooksOAuthCallbackResponse)
def quickbooks_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    realm_id: str | None = Query(default=None, alias="realmId"),
) -> QuickBooksOAuthCallbackResponse:
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code.")

    # TODO: Exchange code for access/refresh tokens and persist securely.
    connection = QuickBooksConnectionStatus(
        connected=True,
        realm_id=realm_id,
        environment=settings.qb_environment,
    )
    return QuickBooksOAuthCallbackResponse(
        success=True,
        message="QuickBooks connected successfully (stub).",
        state=state,
        connection=connection,
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
