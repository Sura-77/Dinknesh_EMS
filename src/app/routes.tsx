import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Landing } from './pages/Landing';
import { Discover } from './pages/Discover';
import { EventDetail } from './pages/EventDetail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { SavedTickets } from './pages/SavedTickets';
import { MyTickets } from './pages/MyTickets';
import { OrganizerSignup } from './pages/OrganizerSignup';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateEvent } from './pages/CreateEvent';
import { StaffManagement } from './pages/StaffManagement';
import { SecurityScanner } from './pages/SecurityScanner';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminEvents } from './pages/AdminEvents';
import { AdminCategories } from './pages/AdminCategories';
import { SavedEvents } from './pages/SavedEvents';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: 'discover',
        Component: Discover,
      },
      {
        path: 'events',
        Component: Discover,
      },
      {
        path: 'events/:eventId',
        Component: EventDetail,
      },
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'signup',
        Component: Signup,
      },
      {
        path: 'saved-tickets',
        Component: SavedTickets,
      },
      {
        path: 'my-tickets',
        Component: MyTickets,
      },
      {
        path: 'checkout',
        Component: Checkout,
      },
      {
        path: 'profile',
        Component: Profile,
      },
      {
        path: 'saved-events',
        Component: SavedEvents,
      },
      {
        path: 'organizer/signup',
        Component: OrganizerSignup,
      },
      {
        path: 'organizer/dashboard',
        Component: OrganizerDashboard,
      },
      {
        path: 'organizer/create-event',
        Component: CreateEvent,
      },
      {
        path: 'staff/management',
        Component: StaffManagement,
      },
      {
        path: 'organizer/pending',
        Component: () => (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Pending</h2>
              <p className="text-gray-600 mb-6">
                Thank you for applying to become an organizer. Our team is reviewing your application.
                You'll receive an email once your account is approved.
              </p>
              <a href="/" className="text-gray-900 hover:underline">Return to homepage</a>
            </div>
          </div>
        ),
      },
      {
        path: 'security/scanner',
        Component: SecurityScanner,
      },
      {
        path: 'admin/dashboard',
        Component: AdminDashboard,
      },
      {
        path: 'admin/users',
        Component: AdminUsers,
      },
      {
        path: 'admin/events',
        Component: AdminEvents,
      },
      {
        path: 'admin/categories',
        Component: AdminCategories,
      },
    ],
  },
]);