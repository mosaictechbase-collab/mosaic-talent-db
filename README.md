# Mosaic Talent Network

Central searchable talent network for Northeastern's Mosaic entrepreneurship ecosystem.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

See [docs/SETUP.md](docs/SETUP.md) for full setup including Supabase, Auth, and Vercel deployment.

See [docs/HANDOFF.md](docs/HANDOFF.md) for what's built and what's next.

## Tech stack

- **Next.js 16** App Router, TypeScript
- **Tailwind CSS**
- **Supabase** (Postgres + Auth)
- **Anthropic** (claude-haiku for AI enrichment, with rule-based fallback)
- **Vercel** deployment
