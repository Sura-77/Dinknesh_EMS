import { Link } from 'react-router';
import { Calendar, Users, Shield, Sparkles } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-6">
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="flex-1 bg-green-600" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-red-600" />
        </div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="text-6xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-yellow-300 to-red-400 bg-clip-text text-transparent">DEMS</span>
            </div>
            <div className="h-1 w-32 mx-auto mb-8 flex rounded-full overflow-hidden">
              <div className="flex-1 bg-green-500" /><div className="flex-1 bg-yellow-400" /><div className="flex-1 bg-red-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Ethiopia's Premier Event Platform</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Discover unforgettable experiences. Book tickets seamlessly. Create and manage events with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/discover" className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">Discover Events</Link>
            <Link to="/organizer/signup" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors">Create Event</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <Calendar className="size-8 text-yellow-300" />, title: 'Easy Booking', desc: 'Reserve tickets instantly with our streamlined checkout process' },
              { icon: <Shield className="size-8 text-green-300" />, title: 'Secure Tickets', desc: 'Digital tickets with QR codes for safe and contactless entry' },
              { icon: <Users className="size-8 text-red-300" />, title: 'For Organizers', desc: 'Powerful tools to create, manage, and grow your events' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center size-16 bg-white/10 rounded-full mb-4">{icon}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
            <Sparkles className="size-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">About DEMS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Connecting Ethiopia Through Events</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            DEMS is Ethiopia's most trusted event ticketing platform, bringing together event organizers
            and attendees in a seamless, secure, and culturally-rich experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { stat: '10,000+', label: 'Events Hosted' },
              { stat: '500K+', label: 'Tickets Sold' },
              { stat: '5,000+', label: 'Happy Organizers' },
            ].map(({ stat, label }) => (
              <div key={label} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: 'For Attendees', steps: [{ n: 1, title: 'Discover Events', desc: 'Browse featured, trending, and nearby events' }, { n: 2, title: 'Reserve Tickets', desc: 'Save your tickets and complete checkout within 15 minutes' }, { n: 3, title: 'Get Digital Tickets', desc: 'Access your tickets with QR codes instantly' }] },
              { title: 'For Organizers', steps: [{ n: 1, title: 'Create Account', desc: 'Register as an organizer and get verified' }, { n: 2, title: 'Setup Event', desc: 'Add details, tickets, and manage your team' }, { n: 3, title: 'Track & Earn', desc: 'Monitor sales, check-ins, and revenue in real-time' }] },
            ].map(({ title, steps }) => (
              <div key={title}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
                <div className="space-y-6">
                  {steps.map(({ n, title: t, desc }) => (
                    <div key={n} className="flex gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center size-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold">{n}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-900 dark:bg-gray-800 text-white transition-colors">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of event-goers and organizers on Ethiopia's premier platform</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/discover" className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Explore Events</Link>
            <Link to="/organizer/signup" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors">Become an Organizer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
