import { Router, Request, Response } from 'express';
import { brajExperiences } from '../data/experiences';

const router = Router();

// GET all experiences with optional filter by destination
router.get('/', (req: Request, res: Response) => {
  const { destination, category } = req.query;
  let filtered = [...brajExperiences];

  if (destination && typeof destination === 'string' && destination !== 'all') {
    filtered = filtered.filter(
      (e) =>
        e.destinationSlug.toLowerCase() === destination.toLowerCase() ||
        e.destinationSlug === 'braj'
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter(
      (e) => e.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// GET experience by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const experience = brajExperiences.find((e) => e.id === id);

  if (!experience) {
    return res.status(404).json({
      success: false,
      message: `Experience '${id}' not found`
    });
  }

  res.json({
    success: true,
    data: experience
  });
});

export default router;
