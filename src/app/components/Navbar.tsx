import { Link, useLocation, useNavigate } from 'react-router';
import { Search, User, LogOut, Ticket, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, isOrganizer, isSecurity, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Security staff has a different navbar
  if (isSecurity) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-gray-900">DEMS</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </nav>
    );
  }

  // Organizer navbar
  if (isOrganizer) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        {/* Ethiopian tricolor accent */}
        <div className="h-1 flex">
          <div className="flex-1 bg-green-600" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-red-600" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/organizer/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-gray-900">DEMS</span>
              <span className="text-sm text-gray-500 ml-2">Organizer</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/organizer/create-event"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <PlusCircle className="size-4" />
              Create Event
            </Link>
            <Link
              to="/organizer/staff"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <User className="size-4" />
              Add Staff Member
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Regular attendee navbar
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Ethiopian tricolor accent */}
      <div className="h-1 flex">
        <div className="flex-1 bg-green-600" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-red-600" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="text-2xl font-bold">
            <span className="text-gray-900">DEMS</span>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/discover"
            className={`text-sm ${
              location.pathname === '/discover' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Discover Events
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/my-tickets"
                className={`text-sm flex items-center gap-2 ${
                  location.pathname === '/my-tickets' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Ticket className="size-4" />
                My Tickets
              </Link>
              <Link
                to="/saved-events"
                className={`text-sm flex items-center gap-2 ${
                  location.pathname === '/saved-events' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="size-4" />
                Saved Events
              </Link>
            </>
          )}
          <Link
            to="/organizer/signup"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Create Event
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </form>

        {isAuthenticated ? (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <User className="size-5 text-gray-700" />
              <span className="text-sm text-gray-900">{user?.first_name}</span>
            </button>
            
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="shrink-0 px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
}
