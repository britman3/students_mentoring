# Project Specification — Students Mentoring Platform

## Overview

A web-based platform that connects students with mentors for academic and career guidance. The application allows mentors to publish their availability, students to browse mentor profiles, book sessions, and both parties to track progress over time.

## Core Features

### 1. User Authentication & Profiles
- Sign-up / login for **Students** and **Mentors** (role-based).
- Profile pages with bio, skills/tags, avatar, and availability calendar.
- OAuth support (Google) alongside email/password.

### 2. Mentor Discovery
- Searchable, filterable mentor directory (by subject, rating, availability).
- Mentor cards with summary info; click-through to full profile.

### 3. Session Booking
- Students request a session by choosing an available time slot.
- Mentors confirm or decline requests.
- Calendar integration (iCal export).

### 4. Messaging
- Real-time chat between matched student–mentor pairs.
- Notification badges and email digests.

### 5. Session Feedback & Ratings
- Post-session rating (1-5 stars) and written review.
- Aggregate rating displayed on mentor profile.

### 6. Admin Dashboard
- User management, reported-content moderation, platform analytics.

## Non-Functional Requirements
- Responsive design (mobile-first).
- Accessible (WCAG 2.1 AA).
- Page load ≤ 2 s on 3G.
- 99.5 % uptime target.

## User Roles
| Role    | Capabilities |
|---------|-------------|
| Student | Browse mentors, book sessions, leave reviews, chat |
| Mentor  | Set availability, accept/decline bookings, chat |
| Admin   | Full CRUD on users, moderation tools, analytics |

## Pages / Routes (planned)
| Route | Description |
|-------|-------------|
| `/` | Landing / hero page |
| `/login`, `/signup` | Auth pages |
| `/mentors` | Mentor directory with search |
| `/mentors/:id` | Mentor profile |
| `/dashboard` | Role-aware dashboard |
| `/dashboard/sessions` | Upcoming & past sessions |
| `/dashboard/messages` | Chat inbox |
| `/admin` | Admin panel (admin only) |
