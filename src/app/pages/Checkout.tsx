import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import type { TicketReservation } from '../types';
import { toast } from 'sonner';

export function Checkout() {
  const [reservations, setReservations] = useState<TicketReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getSavedTickets();
      if (data.length === 0) {
        navigate('/saved-tickets');
      }
      setReservations(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const checkoutData = await mockApi.createCheckout(reservations.map(r => r.id));
      await mockApi.confirmPayment(checkoutData.checkout_id);
      
      setPaymentComplete(true);
      toast.success('Payment successful!');
      
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const totals = reservations.reduce(
    (acc, res) => ({
      subtotal: acc.subtotal + res.subtotal,
      service_fee: acc.service_fee + res.service_fee,
      total: acc.total + res.total_price,
    }),
    { subtotal: 0, service_fee: 0, total: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center size-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="size-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-8">
            Your tickets have been sent to your email and are available in your account.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your purchase</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pl-12"
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                <Lock className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  Your payment information is encrypted and secure. We never store your card details.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="flex justify-between text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {reservation.event?.title}
                      </div>
                      <div className="text-gray-500">
                        {reservation.ticket_type?.tier_name} × {reservation.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {reservation.subtotal.toFixed(2)} ETB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Total</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{totals.subtotal.toFixed(2)} ETB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold text-gray-900">{totals.service_fee.toFixed(2)} ETB</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {totals.total.toFixed(2)} ETB
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Complete Payment'}
              </button>

              <div className="mt-4 text-center text-xs text-gray-500">
                By completing this purchase, you agree to the terms and conditions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
