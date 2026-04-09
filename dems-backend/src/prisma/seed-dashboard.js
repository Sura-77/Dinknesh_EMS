import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding organizer dashboard mock data...');

  // Get all organizer profiles and their events
  const organizers = await prisma.organizerProfile.findMany({
    include: {
      events: {
        include: { ticket_types: true, attendance_stats: true },
      },
    },
  });

  // Get the demo attendee user
  const attendee = await prisma.user.findUnique({ where: { email: 'attendee@dems.et' } });
  if (!attendee) { console.log('No attendee user found — run main seed first'); return; }

  for (const organizer of organizers) {
    for (const event of organizer.events) {
      if (!event.ticket_types.length) continue;

      const stats = event.attendance_stats;
      if (!stats || stats.tickets_sold_total === 0) continue;

      // Check if orders already exist for this event
      const existingOrders = await prisma.order.count({
        where: { reservation: { event_id: event.id } },
      });
      if (existingOrders > 0) {
        console.log(`  Skipping ${event.title} — orders already exist`);
        continue;
      }

      // Create mock paid orders based on attendance stats
      const normalType = event.ticket_types.find(t => t.tier_name === 'Normal');
      const vipType = event.ticket_types.find(t => t.tier_name === 'VIP');
      const vvipType = event.ticket_types.find(t => t.tier_name === 'VVIP');

      const ticketSales = [
        { type: normalType, qty: stats.normal_sold },
        { type: vipType, qty: stats.vip_sold },
        { type: vvipType, qty: stats.vvip_sold },
      ].filter(s => s.type && s.qty > 0);

      for (const sale of ticketSales) {
        if (!sale.type || sale.qty === 0) continue;

        // Create in batches of up to 10 per order to keep it manageable
        const batchSize = Math.min(sale.qty, 10);
        const subtotal = sale.type.price * batchSize;
        const service_fee = subtotal * 0.1;
        const total = subtotal + service_fee;
        const orderNum = `DEMS-SEED-${event.id.slice(0, 6)}-${sale.type.tier_name.toUpperCase()}`;

        // Skip if order number already exists
        const existingOrder = await prisma.order.findFirst({ where: { order_number: orderNum } });
        if (existingOrder) continue;

        const reservation = await prisma.ticketReservation.create({
          data: {
            user_id: attendee.id,
            event_id: event.id,
            ticket_type_id: sale.type.id,
            quantity: batchSize,
            unit_price: sale.type.price,
            subtotal,
            service_fee,
            total_price: total,
            status: 'paid',
            expires_at: new Date(Date.now() + 15 * 60 * 1000),
          },
        });

        const order = await prisma.order.create({
          data: {
            user_id: attendee.id,
            reservation_id: reservation.id,
            order_number: orderNum,
            status: 'paid',
            subtotal,
            service_fee,
            total_amount: total,
            payment_method: 'chapa',
            paid_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // random past date
            payment: {
              create: {
                amount: total,
                currency: 'ETB',
                provider_name: 'chapa',
                status: 'success',
                paid_at: new Date(),
              },
            },
          },
        });

        // Create wallet + digital tickets
        const wallet = await prisma.ticketWallet.create({
          data: { user_id: attendee.id, order_id: order.id },
        });

        for (let i = 0; i < batchSize; i++) {
          const code = `DEMS-${orderNum.slice(-8)}-${String(i + 1).padStart(3, '0')}`;
          await prisma.digitalTicket.create({
            data: {
              ticket_wallet_id: wallet.id,
              event_id: event.id,
              ticket_type_id: sale.type.id,
              ticket_code: code,
              qr_payload: code,
              qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${code}`,
              purchase_date: new Date(),
              status: 'active',
            },
          });
        }
      }

      console.log(`  ✓ ${event.title} — orders created`);
    }
  }

  console.log('\nDone! Organizer dashboards now have revenue data.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
