import { Link, useLocation, useNavigate } from 'react-router';
import { Search, User, LogOut, Ticket, Calendar, PlusCircle, LayoutDashboard, Shield, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const role = user?.role;

  const handleLogout = async () => { await logout(); navigate('/'); };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  // ── Security / Staff ──────────────────────────────────────────────────────
  if (role === 'security' || role === 'staff') {
    return (
      <nav className="sticky top-0 z-50 bg-gray-900 text-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="size-5 text-green-400" />
            <span className="text-lg font-bold">DEMS Security</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white">
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </nav>
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (role === 'admin') {
    return (
      <nav className="sticky top-0 z-50 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">DEMS</span>
            <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
          </Link>
          <div className="flex items-center gap-6">
            {[
              { to: '/admin/dashboard', icon: <LayoutDashboard className="size-4" />, label: 'Dashboard' },
              { to: '/admin/users', icon: <User className="size-4" />, label: 'Users' },
              { to: '/admin/events', icon: <Calendar className="size-4" />, label: 'Events' },
              { to: '/admin/categories', icon: <LayoutDashboard className="size-4" />, label: 'Categories' },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} className={`text-sm flex items-center gap-2 ${location.pathname === to ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                {icon} {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.full_name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white">
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ── Organizer ─────────────────────────────────────────────────────────────
  if (role === 'organizer') {
    return (
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="h-1 flex">
          <div className="flex-1 bg-green-600" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-red-600" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/organizer/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">DEMS</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Organizer</span>
          </Link>
          <div className="flex items-center gap-6">
            {[
              { to: '/organizer/dashboard', icon: <LayoutDashboard className="size-4" />, label: 'Dashboard' },
              { to: '/organizer/create-event', icon: <PlusCircle className="size-4" />, label: 'Create Event' },
              { to: '/staff/management', icon: <UserCog className="size-4" />, label: 'Staff' },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} className={`text-sm flex items-center gap-2 transition-colors ${location.pathname === to ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                {icon} {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.full_name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ── Attendee / Guest ──────────────────────────────────────────────────────
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Ethiopian tricolor accent — restored */}
      <div className="h-1 flex">
        <div className="flex-1 bg-green-600" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-red-600" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <Link to="/" className="shrink-0 text-2xl font-bold text-gray-900 dark:text-white">DEMS</Link>

        <div className="flex items-center gap-6">
          <Link to="/discover" className={`text-sm transition-colors ${location.pathname === '/discover' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            Discover
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/my-tickets" className={`text-sm flex items-center gap-2 transition-colors ${location.pathname === '/my-tickets' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                <Ticket className="size-4" /> My Tickets
              </Link>
              <Link to="/saved-events" className={`text-sm flex items-center gap-2 transition-colors ${location.pathname === '/saved-events' ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                <Calendar className="size-4" /> Saved
              </Link>
            </>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-gray-900 dark:focus:ring-gray-400" />
          </div>
        </form>

        {isAuthenticated ? (
          <div className="relative shrink-0">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <User className="size-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-900 dark:text-white">{user?.first_name}</span>
            </button>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Profile Settings
                  </Link>
                  <button onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="shrink-0 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}
