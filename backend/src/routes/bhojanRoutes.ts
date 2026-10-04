import { Router, Request, Response } from 'express';
import { 
  getBhojanalayas, 
  getBhojanalayaByIdOrSlug, 
  saveBhojanalaya, 
  deleteBhojanalaya,
  saveReservation, 
  getReservationByRef, 
  getAllReservations, 
  cancelReservation,
  getMenuItems, 
  saveMenuItem, 
  getReviews, 
  saveReview,
  getBhojanStats
} from '../db/bhojanRepository';
import { Bhojanalaya, BhojanReservation, BhojanMenuItem, BhojanReview } from '../types';

const router = Router();

// ==========================================
// 1. PUBLIC BHOJAN DISCOVERY
// ==========================================

// GET /api/bhojan - List bhojanalayas with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { destination, category, pureSatvik, pureDesiGhee, search, status } = req.query;

    const list = await getBhojanalayas({
      destination: typeof destination === 'string' ? destination : undefined,
      category: typeof category === 'string' ? category : undefined,
      pureSatvik: pureSatvik === 'true',
      pureDesiGhee: pureDesiGhee === 'true',
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : 'APPROVED'
    });

    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bhojanalayas',
      error: err.message
    });
  }
});

// GET /api/bhojan/stats - Overall stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getBhojanStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: err.message
    });
  }
});

// GET /api/bhojan/featured - Top rated & featured bhojanalayas
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const all = await getBhojanalayas({ status: 'APPROVED' });
    const featured = all.filter((b) => b.isFeatured || b.ratingScore >= 4.8).slice(0, 6);
    res.json({
      success: true,
      data: featured
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured bhojanalayas',
      error: err.message
    });
  }
});

// GET /api/bhojan/destinations - Grouped destinations count
router.get('/destinations', async (req: Request, res: Response) => {
  try {
    const all = await getBhojanalayas({ status: 'APPROVED' });
    const counts: Record<string, number> = {
      vrindavan: 0,
      mathura: 0,
      barsana: 0,
      govardhan: 0
    };

    all.forEach((b) => {
      if (counts[b.destinationSlug] !== undefined) {
        counts[b.destinationSlug]++;
      }
    });

    res.json({
      success: true,
      data: counts
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to group by destination',
      error: err.message
    });
  }
});

// ==========================================
// 2. THALI & PRASAD RESERVATIONS
// ==========================================

// POST /api/bhojan/reserve - Book free thali / seva token
router.post('/reserve', async (req: Request, res: Response) => {
  try {
    const {
      bhojanalayaId,
      bhojanalayaName,
      guestName,
      guestPhone,
      guestEmail,
      date,
      mealTime,
      thaliCount,
      specialRequests
    } = req.body;

    if (!guestName || !guestPhone) {
      return res.status(400).json({
        success: false,
        message: 'Devotee name and contact phone number are required.'
      });
    }

    const cleanDate = date || new Date().toISOString().split('T')[0];
    const cleanSlot = mealTime || 'lunch';
    const cleanCount = Number(thaliCount) > 0 ? Number(thaliCount) : 2;

    // Generate unique reference
    const timestampCode = Date.now().toString().slice(-6);
    const reservationReference = `THAL-${timestampCode}`;
    const tokenNumber = `TK-${Math.floor(100 + Math.random() * 900)}`;

    const newReservation: BhojanReservation = {
      id: `res-${Date.now()}`,
      reservationReference,
      bhojanalayaId: bhojanalayaId || 'bhj-general',
      bhojanalayaName: bhojanalayaName || 'Braj Satvik Bhojanalaya',
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail ? guestEmail.trim() : undefined,
      date: cleanDate,
      mealTime: cleanSlot,
      thaliCount: cleanCount,
      specialRequests: specialRequests ? specialRequests.trim() : undefined,
      status: 'CONFIRMED',
      tokenNumber,
      createdAt: new Date().toISOString()
    };

    const saved = await saveReservation(newReservation);

    res.status(201).json({
      success: true,
      message: 'Your Thali / Prasad Seva token has been pre-booked successfully! Kindly show your phone number at the counter upon arrival.',
      reservationId: saved.reservationReference,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to process thali reservation',
      error: err.message
    });
  }
});

// GET /api/bhojan/reservations/lookup - Lookup reservation
router.get('/reservations/lookup', async (req: Request, res: Response) => {
  try {
    const { ref } = req.query;
    if (!ref || typeof ref !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide reservation reference (?ref=THAL-XXXXXX)'
      });
    }

    const reservation = await getReservationByRef(ref);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Reservation #${ref} not found in Brijnidhi logs.`
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error looking up reservation',
      error: err.message
    });
  }
});

// PATCH /api/bhojan/reservations/:refOrId/cancel - Cancel reservation
router.patch('/reservations/:refOrId/cancel', async (req: Request, res: Response) => {
  try {
    const { refOrId } = req.params;
    const ok = await cancelReservation(refOrId);

    if (!ok) {
      return res.status(404).json({
        success: false,
        message: `Reservation '${refOrId}' could not be cancelled or does not exist.`
      });
    }

    res.json({
      success: true,
      message: `Reservation #${refOrId} has been cancelled.`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation',
      error: err.message
    });
  }
});

// ==========================================
// 3. PARTNER ONBOARDING & PROPERTY LISTING
// ==========================================

// POST /api/bhojan/onboard - Register / submit new Bhojanalaya
router.post('/onboard', async (req: Request, res: Response) => {
  try {
    const {
      name,
      hindiName,
      destinationSlug,
      category,
      address,
      nearestLandmark,
      distanceToLandmark,
      walkMinutes,
      timings,
      pureSatvik,
      pureDesiGhee,
      specialityDishes,
      priceRange,
      avgCostForTwo,
      description,
      features,
      images,
      ownerName,
      ownerPhone,
      ownerEmail,
      fssaiLicenseNo
    } = req.body;

    if (!name || !destinationSlug || !address || !nearestLandmark) {
      return res.status(400).json({
        success: false,
        message: 'Name, destination, full address, and nearest temple landmark are required.'
      });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const destNames: Record<string, string> = {
      vrindavan: 'Vrindavan',
      mathura: 'Mathura',
      barsana: 'Barsana',
      govardhan: 'Govardhan'
    };

    const catNames: Record<string, string> = {
      thali: 'Traditional Braj Thali',
      temple_prasadam: 'Temple Mahaprasadam',
      sweets_dairy: 'Braj Sweets & Dairy',
      heritage_cafe: 'Heritage Satvik Cafe',
      annakshetra: 'Community Annakshetra'
    };

    const newBhojanalaya: Bhojanalaya = {
      id: `bhj-${Date.now()}`,
      name: name.trim(),
      hindiName: hindiName ? hindiName.trim() : undefined,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      destinationSlug: (destinationSlug.toLowerCase() as any) || 'vrindavan',
      destinationName: destNames[destinationSlug.toLowerCase()] || 'Braj Dham',
      category: (category as any) || 'thali',
      categoryName: catNames[category] || 'Traditional Braj Thali',
      ratingScore: 5.0,
      reviewsCount: 0,
      priceRange: priceRange || '₹150 - ₹350 per person',
      avgCostForTwo: Number(avgCostForTwo) || 350,
      address: address.trim(),
      nearestLandmark: nearestLandmark.trim(),
      distanceToLandmark: distanceToLandmark || 'Near Main Temple',
      walkMinutes: Number(walkMinutes) || 5,
      timings: timings || '08:00 AM - 10:00 PM',
      pureSatvik: pureSatvik !== false,
      pureDesiGhee: pureDesiGhee !== false,
      specialityDishes: Array.isArray(specialityDishes) ? specialityDishes : ['Braj Satvik Thali'],
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop'
      ],
      description: description || 'Authentic Vaishnava Satvik dining in Braj Dham.',
      features: Array.isArray(features) ? features : ['100% Satvik Pure Veg', 'Pure Desi Ghee', 'Family Seating'],
      contactPhone: ownerPhone ? ownerPhone.trim() : undefined,
      ownerName: ownerName ? ownerName.trim() : undefined,
      ownerEmail: ownerEmail ? ownerEmail.trim() : undefined,
      fssaiLicenseNo: fssaiLicenseNo ? fssaiLicenseNo.trim() : undefined,
      status: 'APPROVED', // Auto-approved for fast onboarding in Braj directory
      isFeatured: false,
      createdAt: new Date().toISOString()
    };

    const saved = await saveBhojanalaya(newBhojanalaya);

    res.status(201).json({
      success: true,
      message: `Radhe Radhe! '${saved.name}' has been successfully onboarded to the Brijnidhi Bhojan directory.`,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to onboard bhojanalaya',
      error: err.message
    });
  }
});

// ==========================================
// 4. SINGLE BHOJANALAYA DETAILS, MENU & REVIEWS
// ==========================================

// GET /api/bhojan/:idOrSlug - Single details with menu & reviews
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const bhojanalaya = await getBhojanalayaByIdOrSlug(idOrSlug);

    if (!bhojanalaya) {
      return res.status(404).json({
        success: false,
        message: `Bhojanalaya '${idOrSlug}' not found in Braj directory`
      });
    }

    const [menu, reviews] = await Promise.all([
      getMenuItems(bhojanalaya.id),
      getReviews(bhojanalaya.id)
    ]);

    res.json({
      success: true,
      data: {
        ...bhojanalaya,
        menu,
        reviews
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get bhojanalaya details',
      error: err.message
    });
  }
});

// GET /api/bhojan/:id/menu - Get menu items
router.get('/:id/menu', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menu = await getMenuItems(id);
    res.json({
      success: true,
      total: menu.length,
      data: menu
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: err.message
    });
  }
});

// POST /api/bhojan/:id/menu - Add menu item
router.post('/:id/menu', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, hindiName, category, price, description, pureDesiGhee, isSpeciality, imageUrl } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name and price are required'
      });
    }

    const newItem: BhojanMenuItem = {
      id: `item-${Date.now()}`,
      bhojanalayaId: id,
      name: name.trim(),
      hindiName: hindiName ? hindiName.trim() : undefined,
      category: category || 'Thali',
      price: Number(price),
      description: description ? description.trim() : undefined,
      pureDesiGhee: pureDesiGhee !== false,
      isSpeciality: Boolean(isSpeciality),
      isAvailable: true,
      imageUrl
    };

    const saved = await saveMenuItem(newItem);
    res.status(201).json({
      success: true,
      message: `Menu item '${saved.name}' added successfully.`,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add menu item',
      error: err.message
    });
  }
});

// GET /api/bhojan/:id/reviews - Get reviews
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await getReviews(id);
    res.json({
      success: true,
      total: reviews.length,
      data: reviews
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: err.message
    });
  }
});

// POST /api/bhojan/:id/reviews - Submit review
router.post('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { authorName, authorCity, rating, title, comment, darshanExperience } = req.body;

    if (!authorName || !comment || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Name, star rating, and review comment are required.'
      });
    }

    const newReview: BhojanReview = {
      id: `rev-${Date.now()}`,
      bhojanalayaId: id,
      authorName: authorName.trim(),
      authorCity: authorCity ? authorCity.trim() : 'Pilgrim Devotee',
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title ? title.trim() : undefined,
      comment: comment.trim(),
      darshanExperience: darshanExperience ? darshanExperience.trim() : undefined,
      createdAt: new Date().toISOString()
    };

    const saved = await saveReview(newReview);
    res.status(201).json({
      success: true,
      message: 'Thank you for sharing your prasadam review! Radhe Radhe.',
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: err.message
    });
  }
});

// ==========================================
// 5. ADMIN MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/bhojan/admin/reservations - View all reservations
router.get('/admin/reservations', async (req: Request, res: Response) => {
  try {
    const { bhojanalayaId } = req.query;
    const list = await getAllReservations(typeof bhojanalayaId === 'string' ? bhojanalayaId : undefined);
    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get master reservations list',
      error: err.message
    });
  }
});

// DELETE /api/bhojan/admin/:id - Delete bhojanalaya
router.delete('/admin/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await deleteBhojanalaya(id);
    if (!ok) {
      return res.status(404).json({
        success: false,
        message: `Bhojanalaya '${id}' not found`
      });
    }
    res.json({
      success: true,
      message: `Bhojanalaya '${id}' removed from directory.`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete bhojanalaya',
      error: err.message
    });
  }
});

export default router;
