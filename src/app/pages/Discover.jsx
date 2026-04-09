import { useEffect, useState, useCallback } from 'react';
import { Sparkles, TrendingUp, Search, SlidersHorizontal, MapPin, X, Star, Navigation } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { api } from '../services/api';

import { Link, useSearchParams } from 'react-router';


// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NEAR_ME_RADIUS_KM = 50;



const CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Adama'];
const RATINGS = [4, 3, 2];
const POPULAR_TAGS = ['fun', 'memorable', 'networking', 'cultural', 'inspiring', 'outdoor', 'workshop', 'music', 'sports', 'tech'];

export function Discover() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [nearMeStatus, setNearMeStatus] = useState('idle');
  const [userLocation, setUserLocation] = useState(null);
  const [nearEvents, setNearEvents] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('search') || '',
    category: '',
    location_type: '',
    city: '',
    min_price: '',
    max_price: '',
    min_rating: '',
    tag: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
    // Refresh near me results if location already granted
    if (userLocation && activeTab === 'near-me') {
      const nearby = allEvents.filter(e => {
        const lat = e.venue?.latitude;
        const lon = e.venue?.longitude;
        if (!lat || !lon) return false;
        return haversine(userLocation.lat, userLocation.lon, lat, lon) <= NEAR_ME_RADIUS_KM;
      });
      setNearEvents(nearby);
    }
  }, [filters, allEvents]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [featured, trending, all, cats] = await Promise.all([
        api.getFeaturedEvents(), api.getTrendingEvents(), api.getEvents(), api.getCategories(),
      ]);
      setFeaturedEvents(featured);
      setTrendingEvents(trending);
      setAllEvents(all);
      setCategories(cats);
    } finally { setLoading(false); }
  };

  const applyFilters = useCallback(() => {
    let result = [...allEvents];
    const q = filters.q.toLowerCase();

    if (q) {
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.category_name || e.category?.name || '').toLowerCase().includes(q) ||
        (e.tag_map || []).some(tm => tm.tag?.name?.toLowerCase().includes(q))
      );
    }
    if (filters.category) {
      result = result.filter(e => e.category?.id === filters.category || e.category_id === filters.category);
    }
    if (filters.location_type) {
      result = result.filter(e => e.venue?.location_type === filters.location_type);
    }
    if (filters.city) {
      result = result.filter(e => e.venue?.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.min_price) {
      result = result.filter(e => {
        const tickets = e.ticket_types || [];
        return tickets.some(t => t.price >= Number(filters.min_price));
      });
    }
    if (filters.max_price) {
      result = result.filter(e => {
        const tickets = e.ticket_types || [];
        return tickets.some(t => t.price <= Number(filters.max_price));
      });
    }
    if (filters.min_rating) {
      result = result.filter(e => (e.rating || 0) >= Number(filters.min_rating));
    }
    if (filters.tag) {
      result = result.filter(e =>
        (e.tag_map || []).some(tm => tm.tag?.slug === filters.tag || tm.tag?.name?.toLowerCase() === filters.tag.toLowerCase())
      );
    }

    setFilteredEvents(result);
  }, [filters, allEvents]);

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'q') {
      value ? setSearchParams({ search: value }) : setSearchParams({});
    }
  };

  const clearFilters = () => {
    setFilters({ q: '', category: '', location_type: '', city: '', min_price: '', max_price: '', min_rating: '', tag: '' });
    setSearchParams({});
  };

  const handleNearMeClick = () => {
    if (activeTab === 'near-me') { setActiveTab('all'); return; }
    setActiveTab('near-me');
    if (userLocation) return; // already have location

    if (!navigator.geolocation) {
      setNearMeStatus('denied');
      return;
    }
    setNearMeStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        setNearMeStatus('active');
        // Filter events by distance
        const nearby = allEvents.filter(e => {
          const lat = e.venue?.latitude;
          const lon = e.venue?.longitude;
          if (!lat || !lon) return false;
          return haversine(loc.lat, loc.lon, lat, lon) <= NEAR_ME_RADIUS_KM;
        });
        setNearEvents(nearby);
      },
      () => setNearMeStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const isFiltering = activeFilterCount > 0;

  const chipClass = (active) =>
    `px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
      active
        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero â€” only when not filtering */}
      {featuredEvents.length > 0 && !isFiltering && (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-6">
                  <Sparkles className="size-4 text-yellow-300" />
                  <span className="text-sm font-medium">Featured Event</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{featuredEvents[0].title}</h1>
                <p className="text-lg text-gray-300 mb-8 line-clamp-3">{featuredEvents[0].description}</p>
                <div className="flex items-center gap-4">
                  <Link to={`/events/${featuredEvents[0].id}`}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    View Event
                  </Link>
                  <span className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                    {featuredEvents[0].category?.name || featuredEvents[0].category_name}
                  </span>
                </div>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <img src={featuredEvents[0].image_url} alt={featuredEvents[0].title} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search bar + tabs */}
      <div className="sticky top-[73px] z-40 border-b transition-colors bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <form onSubmit={e => e.preventDefault()} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" value={filters.q} onChange={e => setFilter('q', e.target.value)}
              placeholder="Search events, tags, categories..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-gray-900 dark:focus:ring-gray-400" />
            {filters.q && (
              <button type="button" onClick={() => setFilter('q', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">Ã—</button>
            )}
          </form>

          {/* Near Me tab */}
          <button onClick={handleNearMeClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
              activeTab === 'near-me'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-400'
            }`}>
            <Navigation className="size-4" />
            {nearMeStatus === 'requesting' ? 'Locating...' : 'Near Me'}
          </button>

          {filters.q && (
            <>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  activeFilterCount > 0
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-400'
                }`}>
                <SlidersHorizontal className="size-4" />
                Filters {activeFilterCount > 1 && <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full size-5 flex items-center justify-center text-xs font-bold">{activeFilterCount - 1}</span>}
              </button>
              <button onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  showMap
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-400'
                }`}>
                <MapPin className="size-4" /> Map
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* â”€â”€ Left Filter Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {showFilters && filters.q && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-36 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
                      <X className="size-3" /> Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Category</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="category" checked={!filters.category} onChange={() => setFilter('category', '')}
                        className="accent-gray-900 dark:accent-white" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">All Categories</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" checked={filters.category === cat.id} onChange={() => setFilter('category', cat.id)}
                          className="accent-gray-900 dark:accent-white" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Minimum Rating</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rating" checked={!filters.min_rating} onChange={() => setFilter('min_rating', '')}
                        className="accent-gray-900 dark:accent-white" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Any rating</span>
                    </label>
                    {RATINGS.map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="rating" checked={filters.min_rating === String(r)} onChange={() => setFilter('min_rating', String(r))}
                          className="accent-gray-900 dark:accent-white" />
                        <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          {r}+ <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location by city */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Location</h4>
                  <select value={filters.city} onChange={e => setFilter('city', e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-gray-900 dark:focus:ring-gray-400">
                    <option value="">All Cities</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Event Format */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Event Format</h4>
                  <div className="space-y-2">
                    {[{ value: '', label: 'All formats' }, { value: 'physical', label: 'In Person' }, { value: 'online', label: 'Online' }, { value: 'hybrid', label: 'Hybrid' }].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="format" checked={filters.location_type === opt.value} onChange={() => setFilter('location_type', opt.value)}
                          className="accent-gray-900 dark:accent-white" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Price (ETB)</h4>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} min="0"
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-gray-900 dark:focus:ring-gray-400" />
                    <span className="text-gray-400 text-sm">â€“</span>
                    <input type="number" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} min="0"
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-gray-900 dark:focus:ring-gray-400" />
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => (
                      <button key={tag} onClick={() => setFilter('tag', filters.tag === tag ? '' : tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          filters.tag === tag
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* â”€â”€ Middle: Event Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex-1 min-w-0">
            {/* Near Me results */}
            {activeTab === 'near-me' && (
              <div className="mb-10">
                {nearMeStatus === 'requesting' && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="animate-spin size-10 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 rounded-full" />
                    <p className="text-gray-500 dark:text-gray-400">Getting your location...</p>
                  </div>
                )}
                {nearMeStatus === 'denied' && (
                  <div className="text-center py-16">
                    <Navigation className="size-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Location access denied</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Please allow location access in your browser settings and try again.</p>
                    <button onClick={handleNearMeClick} className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700">
                      Try Again
                    </button>
                  </div>
                )}
                {nearMeStatus === 'active' && (
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <Navigation className="size-5 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Events Near You
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">within {NEAR_ME_RADIUS_KM}km</span>
                      </h2>
                    </div>
                    {nearEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {nearEvents.map(event => <EventCard key={event.id} event={event} />)}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <MapPin className="size-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No events near you</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">No events found within {NEAR_ME_RADIUS_KM}km of your location.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Trending â€” only when no filters active and on all tab */}
            {activeTab === 'all' && !isFiltering && trendingEvents.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="size-5 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {trendingEvents.slice(0, 6).map(event => <EventCard key={event.id} event={event} />)}
                </div>
              </section>
            )}

            {/* Results header â€” only on all tab */}
            {activeTab === 'all' && (
            <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isFiltering
                  ? `${filteredEvents.length} result${filteredEvents.length !== 1 ? 's' : ''} found`
                  : 'All Events'}
              </h2>
              {/* Active filter chips */}
              {isFiltering && (
                <div className="flex flex-wrap gap-2">
                  {filters.q && <span className={chipClass(true)}>"{filters.q}" <button onClick={() => setFilter('q', '')} className="ml-1">Ã—</button></span>}
                  {filters.tag && <span className={chipClass(true)}>#{filters.tag} <button onClick={() => setFilter('tag', '')} className="ml-1">Ã—</button></span>}
                  {filters.city && <span className={chipClass(true)}>{filters.city} <button onClick={() => setFilter('city', '')} className="ml-1">Ã—</button></span>}
                  {filters.location_type && <span className={chipClass(true)}>{filters.location_type} <button onClick={() => setFilter('location_type', '')} className="ml-1">Ã—</button></span>}
                  {filters.min_rating && <span className={chipClass(true)}>{filters.min_rating}+ â˜… <button onClick={() => setFilter('min_rating', '')} className="ml-1">Ã—</button></span>}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl shadow-sm overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                    <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="size-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No events found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="px-6 py-2 rounded-lg text-sm font-semibold transition-colors bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                  Clear all filters
                </button>
              </div>
            )}
            </> 
            )}

            {/* â”€â”€ Bottom: Interactive Discovery Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {showMap && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="size-5" /> Event Map
                  </h2>
                  <button onClick={() => setShowMap(false)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1">
                    <X className="size-4" /> Hide map
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                  <iframe
                    title="Event Map â€” Addis Ababa"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=38.6%2C8.9%2C38.9%2C9.1&layer=mapnik&marker=9.0192%2C38.7525"
                    className="w-full h-96"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                  <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Showing events in Addis Ababa · {filteredEvents.filter(e => e.venue?.city === 'Addis Ababa').length} events in this area
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3 justify-center">
                      {filteredEvents.slice(0, 5).map(event => (
                        <Link key={event.id} to={`/events/${event.id}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <MapPin className="size-3 text-red-500" />
                          {event.title.length > 25 ? event.title.slice(0, 25) + '...' : event.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

