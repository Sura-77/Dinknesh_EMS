import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.eventCategory.upsert({ where: { slug: 'technology' }, update: {}, create: { name: 'Technology', slug: 'technology' } }),
    prisma.eventCategory.upsert({ where: { slug: 'music' }, update: {}, create: { name: 'Music', slug: 'music' } }),
    prisma.eventCategory.upsert({ where: { slug: 'art-culture' }, update: {}, create: { name: 'Art & Culture', slug: 'art-culture' } }),
    prisma.eventCategory.upsert({ where: { slug: 'sports' }, update: {}, create: { name: 'Sports', slug: 'sports' } }),
    prisma.eventCategory.upsert({ where: { slug: 'education' }, update: {}, create: { name: 'Education', slug: 'education' } }),
    prisma.eventCategory.upsert({ where: { slug: 'business' }, update: {}, create: { name: 'Business', slug: 'business' } }),
  ]);

  // Admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dems.et' },
    update: {},
    create: {
      first_name: 'System', last_name: 'Admin', full_name: 'System Admin',
      email: 'admin@dems.et', password_hash: adminHash,
      role: 'admin', status: 'active', email_verified: true,
    },
  });

  // System settings
  await prisma.systemSetting.upsert({ where: { key: 'service_fee_percentage' }, update: {}, create: { key: 'service_fee_percentage', value: '10' } });
  await prisma.systemSetting.upsert({ where: { key: 'reservation_timer_minutes' }, update: {}, create: { key: 'reservation_timer_minutes', value: '15' } });
  await prisma.systemSetting.upsert({ where: { key: 'currency' }, update: {}, create: { key: 'currency', value: 'ETB' } });

  console.log(`Seeded ${categories.length} categories, admin user: ${admin.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
