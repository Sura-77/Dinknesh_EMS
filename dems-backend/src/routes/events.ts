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
  const { q, category, type, city, featured, trending, page = '1', limit = '12' } = req.query;

  const where: any = { status: 'published', visibility: 'public' };
  if (q) where.OR = [{ title: { contains: String(q), mode: 'insensitive' } }, { description: { contains: String(q), mode: 'insensitive' } }];
  if (category) where.category = { slug: String(category) };
  if (type) where.event_type = String(type);
  if (city) where.venue = { city: { contains: String(city), mode: 'insensitive' } };
  if (featured === 'true') where.is_featured = true;
  if (trending === 'true') where.is_trending = true;

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    prisma.event.findMany({ where, select: eventSelect, skip, take: Number(limit), orderBy: { created_at: 'desc' } }),
    prisma.event.count({ where }),
  ]);

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
  const { title, category_id, event_type, description, rich_description_html, image_url, thumbnail_url, visibility, schedule, venue, ticket_types } = req.body;

  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(403).json({ error: 'Organizer profile not found' }); return; }

  const event = await prisma.event.create({
    data: {
      organizer_profile_id: organizer.id,
      title, category_id, event_type, description, rich_description_html,
      image_url, thumbnail_url, visibility: visibility || 'public',
      status: 'published',
      schedule: schedule ? { create: schedule } : undefined,
      venue: venue ? { create: venue } : undefined,
      ticket_types: ticket_types ? { create: ticket_types } : undefined,
    },
    include: { schedule: true, venue: true, ticket_types: true },
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

export default router;
