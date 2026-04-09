import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, UserCog } from 'lucide-react';
import { api as mockApi } from '../services/api';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const card = 'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-transparent dark:border-gray-800';

export function OrganizerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [selectedEventStats, setSelectedEventStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getOrganizerDashboard();
      setDashboard(data);
      if (data.live_events.length > 0) {
        const stats = await mockApi.getEventStats(data.live_events[0].id);
        setSelectedEventStats(stats);
      }
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!dashboard) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;

  const chartData = dashboard.revenue_by_event.map(item => ({
    name: item.event_title.length > 20 ? item.event_title.slice(0, 20) + '...' : item.event_title,
    revenue: item.revenue,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organizer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your events and track performance</p>
          </div>
          <div className="flex gap-3">
            <Link to="/staff/management"
              className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
              <UserCog className="size-5" /> Staff Management
            </Link>
            <Link to="/organizer/create-event"
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Create New Event
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <Calendar className="size-6 text-blue-600" />, bg: 'bg-blue-100', label: 'Total Events', value: String(dashboard.total_events) },
            { icon: <Users className="size-6 text-green-600" />, bg: 'bg-green-100', label: 'Tickets Sold', value: dashboard.total_tickets_sold.toLocaleString() },
            { icon: <DollarSign className="size-6 text-yellow-600" />, bg: 'bg-yellow-100', label: 'Total Revenue', value: `${dashboard.total_revenue.toLocaleString()} ETB` },
            { icon: <TrendingUp className="size-6 text-purple-600" />, bg: 'bg-purple-100', label: 'Avg per Event', value: `${Math.round(dashboard.total_revenue / Math.max(dashboard.total_events, 1)).toLocaleString()} ETB` },
          ].map(({ icon, bg, label, value }) => (
            <div key={label} className={`${card} p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className={`${card} p-6 mb-8`}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="size-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue by Event</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Events */}
        {dashboard.live_events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Live Events</h2>
            <div className="grid grid-cols-1 gap-6">
              {dashboard.live_events.map((event) => (
                <div key={event.id} className={`${card} p-6`}>
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {event.thumbnail_url
                        ? <img src={event.thumbnail_url} alt={event.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Calendar className="size-8 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{event.category_name}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Live</span>
                      </div>
                      {selectedEventStats && selectedEventStats.event_id === event.id && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Check-in Progress</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {selectedEventStats.checked_in_total} / {selectedEventStats.tickets_sold_total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div className="bg-gray-900 dark:bg-white h-full rounded-full transition-all duration-500"
                              style={{ width: `${(selectedEventStats.checked_in_total / Math.max(selectedEventStats.tickets_sold_total, 1)) * 100}%` }} />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            {[['Normal', selectedEventStats.normal_sold], ['VIP', selectedEventStats.vip_sold], ['VVIP', selectedEventStats.vvip_sold]].map(([label, val]) => (
                              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">All Events</h2>
          <div className={`${card} overflow-hidden`}>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['Event', 'Category', 'Status', 'Rating', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {[...dashboard.live_events, ...dashboard.past_events].map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{event.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{event.category_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-700' : event.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.rating
                        ? <div className="flex items-center gap-1"><span className="font-semibold text-gray-900 dark:text-white">{event.rating.toFixed(1)}</span><span className="text-xs text-gray-500 dark:text-gray-400">({event.review_count})</span></div>
                        : <span className="text-sm text-gray-400">No reviews</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/events/${event.id}`} className="text-sm text-gray-900 dark:text-white hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

