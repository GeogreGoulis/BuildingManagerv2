# Building Manager

## Project Overview
Self-hosted building management web application for managing buildings, apartments, tenants, finances, notifications, and calendar bookings.

## Tech Stack
- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Auth**: NextAuth.js v5 (Auth.js) with credentials provider + Prisma adapter
- **UI**: Tailwind CSS + shadcn/ui (mobile-first responsive)
- **Validation**: Zod schemas (shared between API and client forms)
- **Deployment**: Docker Compose (local first, Raspberry Pi ARM64 later)

## User Roles (6, configurable RBAC)
- ADMIN — Full access. Can modify permission levels for all roles via `/settings/roles`.
- MANAGER — Manages assigned buildings, apartments, expenses, invoices, slots, notifications.
- OWNER — Property owner. Financial visibility/reports, not day-to-day ops.
- ACCOUNTANT — Read-only financial access across buildings.
- MAINTENANCE — Views assigned maintenance tasks/building info. No financial access.
- TENANT — Views own apartment, payments, invoices. Can book calendar slots.

Permissions stored in DB (`Permission` + `RolePermission` tables). ADMIN always has full access (hardcoded fallback).

## Modules
1. **User Access** — Auth, registration, profile, user CRUD, RBAC settings
2. **Building** — Buildings, apartments, tenancies (tenant assignment)
3. **Financial** — Expenses, payments, invoices
4. **Calendar** — Bookable slots per building, bookings with conflict detection
5. **Notification** — In-app + email notifications triggered by events

## Architecture Conventions
- All data mutations go through `/api/` REST routes (clean API for future mobile app)
- Every API route uses `withAuth()` wrapper checking `hasPermission(role, resource, action)`
- Standardized JSON responses: `{ data, meta? }` or `{ error: { message, code } }`
- Zod schemas in `src/lib/validations/` for request validation
- `src/lib/permissions.ts` — loads and caches role→permission map from DB

## Key File Paths
- `prisma/schema.prisma` — Database schema
- `src/lib/auth.ts` — NextAuth configuration
- `src/lib/api-utils.ts` — Response helpers, `withAuth()` wrapper
- `src/lib/permissions.ts` — RBAC permission checking
- `src/lib/prisma.ts` — Prisma client singleton
- `src/middleware.ts` — Route protection
- `src/app/(dashboard)/layout.tsx` — Dashboard shell layout
- `src/app/(auth)/` — Login/register pages

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npx prisma migrate dev` — Run migrations (dev)
- `npx prisma migrate deploy` — Run migrations (prod)
- `npx prisma db seed` — Seed database
- `docker compose up` — Start full stack in Docker

## Implementation Plan
See `.claude/plans/linked-orbiting-thacker.md` for the full phased implementation plan.
