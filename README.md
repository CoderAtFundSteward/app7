# FundSteward Membership App Monorepo

Monorepo for a membership-based web application where users can log in and optionally connect QuickBooks Online to view accounting transactions.

## Tech Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: FastAPI (Python)
- Database: Supabase (PostgreSQL)
- Deployment:
  - Frontend -> Vercel
  - Backend -> Railway

## Project Structure

```text
/
├── frontend/               # Next.js app
├── backend/                # FastAPI app
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18.17+ (or 20+ recommended)
- npm 9+
- Python 3.10+
- A Supabase project
- A QuickBooks developer app (for OAuth credentials)

## 1) Clone and Install

```bash
git clone https://github.com/CoderAtFundSteward/FundSteward_DataEng.git
cd FundSteward_DataEng
```

### Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Start frontend:

```bash
npm run dev
```

### Backend setup

```bash
cd ../backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy env template and fill values:

```bash
cp .env.example .env
```

Start backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 2) Environment Variables

Backend (`backend/.env`):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `QB_CLIENT_ID`
- `QB_CLIENT_SECRET`
- `QB_REDIRECT_URI`
- `QB_ENVIRONMENT` (`sandbox` or `production`)
- `JWT_SECRET`
- `FRONTEND_URL`

Frontend (`frontend/.env.local`):

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3) QuickBooks OAuth Flow (High-Level)

1. Member logs in on frontend.
2. Member clicks **Connect QuickBooks**.
3. Frontend calls backend `/api/quickbooks/connect/url`.
4. Backend builds QuickBooks OAuth URL and returns it.
5. Frontend redirects member to QuickBooks consent screen.
6. QuickBooks sends callback to backend `/api/quickbooks/callback`.
7. Backend exchanges code for tokens and stores connection details.

## 4) Deployment Notes

### Frontend on Vercel

1. Connect the GitHub repository to Vercel.
2. In Project Settings, set **Root Directory** to `frontend`.
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.

Optional: `frontend/vercel.json` is included with build/output settings and env var references.

### Backend on Railway

1. Create a new Railway project.
2. Connect the GitHub repository and set **Root Directory** to `backend`.
3. Add all backend environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `QB_CLIENT_ID`
   - `QB_CLIENT_SECRET`
   - `QB_REDIRECT_URI`
   - `QB_ENVIRONMENT`
   - `JWT_SECRET`
   - `FRONTEND_URL`
4. Deploy the service and copy the Railway-generated public URL.
5. In Vercel, set `NEXT_PUBLIC_API_URL` to the Railway URL.
6. In Railway env vars, set `QB_REDIRECT_URI` to your production callback URL and use the same URL in Intuit app settings (developer.intuit.com).

Included backend deployment files:

- `backend/railway.json`
- `backend/Procfile`
- `backend/runtime.txt`
- `backend/.railwayignore`

### Supabase Auth Redirect URLs (Production)

In Supabase Dashboard -> Authentication -> URL Configuration:

- Set **Site URL** to your production Vercel URL (for example `https://your-app.vercel.app`).
- Add **Redirect URLs** for:
  - `https://your-app.vercel.app/login`
  - `https://your-app.vercel.app/signup`
  - `https://your-app.vercel.app/dashboard`
  - Any OAuth callback URLs used by your auth flow

Keep local dev URLs (for example `http://localhost:3000`) in the allowed list as well.

## 5) Next Steps

- Add authentication provider (Supabase Auth, Clerk, Auth0, etc.)
- Add persistent token encryption and refresh logic for QuickBooks tokens
- Add role-based member access and transaction filters
- Add tests (Pytest + frontend component/integration tests)