# Building Manager

Self-hosted building management web application for managing buildings, apartments, tenants, finances, notifications, and calendar bookings.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL 16 + Prisma 7 ORM
- **Auth**: NextAuth.js v5 (Auth.js) with credentials provider
- **UI**: Tailwind CSS v4 + custom shadcn-style components (mobile-first responsive)
- **Validation**: Zod v4 schemas (shared between API and client forms)
- **Deployment**: Docker Compose

## Features

- **Authentication** — Login/register with JWT sessions and route protection
- **RBAC** — 6 configurable roles (Admin, Manager, Owner, Accountant, Maintenance, Tenant) with database-stored permissions editable via admin UI
- **Building Management** — CRUD for buildings, apartments, and tenant assignments (tenancies)
- **Financial Module** — Expenses, payments, and invoices with auto-generated invoice numbers, role-scoped data access, sortable/paginated data tables
- **Calendar** — Bookable slots per building, month-view calendar, booking conflict detection
- **Notifications** — In-app notification system with read/unread tracking, email support via nodemailer
- **Dashboard** — Summary cards with live database queries (building count, active tenants, monthly payments, upcoming bookings)
- **REST API** — All mutations through `/api/` routes with standardized JSON responses, ready for future mobile app

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Full access. Can modify permissions for all roles via `/settings/roles` |
| **Manager** | Manages assigned buildings, apartments, expenses, invoices, slots, notifications |
| **Owner** | Financial visibility and reports for their buildings |
| **Accountant** | Read-only financial access across buildings |
| **Maintenance** | Views assigned buildings and calendar. No financial access |
| **Tenant** | Views own apartment, payments, invoices. Can book calendar slots |

## Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/GeogreGoulis/BuildingManagerv2.git
cd BuildingManagerv2

# Copy environment file
cp .env.example .env

# Start everything (Postgres + migrations + app)
docker compose up -d

# Seed the database (admin user + permissions)
docker compose run --rm seed

# Open the app
open http://localhost:3000
```

**Default admin credentials:** `admin@building.local` / `admin123`

## Local Development (without Docker)

```bash
# Install dependencies
npm install

# Set up your .env with a running PostgreSQL instance
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start dev server
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & register pages
│   ├── (dashboard)/         # All authenticated pages
│   │   ├── buildings/       # Building list & detail
│   │   ├── calendar/        # Calendar with month view
│   │   ├── dashboard/       # Dashboard with summary cards
│   │   ├── finances/        # Expenses, payments, invoices
│   │   ├── notifications/   # Notification center
│   │   ├── profile/         # User profile
│   │   ├── settings/roles/  # Admin permission editor
│   │   └── users/           # User management
│   └── api/                 # REST API routes
├── components/
│   ├── layout/              # Dashboard shell, sidebar, topbar
│   ├── shared/              # Reusable DataTable component
│   └── ui/                  # Button, Card, Input, Badge, etc.
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── api-utils.ts         # withAuth() wrapper, response helpers
│   ├── permissions.ts       # RBAC permission checking (cached)
│   ├── prisma.ts            # Prisma client singleton
│   ├── notifications.ts     # Notification helper functions
│   ├── email.ts             # Email via nodemailer
│   └── validations/         # Zod schemas for all entities
├── types/                   # TypeScript type definitions
└── middleware.ts             # Route protection
```

## API Design

All data mutations go through REST API routes. Standardized JSON responses:

```json
// Success
{ "data": { ... }, "meta": { "total": 10 } }

// Error
{ "error": { "message": "Not found", "code": "NOT_FOUND" } }
```

Every route uses `withAuth()` wrapper that checks session + calls `hasPermission(role, resource, action)`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:seed` | Seed database with admin user + permissions |
| `npm run db:reset` | Reset database |

## Docker Commands

```bash
docker compose up -d              # Start all services
docker compose down                # Stop all services
docker compose down -v             # Stop and delete database volume
docker compose run --rm seed       # Seed the database
docker compose logs app            # View app logs
docker compose build               # Rebuild images
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/building_manager` |
| `AUTH_SECRET` | NextAuth secret for JWT signing | — |
| `AUTH_URL` | App URL for NextAuth | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server for email notifications | — (optional) |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | From address for emails | `noreply@buildingmanager.local` |
