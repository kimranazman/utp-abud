# UTP Alumni Business Directory

A member directory for UTP alumni and the businesses they run. Alumni create a profile, list their business with services, images and locations, browse the directory, see other members on a world map, and message each other.

Live at https://utpalumni.org

## Stack

- React and TypeScript, built with Vite
- Tailwind CSS with shadcn/ui components
- Supabase for the database, member sign in, file storage and edge functions
- Hosted on Vercel

## Running it locally

You need Node.js and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local` before starting. The app reads two variables and will not start without them:

- `VITE_SUPABASE_URL`, your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`, your Supabase anon key

Other scripts:

```bash
npm run build     # production build into dist
npm run preview   # serve the production build
npm run lint      # eslint
```

The application pages live under the `/abud` path, with the public directory pages at `/directory`.

## Documentation

- [HANDOVER.md](HANDOVER.md), what the site is made of and how to take it over on your own accounts
- [CHANGELOG.md](CHANGELOG.md), release history
- [docs/deployment.md](docs/deployment.md), deploying the site, the migrations and the edge functions
- [docs/database.md](docs/database.md), tables, storage and how to change the schema
- [docs/mapbox.md](docs/mapbox.md), setting up the map token
- [docs/security.md](docs/security.md), the protections in place and the rules for new code
