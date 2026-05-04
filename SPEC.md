# FundSteward application specification

This document describes the membership web app as implemented in this repository: **Next.js frontend**, **FastAPI backend**, and **Supabase** (auth + database). It is organized into the site shell and components, authentication, QuickBooks integration, and spreadsheet import.

---

## 1. Website and components

### Stack

- **Frontend:** Next.js 14.2 (`frontend/`), React 18, App Router, TypeScript, Tailwind CSS, SWR for data fetching.
- **Backend:** FastAPI + Uvicorn (`backend/app/`), Supabase Python client (service role for server-side DB and JWT validation).
- **Identity:** Supabase Auth (browser session + JWT). API requests send `Authorization: Bearer <access_token>`.
- **Chrome:** Manrope font (`frontend/app/layout.tsx`), global styles in `frontend/app/globals.css` (tokens such as `primary`, `secondary`, `surface`, `editorial-shadow`, `gold-gradient`).

### Routes (App Router)

| Path | Role |
|------|------|
| `/` | Marketing landing (`MarketingLanding`, nav, footer). |
| `/login`, `/signup`, `/forgot-password`, `/update-password` | Auth UI under `(auth)/layout.tsx` (dark gradient shell). |
| `/auth/callback` | Route handler: exchanges `?code=` for Supabase session (PKCE / email links); redirects to `next` (default `/update-password`). |
| `/dashboard` | Home snapshot: membership tier, QuickBooks status, invoice count when connected. |
| `/dashboard/quickbooks` | QuickBooks connect UI, spreadsheet import, P&amp;L summary, tabbed invoices / payments / bills tables. |
| `/dashboard/settings` | Signed-in password change (`supabase.auth.updateUser`). |

### Global layout and navigation

- **`app/layout.tsx`:** Loads Supabase session server-side, wraps the app in `SupabaseSessionProvider`, renders `AppNav` and `<main>`.
- **`AppNav`:** Shown on marketing-style pages only; hidden on `/`, `/dashboard/*`, `/login`, `/signup`, `/forgot-password`, `/update-password`, `/auth/*`. Links to dashboard and login/signup or logout.
- **`dashboard/layout.tsx`:** Dedicated shell: left sidebar (logo, Dashboard / QuickBooks / Settings, link to marketing site, Logout), sticky top bar (“Signed in as” + avatar initials), mobile slide-out menu.

### Component inventory

- **`components/marketing/*`:** `MarketingLanding`, `MarketingNav`, `MarketingFooter`, `FundStewardLogo`.
- **`components/SupabaseSessionProvider`:** Client session context for gated fetches and UI.
- **`components/QuickBooksConnect`:** OAuth connect, sync, disconnect, Intuit verify panel, toasts (see §3).
- **`components/SpreadsheetUploadCard`:** File picker, upload, recent uploads list (see §4).
- **`components/ui/button.tsx`:** Shared button primitive.
- **`components/TransactionTable`:** Legacy-oriented table typing; main QBO tables are implemented inline in `quickbooks/page.tsx`.

### Client API layer

- **`lib/api.ts`:** All REST calls to FastAPI. Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000` for local dev). The browser calls the API directly; CORS on FastAPI must allow the site origin. Sends the Supabase access token when present; handles 401 (optional redirect to login), 429, and FastAPI `detail` payloads.
- **`lib/hooks/useQBData.ts`:** SWR hooks (`useQBStatus`, `useMemberProfile`, `useInvoices`, …) that wait for a Supabase session before fetching.

### Middleware

- **`middleware.ts`:** For `/dashboard` and `/dashboard/:path*`, uses Supabase SSR + cookies; if there is no user, responds with **302** to `/login?redirectTo=<path>`.

---

## 2. Authentication (login and related flows)

### User-facing flows

- **Registration (`/signup`):** Email, password, and full name; `signUp` with `user_metadata.full_name`. Handles duplicate email and email-confirmation when no session is returned.
- **Login (`/login`):**
  - **Google:** `signInWithOAuth` with `redirectTo: <origin>/dashboard`.
  - **Email/password:** `signInWithPassword`; success navigates to `redirectTo` query param or `/dashboard`.
- **Forgot / reset:** Dedicated pages; recovery uses Supabase email links. `/auth/callback` exchanges `code` for a session and redirects (e.g. to `/update-password`).
- **Settings (`/dashboard/settings`):** Change password while signed in via `supabase.auth.updateUser({ password })` (email accounts).

### Backend identity

- **`backend/app/auth/member_auth.py`:** `require_auth` validates the JWT with `supabase.auth.get_user` (server uses service key).
- **Member provisioning:** `members._ensure_member_row` can auto-insert a `members` row on first authenticated request.

### Frontend environment

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also used in middleware and `/auth/callback`).

---

## 3. QuickBooks integration

### User-facing behavior

Implemented in **`QuickBooksConnect`** and **`app/dashboard/quickbooks/page.tsx`**.

| Action | API | Notes |
|--------|-----|--------|
| Connection status | `GET /api/members/me/qb-status` | `connected`, `company_name`, `last_synced_at`. |
| Start OAuth | `GET /api/qb/connect/url` | Returns `{ url, state }`; browser navigates to Intuit. Requires `QB_CLIENT_ID` and `QB_CLIENT_SECRET` or **503**. |
| Verify Intuit vs server | `GET /api/qb/setup-status` | Non-secret checklist (masked client id, redirect URI, environment, scope, `FRONTEND_URL` hints). |
| OAuth callback | `GET /api/qb/callback` | Handled on the **API** host (`code`, `state`, `realmId`). Token exchange, optional company name fetch, upsert `quickbooks_connections`, redirect to `{FRONTEND_URL}/dashboard/quickbooks?connected=true` or `?error=true`. |
| Sync | `POST /api/qb/sync` | Caches sync metadata / transactions per service logic. |
| Disconnect | `POST /api/qb/disconnect` | **204** on success. |
| P&amp;L-style summary | `GET /api/qb/summary` | Income, expenses, net income. |
| Lists | `GET /api/qb/invoices`, `/payments`, `/bills` | Query `max_results` 1–500, default 50. |

When connected, the QuickBooks page shows summary metrics and tabbed **Invoices / Payments / Bills** with search, column sort, and responsive layouts (table + mobile cards).

### Backend configuration (env)

- `QB_CLIENT_ID`, `QB_CLIENT_SECRET`
- `QB_REDIRECT_URI` — must match the Intuit app redirect URI exactly (typically `https://<api-host>/api/qb/callback`).
- `QB_ENVIRONMENT` — `sandbox` vs `production` (QBO API host selection).
- `FRONTEND_URL` — comma-separated allowed CORS origins; first segment used for OAuth success/error redirects in the callback. Optional `CORS_ORIGIN_REGEX` for patterns such as `*.vercel.app` (see `backend/app/main.py`).

### OAuth mechanics

- Authorize: `https://appcenter.intuit.com/connect/oauth2` with scope `com.intuit.quickbooks.accounting`.
- Tokens: `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`.
- QBO API: sandbox vs `quickbooks.api.intuit.com` based on `QB_ENVIRONMENT`.
- **State** format: `{member_id}:{random}`.

### Data model

- **`quickbooks_connections`:** Per-member `realm_id`, tokens, expiry, `company_name`, `is_active`, etc. (`backend/database/schema.sql`). The FastAPI server uses the **service role**; RLS policies apply to direct Supabase access.

### CORS

- Browser calls FastAPI from the web origin. `CORSMiddleware` allows configured origins with `allow_credentials=True`.

---

## 4. Spreadsheet upload and import

### User-facing (`SpreadsheetUploadCard` on the QuickBooks page)

- Accepts **`.csv`** and **`.xlsx`** (`accept=".csv,.xlsx"`).
- **Upload:** `POST /api/members/me/spreadsheet-upload` — multipart field `file`.
- **List recent uploads:** `GET /api/members/me/spreadsheet-uploads` — optional `limit` 1–100 (default 20); UI shows up to five with a manual refresh.

### Backend (`members.py` + `spreadsheet_service.py`)

- **Guards:** Filename required; empty file **400**; max size **10MB**.
- **CSV:** UTF-8-SIG, `csv.DictReader`.
- **XLSX:** `openpyxl`, first sheet, header row + rows.
- **Column mapping:** Normalized headers for date, description, amount, balance, account, currency (see `DATE_HEADERS`, `AMOUNT_HEADERS`, etc. in `spreadsheet_service.py`).
- **Persistence:** Inserts `spreadsheet_uploads` and related `spreadsheet_transactions` for the authenticated member.

### Data model

- **`spreadsheet_uploads`** — file metadata and row counts.
- **`spreadsheet_transactions`** — imported rows linked to `upload_id` and `member_id`.

---

## 5. Cross-cutting backend API

- **`GET /health`** — `{ "status": "ok", "version": "..." }`.
- **Mounted routers:** `/api/members`, `/api/qb`.
- **Errors:** JSON `detail` strings; QuickBooks service errors mapped to 404 / 429 / 401 where applicable (`_raise_service_error` in `quickbooks.py`).

---

## Document maintenance

Update this file when routes, env vars, or major behaviors change. Last aligned with the repository layout and flows described above (members + QuickBooks + spreadsheet features).
