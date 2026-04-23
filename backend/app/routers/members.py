from fastapi import APIRouter, Depends, HTTPException

from app.auth.member_auth import AuthMember, require_auth
from app.database.supabase import get_supabase_client
from app.models.schemas import MemberProfile, QBStatus, UpdateMemberRequest
from app.services.quickbooks_service import get_connection_status

router = APIRouter()


def _ensure_member_row(auth_member: AuthMember) -> dict:
    supabase = get_supabase_client()
    response = (
        supabase.table("members")
        .select("id,email,full_name,subscription_tier,created_at")
        .eq("id", auth_member["id"])
        .limit(1)
        .execute()
    )
    rows = response.data or []
    if rows:
        return rows[0]

    # Auto-provision on first authenticated request.
    created = (
        supabase.table("members")
        .insert(
            {
                "id": auth_member["id"],
                "email": auth_member["email"],
                "full_name": None,
                "subscription_tier": "free",
            }
        )
        .execute()
    )
    created_rows = created.data or []
    if not created_rows:
        raise HTTPException(status_code=500, detail="Failed to create member profile.")
    return created_rows[0]


@router.get("/me", response_model=MemberProfile)
def get_me(auth_member: AuthMember = Depends(require_auth)) -> MemberProfile:
    member = _ensure_member_row(auth_member)
    return MemberProfile(
        id=member["id"],
        email=member["email"],
        full_name=member.get("full_name"),
        subscription_tier=member.get("subscription_tier", "free"),
        created_at=member["created_at"],
    )


@router.put("/me", response_model=MemberProfile)
def update_me(
    payload: UpdateMemberRequest,
    auth_member: AuthMember = Depends(require_auth),
) -> MemberProfile:
    supabase = get_supabase_client()
    _ensure_member_row(auth_member)

    updated = (
        supabase.table("members")
        .update({"full_name": payload.full_name})
        .eq("id", auth_member["id"])
        .execute()
    )
    rows = updated.data or []
    if not rows:
        raise HTTPException(status_code=500, detail="Failed to update profile.")

    row = rows[0]
    return MemberProfile(
        id=row["id"],
        email=row["email"],
        full_name=row.get("full_name"),
        subscription_tier=row.get("subscription_tier", "free"),
        created_at=row["created_at"],
    )


@router.get(
    "/me/qb-status",
    response_model=QBStatus,
)
def get_qb_status(auth_member: AuthMember = Depends(require_auth)) -> QBStatus:
    _ensure_member_row(auth_member)
    status_data = get_connection_status(auth_member["id"])
    if not status_data["connected"]:
        return QBStatus(connected=False, company_name=None, last_synced_at=None)

    last_synced_at = status_data.get("last_synced_at")
    return QBStatus(
        connected=True,
        company_name=status_data.get("company_name"),
        last_synced_at=str(last_synced_at) if last_synced_at else None,
    )
