import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Users, Calendar, Clock, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';

const card = 'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-transparent dark:border-gray-800';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, pendingData, eventsRes] = await Promise.all([
        api.getAdminStats(),
        api.getPendingOrganizers(),
        api.getAdminEvents({ limit: '5' }),
      ]);
      setStats(statsData);
      setPendingOrganizers(pendingData);
      setRecentEvents(eventsRes.events || []);
    } catch { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveOrganizer(id, 'approved');
      toast.success('Organizer approved');
      setPendingOrganizers(prev => prev.filter(o => o.id !== id));
      if (stats) setStats({ ...stats, pending_approvals: stats.pending_approvals - 1 });
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await api.approveOrganizer(id, 'rejected');
      toast.success('Organizer rejected');
      setPendingOrganizers(prev => prev.filter(o => o.id !== id));
      if (stats) setStats({ ...stats, pending_approvals: stats.pending_approvals - 1 });
    } catch { toast.error('Failed to reject'); }
  };

  const daysAgo = (d) => {
    const diff = Math.ceil(Math.abs(Date.now() - new Date(d).getTime()) / 86400000);
    return diff === 1 ? '1 day ago' : `${diff} days ago`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your DEMS platform</p>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">DEMS</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats?.total_users?.toLocaleString(), icon: <Users className="size-12 text-gray-400" />, accent: 'border-l-gray-900' },
            { label: 'Live Events', value: stats?.live_events, icon: <Calendar className="size-12 text-green-400" />, accent: 'border-l-green-500' },
            { label: 'Pending Approvals', value: stats?.pending_approvals, icon: <Clock className="size-12 text-yellow-400" />, accent: 'border-l-yellow-400' },
            { label: 'Total Revenue', value: `${stats?.total_revenue?.toLocaleString()} ETB`, icon: <DollarSign className="size-12 text-red-400" />, accent: 'border-l-red-500' },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} className={`${card} p-6 border-l-4 ${accent}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                {icon}
              </div>
            </div>
          ))}
        </div>

        <div className={`${card} mb-8`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Organizer Approvals</h2>
          </div>
          <div className="p-6">
            {pendingOrganizers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingOrganizers.map(org => (
                  <div key={org.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{org.organization_name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div><span className="font-medium">Contact:</span> {org.full_name || org.user?.full_name}</div>
                          <div><span className="font-medium">Type:</span> {org.organization_type}</div>
                          <div><span className="font-medium">Email:</span> {org.work_email}</div>
                          <div><span className="font-medium">Phone:</span> {org.phone_number}</div>
                          {org.website_url && <div className="md:col-span-2"><span className="font-medium">Website:</span>{' '}<a href={org.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:underline">{org.website_url}</a></div>}
                          <div className="md:col-span-2"><span className="font-medium">Submitted:</span> {daysAgo(org.created_at)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleApprove(org.id)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"><CheckCircle className="size-4" /> Approve</button>
                        <button onClick={() => handleReject(org.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"><XCircle className="size-4" /> Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${card} mb-8`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Events</h2>
            <Link to="/admin/events" className="text-sm text-gray-900 dark:text-white font-semibold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {recentEvents.map(event => (
              <div key={event.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.organizer_profile?.organization_name || event.organizer_name} •{' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' : event.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{event.status}</span>
                  </p>
                </div>
                <Link to={`/events/${event.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Eye className="size-4" /> View
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/admin/users', icon: <Users className="size-5" />, label: 'View All Users' },
              { to: '/admin/events', icon: <Calendar className="size-5" />, label: 'View All Events' },
              { to: '/admin/categories', icon: <Calendar className="size-5" />, label: 'Manage Categories' },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-900 dark:hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-gray-900 dark:text-white">
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
