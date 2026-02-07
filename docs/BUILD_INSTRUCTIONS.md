# Build Instructions

## Prerequisites
- **Node.js** ≥ 20 LTS
- **pnpm** ≥ 9
- **Docker** & Docker Compose (for local database)

## Getting Started

```bash
# 1. Clone the repo
git clone <repo-url> && cd students_mentoring

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in required values (see Environment Variables below)

# 4. Start the local database
docker compose up -d

# 5. Run database migrations
pnpm prisma migrate dev

# 6. Seed the database (optional)
pnpm prisma db seed

# 7. Start the dev server
pnpm dev          # → http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm format` | Prettier format |
| `pnpm test` | Run Vitest unit/integration tests |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm prisma migrate dev` | Apply pending migrations |
| `pnpm prisma studio` | Open Prisma Studio GUI |
| `pnpm prisma generate` | Regenerate Prisma client |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random 32-char secret |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` in dev |
| `GOOGLE_CLIENT_ID` | No | OAuth — Google |
| `GOOGLE_CLIENT_SECRET` | No | OAuth — Google |
| `R2_ACCESS_KEY_ID` | No | Cloudflare R2 uploads |
| `R2_SECRET_ACCESS_KEY` | No | Cloudflare R2 uploads |
| `R2_BUCKET_NAME` | No | Cloudflare R2 uploads |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL |

## Project Structure

```
students_mentoring/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth route group
│   ├── (dashboard)/      # Dashboard route group
│   ├── api/              # Route Handlers
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Shared UI components
│   ├── ui/               # shadcn/ui primitives
│   └── ...               # Feature components
├── lib/                  # Utilities, helpers, config
│   ├── db.ts             # Prisma client singleton
│   ├── auth.ts           # NextAuth config
│   └── validations/      # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── public/               # Static assets
├── docs/                 # Project documentation
├── tests/                # Test files
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## CI Pipeline (GitHub Actions)

Every push and PR triggers:
1. **Lint** — `pnpm lint`
2. **Type-check** — `pnpm tsc --noEmit`
3. **Unit tests** — `pnpm test`
4. **Build** — `pnpm build`
5. **E2E tests** — `pnpm test:e2e` (on `main` only)

## Deployment

- Merges to `main` auto-deploy to **Vercel** production.
- Preview deployments are created for every PR.

## Coding Standards
- All new code must pass `pnpm lint` and `pnpm test` before merge.
- Commit messages follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.).
- PRs require at least one approval before merge.
- Keep bundle size in check — run `pnpm build` and review output.
