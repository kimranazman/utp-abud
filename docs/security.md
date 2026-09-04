# Security

How the application protects itself, and the rules to follow when adding to it.

## Reporting a problem

Please do not open a public issue for a security problem. Report it privately to the repository owner.

## What is in place

### Credentials

The Supabase client in `src/integrations/supabase/client.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the environment and refuses to start if either is missing. There are no credentials in the source. Keep `.env` and `.env.local` out of git; `.env.example` shows the names only.

Only the anon key is ever used in the browser. The service role key must never appear in frontend code.

### Row level security

All data access from the browser goes through Postgres row level security policies defined in `supabase/migrations`. The policies, not the client code, decide what a member can read and write. Sensitive operations are recorded in the `security_audit_log` table.

### Protected routes

`src/components/ProtectedRoute.tsx` guards pages. It takes `requireAdmin` and `requireCompleteProfile` options, and the admin pages in `src/App.tsx` are wrapped with `requireAdmin`. The role is checked against the database, and the policies enforce it again on the server side.

### Edge function CORS

`supabase/functions/_shared/cors.ts` builds the CORS headers from an allow list. Local development addresses are allowed by default, and production origins come from the `ALLOWED_ORIGINS` secret, a comma separated list. Calls from any other origin are refused.

### Link preview and SSRF

`supabase/functions/get-link-preview` fetches a page to build a chat link preview, so it is careful about what it will fetch:

- The caller must send an Authorization header.
- Only `http` and `https` URLs, up to 2048 characters.
- Private and internal addresses are blocked, including `10.x`, `172.16` to `172.31`, `192.168.x`, `127.x`, `169.254.x`, `localhost`, `0.0.0.0`, and IPv6 loopback, link local and unique local ranges.
- Requests time out after 10 seconds and responses are capped at 5 MB.

### Output escaping

`src/lib/sanitize.ts` wraps DOMPurify and exports `sanitizeHtml`, `sanitizeText`, `sanitizeUrl` and `createSafeSvg`. Member supplied text is written with `textContent` or run through these helpers before it reaches the page.

### Security headers

A Content Security Policy plus `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy` and `Permissions-Policy` are set in three places: `vercel.json` for the hosted site, `public/_headers`, and meta tags in `index.html`. If you change one, change all three so they stay in step.

## Rules for new code

- No credentials or API keys in source.
- Every new table gets row level security policies in the same migration.
- Never assign member supplied text to `innerHTML`; use `textContent` or `sanitizeHtml`.
- Validate a URL with `sanitizeUrl` before navigating to it or rendering it as a link.
- Do not rely on a client side role check alone; wrap the route and back it with a policy.
- Error messages returned to the browser should not leak internal detail.
- Add any new environment variable to `.env.example`.

## Rotating the Supabase anon key

Rotate after any suspected exposure, when someone with access leaves, and on a regular schedule.

1. In the Supabase dashboard, under Project Settings, API, reset the anon key.
2. Update `VITE_SUPABASE_ANON_KEY` in Vercel and in local `.env` files.
3. Redeploy.
4. Check sign in, an authenticated page, and the edge functions.

## Known gaps

- No rate limiting on the edge functions.
- `get-mapbox-token` does not require an authenticated caller. It is protected by the origin allow list, and the token it returns is a public Mapbox token.
- No CSRF tokens; the app relies on Supabase JWTs.
- No idle session timeout, no multi factor sign in.
- Admin actions are not fully covered by the audit log.

## Routine checks

```bash
npm audit
npm run lint
npm run build
```
