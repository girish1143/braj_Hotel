import { Router, Request, Response } from 'express';
import { brajBhojanalayas, getBhojanalayaBySlug } from '../data/bhojan';

const router = Router();

// GET all bhojanalayas with rich spiritual filters
router.get('/', (req: Request, res: Response) => {
  let list = [...brajBhojanalayas];
  const { destination, category, pureSatvik, pureDesiGhee, search, featured } = req.query;

  if (destination && typeof destination === 'string' && destination !== 'all') {
    list = list.filter((b) => b.destinationSlug.toLowerCase() === destination.toLowerCase());
  }

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  if (pureSatvik === 'true') {
    list = list.filter((b) => b.pureSatvik);
  }

  if (pureDesiGhee === 'true') {
    list = list.filter((b) => b.pureDesiGhee);
  }

  if (featured === 'true') {
    list = list.filter((b) => b.isFeatured);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.destinationName.toLowerCase().includes(q) ||
        b.nearestLandmark.toLowerCase().includes(q) ||
        b.specialityDishes.some((d) => d.toLowerCase().includes(q)) ||
        b.description.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: list.length,
    data: list
  });
});

// GET single bhojanalaya by slug or ID
router.get('/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const item = getBhojanalayaBySlug(slug);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: `Bhojanalaya '${slug}' not found in Braj Dham directory`
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// POST reserve thali / table booking
router.post('/reserve', (req: Request, res: Response) => {
  const { bhojanalayaId, devoteeName, devoteePhone, date, timeSlot, guestsCount, specialRequests } = req.body;

  if (!bhojanalayaId || !devoteeName || !devoteePhone || !date) {
    return res.status(400).json({
      success: false,
      message: 'Devotee name, mobile number, date, and restaurant are required.'
    });
  }

  const bhojanalaya = brajBhojanalayas.find((b) => b.id === bhojanalayaId);
  const randomRef = Math.floor(1000 + Math.random() * 9000);
  const bookingToken = `PRASAD-${randomRef}`;

  res.status(201).json({
    success: true,
    message: `Radhe Radhe! Your Satvik Thali reservation at ${bhojanalaya ? bhojanalaya.name : 'Braj Bhojanalaya'} has been confirmed.`,
    data: {
      bookingToken,
      bhojanalayaName: bhojanalaya?.name || 'Braj Bhojanalaya',
      destination: bhojanalaya?.destinationName || 'Braj Dham',
      devoteeName,
      devoteePhone,
      date,
      timeSlot: timeSlot || '12:30 PM (Lunch)',
      guestsCount: Number(guestsCount) || 2,
      specialRequests: specialRequests || '100% Satvik Pure Veg',
      status: 'CONFIRMED'
    }
  });
});

export default router;
