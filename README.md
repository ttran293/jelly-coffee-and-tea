# Jelly Coffee Lab

A small coffee and tea recipe notebook. The page has three drinks, four visitor-selectable color themes, and a Supabase visit counter. The selected theme is saved in a one-year cookie; Butter Paper is the default.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Visit counter

Create `.env.local` from `.env.example` and set `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. The secret is read only by `app/api/visits/route.ts`. Local environment files are ignored by `.gitignore`.

Run [`supabase/page-visits.sql`](supabase/page-visits.sql) once in the Supabase SQL Editor. The counter records one visit per browser every 24 hours; refreshes show the current total. Set the same two variables in Vercel's project environment settings for the deployed counter.

## Build

```sh
npm run build
```

The site uses Next.js. Vercel should use the Next.js framework preset and the default `.next` output directory.

The main page is in `app/page.tsx`, its styles are in `app/globals.css`, and the drink images are in `public/`.
