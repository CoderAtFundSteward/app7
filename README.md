# app7

Clean-slate monorepo. Replace FundSteward with a minimal stack you can grow.

## Structure

```text
app7/
├── frontend/     # Next.js 14 (App Router), TypeScript, Tailwind
├── backend/      # FastAPI (Python)
├── .gitignore
└── README.md
```

## Local development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL` if you call the API from the browser.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: [http://localhost:8000/health](http://localhost:8000/health)

## Deployment (FundSteward4 + Vercel + Railway)

See **`docs/DEPLOY.md`** for Supabase project **FundSteward4**, env var tables, and ordering (Supabase → Railway → Vercel).

- **Frontend:** Vercel, root directory `frontend` (`frontend/vercel.json` optional hints).
- **Backend:** Railway, root directory `backend` (`backend/railway.json`). CORS reads `FRONTEND_URL` and optional `CORS_ORIGIN_REGEX`.
