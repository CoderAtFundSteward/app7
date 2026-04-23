from typing import TypedDict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.supabase import get_supabase_client

security = HTTPBearer(auto_error=False)


class AuthMember(TypedDict):
    id: str
    email: str


def _extract_user_id(user: object) -> str | None:
    if hasattr(user, "id"):
        return getattr(user, "id")
    if isinstance(user, dict):
        value = user.get("id")
        return value if isinstance(value, str) else None
    return None


def _extract_user_email(user: object) -> str | None:
    if hasattr(user, "email"):
        return getattr(user, "email")
    if isinstance(user, dict):
        value = user.get("email")
        return value if isinstance(value, str) else None
    return None


def get_current_member(token: str) -> AuthMember:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
        )

    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        ) from exc

    user = getattr(user_response, "user", None)
    user_id = _extract_user_id(user)
    email = _extract_user_email(user)
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    return {"id": user_id, "email": email}


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthMember:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required.",
        )
    return get_current_member(credentials.credentials)
