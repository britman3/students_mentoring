# PKH Mentoring — Slot Selection App

Mentoring group slot selection app for Property Know How. Students use magic links to select their fortnightly mentoring call slot.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Prisma 6** (PostgreSQL)
- **date-fns** for fortnightly week calculations (Europe/London timezone)
- **PM2** for production process management

## Setup

### 1. Environment Variables

```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

### 2. Database

**Option A — Docker:**
```bash
docker compose up -d
```

**Option B — Local PostgreSQL:**
```bash
# Create user and database
psql -U postgres -c "CREATE ROLE pkh_user WITH LOGIN PASSWORD 'pkh_dev_password' CREATEDB;"
psql -U postgres -c "CREATE DATABASE mentoring_db OWNER pkh_user;"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Migrations & Seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev:port    # Runs on port 3099
```

### Production (PM2)

```bash
npm run build
pm2 start ecosystem.config.js
```

## Project Structure

```
src/
  app/          — Next.js App Router pages
  lib/
    db.ts       — Prisma client singleton
    fortnightly.ts — Week 1/2 calculation logic
    assignment.ts  — Auto-assign student to slot instance
    tokens.ts      — Magic link token generation
prisma/
  schema.prisma — Full database schema
  seed.mts      — Database seed script
```

## Fortnightly Cycle

- **Anchor date:** Monday 6th January 2026
- **Week 1:** Even weeks from anchor (groups A–D)
- **Week 2:** Odd weeks from anchor (groups M–P)
- All dates use Europe/London timezone (handles BST/GMT transitions)
