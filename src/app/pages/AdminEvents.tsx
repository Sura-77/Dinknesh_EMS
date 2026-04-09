import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Search, Eye, CheckCircle, XCircle, Star } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';

interface EventRow {
  id: string;
  title: string;
  status: string;
  visibility: string;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
  organizer_profile?: { organization_name: string };
  category?: { name: string };
}

const STATUSES = ['', 'draft', 'published', 'cancelled', 'completed'];

export function AdminEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => { loadEvents(); }, [page, statusFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params: any = { page: String(page), limit: String(limit) };
      if (statusFilter) params.status = statusFilter;
      const res = await api.getAdminEvents(params);
      setEvents(res.events);
      setTotal(res.total);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (eventId: string, data: Partial<EventRow>) => {
    try {
      await api.updateAdminEvent(eventId, data);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...data } : e));
      toast.success('Event updated');
    } catch {
      toast.error('Failed to update event');
    }
  };

  const filtered = search
    ? events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.organizer_profile?.organization_name.toLowerCase().includes(search.toLowerCase())
      )
    : events;

  const totalPages = Math.ceil(total / limit);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Events</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{total.toLocaleString()} total events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center border border-transparent dark:border-gray-800">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or organizer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-transparent dark:border-gray-800">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading events...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Event</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Flags</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Created</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map(event => (
                      <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{event.title}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">{event.organizer_profile?.organization_name}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{event.category?.name || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdate(event.id, { is_featured: !event.is_featured })}
                              title="Toggle featured"
                              className={`p-1 rounded ${event.is_featured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                            >
                              <Star className="size-4" fill={event.is_featured ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {new Date(event.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/events/${event.id}`}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Eye className="size-3" /> View
                            </Link>
                            {event.status === 'draft' && (
                              <button
                                onClick={() => handleUpdate(event.id, { status: 'published' })}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <CheckCircle className="size-3" /> Publish
                              </button>
                            )}
                            {event.status === 'published' && (
                              <button
                                onClick={() => handleUpdate(event.id, { status: 'cancelled' })}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <XCircle className="size-3" /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                      Previous
                    </button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
