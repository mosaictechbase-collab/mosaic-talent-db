# Mosaic Talent Network — Operations Guide

Day-to-day procedures for running and maintaining the Mosaic Talent Network.

---

## Deployment

### Normal deploy (push to main)
```bash
git add .
git commit -m "description of change"
git push origin main
```
Vercel automatically deploys every push to `main`. Deployment takes ~1–2 minutes. Watch progress at vercel.com/dashboard.

### Force redeploy without code change
In Vercel → Deployments → click `···` next to the latest deployment → Redeploy.

### Check what's deployed
The commit hash shown in Vercel's Deployments tab must match `git log --oneline -1` locally. If they differ, Vercel is deploying from a different branch or repo — check Vercel → Project Settings → Git.

---

## Environment Variables

All environment variables live in **Vercel → Project → Settings → Environment Variables**. Changes take effect on the next deployment.

| Variable | Where to get the value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret) |
| `ADMIN_ALLOWED_EMAILS` | Managed manually — comma-separated, no spaces |
| `ANTHROPIC_API_KEY` | anthropic.com console |

### Adding or removing an admin
Edit `ADMIN_ALLOWED_EMAILS` in Vercel env vars, then redeploy. Format: `email1@x.com,email2@x.com`

Current approved admins (as of June 2026):
- m.varghese@northeastern.edu
- sharma.asm@northeastern.edu
- asmitasharma.nu@gmail.com
- mosaictechbase@gmail.com

---

## Database (Supabase)

### Accessing the database
- Supabase dashboard → project `akixmbrjhhspsliszafh` → Table Editor or SQL Editor
- For read queries: Table Editor works fine
- For schema changes: use the SQL Editor and update `supabase/migrations/001_initial.sql` to keep it in sync

### Running the migration on a fresh Supabase project
1. Supabase → SQL Editor
2. Paste the contents of `supabase/migrations/001_initial.sql`
3. Click Run

### Backing up data
Supabase free tier includes daily backups retained for 7 days. For a manual backup:
```sql
-- Run in Supabase SQL Editor, then download as CSV
SELECT * FROM profiles ORDER BY created_at;
```

### Viewing import history
```sql
SELECT filename, imported_by, imported_at, row_count, inserted_count, updated_count, dupes_skipped
FROM import_batches
ORDER BY imported_at DESC;
```

### Deactivating a profile without deleting it
```sql
UPDATE profiles SET is_active = false WHERE id = '<uuid>';
```
The profile will disappear from public search but remain in the database. Re-activate with `is_active = true`.

### Checking profile count
```sql
SELECT COUNT(*) FROM profiles WHERE is_active = true;
```

---

## Email (Resend + Supabase)

Login OTP emails are sent via Resend through Supabase's custom SMTP.

### If login emails stop arriving
1. Check **Resend → Logs** for delivery errors
2. Check **Supabase → Project Settings → Authentication → SMTP Settings** — confirm custom SMTP is enabled
3. Verify SMTP settings:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: Resend API key (`re_...`)
   - Sender: `onboarding@resend.dev`

### If you hit "error sending email"
Most common cause: the Resend API key expired or was revoked.
1. Go to resend.com → API Keys
2. Create a new key with Full Access
3. Update the Password field in Supabase SMTP settings
4. Save

### Supabase email rate limit
Even with custom SMTP, Supabase enforces a "Minimum interval per user" setting (currently 20 seconds). This prevents the same user from requesting a new code within 20 seconds. This is fine for normal use. If an admin is locked out due to rate limiting, wait 20 seconds and try again.

---

## Auth

### Adding a new admin
See "Adding or removing an admin" under Environment Variables above.

### Admin locked out (can't receive email)
1. Check Resend logs to confirm email was sent
2. If sent but not received, check spam folder
3. If Resend shows a delivery failure, fix SMTP config (see above)
4. As a last resort: generate a session directly in Supabase → Authentication → Users → find the user → Actions → Send magic link (this uses Supabase's internal mailer, not Resend)

### Supabase Auth settings
- Supabase → Project Settings → Authentication → URL Configuration
- **Site URL**: must match the production Vercel URL exactly (no trailing slash)
- **Redirect URLs**: add `<production-url>/**`

Current production URL: `https://mosaic-talent-datab-939j6bs8c-mosaic-s-projectsdb.vercel.app`

---

## Monitoring

### Check for errors in production
- Vercel → Project → Functions tab — shows server action errors and durations
- Vercel → Project → Deployments → click a deployment → View Logs

### Search is slow
`getFilterOptions()` is cached for 1 hour with `unstable_cache`. If the cache is cold (first request after 1 hour), it fetches all profiles to rebuild filter options — this may take a few seconds. Subsequent requests are instant.

`searchProfiles()` uses a GIN-indexed `tsvector` column. If search slows as the database grows, check that the `idx_profiles_search_vector` GIN index exists:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'profiles';
```

### Import is slow
A 2,000-row import with AI enrichment takes 2–4 minutes:
- Parsing: ~1 second
- AI enrichment: ~60–90 seconds (50 rows/batch × 5 concurrent)
- DB writes: ~10–20 seconds

If AI enrichment is timing out, set `ANTHROPIC_API_KEY` to empty in Vercel env vars — the import will fall back to rule-based normalization and complete in ~15 seconds total.

---

## Supabase Project Settings Reference

| Setting | Location | Current Value |
|---|---|---|
| Project ID | Project Settings → General | `akixmbrjhhspsliszafh` |
| Site URL | Auth → URL Configuration | Vercel production URL |
| Email OTP template | Auth → Email Templates → Magic link or OTP | Custom (shows 6-digit code) |
| Custom SMTP | Auth → SMTP Settings | Enabled via Resend |
| Rate limit | Auth → Rate Limits | 30 emails/hour |
