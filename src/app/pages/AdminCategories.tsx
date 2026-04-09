import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Plus, Pencil, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import type { Category } from '../types';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    try {
      const updated = await api.updateAdminCategory(id, { name: editName, slug: editSlug });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setEditingId(null);
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const updated = await api.updateAdminCategory(cat.id, { is_active: !cat.is_active });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, ...updated } : c));
      toast.success(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update category');
    }
  };

  const handleAdd = async () => {
    if (!newName || !newSlug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      const created = await api.createAdminCategory({ name: newName, slug: newSlug });
      setCategories(prev => [...prev, created]);
      setNewName('');
      setNewSlug('');
      setShowAdd(false);
      toast.success('Category created');
    } catch {
      toast.error('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Categories</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{categories.length} categories</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus className="size-4" /> Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Add form */}
        {showAdd && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6 border-2 border-gray-900 dark:border-gray-400">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">New Category</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={newName} onChange={e => { setNewName(e.target.value); setNewSlug(toSlug(e.target.value)); }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Technology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <input type="text" value={newSlug} onChange={e => setNewSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="technology" />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create'}
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewName(''); setNewSlug(''); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories list */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-transparent dark:border-gray-800">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading categories...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Slug</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                          autoFocus />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <input value={editSlug} onChange={e => setEditSlug(e.target.value)}
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                      ) : (
                        <code className="text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{cat.slug}</code>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          cat.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={saving}
                            className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(cat)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
