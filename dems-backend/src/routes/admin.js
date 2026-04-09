import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/admin/stats
router.get('/stats', authenticate, requireRole('admin'), async (_req, res) => {
  const [total_users, total_organizers, total_attendees, live_events, pending_approvals, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'organizer' } }),
    prisma.user.count({ where: { role: 'attendee' } }),
    prisma.event.count({ where: { status: 'published' } }),
    prisma.organizerProfile.count({ where: { verification_status: 'pending' } }),
    prisma.order.aggregate({ where: { status: 'paid' }, _sum: { total_amount: true }, _count: true }),
  ]);

  res.json({
    total_users, total_organizers, total_attendees,
    live_events, pending_approvals,
    total_revenue: revenue._sum.total_amount || 0,
    total_tickets_sold: revenue._count,
  });
});

// GET /api/admin/organizers/pending
router.get('/organizers/pending', authenticate, requireRole('admin'), async (_req, res) => {
  const pending = await prisma.organizerProfile.findMany({
    where: { verification_status: 'pending' },
    include: { user: { select: { full_name: true, email: true, created_at: true } } },
    orderBy: { created_at: 'desc' },
  });
  res.json(pending);
});

// PATCH /api/admin/organizers/:id/approve
router.patch('/organizers/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  const organizer = await prisma.organizerProfile.update({
    where: { id: req.params.id },
    data: {
      verification_status: status,
      approved_by_admin_id: req.user.id,
      approved_at: status === 'approved' ? new Date() : null,
    },
  });

  if (status === 'approved') {
    await prisma.user.update({ where: { id: organizer.user_id }, data: { status: 'active' } });
  }

  res.json(organizer);
});

// GET /api/admin/users
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  const { role, status, page = '1', limit = '20' } = req.query;
  const where = {};
  if (role) where.role = String(role);
  if (status) where.status = String(status);

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: { id: true, full_name: true, email: true, role: true, status: true, created_at: true, last_login_at: true }, skip, take: Number(limit), orderBy: { created_at: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total });
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { status, role } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { status, role } });
  res.json({ id: user.id, status: user.status, role: user.role });
});

// GET /api/admin/events
router.get('/events', authenticate, requireRole('admin'), async (req, res) => {
  const { status, page = '1', limit = '20' } = req.query;
  const where = {};
  if (status) where.status = String(status);

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    prisma.event.findMany({ where, include: { organizer_profile: { select: { organization_name: true } }, category: true }, skip, take: Number(limit), orderBy: { created_at: 'desc' } }),
    prisma.event.count({ where }),
  ]);
  res.json({ events, total });
});

// PATCH /api/admin/events/:id
router.patch('/events/:id', authenticate, requireRole('admin'), async (req, res) => {
  const event = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
  res.json(event);
});

// GET /api/admin/categories
router.get('/categories', authenticate, requireRole('admin'), async (_req, res) => {
  const categories = await prisma.eventCategory.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

// POST /api/admin/categories
router.post('/categories', authenticate, requireRole('admin'), async (req, res) => {
  const { name, slug, icon_url } = req.body;
  const category = await prisma.eventCategory.create({ data: { name, slug, icon_url } });
  res.status(201).json(category);
});

// PATCH /api/admin/categories/:id
router.patch('/categories/:id', authenticate, requireRole('admin'), async (req, res) => {
  const category = await prisma.eventCategory.update({ where: { id: req.params.id }, data: req.body });
  res.json(category);
});

export default router;
