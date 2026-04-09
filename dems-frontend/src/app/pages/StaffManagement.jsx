import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, X, Mail, Phone, Shield, Trash2, Search } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';


const inp = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500';

export function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '', assigned_role: 'staff' });

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    setLoading(true);
    try { setStaff(await api.getStaff()); }
    catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ full_name: '', email: '', phone_number: '', assigned_role: 'staff' });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createStaff(form);
      toast.success(`${form.assigned_role === 'security' ? 'Security' : 'Staff'} member added`);
      closeModal();
      await loadStaff();
    } catch (err) { toast.error(err.message || 'Failed to add staff member'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name} from your team?`)) return;
    try {
      await api.deleteStaff(id);
      toast.success('Staff member removed');
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch { toast.error('Failed to remove staff member'); }
  };

  const filtered = staff.filter(m =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone_number.includes(searchQuery)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <button onClick={() => navigate('/organizer/dashboard')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 flex items-center gap-2">
            â† Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Staff Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your event staff and security team</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
              <UserPlus className="size-5" /> Add Staff Member
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Staff', value: staff.length, color: 'blue' },
            { label: 'Active', value: staff.filter(s => s.status === 'active').length, color: 'green' },
            { label: 'Security', value: staff.filter(s => s.assigned_role === 'security').length, color: 'purple' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-transparent dark:border-gray-800">
              <div className={`p-2 bg-${color}-100 rounded-lg inline-flex mb-2`}><Shield className={`size-6 text-${color}-600`} /></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input type="text" placeholder="Search by name, email, or phone..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className={`${inp} pl-12 py-3`} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-transparent dark:border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['Staff Member', 'Contact', 'Role', 'Badge ID', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No staff found.' : 'No staff members yet.'}
                </td></tr>
              ) : filtered.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{member.full_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Added {new Date(member.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1"><Mail className="size-3.5" />{member.email}</div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Phone className="size-3.5" />{member.phone_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${member.assigned_role === 'security' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {member.assigned_role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{member.staff_badge_id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(member.id, member.full_name)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-transparent dark:border-gray-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="size-5" /> Add Staff Member
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="size-6" /></button>
              </div>
              <form onSubmit={handleAddStaff} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input type="text" required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className={inp} placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inp} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                  <input type="tel" required value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} className={inp} placeholder="+251 9XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                  <select required value={form.assigned_role} onChange={e => setForm(p => ({ ...p, assigned_role: e.target.value }))} className={inp}>
                    <option value="staff">Staff â€” General Event Support</option>
                    <option value="security">Security â€” Ticket Scanning & Verification</option>
                  </select>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-300">
                  A login account will be created automatically. Temporary password = badge ID.
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50">
                    {submitting ? 'Adding...' : 'Add Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

