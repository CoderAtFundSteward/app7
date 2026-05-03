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


class QuickBooksSetupStatusResponse(BaseModel):
    """Non-secret summary for verifying Intuit Developer app vs server env (call GET /api/qb/setup-status)."""

    oauth_client_configured: bool
    has_client_secret: bool
    qb_environment: str
    redirect_uri: str
    client_id_masked: str
    oauth_authorize_host: str
    expected_scope: str
    frontend_base_url: str
    intuit_portal_checks: list[str]


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


class SpreadsheetUploadResponse(BaseModel):
    upload_id: str
    file_name: str
    file_type: str
    rows_imported: int


class SpreadsheetUploadSummary(BaseModel):
    id: str
    file_name: str
    file_type: str
    row_count: int
    uploaded_at: str


class Transaction(BaseModel):
    id: str
    txn_date: str = Field(description="Transaction date in YYYY-MM-DD format.")
    amount: float
    currency: str = "USD"
    description: str
    account_name: str
