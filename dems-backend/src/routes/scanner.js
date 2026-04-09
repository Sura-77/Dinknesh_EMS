import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// POST /api/scanner/scan
router.post('/scan', authenticate, requireRole('security', 'staff', 'organizer', 'admin'), async (req, res) => {
  const { qr_code, event_id, device_id } = req.body;
  if (!qr_code || !event_id) { res.status(400).json({ error: 'qr_code and event_id required' }); return; }

  const staffMember = await prisma.staffMember.findFirst({ where: { user_id: req.user.id } });
  if (!staffMember) { res.status(403).json({ error: 'Staff profile not found' }); return; }

  const ticket = await prisma.digitalTicket.findFirst({
    where: { ticket_code: qr_code, event_id },
    include: { ticket_type: true, ticket_wallet: { include: { user: { select: { full_name: true } } } } },
  });

  if (!ticket) {
    await prisma.ticketScan.create({
      data: { digital_ticket_id: 'unknown', event_id, staff_member_id: staffMember.id, scan_result: 'invalid', device_id },
    }).catch(() => {}); // best effort log
    res.json({ success: false, scan_result: 'invalid', ticket_info: null });
    return;
  }

  if (ticket.status === 'used') {
    res.json({ success: false, scan_result: 'already_scanned', ticket_info: { ticket_code: ticket.ticket_code, event_name: '', ticket_tier: ticket.ticket_type.tier_name, attendee_name: ticket.ticket_wallet.user.full_name } });
    return;
  }

  await prisma.$transaction([
    prisma.digitalTicket.update({ where: { id: ticket.id }, data: { status: 'used' } }),
    prisma.ticketScan.create({
      data: { digital_ticket_id: ticket.id, event_id, staff_member_id: staffMember.id, scan_result: 'valid', device_id },
    }),
    prisma.eventAttendanceStats.upsert({
      where: { event_id },
      create: { event_id, tickets_sold_total: 0, checked_in_total: 1, normal_sold: 0, vip_sold: 0, vvip_sold: 0 },
      update: { checked_in_total: { increment: 1 } },
    }),
  ]);

  res.json({
    success: true,
    scan_result: 'valid',
    ticket_info: {
      ticket_code: ticket.ticket_code,
      ticket_tier: ticket.ticket_type.tier_name,
      attendee_name: ticket.ticket_wallet.user.full_name,
    },
  });
});

// GET /api/scanner/event/:id/stats
router.get('/event/:id/stats', authenticate, requireRole('security', 'staff', 'organizer', 'admin'), async (req, res) => {
  const stats = await prisma.eventAttendanceStats.findUnique({ where: { event_id: req.params.id } });
  res.json(stats || { event_id: req.params.id, tickets_sold_total: 0, checked_in_total: 0 });
});

export default router;
