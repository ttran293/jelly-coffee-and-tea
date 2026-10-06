# Jelly Coffee Lab

A small coffee and tea recipe notebook. The page has About, Drinks, Toppings, and Card sections, with three drinks and one topping. The homepage card section has a Three.js book-ring preview featuring the go-to basic matcha latte, plus matching printable front and back SVG artwork. Visitors can choose Blush Sky, Spring Mist, or Garden Glow; the other theme palettes remain in the project. The site also has a Supabase visit counter. The selected theme is saved in a one-year cookie; Blush Sky is the default.

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

## Sound credit

The card uses a trimmed recording of [“Turning a page” by planish](https://commons.wikimedia.org/wiki/File:Turning_a_page.ogg), released into the public domain. The original Ogg and the edited MP3 are in `public/sounds/`.
