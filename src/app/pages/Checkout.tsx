import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Lock, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { TicketReservation } from '../types';
import { toast } from 'sonner';

export function Checkout() {
  const [reservations, setReservations] = useState<TicketReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const txRef = searchParams.get('tx_ref') || searchParams.get('trx_ref');

  useEffect(() => {
    if (txRef) verifyPayment(txRef);
    else loadReservations();
  }, [txRef]);

  const verifyPayment = async (ref: string) => {
    setVerifying(true);
    try {
      await api.confirmPayment(ref);
      setPaymentComplete(true);
      toast.success('Payment confirmed!');
      setTimeout(() => navigate('/my-tickets'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Payment verification failed');
      navigate('/checkout');
    } finally {
      setVerifying(false);
    }
  };

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getSavedTickets();
      if (data.length === 0) navigate('/saved-tickets');
      setReservations(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithChapa = async () => {
    setProcessing(true);
    try {
      const checkoutData = await api.createCheckout(reservations.map(r => r.id));
      if (checkoutData.payment_url && checkoutData.payment_url !== '#') {
        window.location.href = checkoutData.payment_url;
      } else {
        toast.error('Payment gateway not configured. Set CHAPA_SECRET_KEY in backend .env');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const totals = reservations.reduce(
    (acc, res) => ({ subtotal: acc.subtotal + res.subtotal, service_fee: acc.service_fee + res.service_fee, total: acc.total + res.total_price }),
    { subtotal: 0, service_fee: 0, total: 0 }
  );

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4 mx-auto" />
          <p className="font-medium text-gray-600 dark:text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center size-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="size-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400">Your tickets are ready. Redirecting to your ticket wallet...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 transition-colors bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Checkout</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">Complete your purchase securely via Chapa</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl shadow-sm p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{reservation.event?.title}</div>
                      <div className="text-sm mt-0.5 text-gray-500 dark:text-gray-400">
                        {reservation.ticket_type?.tier_name} × {reservation.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">{reservation.subtotal.toFixed(2)} ETB</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5 flex gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                You'll be redirected to Chapa's secure payment page. Supported: Telebirr, CBE Birr, bank transfer, and cards.
              </div>
            </div>
          </div>

          {/* Total & Pay */}
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm p-6 sticky top-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Total</h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totals.subtotal.toFixed(2)} ETB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee (10%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totals.service_fee.toFixed(2)} ETB</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{totals.total.toFixed(2)} ETB</span>
                </div>
              </div>

              <button onClick={handlePayWithChapa} disabled={processing}
                className="w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                {processing
                  ? <><div className="animate-spin size-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full" />Redirecting...</>
                  : <><ExternalLink className="size-4" />Pay with Chapa</>}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lock className="size-3" /> Secured by Chapa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
