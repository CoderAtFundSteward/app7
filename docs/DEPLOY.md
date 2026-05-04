# Production deployment: FundSteward4 + Railway + Vercel

All configuration lives in this repo (`frontend/`, `backend/`, `docs/`). Do not put real secrets in Git; use Vercel, Railway, and Supabase dashboards.

Supabase **project name** in the dashboard: **FundSteward4** (API keys and URL come from **Project Settings → API** for that project).

---

## 1. Deployment order (checklist)

Follow this order to avoid broken OAuth redirects, auth callbacks,and CORS.

1. **Supabase (FundSteward4)**  
   - [ ] Confirm project **FundSteward4** exists and note **Project URL** and **anon** / **service_role** keys.  
   - [ ] **Authentication → URL Configuration**  
     - **Site URL:** `https://<vercel-production-domain>` (no trailing slash unless you standardize on one).  
     - **Redirect URLs:** include at least:
       - `https://<vercel-production-domain>/auth/callback`
       - `http://localhost:3000/auth/callback` (local dev)  
       - If you use Vercel Preview URLs: add a pattern Supabase accepts (e.g. each preview URL, or documented wildcard support per Supabase — verify in dashboard).  
   - [ ] **SQL / RLS:** If the app uses custom tables (e.g. `members`, QuickBooks tokens), apply migrations from `supabase/migrations` in-repo when that folder exists. Until then, **defaults only** (Auth users + built-in auth schema) may be enough for login/signup smoke tests.

2. **Railway (API, new service)**  
   - [ ] New service from this GitHub repo; **Root Directory:** `backend`.  
   - [ ] Generate public HTTPS domain; note **`<railway-public-domain>`** (no trailing slash).  
   - [ ] Set environment variables (see table below).  
   - [ ] Deploy; confirm **GET** `https://<railway-public-domain>/health` returns JSON `{"status":"ok"}`.

3. **Vercel (frontend, new project)**  
   - [ ] New project from same repo; **Root Directory:** `frontend`; production branch (e.g. `main`).  
   - [ ] Set environment variables (see table below). **`NEXT_PUBLIC_API_URL`** must match Railway base URL exactly (HTTPS, **no trailing slash**).  
   - [ ] Deploy; open production URL and smoke-test UI.

4. **Align hosts**  
   - [ ] Railway `FRONTEND_URL` = Vercel production origin (and comma-separated extras if needed, e.g. `https://app.vercel.app,https://www.example.com`).  
   - [ ] Optional previews: set `CORS_ORIGIN_REGEX` on Railway (see `backend/.env.example`) so preview deployments can call the API.  
   - [ ] QuickBooks (when enabled): Intuit app **Redirect URI** must match live code — e.g. `https://<railway-public-domain>/api/qb/callback` (adjust path if your router differs).

---

## 2. Environment variable tables (placeholders only)

Replace angle-bracket placeholders with real values in each platform’s UI. Never commit secrets.

### Vercel (Production / Preview)

| Name | Example value | Notes |
|------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | FundSteward4 → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon key>` | FundSteward4 → **anon** `public` |
| `NEXT_PUBLIC_API_URL` | `https://<railway-public-domain>` | Same string you use in the browser to reach the API |

### Railway (backend service)

| Name | Example value | Notes |
|------|----------------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Same project as frontend |
| `SUPABASE_SERVICE_KEY` | `<service_role secret>` | **Server only** — FundSteward4 service role |
| `FRONTEND_URL` | `https://<vercel-production-domain>` | Comma-separated list allowed (see `backend/app/main.py`) |
| `CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` | Optional; Vercel preview hosts if regex is enabled in backend |
| `JWT_SECRET` | `<random string>` | When JWT/session helpers are used |
| `QB_CLIENT_ID` | `<from Intuit>` | If QuickBooks OAuth is enabled |
| `QB_CLIENT_SECRET` | `<from Intuit>` | If QuickBooks OAuth is enabled |
| `QB_REDIRECT_URI` | `https://<railway-public-domain>/api/qb/callback` | Must match Intuit app + FastAPI route |
| `QB_ENVIRONMENT` | `sandbox` or `production` | Match Intuit app |

Copy **`backend/.env.example`** locally for development; sync names (not values) with Railway.

---

## 3. Repo files

| File | Role |
|------|------|
| `frontend/vercel.json` | Optional framework/install hints for Vercel when root is `frontend/` |
| `backend/railway.json` | Nixpacks + `uvicorn` on `$PORT`, health check `/health` |
| `frontend/.env.example` | Local + docs for `NEXT_PUBLIC_*` |
| `backend/.env.example` | Local + docs for Railway-related vars |

---

## 4. Sanity tests (after full FundSteward UI exists)

The minimal scaffold may not include login, `/auth/callback`, or `/dashboard` yet. When those routes and Supabase wiring are present:

1. **Railway:** `curl -sS https://<railway-public-domain>/health` → `{"status":"ok"}` (or equivalent).  
2. **Vercel + Supabase:** Open `/login`, start Google or email sign-in, complete flow; confirm redirect lands on `/auth/callback` then dashboard (or intended `next` target).  
3. **Browser + API:** While logged in, trigger a request from the app to `NEXT_PUBLIC_API_URL` (e.g. `/api/members/me`) with `Authorization: Bearer <access_token>`; confirm **no CORS error** in DevTools Network.  
4. If CORS fails on previews: add preview origin to `FRONTEND_URL` or set `CORS_ORIGIN_REGEX` and redeploy Railway.

---

## 5. Vercel dashboard summary

- **Framework preset:** Next.js (auto from `frontend/package.json`).  
- **Root Directory:** `frontend`.  
- **Build:** `npm run build` (default); **Install:** `npm ci` or `npm install` per lockfile.  
- **Output:** default (Next.js on Vercel handles `.next`).  

No `vercel.json` is strictly required; one is provided for explicit install/build if you want parity across environments.

---

*FundSteward4 = Supabase project name; hosts `<vercel-domain>` and `<railway-public-domain>` are placeholders until you create projects.*
