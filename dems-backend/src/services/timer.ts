import redis from '../lib/redis';
import prisma from '../lib/prisma';

const EXPIRY_MINUTES = Number(process.env.RESERVATION_EXPIRY_MINUTES) || 15;

export async function setReservationTimer(reservationId: string): Promise<void> {
  const expirySeconds = EXPIRY_MINUTES * 60;
  await redis.setex(`reservation:${reservationId}`, expirySeconds, 'active');
}

export async function cancelReservationTimer(reservationId: string): Promise<void> {
  await redis.del(`reservation:${reservationId}`);
}

export async function isReservationActive(reservationId: string): Promise<boolean> {
  const val = await redis.get(`reservation:${reservationId}`);
  return val !== null;
}

// Call this on a cron or background job to expire stale reservations
export async function expireStaleReservations(): Promise<void> {
  const expired = await prisma.ticketReservation.findMany({
    where: { status: 'active', expires_at: { lt: new Date() } },
  });

  for (const r of expired) {
    await prisma.$transaction([
      prisma.ticketReservation.update({ where: { id: r.id }, data: { status: 'expired' } }),
      prisma.ticketType.update({
        where: { id: r.ticket_type_id },
        data: { remaining_quantity: { increment: r.quantity } },
      }),
    ]);
  }
}
