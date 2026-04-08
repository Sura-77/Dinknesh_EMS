import { useEffect, useState } from 'react';
import { Download, Calendar, MapPin, QrCode } from 'lucide-react';
import { api as mockApi } from '../services/api';
import type { DigitalTicket } from '../types';

export function MyTickets() {
  const [tickets, setTickets] = useState<DigitalTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getTickets();
      setTickets(data);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center size-20 bg-gray-100 rounded-full mb-6">
            <QrCode className="size-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tickets Yet</h2>
          <p className="text-gray-600 mb-8">
            You don't have any tickets. Start exploring events and book your first ticket!
          </p>
          <a
            href="/discover"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Discover Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Digital Tickets</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Show these QR codes at the event entrance for check-in</p>
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-xl shadow-sm overflow-hidden border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {ticket.event?.thumbnail_url ? (
                        <img src={ticket.event.thumbnail_url} alt={ticket.event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="size-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{ticket.event?.title}</h3>
                      <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {ticket.ticket_type?.tier_name} Ticket
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="size-4" />
                      <span>{ticket.schedule && formatDate(ticket.schedule.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="size-4" />
                      <span>{ticket.venue?.venue_name}, {ticket.venue?.city}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 mb-1">Ticket Code</div>
                        <div className="font-mono font-semibold text-gray-900 dark:text-white">{ticket.ticket_code}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 mb-1">Purchase Date</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{formatDate(ticket.purchase_date)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                      <Download className="size-4" /> Download Ticket
                    </button>
                    <button className="px-4 py-2 border rounded-lg text-sm font-semibold transition-colors border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600">
                      View Details
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                    <img src={ticket.qr_image_url} alt="QR Code" className="size-40" />
                  </div>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">Scan this code at the event entrance</p>
                </div>
              </div>
              {ticket.status === 'used' && (
                <div className="px-6 py-3 border-t bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">✓ This ticket has been used</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
