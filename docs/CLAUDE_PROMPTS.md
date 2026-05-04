# Claude prompts: FundSteward website (portable)

Use these prompts **one at a time** in Claude (or similar) to recreate or adapt the **frontend website** for another project. Replace bracketed placeholders like `[PRODUCT_NAME]` with your own branding.

**Stack assumption in every prompt:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS. Adjust if you use a different stack.

---

## 0. Design system & global styles (run first)

```
Build the design foundation for a Next.js 14 App Router app.

Tailwind theme extensions:
- Colors: primary #0A192F, secondary #B3934F, accent #C9A961, background #F8F9FA, surface #FFFFFF, on-surface #111111, on-surface-variant #4A5568, outline #E2E8F0.
- Font: Manrope from next/font/google as CSS variable --font-manrope; set fontFamily.sans to var(--font-manrope).

globals.css:
- Import Google Material Symbols Outlined (for icons).
- Utilities: .editorial-shadow (soft navy shadow), .gold-gradient (linear 135deg #c9a961 → #b3934f), .letter-spacing-tight, .letter-spacing-wide, .material-symbols-outlined base variation settings.

Root layout: html lang=en, body min-h-screen font-sans antialiased; apply Manrope variable class on html.

Do not add a backend. Output tailwind.config, globals.css snippet, and app/layout.tsx shell that only wraps children (no auth yet).
```

---

## 1. Marketing navigation

```
Create a client-ready MarketingNav for Next.js App Router.

- Sticky header: border-b border-white/5, bg-primary/95, backdrop-blur, max-w-7xl mx-auto, px-4 py-4.
- Left: Link to / with a small logo mark (SVG placeholder or text) + brand name "FundSteward" in white semibold.
- Right on desktop: anchor links to /#problem, /#how-it-works, /#contact; Link "Log in" to /login (small uppercase tracking); Link "Sign up" to /signup as gold pill (bg-secondary text-primary).
- Mobile: compact spacing; same links.

Use Tailwind; primary background context is dark nav on marketing pages. Return a single TSX component file.
```

---

## 2. Marketing footer

```
Create MarketingFooter for the same product: mission-driven financial software.

- Section on background surface or primary as appropriate; include copyright, short tagline, and columns: Product (anchor links), Company (placeholder links), Legal (placeholder).
- Subtle borders using outline or white/10; accessible link contrast.
- Return TSX using Next.js Link.
```

---

## 3. Logo component

```
Create FundStewardLogo.tsx: a small inline SVG suitable for nav (roughly 28×28 viewBox). Use secondary/accent strokes or fills consistent with palette primary #0A192F, secondary #B3934F — abstract mark (e.g. stylized F or chart motif). Accept className prop. No external image files.
```

---

## 4. Marketing landing page

```
Build MarketingLanding.tsx: long single-page marketing site for "[PRODUCT_NAME]" — financial intelligence for mission-driven / nonprofit-style organizations.

Sections in order:
1) Hero: center, eyebrow pill "Now in Private Beta", huge extrabold headline (letter-spacing-tight), subcopy, two CTAs — primary gold-gradient "Request a Demo" to /#contact, outline "Learn More" to /#how-it-works; row of three value bullets with Material Symbols check_circle (filled style).
2) Problem section: id="problem", bg-primary, white headline + muted body about manual reporting cost.
3) "How it works" section: id="how-it-works", light background, 3–4 step cards with icons.
4) Social proof or metrics strip (placeholder).
5) Contact / CTA section: id="contact", primary bg, email capture or mailto placeholder.

Use existing tokens: bg-background, text-primary, text-on-surface-variant, gold-gradient, editorial-shadow, Material Symbols. Compose MarketingNav at top and MarketingFooter at bottom.

Return one component; keep content in JSX (editable strings).
```

---

## 5. Home route wiring

```
Create app/page.tsx that only renders MarketingLanding in the main area. No dashboard logic.
```

---

## 6. Auth layout shell

```
Create app/(auth)/layout.tsx: full viewport min-h-screen flex flex-col bg-primary. Top: same MarketingNav as marketing pages. Main: flex flex-1 items-center justify-center px-4 py-12; render {children}. Used for login, signup, forgot password, update password.
```

---

## 7. Login page

```
Create app/(auth)/login/page.tsx ("use client").

- Read ?redirectTo from searchParams (useSearchParams); default "/dashboard" after login.
- Card: editorial-shadow, max-w-md, rounded-2xl, border border-white/10, bg-white/5, padding; headings in white.
- Primary action: "Sign in with Google" button calling supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/dashboard` } }) — use getSupabaseBrowserClient from a stub @/lib/supabase/client.
- Divider "OR".
- Form: email + password, forgot link to /forgot-password, submit calls signInWithPassword; on success window.location.href = redirectTo.
- Error state; link to /signup at bottom.
- Reuse labelClass: text-[10px] font-extrabold uppercase tracking-widest text-white/40; inputClass: rounded-lg border border-white/10 bg-white/5 px-5 py-3.5 text-white focus:border-secondary.

Assume Supabase client exists; do not implement the client module in this file.
```

---

## 8. Signup page

```
Create app/(auth)/signup/page.tsx ("use client"): full name, email, password; validate email format and password length ≥ 8; supabase.auth.signUp with options.data.full_name.

If identities empty array → show "account exists" style message. If no session returned → tell user to confirm email. If session → redirect /dashboard.

Styling match login card on dark primary background. Link to /login at bottom.
```

---

## 9. Forgot password & update password pages

```
Create app/(auth)/forgot-password/page.tsx: form with email; supabase.auth.resetPasswordForEmail with redirectTo pointing to `${origin}/auth/callback?next=/update-password` (or your callback path).

Create app/(auth)/update-password/page.tsx: two password fields, min 8 chars, match check; supabase.auth.updateUser({ password }).

Same dark auth card styling as login. Use client components.
```

---

## 10. Auth callback route (Supabase PKCE)

```
Create app/auth/callback/route.ts (Next.js Route Handler GET).

Read code and next search params. Create Supabase server client with @supabase/ssr and cookies(). If no code redirect /login or /forgot-password. Call exchangeCodeForSession(code). On error redirect forgot-password. On success redirect origin + (next param or /update-password).

Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env.
```

---

## 11. App shell nav (non-dashboard pages)

```
Create AppNav.tsx ("use client"): sticky header with logo + brand, links to /dashboard, conditional Log in / Sign up when no session vs Log out when session. usePathname: return null (render nothing) when path is /, /dashboard, /login, /signup, /forgot-password, /update-password, or /auth/* so dashboard and auth layouts own their own chrome.

Use useSupabaseSession from a placeholder SupabaseSessionProvider; signOut and router push /login.

Styling: bg-primary/95, border-b border-white/5, similar to MarketingNav but simpler links.
```

---

## 12. Root layout with session provider

```
Update app/layout.tsx (server component): get Supabase server client, getSession, pass initialSession to SupabaseSessionProvider wrapping children; render AppNav + main with min-h-screen.

Assume getSupabaseServerClient and SupabaseSessionProvider exist.
```

---

## 13. Supabase browser session provider (minimal)

```
Create components/SupabaseSessionProvider.tsx and lib/supabase/client.ts + lib/supabase/server.ts stubs using @supabase/ssr and @supabase/supabase-js:

- Provider holds session + loading from createBrowserClient; listen to onAuthStateChange; expose useSupabaseSession().
- Server: createServerClient reading cookies for layout session fetch.

Keep implementations minimal but type-safe for Next 14.
```

---

## 14. Middleware (protect dashboard)

```
Create middleware.ts: matcher ["/dashboard", "/dashboard/:path*"]. Create Supabase server client with cookies from request; getUser(). If no user and path starts with /dashboard, redirect to /login?redirectTo=pathname. Otherwise NextResponse.next.

Skip if NEXT_PUBLIC_SUPABASE_URL or ANON_KEY missing (pass through).
```

---

## 15. Dashboard layout (sidebar app shell)

```
Create app/dashboard/layout.tsx ("use client"):

- Grid lg:grid-cols-[260px_1fr]. Left aside: fixed mobile / static desktop, bg-primary text white, border-r; logo + "FundSteward", nav links: Dashboard /dashboard, QuickBooks /dashboard/quickbooks, Settings /dashboard/settings — active state with bg-secondary/20 text-secondary; "← Marketing site" link /; Logout button (supabase signOut, router /login).
- Mobile: hamburger opens slide-over aside with overlay.
- Right: section bg-background; sticky header with mobile menu button, "Signed in as" label + user name from session.user.user_metadata.full_name or email prefix, circular avatar initials.
- Content area: px-4 py-6 sm:px-6 with {children}.

Use FundStewardLogo component and Next Link. Assume useSupabaseSession.
```

---

## 16. Dashboard home page

```
Create app/dashboard/page.tsx ("use client"):

- Welcome headline with display name from useMemberProfile (stub hook that calls GET /api placeholder or returns mock).
- Two cards: Membership Status (subscription tier badge + placeholder upgrade copy); QuickBooks Status from useQBStatus — if not connected show CTA Link to /dashboard/quickbooks; if connected show company name, invoice count from useInvoices when enabled, last sync time, Link to QuickBooks page.

Tailwind: editorial-shadow, rounded-xl border border-outline bg-surface; use gold-gradient CTA for primary actions. Loading skeletons when data pending.
```

---

## 17. Settings page

```
Create app/dashboard/settings/page.tsx ("use client"): title Settings; section "Change password" with new + confirm fields (min 8), supabase.auth.updateUser({ password }), success/error messages. Form styled for light dashboard (border-outline bg-background), gold-gradient submit, editorial-shadow card.
```

---

## 18. QuickBooks dashboard page (data UI only — no real OAuth logic)

```
Create app/dashboard/quickbooks/page.tsx ("use client") for a "QuickBooks Integration" hub:

- Page title + subtitle.
- Mount placeholder components QuickBooksConnect and SpreadsheetUploadCard (import from @/components/...).
- useQBStatus: if error show banner; if not connected show empty-state panel with headline and benefit copy.
- If connected: "Summary" section with three MetricCards — Total Revenue, Total Expenses, Net Income (currency USD) from usePLSummary; net can color rose if negative, emerald if positive placeholder.
- Tabs: invoices | payments | bills — pill toggle; search input filtering rows by substring across values.
- Desktop: HTML table with sortable column headers (click toggles asc/desc arrow); Mobile: stacked cards per row (MobileDataCard pattern).

Define TypeScript types Invoice, Payment, Bill inline or imported with id, amounts, dates, names, status. Use hooks useInvoices, usePayments, useBills, usePLSummary, useQBStatus — stub them to return mock data if needed for Storybook-style demo.

Utilities: formatCurrency with Intl.NumberFormat en-US USD; sortAndFilter generic.

This prompt is UI-heavy; you can strip QuickBooks naming for a generic "accounting integration" page.
```

---

## 19. QuickBooks connect card component

```
Create QuickBooksConnect.tsx ("use client"):

- useQBStatus for connected state, loading, error; mutate to refresh**.
- On mount: read URL ?connected=true or ?error=true — toast success "QuickBooks connected" or error toast; strip query params with replaceState; 4s auto-dismiss toasts (fixed top-right).
- If not connected: green Intuit-style "Connect QuickBooks" button — onClick calls async getQBConnectUrl() from @/lib/api then window.location.href = url. Loading state. Catch errors with apiRequestFailureMessage(err, path hint).

- If connected: show company name, last synced formatted; "Sync Now" calls syncQBData + mutate + success toast; "Disconnect" calls disconnectQB + mutate.

- Section "Verify Intuit ↔ server settings" button loading getQBSetupStatus; display oauth_client_configured, masked client id, QB_ENVIRONMENT, redirect_uri, scope, frontend_base_url, numbered intuit_portal_checks list.

- Error banner combining statusError and actionError with Retry pattern.

Style: editorial-shadow rounded-2xl border border-outline bg-surface; Intuit green #2CA01C for connect button; rose for errors.

Stub api module or accept props callbacks for portability to projects without your backend.
```

---

## 20. Spreadsheet upload card

```
Create SpreadsheetUploadCard.tsx ("use client"):

- Title "Import Spreadsheet"; description: CSV or XLSX accounting transactions saved to profile.
- File input accept .csv,.xlsx; "Upload & Import" disabled when no file or uploading; calls uploadSpreadsheet(file) from api, shows success with rows_imported and file name; error message panel.
- "Refresh uploads" loads getSpreadsheetUploads; show last 5 uploads with file name, row count, uploaded_at formatted.

Card styling consistent with dashboard (editorial-shadow, border-outline, bg-surface). Stub API functions returning Promises for portability.
```

---

## 21. Generic API client pattern (optional, for wiring a real backend later)

```
Create lib/api.ts ("use client"): 

- API_BASE_URL from NEXT_PUBLIC_API_URL default http://localhost:8000, trim trailing slash.
- getAccessToken from Supabase getSession.
- apiClient<T>(path, init, expectNoContent): fetch with Authorization Bearer, Content-Type json unless FormData; parse JSON detail on errors; 401 with token redirects /login?redirectTo=current path; export ApiError and apiRequestFailureMessage for TypeError network hints.

Export typed functions: getMemberProfile, getQBStatus, getQBSetupStatus, getQBConnectUrl, disconnectQB, getInvoices, getPayments, getBills, getPLSummary, syncQBData, uploadSpreadsheet, updateMemberProfile — paths under /api/members and /api/qb matching a FastAPI backend.

This file is portable: swap paths and URLs for your other project's API.
```

---

## 22. SWR hooks pattern (optional)

```
Create lib/hooks/useQBData.ts: useSupabaseSession gating — only run SWR fetcher when session exists and session loading false. Export useQBStatus, useMemberProfile, useInvoices, usePayments, useBills, usePLSummary with keyed strings and optional { enabled } to skip when QuickBooks not connected.

Each returns { data, isLoading, error: string | null, mutate }.
```

---

## Usage tips

1. **Order:** Run **0 → 3 → 1 → 2 → 4 → 5**, then **13 → 12 → 11**, then **6–10**, **14**, **15–20**, finally **21–22** if you need API wiring.
2. **Strip branding:** Replace FundSteward, mission-driven copy, and color hex values in prompt **0** first.
3. **No Supabase:** Omit 7–14, 21–22 and replace with your auth provider; keep layout/nav prompts.
4. **No QuickBooks:** Use prompt **18** as a generic “external accounting dashboard” and remove Intuit colors from **19**.

---

*Generated from the FundSteward_DataEng frontend. For the canonical feature list see `SPEC.md` in the repo root.*
