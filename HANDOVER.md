# utpalumni.org Handover

This document describes what the utpalumni.org website (UTP Alumni Business Directory, "ABuD") consists of and how a new operator takes it over to run entirely on their own accounts. Once complete, nothing depends on the previous operator's servers or accounts.

---

## Part 1: What you are receiving

The site is made of four pieces. You need all four.

| Piece | What it is | How it transfers |
|---|---|---|
| Website code | React (Vite) single-page app, this repository, deployed on Vercel | Public GitHub repository, fork or clone it |
| Database and member logins | Supabase (Postgres, Auth, REST, Storage), currently self-hosted at `api.utpalumni.org` | Database export file, provided separately and privately |
| Uploaded images | Member avatars, business logos, banners and product photos, stored in a Supabase bucket named `images` | Included with the database export |
| Domain and DNS | `utpalumni.org` with `www` and `api` records, managed in Cloudflare | Account-to-account transfer |

Third-party services the app talks to, each needing its own account and key:

- **Supabase** (required): database, member accounts, file storage and edge functions.
- **Mapbox** (optional): the directory map. The token is served by the `get-mapbox-token` edge function.

### What is not handed over

No account, server, API key or password belonging to the previous operator. Every key is rotated at handover and every account is created fresh in your name. The Cloudflare Tunnel that currently connects `api.utpalumni.org` to the previous host is shut down at cutover.

---

## Part 2: Steps

### Step 0. Accounts to create first

1. GitHub, to hold your own copy of the code.
2. Supabase (https://supabase.com). The free tier covers the current size; Pro adds daily backups.
3. Vercel (https://vercel.com). The Hobby tier is enough.
4. Cloudflare (https://cloudflare.com). Free plan.
5. Mapbox, only if you want the map feature.

### Step 1. Receive the code

This repository is public. Fork it into your own GitHub account or organisation, or clone it and push it to a new repository you own. Your copy is the one you will deploy from and make changes to. Once your site is live you can keep your copy private if you prefer.

### Step 2. Receive the data export

You receive a zip file, sent privately. It contains a Postgres export of the `public`, `auth` and `storage` schemas (structure and rows, including member accounts with their password hashes), the image files from the `images` bucket in their original folder layout, a table listing each image's bucket, path and content type, and a checksum manifest.

The zip contains personal data of every member. Keep it confidential and delete it once your import is verified.

### Step 3. Set up Supabase and import

1. Create a new Supabase project and note its project URL, anon key, service role key and database connection string.
2. Restore the database from the export into your project: roles first, then structure, then rows. Verify afterwards that the member count in the auth users table and the object count in the storage table match the numbers in the manifest. Member passwords carry over, so nobody needs to reset.
3. Create a public bucket named `images` and upload the exported image files with the same paths and content types. Each object must be uploaded through the Supabase Storage API, not copied to disk, so that the storage table and the files stay in sync.
4. Deploy the edge functions from `supabase/functions` with the Supabase CLI and set the Mapbox token secret.
5. In Authentication settings, set the site URL to `https://www.utpalumni.org/abud`, add the same host to the redirect list, and configure an SMTP sender if you want sign-up and password-reset emails from your own domain.

### Step 4. Deploy the website on Vercel

1. Import your copy of the repository as a new Vercel project. Framework is Vite; build settings are already in `vercel.json`.
2. Set the production environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your project's values.
3. Deploy and test on the temporary Vercel address: browse the directory, log in as an existing member, open a business page, upload an avatar.

### Step 5. Move the domain

1. Take over the `utpalumni.org` domain registration and the Cloudflare zone into your own account.
2. Remove the old `api` DNS record. It pointed at the previous host and is no longer used; the app talks to your Supabase project URL directly.
3. Point `www` and the apex at Vercel as Vercel's domain instructions describe, and add both hostnames to the Vercel project. The redirect from the apex to `www` and on to `/abud` is handled by `vercel.json`.
4. Confirm the site loads at https://www.utpalumni.org/abud and logins work.

### Step 6. Previous operator shuts down

Only after you confirm Step 5, the previous operator stops the self-hosted Supabase stack and tunnel, deletes its Vercel project, removes the domain from their Cloudflare account, and deletes their copies of the export.

### Step 7. Ongoing care

- **Backups:** Supabase Pro takes daily backups. On the free tier, export the database and download the `images` bucket monthly.
- **Code updates:** push to `main`; Vercel deploys automatically. Any other branch gets a preview URL.
- **Schema changes:** migrations live in `supabase/migrations` and are applied with the Supabase CLI.

---

## Part 3: Quick reference

- Frontend env vars (Vercel): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Edge function secrets (Supabase): `MAPBOX_PUBLIC_TOKEN`
- Storage bucket: `images` (public)
- Content Security Policy: `vercel.json`, `public/_headers` and `index.html` allow any `*.supabase.co` host, so no change is needed when you switch projects
- Schema documentation: `docs/database.md`
- Deployment notes: `docs/deployment.md`
- Map token setup: `docs/mapbox.md`
- Security notes: `docs/security.md`

## Migration support

The previous operator can carry out the full migration (data import, storage restore, edge functions, auth configuration, DNS cutover and verification) as a paid service. Ask them for a quote.
