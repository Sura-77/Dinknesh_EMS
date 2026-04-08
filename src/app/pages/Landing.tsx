import { Link } from 'react-router';
import { Calendar, Users, Shield, Sparkles } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-6">
        {/* Ethiopian tricolor accent */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="flex-1 bg-green-600" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-red-600" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="text-6xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">
                DEMS
              </span>
            </div>
            <div className="h-1 w-32 mx-auto mb-8 flex rounded-full overflow-hidden">
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-red-500" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Ethiopia's Premier Event Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Discover unforgettable experiences. Book tickets seamlessly. Create and manage events with ease.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/discover"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Discover Events
            </Link>
            <Link
              to="/organizer/signup"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Create Event
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-16 bg-white/10 rounded-full mb-4">
                <Calendar className="size-8 text-yellow-300" />
              </div>
              <h3 className="font-semibold mb-2">Easy Booking</h3>
              <p className="text-sm text-gray-400">
                Reserve tickets instantly with our streamlined checkout process
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center size-16 bg-white/10 rounded-full mb-4">
                <Shield className="size-8 text-green-300" />
              </div>
              <h3 className="font-semibold mb-2">Secure Tickets</h3>
              <p className="text-sm text-gray-400">
                Digital tickets with QR codes for safe and contactless entry
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center size-16 bg-white/10 rounded-full mb-4">
                <Users className="size-8 text-red-300" />
              </div>
              <h3 className="font-semibold mb-2">For Organizers</h3>
              <p className="text-sm text-gray-400">
                Powerful tools to create, manage, and grow your events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6">
            <Sparkles className="size-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">About DEMS</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Connecting Ethiopia Through Events
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            DEMS is Ethiopia's most trusted event ticketing platform, bringing together event organizers 
            and attendees in a seamless, secure, and culturally-rich experience. From concerts and conferences 
            to workshops and festivals, we make discovering and attending events effortless.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-sm text-gray-600">Events Hosted</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-2">500K+</div>
              <div className="text-sm text-gray-600">Tickets Sold</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
              <div className="text-sm text-gray-600">Happy Organizers</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Attendees */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">For Attendees</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 text-white rounded-full font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Discover Events</h4>
                    <p className="text-sm text-gray-600">Browse featured, trending, and nearby events</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 text-white rounded-full font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Reserve Tickets</h4>
                    <p className="text-sm text-gray-600">Save your tickets and complete checkout within 15 minutes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 text-white rounded-full font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Get Digital Tickets</h4>
                    <p className="text-sm text-gray-600">Access your tickets with QR codes instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Organizers */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">For Organizers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 text-white rounded-full font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Create Account</h4>
                    <p className="text-sm text-gray-600">Register as an organizer and get verified</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 text-white rounded-full font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Setup Event</h4>
                    <p className="text-sm text-gray-600">Add details, tickets, and manage your team</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 text-white rounded-full font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Track & Earn</h4>
                    <p className="text-sm text-gray-600">Monitor sales, check-ins, and revenue in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of event-goers and organizers on Ethiopia's premier platform
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/discover"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Events
            </Link>
            <Link
              to="/organizer/signup"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Become an Organizer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
