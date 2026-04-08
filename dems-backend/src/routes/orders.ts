import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { initializePayment, verifyPayment } from '../services/payment';
import { generateQRCode } from '../services/qr';
import { cancelReservationTimer } from '../services/timer';

const router = Router();

// POST /api/orders/checkout - initiate payment
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  const { reservation_ids } = req.body;
  if (!reservation_ids?.length) { res.status(400).json({ error: 'reservation_ids required' }); return; }

  // For simplicity, handle one reservation at a time (extend for multi)
  const reservationId = reservation_ids[0];
  const reservation = await prisma.ticketReservation.findFirst({
    where: { id: reservationId, user_id: req.user!.id, status: 'active' },
    include: { event: true },
  });
  if (!reservation) { res.status(404).json({ error: 'Reservation not found or expired' }); return; }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const tx_ref = `DEMS-${uuidv4()}`;
  const order = await prisma.order.create({
    data: {
      user_id: req.user!.id,
      reservation_id: reservationId,
      order_number: tx_ref,
      subtotal: reservation.subtotal,
      service_fee: reservation.service_fee,
      total_amount: reservation.total_price,
      payment: { create: { amount: reservation.total_price, currency: 'ETB', provider_name: 'chapa' } },
    },
  });

  const { checkout_url } = await initializePayment({
    amount: reservation.total_price,
    currency: 'ETB',
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    tx_ref,
    callback_url: `${process.env.FRONTEND_URL}/api/orders/webhook`,
    return_url: `${process.env.FRONTEND_URL}/checkout/success?order=${order.id}`,
  });

  res.json({ checkout_url, order_id: order.id, tx_ref });
});

// POST /api/orders/verify - verify payment after redirect
router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  const { tx_ref } = req.body;
  if (!tx_ref) { res.status(400).json({ error: 'tx_ref required' }); return; }

  const order = await prisma.order.findFirst({
    where: { order_number: tx_ref, user_id: req.user!.id },
    include: { reservation: { include: { ticket_type: true } }, payment: true },
  });
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  if (order.status === 'paid') { res.json({ success: true, order_id: order.id }); return; }

  const { status } = await verifyPayment(tx_ref);
  if (status !== 'success') { res.status(402).json({ error: 'Payment not completed', status }); return; }

  // Mark order paid, create wallet + digital tickets
  const ticketCode = `DEMS-${order.order_number.slice(-8).toUpperCase()}`;
  const { qr_payload, qr_image_url } = await generateQRCode(ticketCode);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: 'paid', paid_at: new Date(), payment_method: 'chapa' } });
    await tx.payment.update({ where: { order_id: order.id }, data: { status: 'success', paid_at: new Date() } });
    await tx.ticketReservation.update({ where: { id: order.reservation_id }, data: { status: 'paid' } });

    const wallet = await tx.ticketWallet.create({ data: { user_id: req.user!.id, order_id: order.id } });

    for (let i = 0; i < order.reservation.quantity; i++) {
      const code = `${ticketCode}-${String(i + 1).padStart(3, '0')}`;
      const qr = await generateQRCode(code);
      await tx.digitalTicket.create({
        data: {
          ticket_wallet_id: wallet.id,
          event_id: order.reservation.event_id,
          ticket_type_id: order.reservation.ticket_type_id,
          ticket_code: code,
          qr_payload: qr.qr_payload,
          qr_image_url: qr.qr_image_url,
          purchase_date: new Date(),
        },
      });
    }

    // Update attendance stats
    await tx.eventAttendanceStats.upsert({
      where: { event_id: order.reservation.event_id },
      create: {
        event_id: order.reservation.event_id,
        tickets_sold_total: order.reservation.quantity,
        checked_in_total: 0,
        normal_sold: order.reservation.ticket_type.tier_name.toLowerCase() === 'normal' ? order.reservation.quantity : 0,
        vip_sold: order.reservation.ticket_type.tier_name.toLowerCase() === 'vip' ? order.reservation.quantity : 0,
        vvip_sold: order.reservation.ticket_type.tier_name.toLowerCase() === 'vvip' ? order.reservation.quantity : 0,
      },
      update: {
        tickets_sold_total: { increment: order.reservation.quantity },
        normal_sold: order.reservation.ticket_type.tier_name.toLowerCase() === 'normal' ? { increment: order.reservation.quantity } : undefined,
        vip_sold: order.reservation.ticket_type.tier_name.toLowerCase() === 'vip' ? { increment: order.reservation.quantity } : undefined,
        vvip_sold: order.reservation.ticket_type.tier_name.toLowerCase() === 'vvip' ? { increment: order.reservation.quantity } : undefined,
      },
    });
  });

  await cancelReservationTimer(order.reservation_id);
  res.json({ success: true, order_id: order.id });
});

export default router;
