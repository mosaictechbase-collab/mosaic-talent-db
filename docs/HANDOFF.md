# Mosaic Talent Network — Handoff Notes

## What's built (Phase 1 & 2)

### Authentication
- Supabase Auth magic link login at `/login`
- `/auth/callback` route handles token exchange
- `proxy.ts` protects all `/admin/*` routes — redirects to `/login` if no session, `/unauthorized` if email not in allowlist
- `lib/auth/requireAdmin.ts` — server-side guard called at the top of every admin server action
- Allowed admins: `m.varghese@northeastern.edu`, `sharma.asm@northeastern.edu` (set via `ADMIN_ALLOWED_EMAILS` env var)

### Database
- `profiles` table with FTS, GIN indexes on arrays, dedup via unique email index
- `import_batches` audit table
- `search_log` table
- RLS: anon SELECT only; writes via service role key exclusively
- Migration: `supabase/migrations/001_initial.sql`

### Search
- Server-rendered search page at `/search` — reads URL params, queries Supabase server-side
- No client-side data loading — safe for 4,000+ profiles
- Full-text search via `tsvector` + `websearch` mode
- Filters: org, skill, role, interest, graduation year
- Pagination: 20 per page

### Admin import
- `/admin` — drag-drop or click CSV/XLSX upload
- Two-pass deduplication (email → name+year)
- AI enrichment via `lib/ai/enrichProfiles.ts` (Anthropic claude-haiku)
- Falls back to `lib/ai/ruleBasedNormalizer.ts` if AI fails
- Import result summary (inserted / updated / skipped / errors)

### UI
- Matches Mosaic Talent Network screenshots: white background, blue accent, TopNav, centered search hero, left filter sidebar, profile cards with skill chips
- No dark mode — clean white UI per design spec

## What's next (Phase 3+)

- [ ] Seed the DB with real profile data via admin import
- [ ] Update stat numbers on home page (500+, 50+, 100+) to pull from live DB count
- [ ] Profile detail page (`/profile/[id]`)
- [ ] Admin: profile edit / delete / deactivate UI
- [ ] Admin: view import history
- [ ] Custom domain DNS in Vercel

## Environment variables checklist for Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_ALLOWED_EMAILS`
- [ ] `ANTHROPIC_API_KEY`

## Supabase post-deploy checklist

- [ ] Migration SQL executed
- [ ] Auth Site URL set to production domain
- [ ] Auth Redirect URL: `https://your-domain/auth/callback`
- [ ] Email provider enabled (magic link)
