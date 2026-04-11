# Dinkinesh Event Management System (DEMS)

A full-stack event ticketing platform built for Ethiopia, enabling event discovery, ticket purchasing, organizer management, and real-time check-in scanning.

## Project Structure

```
Dinknesh_EMS/
├── dems-backend/       # Node.js + Express REST API
└── dems-frontend/      # React + Vite web application
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | PostgreSQL via Prisma ORM |
| Cache / Timers | Redis |
| Payments | Chapa (Ethiopian payment gateway) |
| Auth | JWT + OTP email verification |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional — reservation timers degrade gracefully without it)

### Backend

```bash
cd dems-backend

# Install dependencies
npm install

# Copy environment config and fill in your values
cp .env.example .env

# Run database migrations
npx prisma migrate dev --schema=prisma/schema.prisma

# Seed initial data (categories, admin user, sample events)
npm run db:seed

# Start development server
npm run dev
# → API running at http://localhost:3000
```

### Frontend

```bash
cd dems-frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → App running at http://localhost:5173
```

## Default Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dems.et` | `Admin@1234` |
| Attendee | `attendee@dems.et` | `Attendee@1234` |
| Organizer | `techhub@dems.et` | `Organizer@1234` |

## Key Features

- Event discovery with search, filters, tags, and Near Me location detection
- Ticket reservation with 15-minute countdown timer
- Chapa payment gateway integration
- Digital ticket wallet with QR codes
- Organizer dashboard with revenue analytics
- Admin panel for user, event, and category management
- Security scanner with live camera QR scanning
- Light / Dark mode with per-user preference persistence
- OTP-based email verification for registration

## Environment Variables

See `dems-backend/.env.example` for all required backend configuration including database, JWT secret, SMTP, Chapa API key, and Redis connection.

The frontend requires a single variable in `dems-frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api
```
