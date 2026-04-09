import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Globe, Check } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(formData);
      updateUser(formData);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (language) => {
    try {
      await api.updateLanguage(language);
      updateUser({ default_language: language });
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
              <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Language</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select your preferred language</p>
            <div className="grid grid-cols-2 gap-4">
              {[{ value: 'en', label: 'English', sub: 'English' }, { value: 'am', label: 'አማርኛ', sub: 'Amharic' }].map(lang => (
                <button key={lang.value} onClick={() => handleLanguageChange(lang.value)} className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-200 ${user?.default_language === lang.value ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                  <div className="flex items-center gap-3">
                    <Globe className="size-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">{lang.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{lang.sub}</div>
                    </div>
                  </div>
                  {user?.default_language === lang.value && <Check className="size-4 text-gray-900 dark:text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
