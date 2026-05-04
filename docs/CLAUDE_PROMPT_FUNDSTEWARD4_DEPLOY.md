# Single Claude prompt: FundSteward4 + Vercel + Railway

**Local rule:** Any files or edits produced when using this prompt must live **only** under this repository workspace (this `app7` tree).

Paste the block below into Claude (or similar). It assumes the full feature set described in `docs/CLAUDE_PROMPTS.md` (Next.js 14 App Router marketing site, Supabase auth, dashboard, QuickBooks-style UI, optional FastAPI client).

---

```
You are implementing production deployment configuration and env alignment for FundSteward.

## Workspace (mandatory)
- Save **all** new or changed files **only** inside this Git repository workspace (project root that contains `frontend/`, `backend/`, `docs/`, etc.). Use repo-relative paths (e.g. `frontend/vercel.json`, `backend/railway.json`, `docs/DEPLOY.md`). Do **not** create deliverables in another directory tree, a temp folder outside the repo, or a duplicate project copy.

## Product & stack (from CLAUDE_PROMPTS.md)
- Frontend: Next.js 14 App Router, React 18, TypeScript, Tailwind — navy/gold design system (primary #0A192F, secondary #B3934F, Manrope, Material Symbols, utilities like editorial-shadow and gold-gradient).
- Features to preserve: marketing landing + nav/footer + logo; auth routes (login, signup, forgot/update password) with Supabase; auth callback (PKCE); middleware protecting /dashboard; dashboard shell with QuickBooks hub UI and API hooks pattern (NEXT_PUBLIC_API_URL).

## Supabase — project "FundSteward4"
- Use the Supabase project named **FundSteward4** (Dashboard → Project Settings) as the single database and Auth backend.
- Frontend env (Vercel): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from that project’s API settings.
- Backend env (Railway): `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (service role) for that same project — never expose the service key to the browser.
- In Supabase Dashboard for FundSteward4: set Auth → URL Configuration `Site URL` to the Vercel production URL; add Redirect URLs for production and preview (e.g. `https://<vercel-domain>/auth/callback` and preview patterns if used).
- Document any SQL migrations or RLS policies required for FundSteward4 if the app expects specific tables; otherwise note "defaults only."

## Vercel — new project
- Create a **new** Vercel project connected to the repo; default branch for production.
- If the Next.js app lives in a subdirectory (e.g. `frontend/`), set Root Directory accordingly and use the correct install/build commands (`npm ci` / `npm run build` or pnpm/yarn as in repo).
- Environment variables (Production + Preview as appropriate):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (FundSteward4)
  - `NEXT_PUBLIC_API_URL` = public HTTPS URL of the **new** Railway API service (below), no trailing slash
- Optional: set `NEXT_PUBLIC_VERCEL_URL`-style usage only if the code already reads it; otherwise rely on explicit URLs.
- Output: `vercel.json` only if needed (headers, rewrites, or framework hints); otherwise list exact Vercel dashboard settings and env var table.

## Railway — new API service
- Create a **new** Railway service from the same repo (or deploy path) for the FastAPI backend; use Nixpacks or Dockerfile per repo.
- Provide a fresh `railway.json` (or equivalent) with: `startCommand` for uvicorn on `$PORT`, `healthcheckPath` matching the app’s health route (e.g. `/health`).
- Environment variables on Railway:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (FundSteward4)
  - `FRONTEND_URL` = Vercel production URL (and document Preview: either a single canonical URL or `CORS_ORIGIN_REGEX` such as `https://.*\.vercel\.app` if the backend supports it — match whatever the repo’s CORS docs say)
  - Secrets from `backend/.env.example` as needed: `JWT_SECRET`, QuickBooks keys if used, `QB_REDIRECT_URI` updated to `https://<railway-public-domain>/api/qb/callback` (or actual callback path in code)
- Ensure Railway’s **public domain** is the one used in `NEXT_PUBLIC_API_URL` on Vercel.

## Deliverables
1. Step-by-step checklist: Supabase FundSteward4 → Railway API → Vercel frontend (order that avoids broken redirects/CORS).
2. Example `.env` / Vercel / Railway key-value tables (no real secrets).
3. Files to add or edit: `vercel.json` (if any), `railway.json`, and a short `DEPLOY.md` section or comments in `.env.example` describing FundSteward4 + new hosts — only if the repo lacks them.
4. Sanity tests: health check on Railway; login redirect and `/auth/callback` on Vercel against FundSteward4; one authenticated API call from the browser to `NEXT_PUBLIC_API_URL` without CORS errors.

Do not commit real keys. Replace placeholders like `<vercel-domain>` and `<railway-public-domain>` with the user’s actual hostnames once created.
```

---

*Derived from `docs/CLAUDE_PROMPTS.md`. Fix the filename typo "CLAUSE" → "CLAUDE" when linking.*
