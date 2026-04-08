import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

// GET /api/staff
router.get('/', authenticate, requireRole('organizer', 'admin'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const staff = await prisma.staffMember.findMany({
    where: { organizer_profile_id: organizer.id },
    orderBy: { created_at: 'desc' },
  });
  res.json(staff);
});

// POST /api/staff
router.post('/', authenticate, requireRole('organizer', 'admin'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const { full_name, email, phone_number, assigned_role } = req.body;
  const badge_count = await prisma.staffMember.count({ where: { organizer_profile_id: organizer.id } });
  const staff_badge_id = `${assigned_role.toUpperCase()}-${String(badge_count + 1).padStart(3, '0')}`;

  const staff = await prisma.staffMember.create({
    data: { organizer_profile_id: organizer.id, full_name, email, phone_number, assigned_role, staff_badge_id },
  });
  res.status(201).json(staff);
});

// PATCH /api/staff/:id
router.patch('/:id', authenticate, requireRole('organizer', 'admin'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  const staff = await prisma.staffMember.findFirst({
    where: { id: req.params.id, organizer_profile_id: organizer?.id },
  });
  if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }

  const updated = await prisma.staffMember.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

// DELETE /api/staff/:id
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), async (req: AuthRequest, res: Response) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user!.id } });
  const staff = await prisma.staffMember.findFirst({
    where: { id: req.params.id, organizer_profile_id: organizer?.id },
  });
  if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }

  await prisma.staffMember.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
