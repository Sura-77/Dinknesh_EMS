import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { setReservationTimer, cancelReservationTimer } from '../services/timer.js';
import { generateQRCode } from '../services/qr.js';

const router = Router();

// GET /api/tickets - digital ticket wallet
router.get('/', authenticate, async (req, res) => {
  const wallets = await prisma.ticketWallet.findMany({
    where: { user_id: req.user.id },
    include: {
      digital_tickets: {
        include: {
          event: { include: { schedule: true, venue: true } },
          ticket_type: true,
        },
      },
    },
  });
  const tickets = wallets.flatMap(w => w.digital_tickets);
  res.json(tickets);
});

// GET /api/tickets/:id
router.get('/:id', authenticate, async (req, res) => {
  const ticket = await prisma.digitalTicket.findFirst({
    where: { id: req.params.id, ticket_wallet: { user_id: req.user.id } },
    include: {
      event: { include: { schedule: true, venue: true } },
      ticket_type: true,
    },
  });
  if (!ticket) { res.status(404).json({ error: 'Ticket not found' }); return; }
  res.json(ticket);
});

// POST /api/tickets/reservations - save/reserve a ticket
router.post('/reservations', authenticate, async (req, res) => {
  const { event_id, ticket_type_id, quantity } = req.body;
  if (!event_id || !ticket_type_id || !quantity) {
    res.status(400).json({ error: 'event_id, ticket_type_id, quantity required' }); return;
  }

  const ticketType = await prisma.ticketType.findUnique({ where: { id: ticket_type_id } });
  if (!ticketType || !ticketType.is_active) { res.status(404).json({ error: 'Ticket type not found or inactive' }); return; }
  if (ticketType.remaining_quantity < quantity) { res.status(409).json({ error: 'Not enough tickets available' }); return; }

  const SERVICE_FEE_RATE = 0.1;
  const subtotal = ticketType.price * quantity;
  const service_fee = subtotal * SERVICE_FEE_RATE;
  const total_price = subtotal + service_fee;
  const expires_at = new Date(Date.now() + (Number(process.env.RESERVATION_EXPIRY_MINUTES) || 15) * 60 * 1000);

  const [reservation] = await prisma.$transaction([
    prisma.ticketReservation.create({
      data: {
        user_id: req.user.id, event_id, ticket_type_id,
        quantity, unit_price: ticketType.price,
        subtotal, service_fee, total_price,
        expires_at,
      },
      include: { event: true, ticket_type: true },
    }),
    prisma.ticketType.update({
      where: { id: ticket_type_id },
      data: { remaining_quantity: { decrement: quantity } },
    }),
  ]);

  await setReservationTimer(reservation.id);
  res.status(201).json(reservation);
});

// GET /api/tickets/reservations - saved tickets (cart)
router.get('/reservations/list', authenticate, async (req, res) => {
  const reservations = await prisma.ticketReservation.findMany({
    where: { user_id: req.user.id, status: 'active' },
    include: { event: { include: { schedule: true, venue: true } }, ticket_type: true },
    orderBy: { created_at: 'desc' },
  });
  res.json(reservations);
});

// PATCH /api/tickets/reservations/:id
router.patch('/reservations/:id', authenticate, async (req, res) => {
  const { quantity } = req.body;
  const reservation = await prisma.ticketReservation.findFirst({
    where: { id: req.params.id, user_id: req.user.id, status: 'active' },
    include: { ticket_type: true },
  });
  if (!reservation) { res.status(404).json({ error: 'Reservation not found' }); return; }

  const diff = quantity - reservation.quantity;
  if (diff > 0 && reservation.ticket_type.remaining_quantity < diff) {
    res.status(409).json({ error: 'Not enough tickets available' }); return;
  }

  const subtotal = reservation.unit_price * quantity;
  const service_fee = subtotal * 0.1;

  await prisma.$transaction([
    prisma.ticketReservation.update({
      where: { id: req.params.id },
      data: { quantity, subtotal, service_fee, total_price: subtotal + service_fee },
    }),
    prisma.ticketType.update({
      where: { id: reservation.ticket_type_id },
      data: { remaining_quantity: { decrement: diff } },
    }),
  ]);

  res.json({ success: true });
});

// DELETE /api/tickets/reservations/:id
router.delete('/reservations/:id', authenticate, async (req, res) => {
  const reservation = await prisma.ticketReservation.findFirst({
    where: { id: req.params.id, user_id: req.user.id, status: 'active' },
  });
  if (!reservation) { res.status(404).json({ error: 'Reservation not found' }); return; }

  await prisma.$transaction([
    prisma.ticketReservation.update({ where: { id: req.params.id }, data: { status: 'cancelled' } }),
    prisma.ticketType.update({
      where: { id: reservation.ticket_type_id },
      data: { remaining_quantity: { increment: reservation.quantity } },
    }),
  ]);

  await cancelReservationTimer(req.params.id);
  res.json({ success: true });
});

export default router;
