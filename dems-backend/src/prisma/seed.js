import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Categories ────────────────────────────────────────────────────────────
  const [tech, music, art, sports, education, business] = await Promise.all([
    prisma.eventCategory.upsert({ where: { slug: 'technology' }, update: {}, create: { name: 'Technology', slug: 'technology' } }),
    prisma.eventCategory.upsert({ where: { slug: 'music' }, update: {}, create: { name: 'Music', slug: 'music' } }),
    prisma.eventCategory.upsert({ where: { slug: 'art-culture' }, update: {}, create: { name: 'Art & Culture', slug: 'art-culture' } }),
    prisma.eventCategory.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports', slug: 'sports' } }),
    prisma.eventCategory.upsert({ where: { slug: 'education' }, update: {}, create: { name: 'Education', slug: 'education' } }),
    prisma.eventCategory.upsert({ where: { slug: 'business' }, update: {}, create: { name: 'Business', slug: 'business' } }),
  ]);

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@dems.et' },
    update: {},
    create: {
      first_name: 'System', last_name: 'Admin', full_name: 'System Admin',
      email: 'admin@dems.et', password_hash: adminHash,
      role: 'admin', status: 'active', email_verified: true,
    },
  });

  // ── Organizer users + profiles ────────────────────────────────────────────
  const orgHash = await bcrypt.hash('Organizer@1234', 12);

  const orgData = [
    { email: 'techhub@dems.et', name: 'TechHub Ethiopia', org: 'TechHub Ethiopia', type: 'corporate' },
    { email: 'addislive@dems.et', name: 'Addis Live Productions', org: 'Addis Live Productions', type: 'corporate' },
    { email: 'heritage@dems.et', name: 'Ethiopian Heritage Foundation', org: 'Ethiopian Heritage Foundation', type: 'non_profit' },
    { email: 'gallery@dems.et', name: 'National Gallery Ethiopia', org: 'National Gallery Ethiopia', type: 'government' },
    { email: 'athletics@dems.et', name: 'Ethiopian Athletics Federation', org: 'Ethiopian Athletics Federation', type: 'non_profit' },
    { email: 'startup@dems.et', name: 'Startup Ethiopia', org: 'Startup Ethiopia', type: 'corporate' },
    { email: 'cultural@dems.et', name: 'Ethiopian Cultural Society', org: 'Ethiopian Cultural Society', type: 'non_profit' },
    { email: 'bizleaders@dems.et', name: 'Business Leaders Forum', org: 'Business Leaders Forum', type: 'corporate' },
  ];

  const organizers = await Promise.all(orgData.map(async (o) => {
    const [first, ...rest] = o.name.split(' ');
    const user = await prisma.user.upsert({
      where: { email: o.email },
      update: {},
      create: {
        first_name: first, last_name: rest.join(' '), full_name: o.name,
        email: o.email, password_hash: orgHash,
        role: 'organizer', status: 'active', email_verified: true,
      },
    });
    const profile = await prisma.organizerProfile.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        organization_name: o.org,
        organization_type: o.type,
        work_email: o.email,
        phone_number: '+251911000000',
        verification_status: 'approved',
        approved_at: new Date(),
      },
    });
    return profile;
  }));

  // ── Events ────────────────────────────────────────────────────────────────
  const eventsData = [
    {
      organizer: organizers[0], category: tech,
      title: 'Innovation Summit 2026',
      event_type: 'conference',
      description: 'Join us for the largest technology conference in East Africa. Network with industry leaders, attend workshops, and discover the latest innovations.',
      image_url: 'https://images.unsplash.com/photo-1773828746476-7ca780cdcb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1773828746476-7ca780cdcb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: true, is_trending: true,
      venue_name: 'Millennium Hall', city: 'Addis Ababa',
      start: '2026-05-20T09:00:00Z', end: '2026-05-22T18:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 500, capacity: 500, remaining: 234 },
        { tier_name: 'VIP', price: 1200, capacity: 200, remaining: 87 },
        { tier_name: 'VVIP', price: 2500, capacity: 50, remaining: 12 },
      ],
      reviews: [
        { name: 'Sara Tadesse', rating: 5, text: 'Amazing experience! The organization was flawless and the content was incredibly valuable.' },
        { name: 'Daniel Alemu', rating: 4, text: 'Great event overall. The venue was perfect and networking opportunities were excellent.' },
      ],
    },
    {
      organizer: organizers[1], category: music,
      title: 'Ethio Jazz Festival 2026',
      event_type: 'festival',
      description: 'Experience the rich heritage of Ethiopian jazz with world-renowned artists and emerging talents. A celebration of music and culture.',
      image_url: 'https://images.unsplash.com/photo-1571900267799-debdb80d1617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1571900267799-debdb80d1617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: true, is_trending: true,
      venue_name: 'Addis Ababa Stadium', city: 'Addis Ababa',
      start: '2026-06-10T18:00:00Z', end: '2026-06-12T23:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 800, capacity: 1000, remaining: 456 },
        { tier_name: 'VIP', price: 2000, capacity: 300, remaining: 120 },
        { tier_name: 'VVIP', price: 5000, capacity: 50, remaining: 18 },
      ],
      reviews: [
        { name: 'Hana Girma', rating: 5, text: 'Absolutely incredible! The music was soul-stirring and the atmosphere was electric.' },
        { name: 'Yonas Bekele', rating: 5, text: 'Best jazz festival I have ever attended. World-class performances.' },
      ],
    },
    {
      organizer: organizers[2], category: art,
      title: 'Coffee Culture Experience',
      event_type: 'workshop',
      description: 'Immerse yourself in the traditional Ethiopian coffee ceremony. Learn the history, preparation, and cultural significance of Ethiopian coffee.',
      image_url: 'https://images.unsplash.com/photo-1576685880864-50b3b35f1c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1576685880864-50b3b35f1c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: false, is_trending: true,
      venue_name: 'Tomoca Coffee House', city: 'Addis Ababa',
      start: '2026-05-15T10:00:00Z', end: '2026-05-15T14:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 300, capacity: 50, remaining: 22 },
        { tier_name: 'VIP', price: 600, capacity: 20, remaining: 8 },
      ],
      reviews: [
        { name: 'Tigist Haile', rating: 5, text: 'A truly authentic experience. Learned so much about our coffee heritage.' },
      ],
    },
    {
      organizer: organizers[3], category: art,
      title: 'Contemporary African Art Exhibition',
      event_type: 'exhibition',
      description: 'Explore groundbreaking works from emerging and established African artists. A showcase of contemporary art that challenges and inspires.',
      image_url: 'https://images.unsplash.com/photo-1719398026703-0d3f3d162e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1719398026703-0d3f3d162e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: false, is_trending: false,
      venue_name: 'National Museum of Ethiopia', city: 'Addis Ababa',
      start: '2026-05-01T09:00:00Z', end: '2026-05-31T18:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 150, capacity: 500, remaining: 312 },
        { tier_name: 'VIP', price: 400, capacity: 100, remaining: 45 },
      ],
      reviews: [
        { name: 'Mekdes Tadesse', rating: 5, text: 'Stunning collection. Every piece tells a powerful story.' },
        { name: 'Biruk Alemu', rating: 4, text: 'Impressive curation. A must-visit for art lovers.' },
      ],
    },
    {
      organizer: organizers[4], category: sports,
      title: 'Great Ethiopian Run 2026',
      event_type: 'sports',
      description: "Join thousands in Africa's biggest road race. 10K fun run through the heart of Addis Ababa. All fitness levels welcome.",
      image_url: 'https://images.unsplash.com/photo-1565483276060-e6730c0cc6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1565483276060-e6730c0cc6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: true, is_trending: false,
      venue_name: 'Meskel Square', city: 'Addis Ababa',
      start: '2026-11-22T07:00:00Z', end: '2026-11-22T12:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 200, capacity: 5000, remaining: 2341 },
        { tier_name: 'VIP', price: 500, capacity: 500, remaining: 187 },
      ],
      reviews: [
        { name: 'Abebe Girma', rating: 5, text: 'An incredible atmosphere. Running through Addis with thousands of people is unforgettable.' },
        { name: 'Selam Tesfaye', rating: 4, text: 'Well organized and a great cause. Will definitely run again next year.' },
      ],
    },
    {
      organizer: organizers[5], category: business,
      title: 'Entrepreneurship Bootcamp',
      event_type: 'workshop',
      description: 'Intensive 3-day bootcamp for aspiring entrepreneurs. Learn from successful founders, pitch to investors, and build your network.',
      image_url: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: false, is_trending: true,
      venue_name: 'Skylight Hotel', city: 'Addis Ababa',
      start: '2026-06-01T08:00:00Z', end: '2026-06-03T18:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 1500, capacity: 100, remaining: 43 },
        { tier_name: 'VIP', price: 3000, capacity: 30, remaining: 12 },
      ],
      reviews: [
        { name: 'Dawit Kebede', rating: 5, text: 'Transformed my thinking about business. The mentors were world-class.' },
      ],
    },
    {
      organizer: organizers[6], category: art,
      title: 'Timkat Festival Celebration',
      event_type: 'festival',
      description: 'Celebrate the Ethiopian Orthodox celebration of Epiphany with traditional ceremonies, music, and cultural performances.',
      image_url: 'https://images.unsplash.com/photo-1761124739443-ef1a8947fcae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1761124739443-ef1a8947fcae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: false, is_trending: false,
      venue_name: 'Jan Meda', city: 'Addis Ababa',
      start: '2027-01-19T06:00:00Z', end: '2027-01-20T20:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 100, capacity: 2000, remaining: 1234 },
        { tier_name: 'VIP', price: 300, capacity: 200, remaining: 89 },
      ],
      reviews: [
        { name: 'Marta Hailu', rating: 5, text: 'A deeply spiritual and culturally rich experience. Truly moving.' },
        { name: 'Tesfaye Worku', rating: 5, text: 'The ceremonies were breathtaking. A celebration of our heritage.' },
      ],
    },
    {
      organizer: organizers[7], category: business,
      title: 'African Business Network Summit',
      event_type: 'conference',
      description: 'Connect with business leaders across Africa. Explore partnerships, investment opportunities, and regional trade initiatives.',
      image_url: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      is_featured: false, is_trending: false,
      venue_name: 'Sheraton Addis', city: 'Addis Ababa',
      start: '2026-07-15T09:00:00Z', end: '2026-07-17T18:00:00Z',
      tickets: [
        { tier_name: 'Normal', price: 2000, capacity: 300, remaining: 145 },
        { tier_name: 'VIP', price: 5000, capacity: 100, remaining: 34 },
        { tier_name: 'VVIP', price: 10000, capacity: 20, remaining: 7 },
      ],
      reviews: [
        { name: 'Solomon Girma', rating: 4, text: 'Excellent networking opportunities. Met investors from 12 countries.' },
        { name: 'Rahel Bekele', rating: 5, text: 'The panels were insightful and the connections made were invaluable.' },
      ],
    },
  ];

  // Create a dummy attendee user for reviews
  const attendeeHash = await bcrypt.hash('Attendee@1234', 12);
  const reviewUser = await prisma.user.upsert({
    where: { email: 'attendee@dems.et' },
    update: {},
    create: {
      first_name: 'Demo', last_name: 'Attendee', full_name: 'Demo Attendee',
      email: 'attendee@dems.et', password_hash: attendeeHash,
      role: 'attendee', status: 'active', email_verified: true,
    },
  });

  let eventCount = 0;
  for (const e of eventsData) {
    // Check if event already exists
    const existing = await prisma.event.findFirst({
      where: { title: e.title, organizer_profile_id: e.organizer.id },
    });
    if (existing) { console.log(`  Skipping existing: ${e.title}`); continue; }

    const event = await prisma.event.create({
      data: {
        organizer_profile_id: e.organizer.id,
        category_id: e.category.id,
        title: e.title,
        event_type: e.event_type,
        description: e.description,
        image_url: e.image_url,
        thumbnail_url: e.thumbnail_url,
        status: 'published',
        visibility: 'public',
        is_featured: e.is_featured,
        is_trending: e.is_trending,
        schedule: {
          create: {
            start_datetime: new Date(e.start),
            end_datetime: new Date(e.end),
            timezone: 'Africa/Addis_Ababa',
            sales_start_datetime: new Date('2026-04-01T00:00:00Z'),
            sales_end_datetime: new Date(e.start),
          },
        },
        venue: {
          create: {
            venue_name: e.venue_name,
            address_line1: 'Addis Ababa',
            city: e.city,
            region: 'Addis Ababa',
            country: 'Ethiopia',
            latitude: 9.0192,
            longitude: 38.7525,
            location_type: 'physical',
          },
        },
        ticket_types: {
          create: e.tickets.map(t => ({
            tier_name: t.tier_name,
            price: t.price,
            currency: 'ETB',
            capacity: t.capacity,
            remaining_quantity: t.remaining,
            sales_start_datetime: new Date('2026-04-01T00:00:00Z'),
            sales_end_datetime: new Date(e.start),
            is_active: true,
          })),
        },
        attendance_stats: {
          create: {
            tickets_sold_total: e.tickets.reduce((s, t) => s + (t.capacity - t.remaining), 0),
            checked_in_total: 0,
            normal_sold: e.tickets.find(t => t.tier_name === 'Normal') ? (e.tickets.find(t => t.tier_name === 'Normal').capacity - e.tickets.find(t => t.tier_name === 'Normal').remaining) : 0,
            vip_sold: e.tickets.find(t => t.tier_name === 'VIP') ? (e.tickets.find(t => t.tier_name === 'VIP').capacity - e.tickets.find(t => t.tier_name === 'VIP').remaining) : 0,
            vvip_sold: e.tickets.find(t => t.tier_name === 'VVIP') ? (e.tickets.find(t => t.tier_name === 'VVIP').capacity - e.tickets.find(t => t.tier_name === 'VVIP').remaining) : 0,
          },
        },
      },
    });

    // Add reviews
    for (const r of e.reviews) {
      await prisma.eventReview.create({
        data: {
          event_id: event.id,
          user_id: reviewUser.id,
          rating: r.rating,
          review_text: r.text,
          status: 'visible',
        },
      });
    }

    // Add featured banner for featured events
    if (e.is_featured) {
      await prisma.featuredEventBanner.create({
        data: {
          event_id: event.id,
          banner_image_url: e.image_url,
          sort_order: eventCount,
          is_active: true,
        },
      });
    }

    eventCount++;
    console.log(`  ✓ ${e.title}`);
  }

  // System settings
  await prisma.systemSetting.upsert({ where: { key: 'service_fee_percentage' }, update: {}, create: { key: 'service_fee_percentage', value: '10' } });
  await prisma.systemSetting.upsert({ where: { key: 'reservation_timer_minutes' }, update: {}, create: { key: 'reservation_timer_minutes', value: '15' } });
  await prisma.systemSetting.upsert({ where: { key: 'currency' }, update: {}, create: { key: 'currency', value: 'ETB' } });

  console.log(`\nDone! Seeded ${eventCount} events.`);
  console.log('Admin login:    admin@dems.et / Admin@1234');
  console.log('Attendee login: attendee@dems.et / Attendee@1234');
  console.log('Organizer login: techhub@dems.et / Organizer@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
