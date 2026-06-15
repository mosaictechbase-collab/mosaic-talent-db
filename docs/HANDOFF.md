# Mosaic Talent Network — Developer Handoff Guide

This document is written for a developer taking over this project with no prior context. Read it top to bottom before touching any code.

---

## Accounts & Access

You will need credentials or invitations for:

| Service | URL | Account |
|---|---|---|
| GitHub repo | github.com/mosaictechbase-collab/mosaic-talent-db | mosaictechbase@gmail.com |
| Vercel | vercel.com | Same account |
| Supabase | supabase.com (project ID: `akixmbrjhhspsliszafh`) | Same account |
| Resend (email) | resend.com | Same account |

---

## Local Development Setup

### 1. Clone
```bash
git clone https://github.com/mosaictechbase-collab/mosaic-talent-db.git
cd mosaic-talent-db
npm install
```

### 2. Environment variables
```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://akixmbrjhhspsliszafh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase → Project Settings → API → anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase → Project Settings → API → service_role key
ADMIN_ALLOWED_EMAILS=your@email.com
ANTHROPIC_API_KEY=               # optional — leave blank to use rule-based fallback
```

### 3. Run
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Login locally
Go to http://localhost:3000/login. Enter an email in `ADMIN_ALLOWED_EMAILS`. Check your inbox for a **6-digit code** and type it in (do not click the magic link in the email).

---

## Codebase Orientation

Read these files in order to understand the system:

1. **`lib/types.ts`** — all shared TypeScript interfaces
2. **`supabase/migrations/001_initial.sql`** — full database schema, indexes, triggers, RLS
3. **`proxy.ts`** — route protection (Next.js 16 replacement for middleware.ts)
4. **`lib/auth/requireAdmin.ts`** — server-side admin guard
5. **`app/admin/actions.ts`** — all admin server actions (import, add, update, delete, list)
6. **`lib/search.ts`** — public search and cached filter options

---

## Common Administrative Tasks

### Add a new admin email
1. Vercel → Project → Settings → Environment Variables
2. Edit `ADMIN_ALLOWED_EMAILS` — comma-separated, no spaces
3. Redeploy (or it takes effect on next push)

No code changes needed.

### Import profiles (bulk)
1. Log in at `/login`
2. Go to `/admin` → "Upload CSV / Excel" tab
3. Drop file, click Import

Accepted CSV column names (case-insensitive): `name`, `full name`, `email`, `organization`, `skills`, `roles`, `interests`, `bio`, `location`, `linkedin`, `grad year`, `graduation year`, `major`, `college`

### Add / edit / delete profiles (manual)
- `/admin` → "Add Manually" tab: fill form, submit
- `/admin` → "Manage Profiles" tab: search, click Edit (modal) or Delete

---

## Known Quirks — Read Before Debugging

### Google Sheets CSV export wraps rows in outer quotes
Google Sheets wraps each row in `"..."` when exporting CSV. PapaParse sees the header line as a single field and reports "File has no valid rows." The importer handles this via `unwrapIfNeeded()` in `lib/import.ts` — it detects and strips the wrapping automatically. If you see that error with a Google Sheets file, check the file is saved as `.csv` not `.tsv`.

### Supabase upsert fails with partial unique index
The `email` column has a **partial** unique index (`WHERE email IS NOT NULL`). Supabase's `.upsert({ onConflict: 'email' })` only works with simple unique indexes, not partial ones. The import pipeline works around this by doing a chunked SELECT to find existing rows, then separate bulk INSERT and bulk UPDATE calls.

### PostgREST URL limit — chunk `.in()` queries to ≤100 items
Supabase's REST API generates URLs like `?email=in.(a,b,c,...)`. At 2,000 items this exceeds the ~8KB URL limit and returns a 414 error. All `.in()` lookups in the import pipeline are chunked to 100 items (`LOOKUP_CHUNK=100`).

### unstable_cache requires service client, not cookie client
`getFilterOptions()` in `lib/search.ts` uses `unstable_cache`. The cookie-based Supabase server client (`createClient()`) calls `cookies()` which is not allowed inside a cache function and throws a runtime error. Always use `createServiceClient()` (no cookies, service role key) for anything called inside `unstable_cache`.

### Next.js 16: file is proxy.ts, export is proxy
Next.js 16 renamed `middleware.ts` → `proxy.ts` and `export function middleware` → `export function proxy`. Do not rename either. Build error if wrong: "Proxy is missing expected function export name."

### OTP codes, not magic links
Login uses `signInWithOtp` without `emailRedirectTo`. This sends a **6-digit code**. Supabase also includes a magic link in the same email — the magic link redirects to whatever "Site URL" is set in Supabase settings, which may not match the current deployment. Always use the 6-digit code. The magic link can be removed from the email template in Supabase → Authentication → Email Templates → Magic link or OTP.

### Supabase email rate limit
Supabase's built-in mailer limits to 30 OTP emails per hour. The project is configured to use Resend via custom SMTP to avoid this. If emails stop sending, check Resend → Logs for delivery errors.

---

## Security Rules (Never Break These)

- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` must **never** be prefixed with `NEXT_PUBLIC_` or read client-side
- `ADMIN_ALLOWED_EMAILS` is only read in `proxy.ts` and `lib/auth/requireAdmin.ts` — both server-side only
- Every admin server action must call `await requireAdmin()` as its first line
- All database writes use `createServiceClient()` (service role key) — never the anon client
- The anon key is safe to expose; RLS enforces read-only access for it

---

## What Was Built

### Authentication
- 6-digit OTP login at `/login` via `supabase.auth.signInWithOtp` + `verifyOtp`
- `proxy.ts` protects `/admin/*` — unauthenticated → `/login`, unauthorized email → `/unauthorized`
- `lib/auth/requireAdmin.ts` — double-checks auth server-side on every admin action

### Database
- `profiles` table with FTS (`tsvector`), GIN indexes on array columns, partial unique index on email
- `import_batches` audit table tracking every import
- `search_log` table (reserved for analytics)
- RLS: anon + authenticated users can SELECT active profiles; all writes via service role key

### Search
- Server-rendered `/search` page — queries Supabase server-side, never loads full dataset to browser
- Full-text search via `tsvector` websearch mode
- Sidebar filters: org, role, skill, interest, graduation year (cached 1 hour)
- Pagination: 20 per page

### Admin Panel (`/admin`)
Three tabs:
1. **Upload CSV / Excel** — bulk import with dedup, AI enrichment, result summary
2. **Add Manually** — single-profile form
3. **Manage Profiles** — paginated table with inline Edit modal and Delete

### AI Enrichment
- Anthropic `claude-haiku-4-5-20251001` normalizes skills/orgs/roles/interests on import
- Batches of 50, up to 5 concurrent API calls
- Automatic fallback to `ruleBasedNormalizer.ts` if API key missing or call fails

### Homepage
- Hero search bar, stats, "Connect with Our Mosaic Community" section (UI only — backend TBD)

---

## What's Next

See [ROADMAP.md](./ROADMAP.md).
