import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, X, Mail, Phone, Shield, Edit2, Trash2, Search } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import type { StaffMember } from '../types';

export function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Staff form fields
  const [staffFullName, setStaffFullName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'staff' | 'security'>('staff');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getStaff();
      setStaff(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!staffPhone) {
      setOtpError('Please enter a phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock OTP send
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
      setOtpError('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP code');
      return;
    }

    setIsSubmitting(true);
    try {
      const staffData = {
        full_name: staffFullName,
        email: staffEmail,
        phone_number: staffPhone,
        assigned_role: staffRole,
        otp_code: otp,
      };

      const result = await mockApi.createStaff(staffData);

      if (result.success) {
        // Reset form
        closeModal();
        // Refresh staff list
        await loadStaff();
      }
    } catch (error) {
      setOtpError('Failed to add staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAddStaffModal(false);
    setStaffFullName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffRole('staff');
    setOtpSent(false);
    setOtp('');
    setOtpError('');
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      try {
        await mockApi.deleteStaff(staffId);
        await loadStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone_number.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
              <p className="text-gray-600">Manage your event staff and security team</p>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <UserPlus className="size-5" />
              Add Staff Member
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="size-6 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{staff.length}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="size-6 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Active Staff</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {staff.filter((s) => s.status === 'active').length}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="size-6 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">Security Staff</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {staff.filter((s) => s.assigned_role === 'security').length}
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Badge ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'No staff members found matching your search.' : 'No staff members yet. Add your first staff member to get started.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{member.full_name}</div>
                        <div className="text-sm text-gray-500">
                          Added {new Date(member.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-900 mb-1">
                          <Mail className="size-4" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="size-4" />
                          {member.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          member.assigned_role === 'security'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {member.assigned_role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-900">{member.staff_badge_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Staff Modal */}
        {showAddStaffModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <UserPlus className="size-5 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Add Staff Member</h2>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={closeModal}
                >
                  <X className="size-6" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      value={staffFullName}
                      onChange={(e) => setStaffFullName(e.target.value)}
                      placeholder="Enter full name"
                      required
                      disabled={otpSent}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline size-4 mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      disabled={otpSent}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline size-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="+251 9XX XXX XXX"
                      required
                      disabled={otpSent}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Shield className="inline size-4 mr-1" />
                      Role *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as 'staff' | 'security')}
                      required
                      disabled={otpSent}
                    >
                      <option value="staff">Staff - General Event Support</option>
                      <option value="security">Security - Ticket Scanning & Verification</option>
                    </select>
                  </div>

                  {!otpSent && (
                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSendOTP}
                        disabled={isSubmitting || !staffFullName || !staffEmail || !staffPhone}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full" />
                            Sending OTP...
                          </span>
                        ) : (
                          'Send OTP to Phone'
                        )}
                      </button>
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        We'll send a 6-digit verification code to the phone number above
                      </p>
                    </div>
                  )}

                  {otpSent && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                          ✓ OTP sent successfully to {staffPhone}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter 6-Digit OTP *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          required
                          autoFocus
                        />
                        {otpError && (
                          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                            <span>⚠</span> {otpError}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSubmitting || otp.length !== 6}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full" />
                              Adding...
                            </span>
                          ) : (
                            'Add Staff Member'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
