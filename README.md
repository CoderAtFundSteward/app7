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

## Deployment sketch

- **Frontend:** Vercel with root directory `frontend`.
- **Backend:** Railway with root directory `backend` (see `backend/railway.json`). Point `NEXT_PUBLIC_API_URL` at the Railway URL and widen CORS in `backend/app/main.py` for production origins.
