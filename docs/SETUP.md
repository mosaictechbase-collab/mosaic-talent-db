# Mosaic Talent Network — Setup Guide

## Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Vercel](https://vercel.com) account

---

## 1. Clone & Install

```bash
git clone <your-repo>
cd mosaictalentdb
npm install
```

---

## 2. Supabase Setup

### Create project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Note your **service_role key** (Settings → API → Secret — keep this secret)

### Run the migration
Paste the contents of `supabase/migrations/001_initial.sql` into the **Supabase SQL Editor** and run it.

This creates:
- `profiles` table with FTS trigger and indexes
- `import_batches` table
- `search_log` table
- RLS: public SELECT on profiles, all writes via service role only

### Configure Auth
1. Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider (Magic Link is on by default)
3. Authentication → URL Configuration:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: add `https://your-domain.vercel.app/auth/callback`

---

## 3. Environment Variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `ADMIN_ALLOWED_EMAILS` | Comma-separated, e.g. `m.varghese@northeastern.edu,sharma.asm@northeastern.edu` |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

---

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. Deploy to Vercel

1. Push repo to GitHub
2. Vercel Dashboard → New Project → Import repo
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables from `.env.local` in Vercel → Project Settings → Environment Variables
5. Deploy

### Post-deploy
- Update Supabase Auth **Site URL** and **Redirect URLs** to your Vercel domain
- Test magic link login at `/login`

---

## 6. Admin Access

Only the emails in `ADMIN_ALLOWED_EMAILS` can access `/admin`.

To sign in:
1. Go to `/admin` (you'll be redirected to `/login`)
2. Enter your approved email
3. Click the magic link in your email
4. You'll land on `/admin`

To add more admins: update `ADMIN_ALLOWED_EMAILS` in Vercel env vars and redeploy.

---

## 7. Importing Profiles

### CSV format
| Column | Description |
|---|---|
| `name` | Full name (required) |
| `email` | Email address (used for deduplication) |
| `organization` | Mosaic org (Generate, IDEA, Scout, etc.) |
| `skills` | Comma-separated |
| `interests` | Comma-separated |
| `roles` | Comma-separated (Founder, Designer, etc.) |
| `bio` | Short description |
| `location` | City, state |
| `grad year` | 4-digit year |
| `linkedin` | Full LinkedIn URL |

Column names are case-insensitive and flexible (e.g. "Grad Year", "graduation_year", "Class Year" all work).

### Deduplication
1. **By email** — if a row's email matches an existing profile, the existing record is updated
2. **By name + grad year** — for rows without email, a name/year match updates the existing record
3. **Within-batch** — duplicate rows in the same CSV are collapsed (last occurrence wins)

### AI enrichment
Skills, organizations, roles, and interests are automatically normalized using the Anthropic API (claude-haiku). If the API is unavailable, a rule-based fallback normalizer runs instead — imports never fail due to AI.

---

## 8. Architecture Overview

```
app/
├── page.tsx              Home — search hero
├── search/page.tsx       Search — server-rendered with URL params
├── admin/
│   ├── page.tsx          Admin upload UI
│   └── actions.ts        Server actions (import pipeline)
├── login/page.tsx        Magic link login
├── auth/callback/        Supabase Auth callback
└── unauthorized/         Not-allowed redirect

lib/
├── supabase/             Supabase clients (browser + server + service)
├── auth/requireAdmin.ts  Admin guard (called at top of every admin action)
├── search.ts             searchProfiles() + getFilterOptions()
├── import.ts             CSV/XLSX parsing + dedup
├── ai/
│   ├── enrichProfiles.ts AI enrichment (Anthropic, with fallback)
│   └── ruleBasedNormalizer.ts  Fallback normalization

proxy.ts                  Route protection for /admin/*
supabase/migrations/      SQL schema
docs/                     This file + HANDOFF.md
```
