import { Router, Request, Response } from 'express';
import { brajDestinations } from '../data/destinations';
import { brajHotels } from '../data/hotels';

const router = Router();

// GET all destinations with dynamic stay counts
router.get('/', (req: Request, res: Response) => {
  const data = brajDestinations.map(d => ({
    ...d,
    popularStaysCount: brajHotels.filter(h => h.destinationSlug === d.slug).length
  }));

  res.json({
    success: true,
    count: data.length,
    data
  });
});

// GET destination by slug
router.get('/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const destination = brajDestinations.find(
    (d) => d.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!destination) {
    return res.status(404).json({
      success: false,
      message: `Destination '${slug}' not found in Braj Bhumi`
    });
  }

  res.json({
    success: true,
    data: {
      ...destination,
      popularStaysCount: brajHotels.filter(h => h.destinationSlug === destination.slug).length
    }
  });
});

export default router;
