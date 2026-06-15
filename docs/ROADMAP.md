# Mosaic Talent Network — Roadmap

## Current State (v1 — June 2026)

What is live and working:
- Public search and browse at `/search`
- Admin login via 6-digit OTP (approved email list)
- Admin panel: CSV/Excel bulk import, manual add/edit/delete
- AI-assisted data normalization on import (Anthropic claude-haiku)
- "Connect with Our Mosaic Community" UI on homepage (visual only — no backend)
- Deployed on Vercel, database on Supabase

---

## Near-Term (v1.1)

Small improvements that can be shipped quickly with minimal risk.

### Fix the Vercel deployment pipeline
**Status:** In progress — Vercel is connected to the correct GitHub repo but was previously deploying an old version.
**Work:** Confirm every push to `main` triggers a Vercel deployment from `mosaictechbase-collab/mosaic-talent-db`.

### Homepage live stats
**Status:** The homepage shows hardcoded "500+ Members, 50+ Orgs, 100+ Skills".
**Work:** Add a server component that queries `SELECT COUNT(*) FROM profiles WHERE is_active = true` and distinct organizations/skills counts. Cache with `unstable_cache` (1 hour TTL).

### Profile detail page
**Status:** Not built. Profile cards on `/search` have no clickable link.
**Work:** Create `app/profile/[id]/page.tsx`. Server component, fetches single profile by UUID. Show all fields: full bio, all skills/orgs/interests, LinkedIn button. Public access (no auth).

### Import history tab in admin
**Status:** `import_batches` table is populated on every import but not surfaced in the UI.
**Work:** Add a 4th tab to the admin panel — "Import History" — listing past imports from the `import_batches` table: filename, date, who imported, counts.

### Custom domain
**Status:** Site lives on a Vercel-generated URL. Mosaic likely wants a cleaner domain.
**Work:** Point a domain (e.g. `talent.mosaicnu.com`) to the Vercel project. Update Supabase Site URL and Redirect URLs to match. No code changes needed.

---

## Medium-Term (v2)

Features that require new infrastructure or significant new code.

### Connect / Match backend
**Status:** The "Connect with Our Mosaic Community" section on the homepage has a UI (email input + 3 placeholder cards) but no backend.
**How it should work:**
1. User enters their student email
2. System looks up their profile by email
3. Computes similarity to other profiles based on shared skills, interests, and organizations
4. Returns top 3 matches with explanation (e.g. "Both in Generate, both interested in FinTech")

**Implementation approach:**
- Server action `findMatches(email: string)` — looks up profile, scores all others by weighted overlap, returns top 3
- No ML needed — simple set intersection scoring is sufficient for v2
- Add a `match_score` function in SQL or compute in TypeScript

### Student self-registration / profile claiming
**Status:** All profiles are admin-managed. Students cannot create or claim their own profiles.
**Work:**
- Add a public `/register` page where students submit their info
- Admin reviews and approves submissions before they appear in search
- OR: allow students to "claim" an existing profile by verifying their email matches

### Profile photos
**Status:** Profile cards show initials only.
**Work:** Add `avatar_url` column to `profiles`. On manual add/edit, allow URL input or upload. On import, optionally scrape LinkedIn photo (requires LinkedIn API access). Store in Supabase Storage.

### Search analytics
**Status:** `search_log` table exists but is never written to.
**Work:** In `searchProfiles()`, fire an async insert to `search_log` (query, filters, result count). Add an admin "Analytics" tab showing top searches, zero-result queries, filter usage.

### Messaging / connection requests
**Status:** Not started.
**Work:** Requires student auth (see above). Students log in, browse profiles, send a connection request. Request goes to the other student's email via Resend. Both must be verified users.

---

## Long-Term (v3+)

Larger bets that depend on v2 being stable.

### Organization pages
Dedicated pages for each Mosaic org (e.g. `/org/generate`) showing member profiles, recent imports, and org description. Managed by org leads, not just central admins.

### Alumni network
Extend beyond current students to include Mosaic alumni. Add `is_alumni` flag, graduation year becomes the key differentiator. Alumni can update their own profiles.

### API for org integrations
Some Mosaic orgs (Generate, IDEA) maintain their own member databases. Expose a read API so they can pull profiles or push updates programmatically instead of re-uploading CSVs.

### Mobile app
If usage grows, a React Native or PWA version of the search/browse experience for on-the-go networking at Mosaic events.

---

## Technical Debt

Items that should be cleaned up before the codebase gets much larger.

| Item | Priority | Notes |
|---|---|---|
| Rotate exposed credentials | High | SUPABASE_SERVICE_ROLE_KEY and ANTHROPIC_API_KEY were shared in chat during development. Rotate both in their respective dashboards and update Vercel env vars. |
| TypeScript strict mode | Medium | Supabase `.select()` returns `any[]` — currently cast manually. Consider using Supabase's generated types (`supabase gen types typescript`) for full type safety. |
| Test coverage | Medium | No automated tests exist. At minimum, add unit tests for `lib/import.ts` (CSV parsing edge cases) and `lib/ai/ruleBasedNormalizer.ts`. |
| Error boundary on search page | Low | If `searchProfiles()` throws (Supabase down), the whole page 500s. Add a Next.js `error.tsx` in `app/search/`. |
| `search_log` not populated | Low | The table exists but nothing writes to it. Either wire it up or drop the table. |
