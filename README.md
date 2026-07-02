# Faithful God — Gratitude Concert 2026

A full event registration site: for a concert or event.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (file-based routing) |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (`@theme` tokens in `src/styles.css`) |
| Database | Netlify Database (Postgres) + Drizzle ORM |
| File storage | Netlify Blobs (selfie photos) |
| Auth | Custom email/password admin login, bcrypt + signed session tokens |
| QR codes | `qrcode` (client-side data URL generation) |
| Ticket export | `html-to-image` (PNG export of the ticket card) |
| Language | TypeScript (strict mode) |
| Deployment | Netlify |

## Features

- **Home page** (`/`) — hero, concert info, featured ministers, enquiries banner.
- **Registration** (`/register`) — two-step flow (profile → live face scan via
  `getUserMedia`), with a live-updating pass preview panel. Assigns a ticket ref
  (`FG-0001`, …) and seating type (`hall_pass` vs `overflow`) based on a configurable
  main hall capacity.
- **Ticket page** (`/ticket/$ref`) — shows the selfie, QR code, and a "Download Ticket"
  PNG export.
- **Retrieve pass** (`/retrieve`) — look up an existing ticket by email.
- **Admin console** (`/admin`) — stats, search/filter, mark-present, bulk delete, and a
  capacity settings page (`/admin/capacity`), protected by session cookies.
- **Admin bootstrap** (`/admin/setup`) — one-time route to create the first admin
  account; automatically disables itself once an admin exists.

## Running Locally

This project depends on Netlify Database and Netlify Blobs, both of which require the
Netlify CLI / dev environment:

```bash
npm install
netlify dev
```

`netlify dev` provisions the local Blobs emulation and connects to your linked site's
database branch. Running `vite dev` directly will not have working Blobs/Database
access.

### First-time setup

1. Start the app and visit `/admin/setup` to create the first admin account (email +
   password, min 8 characters). This route only works while the `admins` table is
   empty — it 404s/refuses once an admin exists.
2. Log in at `/admin/login`.
3. Adjust the main hall seating capacity at `/admin/capacity` (defaults to 2000).

### Database migrations

Schema lives in `db/schema.ts`. After changing it, generate a migration:

```bash
npx drizzle-kit generate
```

Migrations are written to `netlify/database/migrations/` and applied automatically by
Netlify on deploy — do not run `drizzle-kit migrate` or `push` yourself.

## Environment

No manual environment variables are required — Netlify Database and Netlify Blobs are
auto-provisioned per site/branch.
