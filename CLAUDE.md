# CLAUDE.md — Project Context & Reference

> Persistent reference for AI-assisted development on the Students Mentoring platform.

---

## Project Overview

**MentorConnect** is a web platform connecting students with mentors for academic and career guidance. Mentors publish availability, students browse/book sessions, and both track progress over time.

**Three user roles:** Student, Mentor, Admin.

**Core features:** Auth & profiles, mentor discovery (search/filter), session booking with calendar, real-time chat, post-session ratings/reviews, admin dashboard.

**Key routes:** `/` (landing), `/login`, `/signup`, `/mentors`, `/mentors/:id`, `/dashboard`, `/dashboard/sessions`, `/dashboard/messages`, `/admin`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, React 18, Server Components) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 |
| Components | shadcn/ui (Radix + Tailwind) |
| State | React Context + SWR |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL 16 (Supabase/Neon) via Prisma 5 |
| Auth | NextAuth.js v5 (credentials + Google) |
| Real-time | Socket.io |
| File storage | Cloudflare R2 |
| Package manager | pnpm |
| Testing | Vitest + React Testing Library (unit), Playwright (E2E) |
| Linting | ESLint (Airbnb-based) + Prettier |
| CI | GitHub Actions |
| Hosting | Vercel |

**API convention:** All responses use `{ data, error, meta }` envelope. REST endpoints live in `app/api/`.

---

## Brand Guidelines

- **Tagline:** "Grow together, learn forever."
- **Voice:** Friendly, encouraging, professional but not corporate.
- **Primary colour:** `#4F46E5` (Indigo) — buttons, links, active states.
- **Secondary colour:** `#F59E0B` (Amber) — accents, badges, CTAs.
- **Error:** `#EF4444` | **Success:** `#10B981`
- **Neutrals:** `#F9FAFB` (bg) → `#111827` (headings).
- **Font:** Inter (via `next/font/google`, `display: 'swap'`).
- **Icons:** Lucide React (20 px inline, 24 px standalone).
- **Spacing base:** 4 px. Content max-width: `max-w-7xl`. Card radius: `rounded-xl`.
- **Logos:** `public/logo.svg`, `public/logo-dark.svg`.

---

## Build & Dev Commands

```bash
pnpm install            # Install dependencies
pnpm dev                # Dev server → http://localhost:3000
pnpm build              # Production build
pnpm lint               # ESLint check
pnpm lint:fix           # ESLint auto-fix
pnpm format             # Prettier format
pnpm test               # Vitest unit/integration tests
pnpm test:e2e           # Playwright E2E tests
pnpm prisma migrate dev # Apply DB migrations
pnpm prisma generate    # Regenerate Prisma client
pnpm prisma studio      # Open DB GUI
```

**Local DB:** `docker compose up -d` (PostgreSQL).

---

## Build Rules & Standards

1. All code must pass `pnpm lint` and `pnpm test` before merge.
2. Commit messages follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.).
3. PRs require at least one approval.
4. CI pipeline on every push: lint → type-check (`tsc --noEmit`) → unit tests → build → E2E (main only).
5. Merges to `main` auto-deploy to Vercel; PRs get preview deploys.
6. Prefer **named exports** over default exports.
7. Environment variables: client-safe values prefixed `NEXT_PUBLIC_`.
8. Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`.

---

## Project Structure

```
app/              → Next.js App Router (routes, layouts, API handlers)
  (auth)/         → Auth route group
  (dashboard)/    → Dashboard route group
  api/            → REST Route Handlers
components/       → Shared UI (components/ui/ for shadcn primitives)
lib/              → Utilities, config (db.ts, auth.ts, validations/)
prisma/           → schema.prisma, seed.ts
public/           → Static assets (logos, images)
docs/             → Project documentation
tests/            → Test files
```

---

## Non-Functional Requirements

- Mobile-first responsive design.
- WCAG 2.1 AA accessible.
- Page load ≤ 2 s on 3G.
- 99.5% uptime target.
