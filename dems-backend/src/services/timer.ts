import redis from '../lib/redis';
import prisma from '../lib/prisma';

const EXPIRY_MINUTES = Number(process.env.RESERVATION_EXPIRY_MINUTES) || 15;

export async function setReservationTimer(reservationId: string): Promise<void> {
  try {
    const expirySeconds = EXPIRY_MINUTES * 60;
    await redis.setex(`reservation:${reservationId}`, expirySeconds, 'active');
  } catch {
    // Redis unavailable — timer won't work but reservation still saved in DB
  }
}

export async function cancelReservationTimer(reservationId: string): Promise<void> {
  try {
    await redis.del(`reservation:${reservationId}`);
  } catch {
    // ignore
  }
}

export async function isReservationActive(reservationId: string): Promise<boolean> {
  try {
    const val = await redis.get(`reservation:${reservationId}`);
    return val !== null;
  } catch {
    return true; // assume active if Redis is down
  }
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
