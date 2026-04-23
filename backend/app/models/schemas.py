from pydantic import BaseModel, Field


class MemberProfile(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    subscription_tier: str = "free"
    created_at: str


class QuickBooksConnectionStatus(BaseModel):
    connected: bool
    realm_id: str | None = None
    environment: str = "sandbox"


class QuickBooksConnectURLResponse(BaseModel):
    url: str
    state: str


class QuickBooksOAuthCallbackResponse(BaseModel):
    success: bool
    message: str
    state: str | None = None
    connection: QuickBooksConnectionStatus


class QBStatus(BaseModel):
    connected: bool
    company_name: str | None = None
    last_synced_at: str | None = None


class UpdateMemberRequest(BaseModel):
    full_name: str


class Transaction(BaseModel):
    id: str
    txn_date: str = Field(description="Transaction date in YYYY-MM-DD format.")
    amount: float
    currency: str = "USD"
    description: str
    account_name: str
