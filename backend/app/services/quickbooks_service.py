import base64
import os
from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
from dotenv import load_dotenv
from requests_oauthlib import OAuth2Session

from app.database.supabase import get_supabase_client

try:
    from intuitlib.client import AuthClient
    from quickbooks import QuickBooks
    from quickbooks.objects.bill import Bill
    from quickbooks.objects.invoice import Invoice
    from quickbooks.objects.payment import Payment
except ImportError:  # pragma: no cover - runtime dependency guard
    AuthClient = Any  # type: ignore[assignment]
    QuickBooks = Any  # type: ignore[assignment]
    Bill = Any  # type: ignore[assignment]
    Invoice = Any  # type: ignore[assignment]
    Payment = Any  # type: ignore[assignment]

load_dotenv()


class MemberQBConnectionNotFoundError(Exception):
    """Raised when a member has no active QuickBooks connection."""


class QBRateLimitError(Exception):
    """Raised when QuickBooks API rate limit is reached."""


class QBReconnectRequiredError(Exception):
    """Raised when token refresh/auth fails and reconnect is required."""


def _get_qb_env() -> str:
    return os.getenv("QB_ENVIRONMENT", "sandbox").strip().lower()


def _get_qb_api_base() -> str:
    if _get_qb_env() == "production":
        return "https://quickbooks.api.intuit.com"
    return "https://sandbox-quickbooks.api.intuit.com"


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def _to_float(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _is_rate_limited(status_code: int | None, message: str) -> bool:
    return status_code == 429 or "429" in message.lower() or "rate limit" in message.lower()


def _is_unauthorized(status_code: int | None, message: str) -> bool:
    lowered = message.lower()
    return status_code in (401, 403) or "unauthorized" in lowered or "invalid token" in lowered


def _extract_status_code(error: Exception) -> int | None:
    for attr in ("status_code", "http_status", "status"):
        value = getattr(error, attr, None)
        if isinstance(value, int):
            return value
    return None


def _extract_quickbooks_fault_message(payload: dict[str, Any]) -> str:
    fault = payload.get("Fault", {})
    errors = fault.get("Error", [])
    if isinstance(errors, list) and errors:
        first = errors[0] or {}
        detail = first.get("Detail") or first.get("Message")
        if detail:
            return str(detail)
    return "QuickBooks API returned an error."


def _handle_qb_error(error: Exception) -> None:
    status_code = _extract_status_code(error)
    message = str(error)
    if _is_rate_limited(status_code, message):
        raise QBRateLimitError("QuickBooks API rate limit reached. Please retry later.") from error
    if _is_unauthorized(status_code, message):
        raise QBReconnectRequiredError(
            "QuickBooks authorization failed. Please reconnect your account."
        ) from error
    raise error


def _run_qbo_query(member_id: str, select_query: str) -> dict[str, Any]:
    connection = _ensure_valid_connection(member_id)
    realm_id = connection.get("realm_id")
    access_token = connection.get("access_token")
    if not realm_id or not access_token:
        raise QBReconnectRequiredError(
            "QuickBooks connection is incomplete. Please reconnect your account."
        )

    url = f"{_get_qb_api_base()}/v3/company/{realm_id}/query"
    response = httpx.post(
        url,
        content=select_query,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/text",
        },
        params={"minorversion": 75},
        timeout=30.0,
    )

    if response.status_code == 429:
        raise QBRateLimitError("QuickBooks API rate limit reached. Please retry later.")
    if response.status_code in (401, 403):
        raise QBReconnectRequiredError(
            "QuickBooks access is no longer valid. Please reconnect your account."
        )
    if response.is_error:
        raise RuntimeError(f"QuickBooks query failed: {response.text}")

    payload = response.json()
    if "Fault" in payload:
        message = _extract_quickbooks_fault_message(payload)
        if "rate limit" in message.lower():
            raise QBRateLimitError(message)
        if "token" in message.lower() or "unauthorized" in message.lower():
            raise QBReconnectRequiredError(
                "QuickBooks authorization failed. Please reconnect your account."
            )
        raise RuntimeError(message)

    query_response = payload.get("QueryResponse", {})
    return query_response if isinstance(query_response, dict) else {}


def _get_active_connection(member_id: str) -> dict[str, Any]:
    supabase = get_supabase_client()
    response = (
        supabase.table("quickbooks_connections")
        .select("*")
        .eq("member_id", member_id)
        .eq("is_active", True)
        .order("connected_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if not rows:
        raise MemberQBConnectionNotFoundError(
            "QuickBooks is not connected for this member. Please connect your QuickBooks account."
        )
    return rows[0]


def _deactivate_member_connections(member_id: str) -> None:
    get_supabase_client().table("quickbooks_connections").update({"is_active": False}).eq(
        "member_id", member_id
    ).eq("is_active", True).execute()


def _refresh_tokens(connection: dict[str, Any]) -> dict[str, Any]:
    client_id = os.getenv("QB_CLIENT_ID", "")
    client_secret = os.getenv("QB_CLIENT_SECRET", "")
    if not client_id or not client_secret:
        raise QBReconnectRequiredError(
            "QuickBooks credentials are missing on the server. Please configure QB_CLIENT_ID and QB_CLIENT_SECRET."
        )

    refresh_token = connection.get("refresh_token")
    if not refresh_token:
        raise QBReconnectRequiredError(
            "Missing QuickBooks refresh token. Please reconnect your account."
        )

    encoded = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("utf-8")
    headers = {
        "Authorization": f"Basic {encoded}",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    payload = {"grant_type": "refresh_token", "refresh_token": refresh_token}

    response = httpx.post(
        "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        data=payload,
        headers=headers,
        timeout=30.0,
    )

    if response.status_code == 429:
        raise QBRateLimitError("QuickBooks API rate limit reached while refreshing token.")
    if response.status_code in (400, 401, 403):
        raise QBReconnectRequiredError(
            "QuickBooks token refresh failed. Please reconnect your account."
        )
    if response.is_error:
        raise RuntimeError(f"QuickBooks token refresh error: {response.text}")

    data = response.json()
    expires_in = int(data.get("expires_in", 3600))
    token_expires_at = datetime.now(UTC) + timedelta(seconds=expires_in)

    supabase = get_supabase_client()
    updated = (
        supabase.table("quickbooks_connections")
        .update(
            {
                "access_token": data.get("access_token"),
                "refresh_token": data.get("refresh_token", refresh_token),
                "token_expires_at": token_expires_at.isoformat(),
                "is_active": True,
            }
        )
        .eq("id", connection["id"])
        .execute()
    )
    rows = updated.data or []
    if not rows:
        raise QBReconnectRequiredError(
            "QuickBooks token refresh failed. Please reconnect your account."
        )
    return rows[0]


def _ensure_valid_connection(member_id: str) -> dict[str, Any]:
    connection = _get_active_connection(member_id)
    expires_at = _parse_datetime(connection.get("token_expires_at"))
    # Refresh 5 minutes before expiration.
    if expires_at and datetime.now(UTC) >= (expires_at - timedelta(minutes=5)):
        return _refresh_tokens(connection)
    return connection


def get_connection_status(member_id: str) -> dict[str, Any]:
    try:
        connection = _ensure_valid_connection(member_id)
    except MemberQBConnectionNotFoundError:
        return {"connected": False, "company_name": None, "last_synced_at": None}
    except QBReconnectRequiredError:
        _deactivate_member_connections(member_id)
        return {"connected": False, "company_name": None, "last_synced_at": None}

    return {
        "connected": True,
        "company_name": connection.get("company_name"),
        "last_synced_at": connection.get("last_synced_at"),
    }


def get_qb_client(member_id: str) -> QuickBooks:
    connection = _ensure_valid_connection(member_id)
    client_id = os.getenv("QB_CLIENT_ID", "")
    client_secret = os.getenv("QB_CLIENT_SECRET", "")
    if not client_id or not client_secret:
        raise QBReconnectRequiredError(
            "QuickBooks credentials are missing on the server. Please configure QB_CLIENT_ID and QB_CLIENT_SECRET."
        )

    if QuickBooks is Any or AuthClient is Any:
        raise RuntimeError("python-quickbooks is not installed. Add it to backend dependencies.")

    auth_client = AuthClient(
        client_id=client_id,
        client_secret=client_secret,
        environment="production" if _get_qb_env() == "production" else "sandbox",
        redirect_uri=os.getenv("QB_REDIRECT_URI", ""),
    )
    auth_client.access_token = connection.get("access_token")
    auth_client.refresh_token = connection.get("refresh_token")
    auth_client.realm_id = connection.get("realm_id")

    qb_client = QuickBooks(
        auth_client=auth_client,
        company_id=connection.get("realm_id"),
        refresh_token=connection.get("refresh_token"),
        minorversion=75,
    )
    if getattr(qb_client, "session", None) is None:
        access_token = connection.get("access_token")
        refresh_token = connection.get("refresh_token")
        if not access_token:
            raise QBReconnectRequiredError(
                "QuickBooks access token is missing. Please reconnect your account."
            )
        qb_client.session = OAuth2Session(
            client_id,
            token={"access_token": access_token, "refresh_token": refresh_token},
        )

    return qb_client


def get_invoices(member_id: str, max_results: int = 50) -> list[dict[str, Any]]:
    query = f"SELECT * FROM Invoice MAXRESULTS {max_results}"
    try:
        query_response = _run_qbo_query(member_id, query)
        invoices = query_response.get("Invoice", []) or []
    except Exception as exc:
        _handle_qb_error(exc)

    results: list[dict[str, Any]] = []
    for invoice in invoices:
        customer_ref = invoice.get("CustomerRef", {}) if isinstance(invoice, dict) else {}
        balance = _to_float(invoice.get("Balance", 0))
        status = "paid" if balance == 0 else "open"
        meta = invoice.get("MetaData", {}) if isinstance(invoice, dict) else {}
        created_at = meta.get("CreateTime") if isinstance(meta, dict) else None
        results.append(
            {
                "id": str(invoice.get("Id", "")),
                "doc_number": invoice.get("DocNumber"),
                "customer_name": customer_ref.get("name") if isinstance(customer_ref, dict) else None,
                "total_amount": _to_float(invoice.get("TotalAmt", 0)),
                "balance": balance,
                "due_date": invoice.get("DueDate"),
                "status": status,
                "created_at": created_at,
            }
        )
    return results


def get_payments(member_id: str, max_results: int = 50) -> list[dict[str, Any]]:
    query = f"SELECT * FROM Payment MAXRESULTS {max_results}"
    try:
        query_response = _run_qbo_query(member_id, query)
        payments = query_response.get("Payment", []) or []
    except Exception as exc:
        _handle_qb_error(exc)

    results: list[dict[str, Any]] = []
    for payment in payments:
        customer_ref = payment.get("CustomerRef", {}) if isinstance(payment, dict) else {}
        payment_method_ref = (
            payment.get("PaymentMethodRef", {}) if isinstance(payment, dict) else {}
        )
        results.append(
            {
                "id": str(payment.get("Id", "")),
                "customer_name": customer_ref.get("name") if isinstance(customer_ref, dict) else None,
                "amount": _to_float(payment.get("TotalAmt", 0)),
                "payment_date": payment.get("TxnDate"),
                "payment_method": payment_method_ref.get("name")
                if isinstance(payment_method_ref, dict)
                else None,
            }
        )
    return results


def get_bills(member_id: str, max_results: int = 50) -> list[dict[str, Any]]:
    query = f"SELECT * FROM Bill MAXRESULTS {max_results}"
    try:
        query_response = _run_qbo_query(member_id, query)
        bills = query_response.get("Bill", []) or []
    except Exception as exc:
        _handle_qb_error(exc)

    results: list[dict[str, Any]] = []
    for bill in bills:
        vendor_ref = bill.get("VendorRef", {}) if isinstance(bill, dict) else {}
        balance = _to_float(bill.get("Balance", 0))
        status = "paid" if balance == 0 else "open"
        results.append(
            {
                "id": str(bill.get("Id", "")),
                "vendor_name": vendor_ref.get("name") if isinstance(vendor_ref, dict) else None,
                "total_amount": _to_float(bill.get("TotalAmt", 0)),
                "balance": balance,
                "due_date": bill.get("DueDate"),
                "status": status,
            }
        )
    return results


def _extract_pnl_totals(report_json: dict[str, Any]) -> dict[str, float]:
    totals = {"total_income": 0.0, "total_expenses": 0.0, "net_income": 0.0}

    def walk_rows(rows: list[dict[str, Any]]) -> None:
        for row in rows:
            summary = row.get("Summary")
            if isinstance(summary, dict):
                cols = summary.get("ColData") or []
                if cols:
                    label = str(cols[0].get("value", "")).strip().lower()
                    amount = _to_float(cols[-1].get("value"))
                    if "total income" in label:
                        totals["total_income"] = amount
                    elif "total expenses" in label:
                        totals["total_expenses"] = amount
                    elif "net income" in label:
                        totals["net_income"] = amount

            nested = row.get("Rows", {}).get("Row", [])
            if isinstance(nested, list) and nested:
                walk_rows(nested)

    rows = report_json.get("Rows", {}).get("Row", [])
    if isinstance(rows, list):
        walk_rows(rows)
    return totals


def get_profit_and_loss_summary(member_id: str) -> dict[str, float]:
    connection = _ensure_valid_connection(member_id)
    realm_id = connection.get("realm_id")
    access_token = connection.get("access_token")
    if not realm_id or not access_token:
        raise QBReconnectRequiredError(
            "QuickBooks connection is incomplete. Please reconnect your account."
        )

    url = f"{_get_qb_api_base()}/v3/company/{realm_id}/reports/ProfitAndLoss"
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
    response = httpx.get(url, headers=headers, timeout=30.0)
    if response.status_code == 429:
        raise QBRateLimitError("QuickBooks API rate limit reached. Please retry later.")
    if response.status_code in (401, 403):
        raise QBReconnectRequiredError(
            "QuickBooks access is no longer valid. Please reconnect your account."
        )
    if response.is_error:
        raise RuntimeError(f"QuickBooks reports API error: {response.text}")

    report = response.json().get("Report", {})
    return _extract_pnl_totals(report)


def _upsert_transaction_cache(
    member_id: str,
    transaction_type: str,
    qb_transaction_id: str,
    data: dict[str, Any],
) -> None:
    supabase = get_supabase_client()
    existing = (
        supabase.table("qb_transactions_cache")
        .select("id")
        .eq("member_id", member_id)
        .eq("transaction_type", transaction_type)
        .eq("qb_transaction_id", qb_transaction_id)
        .limit(1)
        .execute()
    )
    rows = existing.data or []
    payload = {
        "member_id": member_id,
        "transaction_type": transaction_type,
        "qb_transaction_id": qb_transaction_id,
        "data": data,
        "synced_at": datetime.now(UTC).isoformat(),
    }
    if rows:
        (
            supabase.table("qb_transactions_cache")
            .update(payload)
            .eq("id", rows[0]["id"])
            .execute()
        )
    else:
        supabase.table("qb_transactions_cache").insert(payload).execute()


def sync_and_cache_transactions(member_id: str) -> None:
    invoices = get_invoices(member_id)
    payments = get_payments(member_id)
    bills = get_bills(member_id)

    for invoice in invoices:
        _upsert_transaction_cache(
            member_id=member_id,
            transaction_type="Invoice",
            qb_transaction_id=invoice["id"],
            data=invoice,
        )
    for payment in payments:
        _upsert_transaction_cache(
            member_id=member_id,
            transaction_type="Payment",
            qb_transaction_id=payment["id"],
            data=payment,
        )
    for bill in bills:
        _upsert_transaction_cache(
            member_id=member_id,
            transaction_type="Bill",
            qb_transaction_id=bill["id"],
            data=bill,
        )

    connection = _get_active_connection(member_id)
    get_supabase_client().table("quickbooks_connections").update(
        {"last_synced_at": datetime.now(UTC).isoformat()}
    ).eq("id", connection["id"]).execute()


def disconnect_quickbooks(member_id: str) -> None:
    _deactivate_member_connections(member_id)
