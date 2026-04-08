import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Users, Calendar, Clock, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { toast } from 'sonner';

interface AdminStats {
  total_users: number;
  total_organizers: number;
  total_attendees: number;
  total_security: number;
  live_events: number;
  pending_approvals: number;
  total_revenue: number;
  total_tickets_sold: number;
}

interface PendingOrganizer {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  full_name: string;
  work_email: string;
  phone_number: string;
  website_url?: string;
  verification_status: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  organizer_name?: string;
  status: string;
  created_at: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, pendingData, eventsData] = await Promise.all([
        mockApi.getAdminStats(),
        mockApi.getPendingOrganizers(),
        mockApi.getRecentEvents(5),
      ]);
      
      setStats(statsData);
      setPendingOrganizers(pendingData);
      setRecentEvents(eventsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (organizerId: string) => {
    try {
      await mockApi.approveOrganizer(organizerId);
      toast.success('Organizer approved successfully');
      // Remove from pending list
      setPendingOrganizers(prev => prev.filter(org => org.id !== organizerId));
      // Update stats
      if (stats) {
        setStats({ ...stats, pending_approvals: stats.pending_approvals - 1 });
      }
    } catch (error) {
      toast.error('Failed to approve organizer');
    }
  };

  const handleReject = async (organizerId: string) => {
    try {
      await mockApi.rejectOrganizer(organizerId);
      toast.success('Organizer rejected');
      // Remove from pending list
      setPendingOrganizers(prev => prev.filter(org => org.id !== organizerId));
      // Update stats
      if (stats) {
        setStats({ ...stats, pending_approvals: stats.pending_approvals - 1 });
      }
    } catch (error) {
      toast.error('Failed to reject organizer');
    }
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your DEMS platform</p>
            </div>
            <div className="text-3xl font-bold text-gray-900">DEMS</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_users.toLocaleString()}</p>
              </div>
              <Users className="size-12 text-gray-400" />
            </div>
          </div>

          {/* Live Events */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Live Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.live_events}</p>
              </div>
              <Calendar className="size-12 text-green-400" />
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pending_approvals}</p>
              </div>
              <Clock className="size-12 text-yellow-400" />
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_revenue.toLocaleString()} ETB</p>
              </div>
              <DollarSign className="size-12 text-red-400" />
            </div>
          </div>
        </div>

        {/* Pending Organizer Approvals */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Organizer Approvals</h2>
          </div>
          <div className="p-6">
            {pendingOrganizers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingOrganizers.map((org) => (
                  <div
                    key={org.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{org.organization_name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Contact:</span> {org.full_name}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {org.organization_type}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {org.work_email}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {org.phone_number}
                          </div>
                          {org.website_url && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Website:</span>{' '}
                              <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">
                                {org.website_url}
                              </a>
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <span className="font-medium">Submitted:</span> {getDaysAgo(org.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleApprove(org.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="size-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(org.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          <XCircle className="size-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
            <Link to="/admin/events" className="text-sm text-gray-900 font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentEvents.map((event) => (
              <div key={event.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.organizer_name} • {' '}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'published' ? 'bg-green-100 text-green-800' :
                        event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="size-4" />
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/users"
                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors font-semibold text-gray-900"
              >
                <Users className="size-5" />
                View All Users
              </Link>
              <Link
                to="/admin/events"
                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors font-semibold text-gray-900"
              >
                <Calendar className="size-5" />
                View All Events
              </Link>
              <Link
                to="/admin/categories"
                className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors font-semibold text-gray-900"
              >
                <Calendar className="size-5" />
                Manage Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
