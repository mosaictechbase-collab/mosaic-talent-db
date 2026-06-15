# Mosaic Talent Network — Technical Specification

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | managed |
| Auth | Supabase Auth (OTP) | @supabase/ssr 0.12 |
| AI | Anthropic claude-haiku-4-5-20251001 | @anthropic-ai/sdk 0.104 |
| CSV parsing | PapaParse | 5.5 |
| Excel parsing | xlsx | 0.18 |
| Hosting | Vercel | — |

## Repository Structure

```
mosaictalentdb/
├── app/
│   ├── page.tsx                  # Homepage with hero + connect section
│   ├── layout.tsx                # Root layout with TopNav
│   ├── search/page.tsx           # Public search page (server component)
│   ├── login/page.tsx            # OTP login (client component)
│   ├── admin/
│   │   ├── page.tsx              # Admin panel with 3 tabs (client)
│   │   └── actions.ts            # All admin server actions
│   ├── auth/callback/route.ts    # Supabase auth callback handler
│   └── unauthorized/page.tsx     # Shown when non-admin hits /admin
├── components/
│   ├── nav/TopNav.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── ProfileCard.tsx
│   │   └── Pagination.tsx
│   └── admin/
│       ├── UploadBox.tsx         # Drag-and-drop file input
│       ├── ImportResult.tsx      # Post-import summary panel
│       ├── ManualAddForm.tsx     # Single-profile add form
│       └── ProfileList.tsx       # Paginated table with edit modal
├── lib/
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── search.ts                 # searchProfiles() + getFilterOptions()
│   ├── import.ts                 # CSV/Excel parsing, dedup, header mapping
│   ├── auth/requireAdmin.ts      # Server-side admin guard
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server + service role clients
│   └── ai/
│       ├── enrichProfiles.ts     # Anthropic batching + concurrency
│       └── ruleBasedNormalizer.ts # Fallback when AI unavailable
├── supabase/migrations/
│   └── 001_initial.sql           # Full schema, indexes, triggers, RLS
└── proxy.ts                      # Next.js 16 route proxy (replaces middleware.ts)
```

## Critical Next.js 16 Breaking Change

Next.js 16 renamed `middleware.ts` to `proxy.ts` and the export from `middleware` to `proxy`. **Do not rename this file or the export** — the app will silently break route protection.

```ts
// proxy.ts — correct
export async function proxy(request: NextRequest) { ... }
export const config = { matcher: ['/admin/:path*'] }
```

## Authentication Flow

### Login (6-digit OTP)
1. User enters email at `/login`
2. `supabase.auth.signInWithOtp({ email })` — no `emailRedirectTo` → Supabase sends a 6-digit code
3. UI transitions to code input step
4. `supabase.auth.verifyOtp({ email, token, type: 'email' })` — sets session cookie
5. Router pushes to `redirectTo` param (default `/admin`)

### Route Protection (proxy.ts)
- Runs on every request matching `/admin/*`
- Reads Supabase session from cookies via `createServerClient`
- Unauthenticated → redirect to `/login?redirectTo=<path>`
- Authenticated but not in `ADMIN_ALLOWED_EMAILS` → redirect to `/unauthorized`
- Refreshes session on every request to prevent expiry

### Admin Guard (requireAdmin.ts)
- Called at the top of every server action in `app/admin/actions.ts`
- Double-checks auth server-side (proxy.ts is defense-in-depth, not the only gate)
- Returns the authenticated email on success, throws `AdminAuthError` on failure

### Supabase Client Types

| Client | File | Use |
|---|---|---|
| Browser client | `lib/supabase/client.ts` | Login page, client components |
| Server client | `lib/supabase/server.ts → createClient()` | Server components, reading auth session |
| Service client | `lib/supabase/server.ts → createServiceClient()` | All DB writes, bypasses RLS |

**Never use the service client in client components.** It holds the service role key which must never reach the browser.

## Database Schema

### profiles
Primary table. `full_name` is the only required field.

- **Partial unique index on email**: `WHERE email IS NOT NULL AND email != ''` — allows multiple rows with null email (for profiles without known email addresses).
- **search_vector**: `tsvector` column maintained by a `BEFORE INSERT OR UPDATE` trigger. Weights: name=A, bio=B, major/skills=C, interests/orgs=D.
- **GIN indexes** on `organizations`, `skills`, `interests`, `roles` arrays for fast containment queries.

### import_batches
Records each CSV/Excel import: filename, who imported it, counts of inserted/updated/skipped rows.

### search_log
Reserved for future analytics. Currently not written to.

### RLS Policy
- `public_read_profiles`: anon and authenticated users can SELECT where `is_active = true`
- No write policies for authenticated users — all writes use the service role key server-side which bypasses RLS entirely

## Import Pipeline

```
FormData (file)
  → parse CSV/Excel (PapaParse / xlsx)
    → unwrapIfNeeded()          ← strips Google Sheets outer-quote wrapping
    → mapHeaders()              ← flexible case-insensitive header mapping
  → dedupWithinBatch()          ← in-memory dedup by email, then name+year
  → enrichProfiles()            ← Anthropic API (BATCH_SIZE=50, MAX_CONCURRENT=5)
      └─ fallback: ruleBasedNormalize() per batch on any error
  → create import_batch record
  → chunked SELECT for existing records (LOOKUP_CHUNK=100 to stay under PostgREST 8KB URL limit)
  → bulkInsert() new rows (INSERT_CHUNK=500)
  → bulkUpdate() existing rows in parallel (UPDATE_CHUNK=100)
  → update import_batch with final counts
```

### Why chunked lookups?
PostgREST generates a URL like `?email=in.(a,b,c,...)`. At 2,000 rows this exceeds the ~8KB URL limit and returns a 414 error. Chunking to 100 items keeps each request well under the limit.

### Why separate insert/update instead of upsert?
Supabase's `upsert` with `onConflict: 'email'` requires the conflict column to have a simple unique index. Our email index is a partial index (`WHERE email IS NOT NULL`), which Supabase's upsert implementation does not support. The chunked SELECT + separate bulk insert/update is the workaround.

## Search

`searchProfiles()` in `lib/search.ts`:
- Uses Supabase's `textSearch()` with `type: 'websearch'` for natural-language queries
- Array filters use `.contains()` (GIN index)
- Selects explicit columns (not `*`) to reduce payload
- Returns `Profile[]` cast (Supabase returns `any[]` for explicit selects)

`getFilterOptions()` — cached with `unstable_cache`:
- Must use `createServiceClient()` (not `createClient()`) inside the cache — cookie-based clients throw a runtime error inside `unstable_cache`
- 1-hour TTL (`revalidate: 3600`) — acceptable staleness since filter options only change on import

## AI Enrichment

- Model: `claude-haiku-4-5-20251001` (fast, cheap, sufficient for normalization)
- Batches of 50 profiles per API call
- Up to 5 concurrent API calls (`MAX_CONCURRENT=5`)
- If `ANTHROPIC_API_KEY` is empty or unset, throws immediately and falls back to `ruleBasedNormalize()`
- If any batch fails (network error, malformed response, length mismatch), that batch falls back to rule-based; other batches continue

## Environment Variables

| Variable | Exposed to browser | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anon/publishable key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes | Supabase service role key — bypasses RLS, never expose |
| `ADMIN_ALLOWED_EMAILS` | No | Yes | Comma-separated list of allowed admin emails |
| `ANTHROPIC_API_KEY` | No | No | If blank, rule-based normalization is used instead |

## Key Design Decisions

**No client-side data loading** — The full profile dataset is never sent to the browser. Search is server-side paginated. Filter options are server-cached.

**Hard deletes** — `deleteProfile()` issues a real DELETE. There is no soft-delete UI. The `is_active` flag exists for future use but is always set to `true` on insert.

**No student auth in v1** — Self-registration and profile claiming are deferred. All profiles are admin-managed.

**Supabase Auth OTP instead of magic link** — Magic links have a 2/hour rate limit on Supabase's free tier and require the Site URL to match the deployment domain. OTP codes avoid both issues.
