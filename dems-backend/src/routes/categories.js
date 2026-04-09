import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res) => {
  const categories = await prisma.eventCategory.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

export default router;
