import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, UserCog } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import type { OrganizerDashboard as DashboardData, EventStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function OrganizerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [selectedEventStats, setSelectedEventStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getOrganizerDashboard();
      setDashboard(data);
      
      // Load stats for first live event
      if (data.live_events.length > 0) {
        const stats = await mockApi.getEventStats(data.live_events[0].id);
        setSelectedEventStats(stats);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>No data available</div>;
  }

  const chartData = dashboard.revenue_by_event.map(item => ({
    name: item.event_title.length > 20 ? item.event_title.substring(0, 20) + '...' : item.event_title,
    revenue: item.revenue,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizer Dashboard</h1>
            <p className="text-gray-600">Manage your events and track performance</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/staff/management"
              className="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <UserCog className="size-5" />
              Staff Management
            </Link>
            <Link
              to="/organizer/create-event"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Create New Event
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="size-6 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{dashboard.total_events}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="size-6 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Tickets Sold</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.total_tickets_sold.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="size-6 text-yellow-600" />
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {dashboard.total_revenue.toLocaleString()} ETB
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="size-6 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">Avg per Event</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(dashboard.total_revenue / dashboard.total_events).toLocaleString()} ETB
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="size-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Revenue by Event</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1f2937" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Events */}
        {dashboard.live_events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Events</h2>
            <div className="grid grid-cols-1 gap-6">
              {dashboard.live_events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {event.thumbnail_url ? (
                        <img
                          src={event.thumbnail_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="size-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-500">{event.category_name}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Live
                        </span>
                      </div>

                      {selectedEventStats && selectedEventStats.event_id === event.id && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Check-in Progress</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {selectedEventStats.checked_in_total} / {selectedEventStats.tickets_sold_total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gray-900 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(selectedEventStats.checked_in_total / selectedEventStats.tickets_sold_total) * 100}%`,
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-600 mb-1">Normal</div>
                              <div className="text-lg font-bold text-gray-900">
                                {selectedEventStats.normal_sold}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-600 mb-1">VIP</div>
                              <div className="text-lg font-bold text-gray-900">
                                {selectedEventStats.vip_sold}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-xs text-gray-600 mb-1">VVIP</div>
                              <div className="text-lg font-bold text-gray-900">
                                {selectedEventStats.vvip_sold}
                              </div>
                            </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Events</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...dashboard.live_events, ...dashboard.past_events].map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{event.category_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-900">{event.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({event.review_count})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/events/${event.id}`}
                        className="text-sm text-gray-900 hover:underline"
                      >
                        View
                      </Link>
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