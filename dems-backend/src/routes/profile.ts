import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// PATCH /api/profile
router.patch('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { first_name, last_name, phone_number, default_language, theme_preference } = req.body;
  const full_name = first_name && last_name ? `${first_name} ${last_name}` : undefined;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { first_name, last_name, full_name, phone_number, default_language, theme_preference },
    select: { id: true, first_name: true, last_name: true, full_name: true, email: true, phone_number: true, default_language: true, theme_preference: true },
  });
  res.json(user);
});

// GET /api/profile/saved-events
router.get('/saved-events', authenticate, async (req: AuthRequest, res: Response) => {
  const saved = await prisma.savedEvent.findMany({
    where: { user_id: req.user!.id },
    include: { event: { include: { schedule: true, venue: true, category: true } } },
    orderBy: { saved_at: 'desc' },
  });
  res.json(saved);
});

// POST /api/profile/saved-events/:eventId
router.post('/saved-events/:eventId', authenticate, async (req: AuthRequest, res: Response) => {
  const saved = await prisma.savedEvent.upsert({
    where: { user_id_event_id: { user_id: req.user!.id, event_id: req.params.eventId } },
    create: { user_id: req.user!.id, event_id: req.params.eventId },
    update: {},
    include: { event: true },
  });
  res.status(201).json(saved);
});

// DELETE /api/profile/saved-events/:eventId
router.delete('/saved-events/:eventId', authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.savedEvent.deleteMany({ where: { user_id: req.user!.id, event_id: req.params.eventId } });
  res.json({ success: true });
});

// GET /api/profile/notifications
router.get('/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { user_id: req.user!.id },
    orderBy: { created_at: 'desc' },
    take: 20,
  });
  res.json(notifications);
});

export default router;
