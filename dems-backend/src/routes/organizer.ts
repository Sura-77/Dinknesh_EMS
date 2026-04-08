import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/organizer/register
router.post('/register', async (req: any, res: Response) => {
  const { full_name, work_email, password, organization_name, organization_type, website_url, bio, phone_number, tax_id_number } = req.body;

  const existing = await prisma.user.findUnique({ where: { email: work_email } });
  if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }

  const [first_name, ...rest] = full_name.trim().split(' ');
  const last_name = rest.join(' ') || '';
  const password_hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      first_name, last_name, full_name,
      email: work_email, password_hash,
      phone_number, role: 'organizer', status: 'pending',
      organizer_profile: {
        create: {
          organization_name, organization_type,
          website_url, bio, work_email, phone_number,
          tax_id_number, verification_status: 'pending',
        },
      },
    },
    include: { organizer_profile: true },
  });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const { password_hash: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, organizer_profile: user.organizer_profile, token });
});

// GET /api/organizer/dashboard
router.get('/dashboard', authenticate, requireRole('organizer'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const [events, ticketStats] = await Promise.all([
    prisma.event.findMany({
      where: { organizer_profile_id: organizer.id },
      include: { schedule: true, attendance_stats: true },
      orderBy: { created_at: 'desc' },
    }),
    prisma.order.findMany({
      where: { reservation: { event: { organizer_profile_id: organizer.id } }, status: 'paid' },
      select: { total_amount: true, reservation: { select: { event_id: true, event: { select: { title: true } } } } },
    }),
  ]);

  const live_events = events.filter(e => e.status === 'published');
  const past_events = events.filter(e => e.status === 'completed');
  const total_tickets_sold = ticketStats.length;
  const total_revenue = ticketStats.reduce((sum, o) => sum + o.total_amount, 0);

  const revenueMap: Record<string, { event_id: string; event_title: string; revenue: number }> = {};
  for (const o of ticketStats) {
    const eid = o.reservation.event_id;
    if (!revenueMap[eid]) revenueMap[eid] = { event_id: eid, event_title: o.reservation.event.title, revenue: 0 };
    revenueMap[eid].revenue += o.total_amount;
  }

  res.json({ total_events: events.length, live_events, past_events, total_tickets_sold, total_revenue, revenue_by_event: Object.values(revenueMap) });
});

// GET /api/organizer/events
router.get('/events', authenticate, requireRole('organizer'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const events = await prisma.event.findMany({
    where: { organizer_profile_id: organizer.id },
    include: { schedule: true, venue: true, ticket_types: true, attendance_stats: true },
    orderBy: { created_at: 'desc' },
  });
  res.json(events);
});

// GET /api/organizer/revenue
router.get('/revenue', authenticate, requireRole('organizer'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const orders = await prisma.order.findMany({
    where: { reservation: { event: { organizer_profile_id: organizer.id } }, status: 'paid' },
    select: { total_amount: true, paid_at: true },
  });

  const total_revenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  res.json({ total_revenue, orders_count: orders.length });
});

export default router;
