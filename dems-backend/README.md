# DEMS Backend API

REST API for the Dinkinesh Event Management System, built with Node.js and Express.

## Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis (reservation timers)
- **Auth:** JWT + bcrypt + OTP email verification
- **Payments:** Chapa
- **File uploads:** Multer

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials, JWT secret, SMTP, and Chapa key

# Run database migrations
npx prisma migrate dev --schema=prisma/schema.prisma

# Seed the database
npm run db:seed

# Start development server (with hot reload)
npm run dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) |
| `REDIS_URL` | Redis connection URL |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `EMAIL_FROM` | Sender address for system emails |
| `CHAPA_SECRET_KEY` | Chapa payment gateway secret key |
| `CHAPA_BASE_URL` | Chapa API base URL |
| `FRONTEND_URL` | Frontend origin for CORS and payment redirects |
| `UPLOAD_DIR` | Directory for uploaded files |
| `RESERVATION_EXPIRY_MINUTES` | Ticket reservation timeout (default: 15) |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/verify-otp` | Verify OTP and activate account |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List events with filters |
| GET | `/api/events/featured` | Featured events |
| GET | `/api/events/trending` | Trending events |
| GET | `/api/events/:id` | Event detail |
| POST | `/api/events` | Create event (organizer) |
| PATCH | `/api/events/:id` | Update event |
| GET | `/api/events/:id/reviews` | Event reviews |
| POST | `/api/events/:id/reviews` | Submit a review |
| GET | `/api/events/:id/stats` | Attendance stats |
| GET | `/api/events/tags/all` | All available tags |

### Tickets & Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tickets/reservations` | Reserve a ticket |
| GET | `/api/tickets/reservations/list` | Get active reservations |
| PATCH | `/api/tickets/reservations/:id` | Update reservation quantity |
| DELETE | `/api/tickets/reservations/:id` | Cancel reservation |
| GET | `/api/tickets` | Digital ticket wallet |
| GET | `/api/tickets/:id` | Single ticket detail |
| POST | `/api/orders/checkout` | Initiate Chapa payment |
| POST | `/api/orders/verify` | Verify payment and issue tickets |

### Organizer
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/organizer/register` | Register as organizer |
| GET | `/api/organizer/dashboard` | Dashboard stats and events |
| GET | `/api/organizer/events` | Organizer's events |
| GET | `/api/organizer/revenue` | Revenue summary |

### Staff & Scanner
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/staff` | List staff members |
| POST | `/api/staff` | Add staff member |
| DELETE | `/api/staff/:id` | Remove staff member |
| POST | `/api/scanner/scan` | Scan a ticket QR code |
| GET | `/api/scanner/event/:id/stats` | Live event stats |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/organizers/pending` | Pending organizer applications |
| PATCH | `/api/admin/organizers/:id/approve` | Approve or reject organizer |
| GET | `/api/admin/users` | All users with filters |
| PATCH | `/api/admin/users/:id` | Update user status or role |
| GET | `/api/admin/events` | All events with filters |
| PATCH | `/api/admin/events/:id` | Update event |
| GET | `/api/admin/categories` | All categories |
| POST | `/api/admin/categories` | Create category |
| PATCH | `/api/admin/categories/:id` | Update category |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Public category list |
| GET | `/api/profile/saved-events` | User's saved events |
| POST | `/api/profile/saved-events/:id` | Save an event |
| DELETE | `/api/profile/saved-events/:id` | Unsave an event |
| PATCH | `/api/profile` | Update profile |
| POST | `/api/upload/image` | Upload an image file |
| GET | `/api/health` | Health check |

## Database

The schema is defined in `prisma/schema.prisma`. Key models:

- `User` — all account types (attendee, organizer, staff, security, admin)
- `Event` + `EventSchedule` + `EventVenue` — event data
- `TicketType` — ticket tiers per event
- `TicketReservation` — temporary holds before payment
- `Order` + `Payment` — completed purchases
- `DigitalTicket` — issued tickets with QR codes
- `TicketScan` — check-in audit log
- `EventAttendanceStats` — live check-in counters

## Scripts

```bash
npm run dev          # Start with hot reload
npm start            # Start production server
npm run db:migrate   # Run pending migrations
npm run db:seed      # Seed categories, admin, and sample events
npm run db:studio    # Open Prisma Studio (database GUI)
```
