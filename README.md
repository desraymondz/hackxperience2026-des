# HackXperience 2026

Landing page, project submission portal, and organiser/judge dashboards for **HackXperience 2026** — SIM IT Club's flagship **2-day agentic hackathon** (theme: **AI for Living**, 24–25 July 2026 at SIM Campus).

**Live site:** [hackxperience2026.vercel.app](https://hackxperience2026.vercel.app)

---

## What's in this repo

| Area | Routes | Purpose |
|---|---|---|
| **Landing page** | `/` | Marketing site — hero, tracks, prizes, timeline, judges, sponsors, FAQ, committee |
| **Gallery** | `/gallery` | Photos from past hackathons |
| **Submit** | `/submit` | Team project submission form (time-gated via env) |
| **Admin** | `/admin/*` | Review submissions, settings, results, activity logs |
| **Judge** | `/judge/*` | Scoring dashboard for industry judges |
| **Login** | `/login` | Shared portal auth entry |

Machine-readable event summary for LLM crawlers: [`public/llms.txt`](public/llms.txt)

---

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 + React 19
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion 12
- **UI:** shadcn/ui (Radix), lucide-react
- **Backend:** Supabase (Postgres + Storage)
- **SEO:** next-sitemap (runs on `postbuild`)

---

## Dev setup

```bash
npm install
cp .env.local.example .env.local   # fill in values (see below)
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

```bash
npm run build    # production build + sitemap
npm run lint     # ESLint
npm run start    # serve production build
```

---

## Environment variables

Create `.env.local` in the project root.

### Supabase (required for submission + portals)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-side only** |
| `PORTAL_AUTH_SECRET` | Secret for admin/judge session signing |

### Landing page CTAs

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_TEAM_REGISTRATION_URL` | Team registration form (Microsoft Form) |
| `NEXT_PUBLIC_LOOKING_FOR_TEAM_URL` | Solo / incomplete team form |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |

When registration URLs are set, the hero and bottom CTA show **Register your team** as the primary button. Telegram stays as secondary.

### Submission window

The `/submit` page has three states driven by two optional time variables:

```
Before OPEN_AT              → "Submissions not yet open" (countdown)
Between OPEN_AT and DEADLINE → Form accessible
After DEADLINE              → "Submissions closed"
```

SGT = UTC+8 — subtract 8 hours when writing UTC values.

**Example — hackathon 24–25 July 2026, submission due 25 Jul 12:00 PM SGT:**

```env
NEXT_PUBLIC_SUBMISSION_OPEN_AT=2026-07-24T02:00:00Z      # 24 Jul 10:00 SGT
NEXT_PUBLIC_SUBMISSION_DEADLINE=2026-07-25T04:00:00Z     # 25 Jul 12:00 SGT
```

Omit either variable to remove that gate (useful during local testing).

---

## Supabase setup

### 1. Run the schema

Supabase dashboard → SQL Editor → paste and run [`supabase/schema.sql`](supabase/schema.sql).

### 2. Create the Storage bucket

Dashboard → Storage → New bucket:

- Name: `submission-assets`
- Public: **on**

Then run these storage policies in SQL Editor:

```sql
CREATE POLICY "Anyone can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'submission-assets');

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'submission-assets');
```

---

## Project structure

```
app/
  page.tsx                 # Landing page — composes all sections
  layout.tsx               # Root layout, metadata, analytics
  timeline.js              # Hackathon timeline, judges, sponsors
  pre_event.js             # Pre-event workshops
  components/              # Landing sections (hero, tracks, prizes, faq, …)
  submit/                  # Project submission portal
  admin/                   # Organiser dashboard
  judge/                   # Judge scoring dashboard
  gallery/                 # Past event photos
  api/                     # Submissions, auth, admin, judge routes
lib/
  hackathon-content.ts     # Theme + track copy (single source of truth)
  hackathon-prizes.ts      # Prize tiers + judging criteria
  hackathon-pre-events.ts  # Pre-event copy
  site-links.ts            # Registration URLs, Telegram link
public/
  judges/                  # Judge headshots
  sponsors/                # Sponsor logos
  llms.txt                 # LLM-readable event summary
```

**Content conventions**

- Hackathon copy lives in `lib/hackathon-*.ts` — update there first, then mirror in `llms.txt` if needed.
- Brand colours use inline `style` props (`#c00000` red, `#f2ede5` cream, `#1d1c17` dark) — not Tailwind colour utilities.
- Landing sections are assembled in `app/page.tsx` in display order.
- See [`CLAUDE.md`](CLAUDE.md) for design system and agent notes.

---

## API routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/submissions` | Create a submission |
| `GET` | `/api/submissions/[token]` | Fetch by edit token |
| `PUT` | `/api/submissions/[token]` | Update by edit token |
| `GET` | `/api/submissions/check` | Check duplicate team name |
| `POST` | `/api/auth/login` | Portal login |
| `GET` | `/api/auth/session` | Current session |
| `GET` | `/api/judge/projects` | Projects for judge dashboard |
| `PUT` | `/api/judge/scores/[submissionId]` | Save judge scores |
| `GET/PUT` | `/api/admin/submissions` | Admin submission management |
| `GET/PUT` | `/api/admin/settings` | Portal settings |

---

## Event quick reference

| | |
|---|---|
| **Dates** | 24–25 July 2026 |
| **Registration closes** | 16 July 2026, 23:59 SGT |
| **Submission deadline** | 25 July 2026, 12:00 PM SGT |
| **Team size** | 3–4 members |
| **Theme** | AI for Living |
| **Tracks** | Care Forward · Friction To Flow |
| **Telegram** | [SIM ITCommunity](https://t.me/+o_3QtjEFmNFhYmFl) |
| **Contact** | it@mymail.sim.edu.sg |

---

## Deploy

Hosted on Vercel. Set all production env vars in the Vercel project settings (same keys as `.env.local`). `next-sitemap` regenerates `public/sitemap.xml` and `public/robots.txt` on each build.
