# Security Model

This is a demo/portfolio app with no user accounts. The model is deliberately
simple and layered: **public read and submit, admin-secret-gated mutations,
with Row Level Security as the database-level backstop.**

## Overview

| Operation | Who | Enforced by |
| --- | --- | --- |
| Read anything (all GET routes) | Anyone | Anon RLS `SELECT` policies |
| Submit an action item (`POST /api/action-items`) | Anyone | Anon RLS `INSERT` policy on `action_items` |
| Edit/delete action items (`PUT`/`DELETE /api/action-items/[id]`) | Admin secret holders | `requireAdmin()` + service-role client |
| Create/edit/delete sites, categories, sub-categories, statuses | Admin secret holders | `requireAdmin()` + service-role client |

All database access goes through Next.js API routes — the browser never talks
to Supabase directly.

## Layer 1: API-level admin gate

Every destructive route calls `requireAdmin()` (`lib/admin.ts`) before doing
anything. It compares the `x-admin-secret` request header against the
server-only `ADMIN_SECRET` env var using a constant-time comparison
(`crypto.timingSafeEqual` over SHA-256 digests, so length differences don't
leak timing either). Failures return a generic `401 Unauthorized` that does
not reveal whether the secret is configured.

Routes that pass the gate create a **per-request** Supabase client with the
`service_role` key (`createAdminClient()`), which bypasses RLS. That client
is never created at module level and never shared with public code paths.

The `/edit` page provides a minimal unlock: it prompts for the secret, keeps
it in `sessionStorage` (cleared when the tab closes), and sends it as the
header. This is a convenience for a demo app, not real authentication — the
server-side check is what actually protects the data.

## Layer 2: Row Level Security (database backstop)

Even if the API layer were bypassed or misconfigured, the anon key can only
do what the RLS policies in `supabase/migrations/002_harden_rls.sql` allow:

- `SELECT` on all five tables (read is public)
- `INSERT` on `action_items` only (the public submit form)
- **Nothing else.** No anon policy exists for `UPDATE` or `DELETE` on any
  table, or for `INSERT` on the lookup tables, so PostgreSQL denies them by
  default.

## Environment variables

All four variables are **server-only** — none use the `NEXT_PUBLIC_` prefix,
so none are compiled into client-side JavaScript.

| Variable | Sensitivity |
| --- | --- |
| `SUPABASE_URL` | Low — just the project endpoint, but still kept server-side |
| `SUPABASE_ANON_KEY` | Low — limited to the anon RLS policies above; kept server-side anyway since the browser never needs it |
| `SUPABASE_SERVICE_ROLE_KEY` | **High — bypasses RLS entirely. Treat like a database password.** |
| `ADMIN_SECRET` | **High — grants all destructive operations via the API.** |

In production, set them in Vercel's project settings (encrypted at rest,
never committed to the repository). Locally they live in `.env.local`, which
is gitignored.

## What an attacker gets at each layer

- **Anonymous web user**: can read everything and submit action items —
  exactly what the app is for. Cannot modify or delete anything.
- **Someone who somehow obtains the anon key**: same as above; the key is
  constrained by RLS. (It shouldn't leak — it's server-only — but it's not a
  catastrophe if it does.)
- **Someone who obtains `ADMIN_SECRET` or `SUPABASE_SERVICE_ROLE_KEY`**: full
  write access. Rotate immediately (regenerate the secret / rotate the key in
  Supabase → Settings → API) if you suspect compromise.

## Known dependency advisories

`npm audit` findings reviewed 2026-07-10 (production dependencies):

- **`xlsx` (high — [prototype pollution](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6), [ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9); no fixed npm release exists).**
  Not exploitable in this app's usage: xlsx is used in exactly one place
  (`lib/excel.ts`) to **generate** workbooks from our own database rows
  (`json_to_sheet` → `writeFile`). Both advisory classes require the library
  to **parse** an attacker-supplied spreadsheet, and no read/parse code path
  exists anywhere in the app.
- **`ws` (transitive, via `@supabase/realtime-js`).** The app never opens a
  realtime/websocket connection — all database access is server-side REST.
  A patched version is available via `npm audit fix` when convenient.
- **`postcss` (moderate, pinned inside `next` itself).** Resolves upstream
  with future Next.js releases; not directly actionable here.

Re-check with `npm audit --omit=dev` after dependency changes.

## Known limitations (accepted for a demo app)

- A single shared admin secret, not per-user auth or audit trails.
- No rate limiting on the public submit endpoint.
- The admin secret transits as a request header — fine over HTTPS (Vercel
  enforces it), but do not run this over plain HTTP.
