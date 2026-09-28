# Vitota Technologies — Platform

A production-ready website + client management platform for Vitota Technologies.

## Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Argon2id password hashing, HTTP-only cookie sessions
- **Styling**: Tailwind CSS with centralized design tokens
- **Animation**: Framer Motion + Canvas-based particle/star systems
- **Validation**: Zod
- **State**: TanStack React Query

## Features

- Public marketing website (hero, services, about, process, portfolio, testimonials, leadership, statistics, contact/leads, footer)
- Secure authentication (registration, email + phone OTP verification, login, forgot-password with OTP, secure sessions)
- Terms & Conditions versioning + user acceptance audit
- Admin dashboard (leads, urgent leads, clients, projects, milestones, chat, payments, CMS, notifications, settings, audit logs)
- Client dashboard (projects, progress, milestones, payments, chat with Vitota, notifications)
- Secure client data isolation at DB/API level
- Provider abstractions for Email, SMS, Payments, Storage, Realtime
- Security headers, rate limiting, IDOR protection, server-side validation everywhere

## Setup

### 1. Install dependencies

```bash
npm install