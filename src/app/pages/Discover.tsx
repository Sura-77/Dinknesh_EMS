import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Search } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { api } from '../services/api';
import type { Event, Category } from '../types';
import { Link, useSearchParams } from 'react-router';

export function Discover() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  useEffect(() => { setSearchInput(urlSearch); }, [urlSearch]);
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featured, trending, all, cats] = await Promise.all([
        api.getFeaturedEvents(), api.getTrendingEvents(), api.getEvents(), api.getCategories(),
      ]);
      setFeaturedEvents(featured); setTrendingEvents(trending);
      setAllEvents(all); setCategories(cats);
    } finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchInput.trim() ? setSearchParams({ search: searchInput.trim() }) : setSearchParams({});
  };

  const filteredEvents = allEvents.filter(event => {
    const query = (searchInput || urlSearch).toLowerCase();
    const matchesSearch = !query ||
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      (event.category_name || (event as any).category?.name || '').toLowerCase().includes(query);
    const eventCategoryId = event.category_id || (event as any).category?.id;
    return matchesSearch && (!selectedCategory || eventCategoryId === selectedCategory);
  });

  const isSearching = !!(searchInput || urlSearch);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero */}
      {featuredEvents.length > 0 && !isSearching && (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
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
                    {(featuredEvents[0] as any).category?.name || featuredEvents[0].category_name}
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

      {/* Search + Category bar */}
      <section className="sticky top-[73px] z-40 border-b transition-colors
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search events by name, category..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-colors
                bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-gray-900 dark:focus:ring-gray-400" />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearchParams({}); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">×</button>
            )}
          </form>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>All Events</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>{cat.name}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!selectedCategory && !isSearching && trendingEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="size-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingEvents.slice(0, 6).map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {isSearching ? `Results for "${searchInput || urlSearch}"`
              : selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Events`
              : 'All Events'}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl shadow-sm overflow-hidden border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                  <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="size-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No events found.</p>
              {(isSearching || selectedCategory) && (
                <button onClick={() => { setSearchInput(''); setSearchParams({}); setSelectedCategory(null); }}
                  className="mt-4 text-sm text-gray-900 dark:text-white underline">Clear filters</button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
