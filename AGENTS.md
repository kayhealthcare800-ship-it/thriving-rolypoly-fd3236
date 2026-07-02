# AGENTS.md

This document provides an overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

A clone of the "Faithful God" gratitude concert registration site (Obafemi Awolowo
University, July 17 2026). Public registration flow with live face-scan capture,
seating assignment, downloadable QR tickets, and a protected admin console. Built with
TanStack Start and deployed on Netlify.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Database | Netlify Database (Postgres) via Drizzle ORM (`@beta` dist-tag) |
| Object storage | Netlify Blobs (`faithfulgod-selfies` store) |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── db
│   ├── schema.ts   # Drizzle table definitions: registrations, admins, adminSessions, eventSettings
│   └── index.ts    # Drizzle client via drizzle-orm/netlify-db (no connection string needed)
├── drizzle.config.ts  # out: netlify/database/migrations (required for Netlify auto-apply)
├── netlify/database/migrations/  # Generated SQL migrations — never hand-edit or apply manually
├── src
│   ├── components
│   │   ├── Header.tsx          # Public site header (monogram + wordmark + registration-open pill)
│   │   ├── Footer.tsx          # Public site footer
│   │   └── InitialsAvatar.tsx  # Gold-gradient initials placeholder for ministers (no real photos)
│   ├── server
│   │   ├── blobs.ts                    # getSelfieStore() — Netlify Blobs store for selfie JPEGs
│   │   ├── device.functions.ts         # fg_device_id cookie bootstrap
│   │   ├── admin-auth.functions.ts     # admin login/logout/session, first-admin bootstrap
│   │   └── registrations.functions.ts  # registration CRUD, ticket ref/seating assignment, admin dashboard queries
│   ├── routes
│   │   ├── __root.tsx              # Root layout/shell
│   │   ├── index.tsx                # Home page (/)
│   │   ├── register.tsx             # Two-step registration (profile → face scan)
│   │   ├── ticket.$ref.tsx          # Ticket display + QR + PNG export
│   │   ├── retrieve.tsx             # Retrieve pass by email
│   │   ├── api.selfie.$key.tsx      # Serves a selfie JPEG from Blobs by ticket ref
│   │   ├── admin.login.tsx          # Admin login
│   │   ├── admin.setup.tsx          # One-time first-admin bootstrap (self-disables)
│   │   ├── admin.logout.tsx         # Clears session cookie
│   │   ├── admin.index.tsx          # Admin dashboard (/admin)
│   │   └── admin.capacity.tsx       # Main hall capacity settings
│   ├── router.tsx    # TanStack Router setup
│   └── styles.css    # Tailwind import + @theme palette tokens + .input utility class
├── netlify.toml
├── package.json
└── tsconfig.json
```

## Key Conventions & Non-Obvious Decisions

### Color palette

Defined once in `src/styles.css` via CSS custom properties (`--fg-cream`, `--fg-maroon`,
`--fg-gold`, `--fg-ink`) and mirrored into a Tailwind 4 `@theme` block so utilities like
`bg-fg-maroon`, `text-fg-gold`, `border-fg-gold/20` work directly. Do not introduce new
ad-hoc colors — extend the theme block instead.

### Selfies live in Blobs, not Postgres

`registrations.selfieKey` stores only the Blobs key (equal to the ticket ref). The
actual JPEG bytes live in the `faithfulgod-selfies` Blobs store. This keeps binary data
out of the relational schema per the netlify-blobs vs netlify-database guidance. Selfies
are served to the browser via `src/routes/api.selfie.$key.tsx`.

### Device-lock

A `fg_device_id` HTTP-only cookie (random UUID, set on first contact) is checked
alongside email before creating a registration (`getExistingRegistrationForDevice`,
`submitRegistration` in `registrations.functions.ts`). This prevents one device/browser
from creating multiple registrations; matching device or email redirects straight to the
existing ticket instead of erroring.

### Ticket ref / seating assignment

Ticket refs are `FG-000N` (zero-padded to 4 digits), assigned as `count(*) + 1` at
submission time. Seating is `hall_pass` while total registrations are below
`event_settings.main_hall_capacity` (default 2000, editable at `/admin/capacity`),
`overflow` afterwards. This is a simple sequential counter, not concurrency-safe against
simultaneous submissions at the exact capacity boundary — acceptable for this event's
scale.

### Admin auth

Custom bcrypt + random-token session auth (no third-party identity provider): a session
token is stored in `admin_sessions` with an expiry and set as an HTTP-only cookie.
`/admin/setup` is the only way to create the first admin, and it checks the `admins`
table is empty before allowing creation — it becomes inert afterwards. There is no UI to
create additional admins beyond direct DB access.

### QR codes and ticket export

QR codes are generated client-side with the `qrcode` package's browser build (`toDataURL`
against a verification URL). The ticket card PNG export uses `html-to-image`'s `toPng`
against a ref'd DOM node — chosen over `html2canvas` per project constraints (lighter,
actively maintained).

## Development Commands

```bash
npm install
netlify dev      # required — provides Netlify Database + Blobs locally
npm run build    # production build (also run automatically by the platform)
```

Do not run `npm run build`/`vite build`/dev servers as a substitute for manual
verification during agent sessions unless explicitly asked — the platform validates
builds automatically.

### Schema changes

Edit `db/schema.ts`, then run `npx drizzle-kit generate` to produce a migration in
`netlify/database/migrations/`. Never hand-write SQL migrations for Drizzle-managed
tables, and never run `drizzle-kit migrate`/`push` — Netlify applies migrations
automatically at deploy time.

## Conventions

### Naming
- Components: PascalCase
- Server function modules: `*.functions.ts` under `src/server/`
- Routes: TanStack Start file-based dot notation (e.g. `admin.capacity.tsx` → `/admin/capacity`)

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias for `src/*`
- Zod-style `inputValidator` on all server functions that accept input (TanStack Start
  server functions use `.inputValidator(...)`, not `.validator(...)`)
