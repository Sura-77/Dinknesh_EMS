import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2, Clock, Calendar, Minus, Plus, ShoppingBag } from 'lucide-react';
import { api as mockApi } from '../services/api';
import { toast } from 'sonner';

export function SavedTickets() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({});
  const navigate = useNavigate();

  useEffect(() => { loadReservations(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTimes = { ...prev };
        reservations.forEach(res => {
          newTimes[res.id] = Math.max(0, new Date(res.expires_at).getTime() - Date.now());
        });
        return newTimes;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reservations]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getSavedTickets();
      setReservations(data);
    } finally { setLoading(false); }
  };

  const handleRemove = async (id) => {
    try {
      await mockApi.deleteSavedTicket(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      toast.success('Ticket removed');
    } catch { toast.error('Failed to remove ticket'); }
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await mockApi.updateSavedTicket(id, newQuantity);
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, quantity: newQuantity, subtotal: r.unit_price * newQuantity, service_fee: r.unit_price * newQuantity * 0.1, total_price: r.unit_price * newQuantity * 1.1 } : r
      ));
    } catch { toast.error('Failed to update quantity'); }
  };

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totals = reservations.reduce(
    (acc, res) => ({ subtotal: acc.subtotal + res.subtotal, service_fee: acc.service_fee + res.service_fee, total: acc.total + res.total_price }),
    { subtotal: 0, service_fee: 0, total: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center size-20 rounded-full mb-6 bg-gray-100 dark:bg-gray-800">
            <ShoppingBag className="size-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Saved Tickets</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-400">You haven't reserved any tickets yet.</p>
          <Link to="/discover" className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">Discover Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 transition-colors bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Saved Tickets</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">Complete your purchase before the timer expires</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="rounded-xl shadow-sm p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="flex gap-6">
                  <div className="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {reservation.event?.thumbnail_url
                      ? <img src={reservation.event.thumbnail_url} alt={reservation.event.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Calendar className="size-8 text-gray-400" /></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{reservation.event?.title}</h3>
                        <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">{reservation.ticket_type?.tier_name} Ticket</p>
                      </div>
                      <button onClick={() => handleRemove(reservation.id)} className="text-red-600 hover:text-red-700 p-2">
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleUpdateQuantity(reservation.id, reservation.quantity - 1)} className="size-8 flex items-center justify-center rounded border transition-colors border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Minus className="size-4" />
                        </button>
                        <span className="font-semibold w-8 text-center text-gray-900 dark:text-white">{reservation.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(reservation.id, reservation.quantity + 1)} className="size-8 flex items-center justify-center rounded border transition-colors border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{reservation.unit_price} ETB</span> each
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-3 py-2 rounded-lg">
                      <Clock className="size-4" />
                      <span className="font-semibold">Expires in {formatTime(timeRemaining[reservation.id] || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm p-6 sticky top-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totals.subtotal.toFixed(2)} ETB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totals.service_fee.toFixed(2)} ETB</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{totals.total.toFixed(2)} ETB</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full px-4 py-3 rounded-lg font-semibold mb-4 transition-colors bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                Proceed to Checkout
              </button>
              <Link to="/discover" className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Continue Shopping</Link>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="size-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p>Your tickets are reserved for 15 minutes. Complete checkout before the timer expires.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
