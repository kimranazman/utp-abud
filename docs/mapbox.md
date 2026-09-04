# Map setup

The alumni map page draws tiles with Mapbox GL, so it needs a Mapbox access token. Without one the map page shows an error and a retry button; the rest of the site works normally.

The token is not built into the frontend. The browser asks the `get-mapbox-token` edge function for it, and that function reads it from the `MAPBOX_PUBLIC_TOKEN` secret in Supabase.

## 1. Get a token

1. Sign in at https://account.mapbox.com/.
2. Go to Account, then Access tokens.
3. Use the default public token or create a new one. It starts with `pk.`.

The token is a public one, meant to be visible in a browser. Limit it with URL restrictions and usage limits in the Mapbox dashboard.

## 2. Store it in Supabase

With the CLI, from the repository root:

```bash
supabase secrets set MAPBOX_PUBLIC_TOKEN="pk.your_token_here"
```

Or in the Supabase dashboard: Project Settings, Edge Functions, Manage secrets, add `MAPBOX_PUBLIC_TOKEN`.

## 3. Deploy the function and check

```bash
supabase functions deploy get-mapbox-token
```

Then open the map page at `/directory/alumni/map`. You should see the globe with alumni markers. Clicking a marker opens a popup, and zoom, rotate and pan work.

If the map does not load, check that the secret is set, that the function is deployed, and that your site's address is in the `ALLOWED_ORIGINS` secret. The function refuses calls from origins that are not on that list.
