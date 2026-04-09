import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Phone } from 'lucide-react';

export function Signup() {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone_number: '', password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) { toast.error('Please fill in all required fields'); return false; }
    if (formData.password !== formData.confirm_password) { toast.error('Passwords do not match'); return false; }
    if (formData.password.length < 8) { toast.error('Password must be at least 8 characters'); return false; }
    setLoading(true);
    try {
      await api.register({ first_name: formData.first_name, last_name: formData.last_name, email: formData.email, password: formData.password, phone_number: formData.phone_number });
      setOtpSent(true); setOtpError('');
      toast.success('OTP sent to ' + formData.email);
      return true;
    } catch (error: any) { toast.error(error.message || 'Failed to send OTP'); return false; }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) { await handleSendOTP(); return; }
    if (otp.length !== 6) { setOtpError('Please enter the 6-digit OTP code'); return; }
    setLoading(true);
    try {
      const response = await api.verifyOTPAndLogin(formData.email, otp, 'signup');
      setUser(response.user); setToken(response.token);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Account created successfully!');
      navigate('/discover');
    } catch (error: any) { setOtpError('Invalid OTP code. Please try again.'); toast.error(error.message || 'Failed to verify OTP'); }
    finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const inputClass = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-gray-900 dark:focus:ring-gray-400";
  const inputDisabledClass = `${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`;
  const labelClass = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="w-full max-w-md">
        <div className="rounded-xl shadow-sm p-8 bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">DEMS</div>
            <div className="h-1 w-24 mx-auto mb-6 flex rounded-full overflow-hidden">
              <div className="flex-1 bg-green-500" /><div className="flex-1 bg-yellow-400" /><div className="flex-1 bg-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Join DEMS to discover amazing events</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className={labelClass}>First Name</label>
                <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="last_name" className={labelClass}>Last Name</label>
                <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="phone_number" className={labelClass}>Phone Number *</label>
              <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required disabled={otpSent} className={inputDisabledClass} placeholder="+251 911 234 567" />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Check your email for the OTP code</p>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} required disabled={otpSent} className={`${inputDisabledClass} pr-12`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={otpSent}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirm_password" className={labelClass}>Confirm Password</label>
              <input type={showPassword ? 'text' : 'password'} id="confirm_password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required disabled={otpSent} className={inputDisabledClass} placeholder="••••••••" />
            </div>

            {!otpSent && (
              <button type="button" onClick={handleSendOTP} disabled={loading}
                className="w-full px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-6 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                {loading ? <><div className="animate-spin size-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full" />Sending OTP...</> : <><Phone className="size-5" />Send OTP Code</>}
              </button>
            )}

            {otpSent && (
              <>
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                    <Phone className="size-4" /> OTP sent to {formData.email}
                  </p>
                </div>
                <div>
                  <label htmlFor="otp" className={labelClass}>Enter 6-Digit OTP *</label>
                  <input type="text" id="otp" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                    required maxLength={6} autoFocus
                    className={`${inputClass} text-center text-2xl tracking-widest font-semibold`} placeholder="000000" />
                  {otpError && <p className="text-sm text-red-600 mt-2">⚠ {otpError}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setOtpError(''); }}
                      className="text-sm underline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      Change email
                    </button>
                    <button type="button" onClick={handleSendOTP} disabled={loading}
                      className="text-sm font-semibold hover:underline disabled:opacity-50 text-gray-900 dark:text-white">
                      Resend OTP
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading || otp.length !== 6}
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 mt-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                  {loading ? <span className="flex items-center justify-center gap-2"><div className="animate-spin size-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full" />Creating account...</span> : 'Verify & Create Account'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline text-gray-900 dark:text-white">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
