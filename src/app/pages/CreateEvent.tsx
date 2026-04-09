import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, MapPin, DollarSign, Image as ImageIcon, ArrowLeft, Upload, X, Tag } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';
import type { Category } from '../types';

export function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [bannerMode, setBannerMode] = useState<'upload' | 'url'>('upload');

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    event_type: 'conference',
    description: '',
    start_datetime: '',
    end_datetime: '',
    venue_name: '',
    address: '',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    location_type: 'physical',
    normal_price: '',
    normal_capacity: '',
    vip_price: '',
    vip_capacity: '',
    vvip_price: '',
    vvip_capacity: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const eventTypes = ['conference', 'festival', 'workshop', 'exhibition', 'sports', 'concert', 'seminar', 'other'];

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    // Auto-fill https:// for URL fields
    if (e.target.type === 'url' && value && !value.startsWith('http')) {
      value = 'https://' + value;
    }
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));

    // Upload immediately so we have the URL ready on submit
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
      setBannerFile(null);
      setBannerPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleBannerRemove = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setImageUrl('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!tags.includes(newTag)) setTags(prev => [...prev, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category_id || !formData.description) {
      toast.error('Please fill in all required fields'); return;
    }
    if (!formData.start_datetime || !formData.end_datetime) {
      toast.error('Please set start and end date/time'); return;
    }
    if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
      toast.error('End time must be after start time'); return;
    }
    if (!formData.normal_price || !formData.normal_capacity) {
      toast.error('Normal ticket price and capacity are required'); return;
    }
    if (uploading) {
      toast.error('Please wait for image upload to finish'); return;
    }

    // Build ticket types array — only include tiers that have both price and capacity
    const ticket_types = [];
    if (formData.normal_price && formData.normal_capacity) {
      ticket_types.push({
        tier_name: 'Normal',
        price: Number(formData.normal_price),
        currency: 'ETB',
        capacity: Number(formData.normal_capacity),
        remaining_quantity: Number(formData.normal_capacity),
        sales_start_datetime: new Date().toISOString(),
        sales_end_datetime: new Date(formData.start_datetime).toISOString(),
        is_active: true,
      });
    }
    if (formData.vip_price && formData.vip_capacity) {
      ticket_types.push({
        tier_name: 'VIP',
        price: Number(formData.vip_price),
        currency: 'ETB',
        capacity: Number(formData.vip_capacity),
        remaining_quantity: Number(formData.vip_capacity),
        sales_start_datetime: new Date().toISOString(),
        sales_end_datetime: new Date(formData.start_datetime).toISOString(),
        is_active: true,
      });
    }
    if (formData.vvip_price && formData.vvip_capacity) {
      ticket_types.push({
        tier_name: 'VVIP',
        price: Number(formData.vvip_price),
        currency: 'ETB',
        capacity: Number(formData.vvip_capacity),
        remaining_quantity: Number(formData.vvip_capacity),
        sales_start_datetime: new Date().toISOString(),
        sales_end_datetime: new Date(formData.start_datetime).toISOString(),
        is_active: true,
      });
    }

    const payload = {
      title: formData.title,
      category_id: formData.category_id,
      event_type: formData.event_type,
      description: formData.description,
      image_url: imageUrl || undefined,
      thumbnail_url: imageUrl || undefined,
      visibility: 'public',
      schedule: {
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
        timezone: 'Africa/Addis_Ababa',
        sales_start_datetime: new Date().toISOString(),
        sales_end_datetime: new Date(formData.start_datetime).toISOString(),
      },
      venue: {
        venue_name: formData.venue_name,
        address_line1: formData.address,
        city: formData.city,
        region: formData.city,
        country: formData.country,
        location_type: formData.location_type,
      },
      ticket_types,
      tags,
    };

    setLoading(true);
    try {
      await api.createEvent(payload);
      toast.success('Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/organizer/dashboard')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4">
            <ArrowLeft className="size-5" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Event</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Fill in the details to publish your event</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 space-y-8 border border-transparent dark:border-gray-800">

          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Innovation Summit 2026" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category_id" required value={formData.category_id} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                  <select name="event_type" required value={formData.event_type} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                    {eventTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" required rows={4} value={formData.description} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Describe your event..." />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Tag className="size-4" /> Tags
                </label>
                <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-gray-900 min-h-[44px] flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-900 text-white text-xs rounded-full">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-gray-300">×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? 'Type a tag and press Enter (e.g. fun, networking, outdoor)' : 'Add more...'}
                    className="flex-1 min-w-32 outline-none text-sm bg-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add a tag. Tags help attendees find your event.</p>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="size-5" /> Banner Image
            </h2>

            {/* Toggle: upload vs URL */}
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => { setBannerMode('upload'); setImageUrl(''); setBannerPreview(null); setBannerFile(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${bannerMode === 'upload' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                Upload File
              </button>
              <button type="button" onClick={() => { setBannerMode('url'); setBannerPreview(null); setBannerFile(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${bannerMode === 'url' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}>
                Image URL
              </button>
            </div>

            {bannerMode === 'upload' ? (
              !bannerPreview ? (
                <label htmlFor="banner_upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Upload className="size-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (max 5MB)</p>
                  <input id="banner_upload" type="file" className="hidden" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleBannerChange} />
                </label>
              ) : (
                <div className="relative">
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-64 object-cover rounded-lg" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <div className="animate-spin size-8 border-4 border-white border-t-transparent rounded-full" />
                    </div>
                  )}
                  <button type="button" onClick={handleBannerRemove}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                    <X className="size-4" />
                  </button>
                  {imageUrl && <div className="absolute bottom-3 left-3 px-2 py-1 bg-green-600 text-white text-xs rounded-lg">✓ Uploaded</div>}
                </div>
              )
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={e => {
                    let val = e.target.value;
                    if (val && !val.startsWith('http')) val = 'https://' + val;
                    setImageUrl(val);
                  }}
                  onFocus={e => { if (!e.target.value) setImageUrl('https://'); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
                {imageUrl && imageUrl.startsWith('http') && (
                  <div className="relative">
                    <img src={imageUrl} alt="Banner preview" className="w-full h-64 object-cover rounded-lg"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="size-5" /> Date & Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                <input type="datetime-local" name="start_datetime" required value={formData.start_datetime} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                <input type="datetime-local" name="end_datetime" required value={formData.end_datetime} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Venue */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="size-5" /> Venue
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                <input type="text" name="venue_name" required value={formData.venue_name} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Millennium Hall" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input type="text" name="address" required value={formData.address} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Street address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input type="text" name="country" required value={formData.country} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="size-5" /> Ticket Types
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Normal', priceKey: 'normal_price', capKey: 'normal_capacity', required: true },
                { label: 'VIP', priceKey: 'vip_price', capKey: 'vip_capacity', required: false },
                { label: 'VVIP', priceKey: 'vvip_price', capKey: 'vvip_capacity', required: false },
              ].map(({ label, priceKey, capKey, required }) => (
                <div key={label} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{label} Tickets {required ? '*' : '(optional)'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
                      <input type="number" name={priceKey} required={required} min="0"
                        value={(formData as any)[priceKey]} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input type="number" name={capKey} required={required} min="1"
                        value={(formData as any)[capKey]} onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate('/organizer/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? 'Creating Event...' : uploading ? 'Uploading image...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
