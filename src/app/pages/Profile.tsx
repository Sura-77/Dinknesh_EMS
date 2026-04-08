import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Sun, Moon, Globe, Check } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(formData);
      updateUser(formData as any);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (t: 'light' | 'dark') => {
    setTheme(t); // apply immediately
    try {
      await api.updateTheme(t);
      updateUser({ theme_preference: t } as any);
    } catch {
      // theme still applied locally even if API fails
    }
  };

  const handleLanguageChange = async (language: 'en' | 'am') => {
    try {
      await api.updateLanguage(language);
      updateUser({ default_language: language } as any);
      toast.success(`Language changed to ${language === 'en' ? 'English' : 'Amharic'}`);
    } catch {
      toast.error('Failed to update language');
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2
    bg-white dark:bg-gray-800
    border-gray-300 dark:border-gray-600
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:ring-gray-900 dark:focus:ring-gray-400`;

  const cardClass = `rounded-xl shadow-sm p-6
    bg-white dark:bg-gray-900
    border border-transparent dark:border-gray-800`;

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h1>

        <div className="space-y-6">

          {/* Personal Information */}
          <div className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClass} />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Appearance</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how DEMS looks for you</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Light */}
              <button onClick={() => handleThemeChange('light')}
                className={`relative group rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  theme === 'light'
                    ? 'border-gray-900 dark:border-white shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}>
                {/* Preview */}
                <div className="bg-white p-4 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-2.5 rounded-full bg-red-400" />
                    <div className="size-2.5 rounded-full bg-yellow-400" />
                    <div className="size-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="bg-gray-100 rounded-t-lg p-3 space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-900 rounded w-1/3 mt-3" />
                  </div>
                </div>
                {/* Label */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">Light</span>
                  </div>
                  {theme === 'light' && <Check className="size-4 text-gray-900" />}
                </div>
              </button>

              {/* Dark */}
              <button onClick={() => handleThemeChange('dark')}
                className={`relative group rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-900 dark:border-white shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}>
                {/* Preview */}
                <div className="bg-gray-950 p-4 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-2.5 rounded-full bg-red-500" />
                    <div className="size-2.5 rounded-full bg-yellow-500" />
                    <div className="size-2.5 rounded-full bg-green-500" />
                  </div>
                  <div className="bg-gray-800 rounded-t-lg p-3 space-y-2">
                    <div className="h-2 bg-gray-600 rounded w-3/4" />
                    <div className="h-2 bg-gray-700 rounded w-1/2" />
                    <div className="h-6 bg-white rounded w-1/3 mt-3" />
                  </div>
                </div>
                {/* Label */}
                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <Moon className="size-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">Dark</span>
                  </div>
                  {theme === 'dark' && <Check className="size-4 text-white" />}
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Your preference is saved and applied across all sessions.
            </p>
          </div>

          {/* Language */}
          <div className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Language</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select your preferred language</p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'en', label: 'English', sub: 'English' },
                { value: 'am', label: 'አማርኛ', sub: 'Amharic' },
              ].map(lang => (
                <button key={lang.value} onClick={() => handleLanguageChange(lang.value as 'en' | 'am')}
                  className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                    user?.default_language === lang.value
                      ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                  <div className="flex items-center gap-3">
                    <Globe className="size-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">{lang.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lang.sub}</div>
                    </div>
                  </div>
                  {user?.default_language === lang.value && (
                    <Check className="size-4 text-gray-900 dark:text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
