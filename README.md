# PKH Mentoring

Student enrolment and management system for the PKH Mentoring Programme. Built with Next.js 14, Prisma, PostgreSQL, and Tailwind CSS.

## Features

- **Admin Dashboard** — Overview cards, quick actions, CSV export
- **Student Management** — View all enrolled students with status tracking
- **Statistics Page** — Per-slot breakdown, capacity bars, waitlist summary
- **Settings** — Global capacity, week 1 anchor date, group label visibility
- **CSV Export** — Zapier-friendly CSV download with clean headers
- **Magic Link Enrolment** — Students choose their slot via a unique link
- **Waitlist** — Auto-expiry for waitlist entries
- **Responsive Design** — Mobile-first with sidebar → hamburger navigation

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL) or an existing PostgreSQL 15+ instance
- PM2 (for production deployment)

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd students_mentoring
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your values:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ADMIN_PASSWORD` | Password for the admin login page | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | Yes |
| `RESEND_API_KEY` | Resend API key for transactional emails | No |
| `SLACK_WEBHOOK_URL` | Slack webhook for enrolment notifications | No |

### 4. Start PostgreSQL

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

For development (creates migration from schema):

```bash
npx prisma migrate dev
```

### 6. Seed the database

```bash
npx prisma db seed
```

This creates:
- 4 slots (Monday–Thursday at 16:00)
- Week 1 and Week 2 instances for each slot
- Default global settings

### 7. Build and run

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

The app runs on port **3099** by default.

## Production Deployment

### With PM2

```bash
npm run build
pm2 start ecosystem.config.js
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name mentoring.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3099;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then add SSL with Certbot:

```bash
sudo certbot --nginx -d mentoring.yourdomain.com
```

## Usage Guide

1. **Login** — Navigate to `/admin/login` and enter your admin password
2. **Create slots** — Slots are seeded automatically (Mon–Thu 16:00)
3. **Generate magic links** — Create links for students to self-enrol
4. **Send links** — Share the enrolment URL with students
5. **Monitor** — Use the dashboard, students page, and stats to track enrolment
6. **Export** — Download CSV for Zapier integration or reporting

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin pages (dashboard, students, stats, settings)
│   ├── api/             # API routes (auth, students, stats, csv, settings, enrol)
│   ├── enrol/           # Student enrolment page (magic link)
│   ├── layout.tsx       # Root layout
│   ├── error.tsx        # Global error boundary
│   └── not-found.tsx    # Custom 404 page
├── components/
│   ├── admin/           # Admin-specific components (sidebar)
│   └── ui/              # Shared UI components (skeleton, toast, etc.)
├── lib/
│   ├── prisma.ts        # Prisma client singleton
│   ├── auth.ts          # Authentication helpers
│   ├── auth-check.ts    # API auth middleware
│   └── dates.ts         # Date formatting (Europe/London)
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Database seed script
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS with PKH brand colours
- **Icons**: Lucide React
- **CSV**: csv-stringify
- **Dates**: date-fns + date-fns-tz (Europe/London)
