# HackXperience 2026 — Landing & Submission Site

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase

---

## Dev setup

```bash
npm install
cp .env.local.example .env.local   # fill in your values (see below)
npm run dev
```

---

## Environment variables

Create `.env.local` in the project root. All variables are optional — omitting them keeps the submission page in development mode (always open, no countdown).

| Variable | Required for prod | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key — **server-side only, never expose** |
| `NEXT_PUBLIC_SUBMISSION_OPEN_AT` | No | ISO 8601 UTC — submissions locked before this time |
| `NEXT_PUBLIC_SUBMISSION_DEADLINE` | No | ISO 8601 UTC — submissions locked after this time |

### Setting the submission window

The submission page has three states driven by the two time variables:

```
 ──────────────────────────────────────────────────────
  Before OPEN_AT       →  "Submissions not yet open"
                             shows countdown to opening
  Between OPEN and DEADLINE  →  Form accessible
  After DEADLINE       →  "Submissions closed"
 ──────────────────────────────────────────────────────
```

**Example — hackathon runs 22 May 09:00 SGT → 23 May 00:00 SGT:**

```env
# SGT = UTC+8, so subtract 8 hours for UTC
NEXT_PUBLIC_SUBMISSION_OPEN_AT=2026-05-22T01:00:00Z
NEXT_PUBLIC_SUBMISSION_DEADLINE=2026-05-22T16:00:00Z
```

Omit either variable to remove that gate:
- No `OPEN_AT` → submissions are open from day one (useful during testing)
- No `DEADLINE` → submissions never close automatically

---

## Supabase setup

### 1. Run the schema

Open Supabase dashboard → SQL Editor → paste and run `supabase/schema.sql`.

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

## API routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/submissions` | Create a new submission |
| `GET` | `/api/submissions/[token]` | Fetch a submission by edit token |
| `PUT` | `/api/submissions/[token]` | Update a submission by edit token |

---

## Dev commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build + sitemap
npm run lint     # ESLint
```
