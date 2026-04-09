import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

const eventSelect = {
  id: true, title: true, description: true, event_type: true,
  image_url: true, thumbnail_url: true, status: true, visibility: true,
  is_featured: true, is_trending: true, created_at: true, updated_at: true,
  organizer_profile: { select: { id: true, organization_name: true } },
  category: { select: { id: true, name: true, slug: true } },
  schedule: true,
  venue: true,
  _count: { select: { reviews: true } },
};

// GET /api/events - list published events with filters
router.get('/', async (req: Request, res: Response) => {
  const {
    q, category, type, city, featured, trending,
    location_type, min_price, max_price, min_rating,
    tag, page = '1', limit = '50',
  } = req.query;

  const where: any = { status: 'published', visibility: 'public' };

  // Text search — title, description, tags
  if (q) {
    where.OR = [
      { title: { contains: String(q), mode: 'insensitive' } },
      { description: { contains: String(q), mode: 'insensitive' } },
      { tag_map: { some: { tag: { name: { contains: String(q), mode: 'insensitive' } } } } },
    ];
  }

  if (category) where.category = { slug: String(category) };
  if (type) where.event_type = String(type);
  if (city) where.venue = { city: { contains: String(city), mode: 'insensitive' } };
  if (location_type) where.venue = { ...(where.venue || {}), location_type: String(location_type) };
  if (featured === 'true') where.is_featured = true;
  if (trending === 'true') where.is_trending = true;
  if (tag) where.tag_map = { some: { tag: { slug: String(tag) } } };

  // Price filter — check against ticket_types
  if (min_price || max_price) {
    where.ticket_types = {
      some: {
        is_active: true,
        ...(min_price ? { price: { gte: Number(min_price) } } : {}),
        ...(max_price ? { price: { lte: Number(max_price) } } : {}),
      },
    };
  }

  const skip = (Number(page) - 1) * Number(limit);
  let events = await prisma.event.findMany({
    where,
    select: {
      ...eventSelect,
      tag_map: { include: { tag: true } },
      ticket_types: { where: { is_active: true }, select: { price: true, tier_name: true } },
    },
    skip,
    take: Number(limit),
    orderBy: { created_at: 'desc' },
  });

  // Rating filter (computed from reviews — filter in memory since it's not stored as a column)
  if (min_rating) {
    const minR = Number(min_rating);
    const eventIds = events.map(e => e.id);
    const ratings = await prisma.eventReview.groupBy({
      by: ['event_id'],
      where: { event_id: { in: eventIds }, status: 'visible' },
      _avg: { rating: true },
    });
    const ratingMap = Object.fromEntries(ratings.map(r => [r.event_id, r._avg.rating || 0]));
    events = events.filter(e => (ratingMap[e.id] || 0) >= minR);
  }

  const total = await prisma.event.count({ where });
  res.json({ events, total, page: Number(page), limit: Number(limit) });
});

// GET /api/events/featured
router.get('/featured', async (_req, res: Response) => {
  const events = await prisma.event.findMany({
    where: { status: 'published', is_featured: true },
    select: eventSelect,
    take: 6,
  });
  res.json(events);
});

// GET /api/events/trending
router.get('/trending', async (_req, res: Response) => {
  const events = await prisma.event.findMany({
    where: { status: 'published', is_trending: true },
    select: eventSelect,
    take: 6,
  });
  res.json(events);
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      organizer_profile: { select: { id: true, organization_name: true, logo_url: true, bio: true } },
      category: true,
      schedule: true,
      venue: true,
      ticket_types: { where: { is_active: true } },
      reviews: { where: { status: 'visible' }, include: { user: { select: { full_name: true } } }, orderBy: { created_at: 'desc' }, take: 10 },
      tag_map: { include: { tag: true } },
      media: { orderBy: { sort_order: 'asc' } },
    },
  });

  if (!event) { res.status(404).json({ error: 'Event not found' }); return; }
  res.json(event);
});

// POST /api/events - organizer creates event
router.post('/', authenticate, requireRole('organizer', 'admin'), async (req: AuthRequest, res: Response) => {
  const { title, category_id, event_type, description, rich_description_html, image_url, thumbnail_url, visibility, schedule, venue, ticket_types, tags } = req.body;

  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(403).json({ error: 'Organizer profile not found' }); return; }

  // Upsert tags and build tag_map
  let tagMapData: { tag_id: string }[] = [];
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const tagRecords = await Promise.all(
      tags.map((name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return prisma.eventTag.upsert({ where: { slug }, update: {}, create: { name, slug } });
      })
    );
    tagMapData = tagRecords.map(t => ({ tag_id: t.id }));
  }

  const event = await prisma.event.create({
    data: {
      organizer_profile_id: organizer.id,
      title, category_id, event_type, description, rich_description_html,
      image_url, thumbnail_url, visibility: visibility || 'public',
      status: 'published',
      schedule: schedule ? { create: schedule } : undefined,
      venue: venue ? { create: venue } : undefined,
      ticket_types: ticket_types ? { create: ticket_types } : undefined,
      tag_map: tagMapData.length > 0 ? { create: tagMapData } : undefined,
    },
    include: { schedule: true, venue: true, ticket_types: true, tag_map: { include: { tag: true } } },
  });

  res.status(201).json(event);
});

// PATCH /api/events/:id
router.patch('/:id', authenticate, requireRole('organizer', 'admin'), async (req: AuthRequest, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id }, include: { organizer_profile: true } });
  if (!event) { res.status(404).json({ error: 'Event not found' }); return; }

  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (req.user!.role !== 'admin' && event.organizer_profile_id !== organizer?.id) {
    res.status(403).json({ error: 'Not your event' }); return;
  }

  const { schedule, venue, ...eventData } = req.body;
  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...eventData,
      schedule: schedule ? { upsert: { create: schedule, update: schedule } } : undefined,
      venue: venue ? { upsert: { create: venue, update: venue } } : undefined,
    },
    include: { schedule: true, venue: true, ticket_types: true },
  });

  res.json(updated);
});

// POST /api/events/:id/reviews
router.post('/:id/reviews', authenticate, async (req: AuthRequest, res: Response) => {
  const { rating, review_text } = req.body;
  if (!rating || !review_text) { res.status(400).json({ error: 'rating and review_text required' }); return; }

  const review = await prisma.eventReview.create({
    data: { event_id: req.params.id, user_id: req.user!.id, rating: Number(rating), review_text },
  });
  res.status(201).json(review);
});

// GET /api/events/:id/reviews
router.get('/:id/reviews', async (req: Request, res: Response) => {
  const reviews = await prisma.eventReview.findMany({
    where: { event_id: req.params.id, status: 'visible' },
    include: { user: { select: { full_name: true } } },
    orderBy: { created_at: 'desc' },
  });
  res.json(reviews);
});

// GET /api/events/:id/stats
router.get('/:id/stats', authenticate, requireRole('organizer', 'admin', 'security', 'staff'), async (req: Request, res: Response) => {
  const stats = await prisma.eventAttendanceStats.findUnique({ where: { event_id: req.params.id } });
  res.json(stats || { event_id: req.params.id, tickets_sold_total: 0, checked_in_total: 0, normal_sold: 0, vip_sold: 0, vvip_sold: 0 });
});

// GET /api/events/tags - all available tags
router.get('/tags/all', async (_req, res: Response) => {
  const tags = await prisma.eventTag.findMany({ orderBy: { name: 'asc' } });
  res.json(tags);
});

export default router;
