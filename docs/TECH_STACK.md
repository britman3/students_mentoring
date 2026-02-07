# Tech Stack

## Front-End
| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 14** (App Router) | React 18, Server Components |
| Language | **TypeScript 5** | Strict mode enabled |
| Styling | **Tailwind CSS 3** | Utility-first; config in `tailwind.config.ts` |
| Component lib | **shadcn/ui** | Radix primitives + Tailwind |
| State management | **React Context + SWR** | SWR for server cache; Context for UI state |
| Forms | **React Hook Form + Zod** | Validation shared with API |
| Testing | **Vitest + React Testing Library** | Unit & integration |
| E2E Testing | **Playwright** | Cross-browser |
| Linting | **ESLint + Prettier** | Airbnb-based config |

## Back-End
| Layer | Choice | Notes |
|-------|--------|-------|
| Runtime | **Node.js 20 LTS** | |
| API | **Next.js Route Handlers** | REST endpoints under `app/api/` |
| Database | **PostgreSQL 16** | Hosted on Supabase or Neon |
| ORM | **Prisma 5** | Schema in `prisma/schema.prisma` |
| Auth | **NextAuth.js v5** | Credentials + Google provider |
| Real-time | **Socket.io** | For chat & notifications |
| File storage | **Cloudflare R2** | Avatar uploads |

## DevOps / Tooling
| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager |
| **Turbo** | Monorepo task runner (if needed) |
| **Docker Compose** | Local Postgres + app |
| **GitHub Actions** | CI — lint, test, build |
| **Vercel** | Production hosting |
| **Husky + lint-staged** | Pre-commit hooks |

## Key Conventions
- Use **barrel exports** (`index.ts`) sparingly — only for public API of a module.
- Prefer **named exports** over default exports.
- All API responses follow `{ data, error, meta }` envelope.
- Environment variables prefixed `NEXT_PUBLIC_` for client-safe values.
