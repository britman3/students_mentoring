# CLAUDE.md — Persistent Project Reference

> Single-source summary of docs/PROJECT_SPEC.md, docs/TECH_STACK.md, docs/BRAND_PACK.md, and docs/BUILD_INSTRUCTIONS.md. Consult the originals for full detail.

---

## Project Context

**Product name:** MentorConnect
**What it is:** A web platform that connects students with mentors for academic and career guidance. Mentors publish availability, students browse profiles and book sessions, both parties track progress.

### User Roles

| Role | Capabilities |
|------|-------------|
| Student | Browse mentors, book sessions, leave reviews, chat |
| Mentor | Set availability, accept/decline bookings, chat |
| Admin | Full CRUD on users, moderation tools, analytics |

### Core Features
1. **Auth & Profiles** — role-based sign-up/login, OAuth (Google), profile with bio/skills/avatar/availability.
2. **Mentor Discovery** — searchable/filterable directory (subject, rating, availability), mentor cards → full profile.
3. **Session Booking** — pick available slot, mentor confirms/declines, iCal export.
4. **Messaging** — real-time chat between matched pairs, notification badges + email digests.
5. **Feedback & Ratings** — 1-5 stars + written review post-session, aggregate rating on profile.
6. **Admin Dashboard** — user management, content moderation, platform analytics.

### Planned Routes
`/` (landing) · `/login` · `/signup` · `/mentors` · `/mentors/:id` · `/dashboard` · `/dashboard/sessions` · `/dashboard/messages` · `/admin`

### Non-Functional Requirements
- Mobile-first responsive design
- WCAG 2.1 AA accessible
- Page load ≤ 2 s on 3G
- 99.5% uptime target

---

## Tech Stack

### Front-End
| Concern | Choice |
|---------|--------|
| Framework | **Next.js 14** — App Router, React 18, Server Components |
| Language | **TypeScript 5** (strict mode) |
| Styling | **Tailwind CSS 3** (`tailwind.config.ts`) |
| Components | **shadcn/ui** (Radix primitives + Tailwind) |
| State | **React Context** (UI state) + **SWR** (server cache) |
| Forms | **React Hook Form + Zod** (validation shared with API) |
| Testing | **Vitest + React Testing Library** (unit/integration), **Playwright** (E2E) |
| Linting | **ESLint** (Airbnb-based) + **Prettier** |

### Back-End
| Concern | Choice |
|---------|--------|
| Runtime | **Node.js 20 LTS** |
| API | **Next.js Route Handlers** — REST under `app/api/` |
| Database | **PostgreSQL 16** (Supabase / Neon) |
| ORM | **Prisma 5** (`prisma/schema.prisma`) |
| Auth | **NextAuth.js v5** — credentials + Google provider |
| Real-time | **Socket.io** (chat & notifications) |
| File storage | **Cloudflare R2** (avatar uploads) |

### DevOps
- **pnpm** (package manager), **Turbo** (monorepo runner if needed)
- **Docker Compose** for local Postgres
- **GitHub Actions** CI, **Vercel** production hosting
- **Husky + lint-staged** pre-commit hooks

### Key Conventions
- Prefer **named exports** over default exports.
- Use barrel exports (`index.ts`) sparingly — only for a module's public API.
- All API responses follow the **`{ data, error, meta }` envelope**.
- Client-safe env vars prefixed `NEXT_PUBLIC_`.

---

## Brand Guidelines

- **Tagline:** "Grow together, learn forever."
- **Voice:** Friendly, encouraging, professional but not corporate.

### Colour Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#4F46E5` | Indigo — buttons, links, active states |
| `primary-light` | `#818CF8` | Hover states, highlights |
| `primary-dark` | `#3730A3` | Text on light backgrounds |
| `secondary` | `#F59E0B` | Amber — accents, badges, CTAs |
| `neutral-50` | `#F9FAFB` | Page background |
| `neutral-100` | `#F3F4F6` | Card backgrounds |
| `neutral-700` | `#374151` | Body text |
| `neutral-900` | `#111827` | Headings |
| `success` | `#10B981` | Positive feedback |
| `error` | `#EF4444` | Errors, destructive actions |

### Typography
- **Font:** Inter (loaded via `next/font/google`, `display: 'swap'`).
- H1: 700 / 2.25 rem (desktop) · 1.875 rem (mobile)
- H2: 600 / 1.875 rem · 1.5 rem
- H3: 600 / 1.5 rem · 1.25 rem
- Body: 400 / 1 rem
- Small/Caption: 400 / 0.875 rem
- Button: 500 / 0.875 rem

### Spacing & Layout
- Base unit: **4 px** (0.25 rem)
- Content max-width: **1 280 px** (`max-w-7xl`)
- Card border-radius: **0.75 rem** (`rounded-xl`)
- Padding: `p-4` mobile, `p-6` md+

### Icons & Images
- **Lucide React** icons — 20 px inline, 24 px standalone.
- Logos at `public/logo.svg` and `public/logo-dark.svg` (8 px min clearspace).
- Aspect ratios: hero 16:9, cards 4:3, avatars 1:1 (`rounded-full`).

---

## Build Rules

### Prerequisites
- Node.js ≥ 20 LTS · pnpm ≥ 9 · Docker & Docker Compose

### Dev Commands
```bash
pnpm install              # Install deps
pnpm dev                  # Dev server → localhost:3000
pnpm build                # Production build
pnpm lint                 # ESLint check
pnpm lint:fix             # ESLint auto-fix
pnpm format               # Prettier
pnpm test                 # Vitest unit/integration
pnpm test:e2e             # Playwright E2E
docker compose up -d      # Local PostgreSQL
pnpm prisma migrate dev   # Apply DB migrations
pnpm prisma generate      # Regen Prisma client
pnpm prisma studio        # DB GUI
```

### Required Environment Variables
`DATABASE_URL` · `NEXTAUTH_SECRET` · `NEXTAUTH_URL` · `NEXT_PUBLIC_APP_URL`

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

### CI Pipeline (GitHub Actions) — every push/PR
1. Lint (`pnpm lint`)
2. Type-check (`tsc --noEmit`)
3. Unit tests (`pnpm test`)
4. Build (`pnpm build`)
5. E2E tests (`pnpm test:e2e`) — `main` branch only

### Coding Standards
- All code must pass `pnpm lint` and `pnpm test` before merge.
- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `docs:`, etc.
- PRs require at least one approval.
- Merges to `main` auto-deploy to Vercel; PRs get preview deploys.

---

## Project Structure
```
app/                → Next.js App Router
  (auth)/           → Auth route group (login, signup)
  (dashboard)/      → Dashboard route group
  api/              → REST Route Handlers
  layout.tsx        → Root layout
  page.tsx          → Landing page
components/         → Shared UI components
  ui/               → shadcn/ui primitives
lib/                → Utilities & config
  db.ts             → Prisma client singleton
  auth.ts           → NextAuth config
  validations/      → Zod schemas
prisma/
  schema.prisma     → Database schema
  seed.ts           → Seed script
public/             → Static assets (logos, images)
docs/               → Project documentation
tests/              → Test files
```
