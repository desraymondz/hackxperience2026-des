@AGENTS.md

# HackXperience Landing Page

## Project Overview

Landing page for **HackXperience 2026**, a 24-hour hackathon organised by ITClub at SIM. The event targets students (Year 1–3) across roles: web devs, AI engineers, designers, PMs, and business analysts. The previous run produced 20 projects from 90+ builders and won SIM's Outstanding Event Award (Silver).

## Tech Stack

- **Framework**: Next.js 16.2.2 (App Router) with Turbopack
- **Language**: TypeScript 5 + React 19
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion 12
- **UI Components**: shadcn/ui (via Radix UI), lucide-react
- **SEO**: next-sitemap

## Design System

Inline style constants are used throughout — do not replace with Tailwind colour utilities:

```ts
const RED      = "#c00000"   // primary accent / CTA
const DARK_RED = "#A20000"   // hover state
const CREAM_BG = "#f2ede5"   // page background
const DARK_BG  = "#1d1c17"   // card / section background
const DARK_TEXT = "#1d1c17"
const OFF_WHITE = "#fef9f1"
```

Typography: **Montserrat** (body / headings) + **IBM Plex Mono** (labels, badges, mono elements) from `next/font/google`.

Visual language: brutalist / hacker aesthetic — bold uppercase type, hard box-shadows, monospace labels prefixed with `//`.

## Project Structure

```
app/
  page.tsx              # Root page — composes all sections
  layout.tsx            # Root layout (fonts, metadata)
  globals.css           # Global styles
  pre_event.js          # Pre-event workshops section
  timeline.js           # Event timeline section
  components/
    navbar.tsx
    hero.tsx            # Countdown timer + CTA (target date: May 22 2026)
    about.tsx           # Hackathon overview + stats
    pastEvents.tsx      # Gallery from previous year
    timelineCta.tsx     # Final CTA with timeline
    faq.tsx
    committee.tsx
    footer.tsx
    ui/                 # shadcn/ui primitives
lib/
  utils.ts              # cn() helper (clsx + tailwind-merge)
public/
  OmniTool*.jpg         # Workshop / sponsor images
  PastYear*.jpg         # Previous event photos
```

## Key Conventions

- All sections are assembled in `app/page.tsx` — add new sections here in order.
- Use inline `style` props for brand colours; Tailwind classes for layout/spacing only.
- Components are functional React with explicit TypeScript types.
- No server components in section files (page is `"use client"`).
- `next-sitemap` runs automatically on `npm run build` (postbuild hook).

## Dev Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build + generate sitemap
npm run lint     # ESLint
```

## Notes

- The countdown in `hero.tsx` targets `May 22, 2026 00:00:00` — update if event date changes.
- External links (Telegram group) are in `hero.tsx`; verify they're still valid before deploy.
- `AGENTS.md` warns: this Next.js version (16.x) has breaking changes — check `node_modules/next/dist/docs/` before adding new Next.js patterns.