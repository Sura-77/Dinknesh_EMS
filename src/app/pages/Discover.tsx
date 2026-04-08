import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { mockApi, mockCategories } from '../services/mockApi';
import type { Event, Category, FeaturedBanner } from '../types';
import { Link } from 'react-router';

export function Discover() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featured, trending, all, cats] = await Promise.all([
        mockApi.getFeaturedEvents(),
        mockApi.getTrendingEvents(),
        mockApi.getEvents(),
        mockApi.getCategories(),
      ]);
      setFeaturedEvents(featured);
      setTrendingEvents(trending);
      setAllEvents(all);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedCategory
    ? allEvents.filter(e => e.category_id === selectedCategory)
    : allEvents;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Carousel */}
      {featuredEvents.length > 0 && (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-6">
                  <Sparkles className="size-4 text-yellow-300" />
                  <span className="text-sm font-medium">Featured Event</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {featuredEvents[0].title}
                </h1>
                <p className="text-lg text-gray-300 mb-8 line-clamp-3">
                  {featuredEvents[0].description}
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    to={`/events/${featuredEvents[0].id}`}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    View Event
                  </Link>
                  <span className="px-4 py-2 bg-white/10 rounded-lg text-sm">
                    {featuredEvents[0].category_name}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={featuredEvents[0].image_url}
                    alt={featuredEvents[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter Chips */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Trending Events */}
        {!selectedCategory && trendingEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="size-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* All Events / Filtered Events */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory
              ? `${categories.find(c => c.id === selectedCategory)?.name} Events`
              : 'All Events'}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="aspect-video w-full bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No events found in this category.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
