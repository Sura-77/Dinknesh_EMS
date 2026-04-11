# DEMS Frontend

React web application for the Dinkinesh Event Management System.

## Stack

- **Framework:** React 18
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Charts:** Recharts
- **Animations:** Motion
- **Notifications:** Sonner

## Setup

```bash
# Install dependencies
npm install

# Configure environment
# Create a .env file with:
VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
# → http://localhost:5173
```

> The backend must be running at `http://localhost:3000` before starting the frontend.

## Project Structure

```
src/
├── main.jsx                  # App entry point
├── app/
│   ├── App.jsx               # Root component with providers
│   ├── routes.jsx            # All route definitions
│   ├── contexts/
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── ThemeContext.jsx  # Light/dark theme state
│   ├── components/
│   │   ├── Navbar.jsx        # Role-aware navigation bar
│   │   ├── Footer.jsx        # Site footer
│   │   └── EventCard.jsx     # Reusable event card
│   ├── pages/                # One file per route
│   │   ├── Landing.jsx
│   │   ├── Discover.jsx      # Event search and discovery
│   │   ├── EventDetail.jsx
│   │   ├── Login.jsx / Signup.jsx / ForgotPassword.jsx
│   │   ├── Checkout.jsx      # Chapa payment flow
│   │   ├── MyTickets.jsx     # Digital ticket wallet
│   │   ├── SavedTickets.jsx  # Reservation cart
│   │   ├── SavedEvents.jsx
│   │   ├── Profile.jsx
│   │   ├── OrganizerSignup.jsx / OrganizerDashboard.jsx
│   │   ├── CreateEvent.jsx
│   │   ├── StaffManagement.jsx
│   │   ├── SecurityScanner.jsx
│   │   └── Admin*.jsx        # Admin panel pages
│   ├── services/
│   │   └── api.js            # All API calls to the backend
│   └── layouts/
│       └── RootLayout.jsx    # Shared layout wrapper
└── styles/
    ├── index.css             # Global styles
    ├── theme.css             # CSS variables for light/dark mode
    ├── tailwind.css          # Tailwind directives
    └── fonts.css             # Font imports
```

## Role-Based Navigation

The app renders a different navbar and redirects to a different home page based on the logged-in user's role:

| Role | Home Page |
|---|---|
| `attendee` | `/discover` |
| `organizer` | `/organizer/dashboard` |
| `admin` | `/admin/dashboard` |
| `security` / `staff` | `/security/scanner` |

## Theme

Light/dark mode is toggled via the Sun/Moon button in the navbar. The preference is saved to `localStorage` and applied on every page load. It also syncs with the user's saved `theme_preference` in the database on login.

## Build

```bash
npm run build
```

Output is placed in `dist/`. Point your web server or CDN at that folder.
