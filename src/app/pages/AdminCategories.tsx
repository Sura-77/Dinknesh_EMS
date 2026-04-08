import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function AdminCategories() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="size-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-gray-600 mt-2">Add, edit, or remove event categories</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="text-gray-500 text-center">Category management interface coming soon...</p>
        </div>
      </div>
    </div>
  );
}
