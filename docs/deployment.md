# Deployment

The site is a Vite single-page app deployed on Vercel. Pushing to `main` builds and deploys to production. Any other branch gets a preview URL.

## Build settings

Vercel detects Vite automatically. If you need to set them by hand:

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Routing, redirects and security headers are already defined in `vercel.json`.

## Environment variables

Set these in the Vercel project under Settings, Environment Variables, for the Production environment:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

These are the only two variables the frontend reads. The app fails to start if either is missing.

The Mapbox token is not a frontend variable. It is stored as a Supabase edge function secret. See [mapbox.md](mapbox.md).

## Supabase side

The backend lives in a Supabase project. Two things need to be deployed there.

### Database migrations

Migrations live in `supabase/migrations`. Apply them with the Supabase CLI:

```bash
supabase db push
```

### Edge functions

There are two functions in `supabase/functions`:

```bash
supabase functions deploy get-link-preview
supabase functions deploy get-mapbox-token
```

Both read the allowed browser origins from an `ALLOWED_ORIGINS` secret, a comma separated list of the sites that may call them. Set it to your production domains, for example:

```bash
supabase secrets set ALLOWED_ORIGINS="https://www.example.org,https://example.org"
```

Requests from other origins are refused by the CORS check in `supabase/functions/_shared/cors.ts`.

## Test the production build locally

```bash
npm run build
npm run preview
```

Open the address the preview command prints. The app's pages live under the `/abud` path. Check that sign in works, an admin page redirects a non-admin, the map loads, and the browser console is clean.

## After deploying

Worth checking on the live site:

- Sign in and sign out work.
- `/abud/admin` redirects anyone who is not an admin.
- The map page draws the globe and the markers.
- No CORS errors in the browser console when a page calls an edge function.

## Rolling back

Use the Vercel dashboard, or `vercel rollback`, to return to the previous deployment. Database migrations are not rolled back automatically; write a new migration to undo one.
