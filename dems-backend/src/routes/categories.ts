import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response) => {
  const categories = await prisma.eventCategory.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

export default router;
