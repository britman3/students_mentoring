# PKH Mentoring App — Claude Code Project Context

## CRITICAL: READ THIS FIRST EVERY SESSION

This is the PKH Mentoring Group Slot Selection & Admin Management App for Property Know How. All specifications, schema definitions, and build instructions are in the `/docs` folder. **Always read the docs before making changes.**

## Tech Stack (NON-NEGOTIABLE)

- **Framework:** Next.js (App Router) with TypeScript and Tailwind CSS
- **Database:** PostgreSQL (local instance on port 5433, NOT Docker)
- **ORM:** Prisma (latest version)
- **Database name:** mentoring_db
- **Email:** Resend
- **Notifications:** Slack webhooks
- **Process management:** PM2 on port 3099
- **Timezone:** Europe/London throughout

## Key Documentation

- `/docs/PROJECT_SPEC.md` — Full functional specification
- `/docs/TECH_STACK.md` — Database schema (Prisma), project structure, infrastructure
- `/docs/BRAND_PACK.md` — Navy & gold colour palette, UI component styles
- `/docs/BUILD_INSTRUCTIONS.md` — Phased build prompts and sub-tasks
- `/docs/ENROLMENT_CHANGE.md` — Change request: open enrolment replacing magic links

## IMPORTANT: Enrolment System (v3 — Open Enrolment)

**Magic links have been COMPLETELY REMOVED. Access codes have been COMPLETELY REMOVED.**

The app uses an open enrolment page with URL parameters from Go High Level.

### How it works:
1. Student signs contract in Go High Level
2. GHL redirects student to: `mentoring.propertyknowhow.com/enrol?firstName=Nick&lastName=Ellsmore&email=nick@example.com&phone=07734366408&closer=Jake`
3. Student lands on `/enrol` with form pre-filled
4. Student confirms details, picks their slot, submits
5. Closer is automatically linked via the `closer` URL param

### What DOES NOT EXIST in this app:
- NO MagicLink model — DELETED from schema
- NO MagicLinkStatus enum — DELETED
- NO `/enrol/[token]` page — DELETED
- NO `/admin/links` page — DELETED
- NO `src/lib/tokens.ts` — DELETED
- NO access codes, no magic links, no token validation

### Closer auto-creation:
- When `closer` param is passed, look up Closer table by firstName (case-insensitive)
- If found → link existing closer to student
- If not found → auto-create new Closer record with firstName only
- No manual closer management needed

## Database Schema

Key field names (use these EXACTLY):
- `groupCode` (NOT groupLabel) — e.g. "W1E", "W2Q"
- `showGroupCodes` (NOT showGroupLabels) in Settings
- `gridPosition` on Slot model (Int, 1-12)
- `joinCode` on Student model (unique, for attendance tracking)
- `displayName` on Slot model
- Closer has `firstName` + `lastName` (NOT a single `name` field)
- Student.phone is REQUIRED (not optional)
- Student.totalAmount/depositAmount are Decimal(10,2) (NOT Float)

**Core tables (with UI):** Settings, Slot, SlotInstance, Student, WaitlistEntry, Attendance
**Expansion tables (no UI yet):** Closer (auto-created), Payment, Arrangement, ActivityLog, Programme

## Attendance Tracking

Each student has a unique `joinCode` (6-char alphanumeric). Their join link is:
```
https://mentoring.propertyknowhow.com/join/[joinCode]
```

When they visit this link:
1. Log an Attendance record (with 30-minute deduplication window)
2. Redirect (302) to the Zoom link for their slot

This join link is what goes in the confirmation email — NOT the raw Zoom URL.

## Slot Grid & Group Codes (CRITICAL)

### Full Grid (12 max)

| Pos | Day | Time | W1 Code | W2 Code | Active at Launch |
|-----|-----|------|---------|---------|-----------------|
| 1 | Tuesday | 12pm | W1A | W2M | ❌ |
| 2 | Tuesday | 2pm | W1B | W2N | ❌ |
| 3 | Tuesday | 4pm | W1C | W2O | ❌ |
| 4 | Tuesday | 6pm | W1D | W2P | ❌ |
| 5 | Wednesday | 12pm | W1E | W2Q | ✅ |
| 6 | Wednesday | 2pm | W1F | W2R | ❌ |
| 7 | Wednesday | 4pm | W1G | W2S | ✅ |
| 8 | Wednesday | 6pm | W1H | W2T | ❌ |
| 9 | Thursday | 12pm | W1I | W2U | ✅ |
| 10 | Thursday | 2pm | W1J | W2V | ❌ |
| 11 | Thursday | 4pm | W1K | W2W | ✅ |
| 12 | Thursday | 6pm | W1L | W2X | ❌ |

### Grid Position Calculation
```
Days: Tuesday(2)=0, Wednesday(3)=1, Thursday(4)=2
Times: "12:00"=0, "14:00"=1, "16:00"=2, "18:00"=3
position = (dayIndex * 4) + timeIndex + 1
W1 letter = charCode(64 + position)
W2 letter = charCode(76 + position)
```

## Fortnightly Logic

- Anchor date: 6th January 2026 (Monday, Week 1)
- Every 14 days alternates: Week 1 → Week 2 → Week 1 → ...
- When assigning a student: put them in the less-full week instance
- Ties broken by earlier next call date

## Last Call Date

Calculated (NOT stored in DB): `firstCallDate + 6 months + 2 weeks`

Used in: student table, detail panel, CSV export, confirmation email, confirmation screen.

## Student Lifecycle

PROSPECT → ENROLLED → SLOT_SELECTED → ACTIVE → PAUSED → COMPLETED → CANCELLED

Current build uses SLOT_SELECTED and ACTIVE primarily. PROSPECT is created by the sync endpoint.

## Admin Dashboard

- **Sidebar nav items:** Dashboard, Slots, Students, Stats, Settings
- **NO Magic Links / Access Codes page**
- **Students page columns:** Name, Email, Phone, Slot, Week, Group, First Call, Last Call, Days Left, Attended, Closer, Status
- **Students page features:** search, filters (slot/week/status/closer), bulk status change, add student manually, resend email, attendance history
- **CSV export** includes: Closer Name, Student Number, Last Call Date, Attended Count
- **Settings** includes: change admin password

## Colour Scheme

Navy (#1B2B4B) and gold (#C5A55A) — NOT the logo traffic-light colours. See docs/BRAND_PACK.md.

## Rules

1. Use the Prisma schema EXACTLY — do not modify field names
2. NO MagicLink model — it has been permanently removed
3. All dates in Europe/London timezone
4. Student form only populates core fields — leave expansion fields null
5. Closer is captured via URL param, auto-created if new
6. Group codes use format W1E, W2Q (no dashes)
7. Grid positions are fixed — new slots fill the correct position
8. Database is local PostgreSQL on port 5433 (NOT Docker)
9. This app deploys to Hetzner VPS — do not try to run Docker or DB locally
10. Mobile-first responsive design
11. Do NOT build UI for expansion tables (Payment, etc.) — database only
12. Always run backup script before making changes on server
13. Confirmation emails use tracked join links (/join/[code]), NOT raw Zoom URLs
14. The /api/sync/student endpoint exists and must be preserved
