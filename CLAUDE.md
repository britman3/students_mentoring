# PKH Mentoring App - Claude Code Reference

> This file exists so any Claude Code instance working on this repo immediately
> understands the tech stack, project layout, and deployment setup.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5 |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 6.19.2 |
| Styling | Tailwind CSS | v4 |
| Icons | Lucide React | 0.563.0 |
| Auth | Custom HMAC-SHA256 sessions + bcryptjs | - |
| Email | Resend | 6.9.1 |
| Notifications | Slack webhooks | - |
| Process Manager | PM2 | - |
| Package Manager | npm (NOT pnpm) | - |

## Production Server

- **Path:** `/opt/students_mentoring/pkh-mentoring`
- **Port:** 3099
- **PM2 name:** `pkh-mentoring`
- **Timezone:** `Europe/London` (critical for fortnightly logic)

## Environment Variables (.env)

```
DATABASE_URL="postgresql://pkh_user:pkh_dev_password@localhost:5433/mentoring_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3099"
PORT=3099
ADMIN_PASSWORD=changeme
RESEND_API_KEY=
SLACK_WEBHOOK_URL=
SESSION_SECRET=pkh-dev-session-secret-change-in-prod
TZ=Europe/London
```

Production values will differ. `SESSION_SECRET` and `ADMIN_PASSWORD` MUST be changed.

## Database

**Docker (dev):**
```bash
docker compose up -d   # PostgreSQL on port 5433
```

**Credentials (dev):** `pkh_user` / `pkh_dev_password` / `mentoring_db`

**Key commands:**
```bash
npx prisma migrate deploy   # Apply migrations (production)
npx prisma migrate dev       # Apply migrations (dev, also regenerates client)
npx prisma db seed            # Seed default data (Settings, Slots, Programme, test links)
npx prisma studio             # Database GUI
npx prisma generate           # Regenerate Prisma client
```

**Seed creates:** Settings (admin password "changeme"), 4 slots (Tue/Wed 12:00/16:00),
8 slot instances (Week 1: A-D, Week 2: M-P), 1 programme, 10 test magic links.

## Build & Deploy

```bash
npm install
npm run build
pm2 start ecosystem.config.js   # or: pm2 restart pkh-mentoring
pm2 logs pkh-mentoring
```

## Project Structure

```
pkh-mentoring/
  src/
    app/
      admin/           # Admin dashboard pages (login, students, slots, links, stats, settings)
      api/
        admin/         # Protected API routes (auth, students, slots, links, stats)
        enrol/         # Public enrollment API (token validation + student creation)
        slots/         # Public slot availability
      enrol/[token]/   # Student enrollment page (magic link entry point)
    components/        # EnrolmentForm, ConfirmationScreen
    lib/
      auth.ts          # Session cookies, password verification (HMAC-SHA256 + bcrypt)
      db.ts            # Prisma client singleton
      fortnightly.ts   # Week 1/2 calculation from anchor date (6 Jan 2026)
      assignment.ts    # Auto-assign student to least-full slot instance
      tokens.ts        # Magic link token generation (nanoid 21)
      email.ts         # Resend email sending
      slack.ts         # Slack webhook notifications
      display.ts       # UI formatting helpers
    middleware.ts      # Auth guard for /admin/* and /api/admin/* routes
  prisma/
    schema.prisma      # Full database schema
    seed.mts           # Database seed script
    migrations/        # Migration history
  ecosystem.config.js  # PM2 production config
  docker-compose.yml   # PostgreSQL 16 container
```

## Admin Authentication

1. Password checked first against `ADMIN_PASSWORD` env var (plaintext), then against
   `Settings.adminPasswordHash` in database (bcrypt)
2. On success, sets `pkh_admin_session` cookie (HMAC-SHA256 signed timestamp, 24hr expiry)
3. Middleware validates cookie on all `/admin/*` and `/api/admin/*` routes
4. Login page: `/admin/login` | Auth API: `POST/DELETE /api/admin/auth`

## Key Database Models

- **Settings** - Global config (capacity, anchor date, admin password hash)
- **Slot** - Recurring time slot (day + time + zoom link)
- **SlotInstance** - Week 1 or Week 2 occurrence of a slot (groups A-D / M-P)
- **Student** - Enrolled student (status lifecycle: PROSPECT -> ENROLLED -> SLOT_SELECTED -> ACTIVE)
- **MagicLink** - Single-use enrollment token (status: UNUSED -> SENT -> OPENED -> COMPLETED)
- **WaitlistEntry** - Waitlist for full slots
- **Payment, Arrangement, Closer, Programme, ActivityLog** - Expansion tables

## Fortnightly Cycle

- Anchor: Monday 6 Jan 2026
- Week 1 = even weeks from anchor (groups A-D)
- Week 2 = odd weeks from anchor (groups M-P)
- Capacity: 12 students per slot instance (configurable in Settings)

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/admin/auth | No | Admin login |
| DELETE | /api/admin/auth | No | Admin logout |
| GET/POST | /api/admin/students | Yes | List/create students |
| PATCH/DELETE | /api/admin/students/[id] | Yes | Update/delete student |
| GET/POST | /api/admin/slots | Yes | List/create slots |
| PATCH/DELETE | /api/admin/slots/[id] | Yes | Update/delete slot |
| GET/POST | /api/admin/links | Yes | List/create magic links |
| DELETE | /api/admin/links/[id] | Yes | Revoke magic link |
| GET | /api/admin/stats/summary | Yes | Dashboard stats |
| GET | /api/enrol/[token] | No | Validate magic link |
| POST | /api/enrol | No | Complete enrollment |
| GET | /api/slots/available | No | Available slots |
