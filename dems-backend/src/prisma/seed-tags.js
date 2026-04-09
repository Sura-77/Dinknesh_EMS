import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eventTags = {
  'Innovation Summit 2026': ['tech', 'networking', 'innovation', 'conference', 'professional', 'inspiring'],
  'Ethio Jazz Festival 2026': ['music', 'jazz', 'live-music', 'fun', 'memorable', 'cultural', 'entertainment'],
  'Coffee Culture Experience': ['coffee', 'cultural', 'traditional', 'workshop', 'authentic', 'memorable', 'fun'],
  'Contemporary African Art Exhibition': ['art', 'exhibition', 'cultural', 'inspiring', 'creative', 'memorable'],
  'Great Ethiopian Run 2026': ['sports', 'running', 'fitness', 'fun', 'community', 'outdoor', 'charity'],
  'Entrepreneurship Bootcamp': ['business', 'startup', 'networking', 'professional', 'inspiring', 'workshop'],
  'Timkat Festival Celebration': ['cultural', 'traditional', 'festival', 'spiritual', 'memorable', 'community'],
  'African Business Network Summit': ['business', 'networking', 'conference', 'professional', 'investment', 'inspiring'],
};

async function main() {
  console.log('Seeding tags...');

  for (const [eventTitle, tags] of Object.entries(eventTags)) {
    const event = await prisma.event.findFirst({ where: { title: eventTitle } });
    if (!event) { console.log(`  Skipping: ${eventTitle} not found`); continue; }

    for (const tagName of tags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      const tag = await prisma.eventTag.upsert({
        where: { slug },
        update: {},
        create: { name: tagName, slug },
      });

      // Only create if not already linked
      const existing = await prisma.eventTagMap.findUnique({
        where: { event_id_tag_id: { event_id: event.id, tag_id: tag.id } },
      });
      if (!existing) {
        await prisma.eventTagMap.create({ data: { event_id: event.id, tag_id: tag.id } });
      }
    }
    console.log(`  ✓ ${eventTitle} — ${tags.join(', ')}`);
  }

  console.log('\nDone seeding tags!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
