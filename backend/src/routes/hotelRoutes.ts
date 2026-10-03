import { Router, Request, Response } from 'express';
import { brajHotels } from '../data/hotels';

const router = Router();

// GET hotels with rich pilgrimage filters
router.get('/', (req: Request, res: Response) => {
  let filtered = [...brajHotels];
  const {
    destination,
    landmark,
    stayType,
    minPrice,
    maxPrice,
    minRating,
    pureSatvik,
    darshanAssistance,
    maxDistanceMeters,
    search,
    featured
  } = req.query;

  // Filter by destination slug
  if (destination && typeof destination === 'string' && destination !== 'all') {
    filtered = filtered.filter(
      (h) => h.destinationSlug.toLowerCase() === destination.toLowerCase()
    );
  }

  // Filter by landmark proximity (e.g. "Banke Bihari", "Prem Mandir")
  if (landmark && typeof landmark === 'string' && landmark !== 'all') {
    const lmarkLower = landmark.toLowerCase();
    filtered = filtered.filter((h) =>
      h.landmarkDistances.some(
        (ld) => ld.landmark.toLowerCase().includes(lmarkLower) || lmarkLower.includes(ld.landmark.toLowerCase())
      ) || h.nearestLandmark.toLowerCase().includes(lmarkLower)
    );
  }

  // Filter by property type (hotel, dharamshala, ashram, guesthouse, haveli)
  if (stayType && typeof stayType === 'string' && stayType !== 'all') {
    filtered = filtered.filter(
      (h) => h.stayType.toLowerCase() === stayType.toLowerCase()
    );
  }

  // Filter by min / max price
  if (minPrice && !isNaN(Number(minPrice))) {
    filtered = filtered.filter((h) => h.pricePerNight >= Number(minPrice));
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    filtered = filtered.filter((h) => h.pricePerNight <= Number(maxPrice));
  }

  // Filter by rating
  if (minRating && !isNaN(Number(minRating))) {
    filtered = filtered.filter((h) => h.ratingScore >= Number(minRating));
  }

  // Filter by pure satvik kitchen
  if (pureSatvik === 'true') {
    filtered = filtered.filter((h) => h.pureSatvikKitchen === true);
  }

  // Filter by darshan assistance
  if (darshanAssistance === 'true') {
    filtered = filtered.filter((h) => h.templeDarshanAssistance === true);
  }

  // Filter by max distance to nearest landmark in meters
  if (maxDistanceMeters && !isNaN(Number(maxDistanceMeters))) {
    const maxDist = Number(maxDistanceMeters);
    filtered = filtered.filter((h) =>
      h.landmarkDistances.some((ld) => ld.distanceMeters <= maxDist)
    );
  }

  // Filter by featured
  if (featured === 'true') {
    filtered = filtered.filter((h) => h.isFeatured);
  }

  // Keyword search
  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.destinationName.toLowerCase().includes(term) ||
        h.address.toLowerCase().includes(term) ||
        h.nearestLandmark.toLowerCase().includes(term) ||
        h.amenities.some((a) => a.toLowerCase().includes(term))
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    data: filtered
  });
});

// GET hotel by ID or Slug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const hotel = brajHotels.find(
    (h) =>
      h.id.toLowerCase() === idOrSlug.toLowerCase() ||
      h.slug.toLowerCase() === idOrSlug.toLowerCase()
  );

  if (!hotel) {
    return res.status(404).json({
      success: false,
      message: `Stay '${idOrSlug}' not found in Braj listings`
    });
  }

  res.json({
    success: true,
    data: hotel
  });
});

// POST /submit & POST /onboard: Public property listing submission sent directly to Admin Onboarding Queue
router.post('/submit', async (req: Request, res: Response) => {
  const { submitHotelToOnboardingQueue } = await import('../modules/system-admin/systemAdminRoutes');
  const resolvedName = (req.body.hotelName || req.body.name || '').trim();
  if (!resolvedName) {
    return res.status(400).json({ success: false, message: 'Property name is required.' });
  }

  const submission = submitHotelToOnboardingQueue(req.body, req.ip);
  res.status(201).json({
    success: true,
    message: `Property '${submission.name}' submitted successfully and sent to Hotel Onboarding Queue for Admin approval.`,
    data: submission
  });
});

router.post('/onboard', async (req: Request, res: Response) => {
  const { submitHotelToOnboardingQueue } = await import('../modules/system-admin/systemAdminRoutes');
  const resolvedName = (req.body.hotelName || req.body.name || '').trim();
  if (!resolvedName) {
    return res.status(400).json({ success: false, message: 'Property name is required.' });
  }

  const submission = submitHotelToOnboardingQueue(req.body, req.ip);
  res.status(201).json({
    success: true,
    message: `Property '${submission.name}' submitted successfully and sent to Hotel Onboarding Queue for Admin approval.`,
    data: submission
  });
});

export default router;
