import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// GET /api/staff
router.get('/', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const staff = await prisma.staffMember.findMany({
    where: { organizer_profile_id: organizer.id },
    orderBy: { created_at: 'desc' },
  });
  res.json(staff);
});

// POST /api/staff — creates staff record + a user account so they can log in
router.post('/', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user.id } });
  if (!organizer) { res.status(404).json({ error: 'Organizer profile not found' }); return; }

  const { full_name, email, phone_number, assigned_role } = req.body;
  if (!full_name || !email || !phone_number || !assigned_role) {
    res.status(400).json({ error: 'full_name, email, phone_number, assigned_role required' }); return;
  }

  const badge_count = await prisma.staffMember.count({ where: { organizer_profile_id: organizer.id } });
  const staff_badge_id = `${assigned_role.toUpperCase()}-${String(badge_count + 1).padStart(3, '0')}`;

  // Create or find a user account for this staff member
  let staffUser = await prisma.user.findUnique({ where: { email } });

  if (!staffUser) {
    // Default password = their badge ID (they should change it)
    const password_hash = await bcrypt.hash(staff_badge_id, 12);
    const [first_name, ...rest] = full_name.trim().split(' ');
    staffUser = await prisma.user.create({
      data: {
        first_name,
        last_name: rest.join(' ') || '',
        full_name,
        email,
        phone_number,
        password_hash,
        // Map assigned_role to user role
        role: assigned_role === 'security' ? 'security' : 'staff',
        status: 'active',
        email_verified: true,
      },
    });
  } else {
    // Update existing user role to match staff role
    await prisma.user.update({
      where: { id: staffUser.id },
      data: { role: assigned_role === 'security' ? 'security' : 'staff' },
    });
  }

  const staff = await prisma.staffMember.create({
    data: {
      organizer_profile_id: organizer.id,
      full_name, email, phone_number,
      assigned_role, staff_badge_id,
      user_id: staffUser.id,
    },
  });

  res.status(201).json({
    ...staff,
    login_credentials: {
      email,
      temporary_password: staff_badge_id,
      note: 'Staff member can log in with these credentials. They should change their password.',
    },
  });
});

// PATCH /api/staff/:id
router.patch('/:id', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user.id } });
  const staff = await prisma.staffMember.findFirst({
    where: { id: req.params.id, organizer_profile_id: organizer?.id },
  });
  if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }

  const updated = await prisma.staffMember.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});

// DELETE /api/staff/:id
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  const organizer = await prisma.organizerProfile.findUnique({ where: { user_id: req.user.id } });
  const staff = await prisma.staffMember.findFirst({
    where: { id: req.params.id, organizer_profile_id: organizer?.id },
  });
  if (!staff) { res.status(404).json({ error: 'Staff member not found' }); return; }

  await prisma.staffMember.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
