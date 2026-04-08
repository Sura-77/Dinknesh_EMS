import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.requestPasswordReset(email);
      toast.success('OTP sent to your email');
      setStep('reset');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      // Pass email along with code and new_password
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, new_password: newPassword }),
      }).then(async r => {
        if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Reset failed'); }
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-gray-900 mb-2">DEMS</div>
            <div className="h-1 w-24 mx-auto mb-6 flex rounded-full overflow-hidden">
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {step === 'email'
                ? 'Enter your email to receive a reset code'
                : `Enter the OTP sent to ${email}`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-center text-2xl tracking-widest font-semibold"
                  placeholder="000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 pr-12"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep('email')}
                className="w-full text-sm text-gray-600 hover:text-gray-900 underline">
                Use a different email
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
