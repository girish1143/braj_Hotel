import { Router, Request, Response } from 'express';
import { requireRole } from '../../middleware/roleGuard';
import { logAudit, getAuditLogs } from '../audit/auditService';
import { brajHotels, addHotel as addBrajHotel, updateHotel as updateBrajHotel, deleteHotel as deleteBrajHotel } from '../../data/hotels';
import {
  getBhojanalayas,
  getBhojanalayaByIdOrSlug,
  saveBhojanalaya,
  deleteBhojanalaya,
  getAllReservations,
  getBhojanStats
} from '../../db/bhojanRepository';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../routes/bookingRoutes';
import { Bhojanalaya, BhojanReservation, BookingResponse } from '../../types';

// In-memory state for admin actions
export interface AdminHotelItem {
  id: string;
  name: string;
  slug: string;
  destinationSlug: string;
  destinationName: string;
  stayType: string;
  pricePerNight: number;
  status: 'APPROVED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'SUSPENDED';
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  submittedAt: string;
  documentsVerified: boolean;
  tradeLicenseNo?: string;
  fssaiLicenseNo?: string;
  nearestLandmark?: string;
  address?: string;
  pureSatvikKitchen?: boolean;
  templeDarshanAssistance?: boolean;
}

export let adminHotels: AdminHotelItem[] = [];

// Initialize adminHotels with default brajHotels if empty
function initializeAdminHotels() {
  if (adminHotels.length === 0 && brajHotels.length > 0) {
    adminHotels = brajHotels.map(h => ({
      id: h.id,
      name: h.name,
      slug: h.slug,
      destinationSlug: h.destinationSlug,
      destinationName: h.destinationName,
      stayType: h.stayType,
      pricePerNight: h.pricePerNight,
      status: 'APPROVED',
      ownerName: 'Braj Seva Trust Partner',
      ownerEmail: `partner@${h.destinationSlug}.brijnidhi.org`,
      submittedAt: '01 Oct 2026',
      documentsVerified: true,
      nearestLandmark: h.nearestLandmark,
      address: h.address,
      pureSatvikKitchen: h.pureSatvikKitchen,
      templeDarshanAssistance: h.templeDarshanAssistance
    }));
  }
}
initializeAdminHotels();

export interface PlatformSettings {
  sacredNoticeText: string;
  sacredNoticeEnabled: boolean;
  platformCommissionPct: number;
  supportPhone: string;
  supportEmail: string;
  payoutsAutoApprove: boolean;
  maintenanceMode: boolean;
}

export let platformSettings: PlatformSettings = {
  sacredNoticeText: '🌸 Radhe Radhe! Clean, pious satvik stays & authentic Braj bhojan with temple darshan assistance.',
  sacredNoticeEnabled: true,
  platformCommissionPct: 10,
  supportPhone: '+91 98765 43210',
  supportEmail: 'seva@brijnidhi.org',
  payoutsAutoApprove: false,
  maintenanceMode: false
};

export function submitHotelToOnboardingQueue(data: any, ip: string = '127.0.0.1'): AdminHotelItem {
  const resolvedName = (data.hotelName || data.name || '').trim();
  const id = `prop-${Date.now().toString(36)}`;
  const slug = resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const destSlug = (data.destinationSlug || data.destination || 'vrindavan').toLowerCase();
  const destMap: Record<string, string> = {
    vrindavan: 'Vrindavan',
    mathura: 'Mathura',
    barsana: 'Barsana',
    govardhan: 'Govardhan'
  };
  const destinationName = destMap[destSlug] || 'Vrindavan';

  const newSubmission: AdminHotelItem = {
    id,
    name: resolvedName,
    slug,
    destinationSlug: destSlug,
    destinationName,
    stayType: data.stayType || 'hotel',
    pricePerNight: Number(data.basePrice || data.pricePerNight) || 1500,
    status: 'SUBMITTED',
    ownerName: (data.contactPerson || data.ownerName || 'Property Partner').trim(),
    ownerEmail: (data.email || data.ownerEmail || 'partner@brajstay.com').trim(),
    ownerPhone: (data.phone || data.ownerPhone || '').trim(),
    submittedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    documentsVerified: Boolean(data.tradeLicenseNo || data.fssaiLicenseNo),
    tradeLicenseNo: data.tradeLicenseNo,
    fssaiLicenseNo: data.fssaiLicenseNo,
    nearestLandmark: data.nearestLandmark || 'Main Temple Sanctum',
    address: data.address || `Near ${data.nearestLandmark || 'Main Temple'}, ${destinationName}`,
    pureSatvikKitchen: data.pureSatvikPledge !== false,
    templeDarshanAssistance: true
  };

  adminHotels.unshift(newSubmission);

  const walkMin = Number(data.walkMinutesToLandmark) || 4;
  addBrajHotel({
    id,
    name: resolvedName,
    slug,
    destinationSlug: destSlug as any,
    destinationName,
    stayType: (data.stayType || 'hotel') as any,
    pricePerNight: Number(data.basePrice || data.pricePerNight) || 1500,
    originalPrice: Math.round((Number(data.basePrice || data.pricePerNight) || 1500) * 1.25),
    nearestLandmark: data.nearestLandmark || 'Main Temple Sanctum',
    address: data.address || `Near ${data.nearestLandmark || 'Main Temple'}, ${destinationName}`,
    distanceToMainTemple: `${walkMin} min walk from ${data.nearestLandmark || 'Main Temple'}`,
    landmarkDistances: [
      { landmark: data.nearestLandmark || 'Main Temple', distanceKm: 0.3, distanceMeters: 300, walkMinutes: walkMin }
    ],
    images: (data.photoUrl || data.roomPhotoUrl)
      ? [data.photoUrl, data.roomPhotoUrl].filter(Boolean)
      : [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop'
        ],
    pureSatvikKitchen: data.pureSatvikPledge !== false,
    templeDarshanAssistance: true,
    shortDescription: data.description ? data.description.slice(0, 140) : `Peaceful pilgrimage stay near ${data.nearestLandmark || 'temple'} in ${destinationName}.`,
    description: data.description || `Providing clean, pious satvik accommodation for Braj yatra devotees visiting ${destinationName}.`,
    amenities: Array.isArray(data.amenities) && data.amenities.length > 0 ? data.amenities : ['100% Satvik Pure Veg', 'Attached Bathroom', 'Geyser / Hot Water', 'Temple Darshan Desk']
  });

  logAudit(
    newSubmission.ownerName,
    'HOTEL_SUBMITTED',
    'Hotel',
    id,
    `New property '${newSubmission.name}' submitted in ${destinationName} and added to Brijnidhi catalog.`,
    ip
  );

  return newSubmission;
}

const router = Router();

// ==========================================
// UNPROTECTED / PUBLIC ADMIN ENDPOINTS
// ==========================================

// Master Admin Security Gate verification
router.post('/auth/verify', (req: Request, res: Response) => {
  const { passcode, email } = req.body;
  const validKeys = ['Brijnidhi@Admin2026', '1082026', 'RadheAdmin#2026'];
  const provided = (passcode || '').trim();

  if (validKeys.includes(provided)) {
    const timestamp = Date.now();
    const token = `brijnidhi_admin_sec_token_${timestamp}`;
    
    logAudit(
      'Girish Sharma',
      'ADMIN_LOGIN_SUCCESS',
      'Security',
      'usr-sys-admin-01',
      'Project Owner authenticated successfully to Brijnidhi Admin Command Center',
      req.ip
    );

    return res.json({
      success: true,
      message: 'Admin security verification passed. Welcome, Project Owner!',
      token,
      admin: {
        id: 'usr-sys-admin-01',
        name: 'Girish Sharma',
        email: email?.trim() || 'admin@brijnidhi.org',
        role: 'SYSTEM_ADMIN'
      }
    });
  }

  logAudit(
    'Unknown Entity',
    'ADMIN_LOGIN_FAILED',
    'Security',
    'security-gate',
    `Failed admin authentication attempt from IP ${req.ip}`,
    req.ip
  );

  return res.status(401).json({
    success: false,
    message: 'Invalid Admin Security Passcode. Access denied to platform governance.'
  });
});

// Public Property Onboarding submission endpoint
router.post('/onboard', (req: Request, res: Response) => {
  const resolvedName = (req.body.hotelName || req.body.name || '').trim();
  if (!resolvedName) {
    return res.status(400).json({
      success: false,
      message: 'Property name is required to submit for onboarding.'
    });
  }

  const submission = submitHotelToOnboardingQueue(req.body, req.ip);

  res.status(201).json({
    success: true,
    message: `Property '${submission.name}' submitted successfully and sent to Hotel Onboarding Queue for Admin approval.`,
    data: submission
  });
});

// Public Notice endpoint for banner on public site
router.get('/public-notice', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      text: platformSettings.sacredNoticeText,
      enabled: platformSettings.sacredNoticeEnabled,
      supportPhone: platformSettings.supportPhone
    }
  });
});

// ==========================================
// PROTECTED OPERATIONAL ADMIN ROUTES
// ==========================================
router.use(requireRole('SYSTEM_ADMIN'));

let adminUsers = [
  { id: 'usr-1', name: 'Girish Sharma', email: 'admin@brijnidhi.org', role: 'SYSTEM_ADMIN', status: 'ACTIVE', joined: '03 Oct 2026' },
  { id: 'usr-2', name: 'Radha Mohan Das', email: 'partner@vrindavan.org', role: 'HOTEL_ADMIN', status: 'ACTIVE', joined: '04 Oct 2026' },
  { id: 'usr-3', name: 'Shyam Sundar Seva', email: 'bhojan@mathura.org', role: 'RESTAURANT_MANAGER', status: 'ACTIVE', joined: '04 Oct 2026' }
];

// 1. Dashboard Overview Metrics (Live dynamic calculations)
router.get('/overview', async (req: Request, res: Response) => {
  try {
    initializeAdminHotels();
    const totalHotels = adminHotels.length;
    const activeHotels = adminHotels.filter(h => h.status === 'APPROVED').length;
    const pendingApprovals = adminHotels.filter(h => h.status === 'SUBMITTED' || h.status === 'UNDER_REVIEW').length;
    const totalUsers = adminUsers.length;

    // Bhojan metrics
    const allBhojan = await getBhojanalayas({ status: 'ALL' });
    const totalBhojan = allBhojan.length;
    const activeBhojan = allBhojan.filter(b => b.status === 'APPROVED').length;
    const bhojanReservations = await getAllReservations();

    // Stay Bookings metrics
    const stayBookings = getAllBookings();
    const totalBookings = stayBookings.length;
    const completedOrConfirmed = stayBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
    
    // Revenue calculations
    const realStayRevenue = completedOrConfirmed.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    // Base platform estimate from active properties if real bookings are few
    const estimatedApprovedRevenue = adminHotels.filter(h => h.status === 'APPROVED').reduce((sum, h) => sum + h.pricePerNight * 2, 0);
    const totalGrossRevenue = realStayRevenue > 0 ? realStayRevenue : estimatedApprovedRevenue;
    const platformCommissionEarned = Math.round(totalGrossRevenue * (platformSettings.platformCommissionPct / 100));

    res.json({
      success: true,
      data: {
        totalHotels,
        activeHotels,
        pendingApprovals,
        totalBhojan,
        activeBhojan,
        totalStayBookings: totalBookings,
        totalBhojanReservations: bhojanReservations.length,
        totalUsers,
        revenueToday: totalGrossRevenue,
        platformCommissionEarnedToday: platformCommissionEarned,
        commissionRatePct: platformSettings.platformCommissionPct,
        activeDestinations: 4,
        avgCustomerRating: 4.9,
        sacredNoticeEnabled: platformSettings.sacredNoticeEnabled
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to calculate overview', error: err.message });
  }
});

// ==========================================
// 2. PROPERTIES & STAYS MANAGEMENT
// ==========================================

router.get('/hotels', (req: Request, res: Response) => {
  initializeAdminHotels();
  res.json({
    success: true,
    count: adminHotels.length,
    data: adminHotels
  });
});

router.post('/hotels', (req: Request, res: Response) => {
  const {
    name,
    destinationSlug = 'vrindavan',
    stayType = 'hotel',
    pricePerNight = 1500,
    nearestLandmark = 'Main Temple',
    address,
    ownerName = 'Braj Hotelier',
    ownerEmail = 'owner@brajstay.com',
    pureSatvikKitchen = true,
    templeDarshanAssistance = true,
    status = 'APPROVED'
  } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Hotel name is required' });
  }

  const id = `prop-${Date.now().toString(36)}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const destinationMap: Record<string, string> = {
    vrindavan: 'Vrindavan',
    mathura: 'Mathura',
    barsana: 'Barsana',
    govardhan: 'Govardhan'
  };
  const destinationName = destinationMap[destinationSlug] || 'Vrindavan';

  const newAdminHotel: AdminHotelItem = {
    id,
    name: name.trim(),
    slug,
    destinationSlug,
    destinationName,
    stayType,
    pricePerNight: Number(pricePerNight) || 1500,
    status: status as any,
    ownerName: ownerName.trim(),
    ownerEmail: ownerEmail.trim(),
    submittedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    documentsVerified: status === 'APPROVED',
    nearestLandmark,
    address: address || `Near ${nearestLandmark}, ${destinationName}`,
    pureSatvikKitchen: pureSatvikKitchen !== false,
    templeDarshanAssistance: templeDarshanAssistance !== false
  };

  adminHotels.unshift(newAdminHotel);

  if (status === 'APPROVED') {
    addBrajHotel({
      id,
      name: newAdminHotel.name,
      slug: newAdminHotel.slug,
      destinationSlug: destinationSlug as any,
      destinationName,
      stayType: stayType as any,
      pricePerNight: newAdminHotel.pricePerNight,
      nearestLandmark,
      address: address || `Near ${nearestLandmark}, ${destinationName}`,
      pureSatvikKitchen: pureSatvikKitchen !== false,
      templeDarshanAssistance: templeDarshanAssistance !== false
    });
  }

  logAudit(
    req.user?.name || 'Project Owner',
    'HOTEL_ADDED',
    'Hotel',
    id,
    `Added new property '${newAdminHotel.name}' in ${destinationName} (Status: ${status}, ₹${newAdminHotel.pricePerNight}/night)`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `Hotel '${newAdminHotel.name}' created successfully.`,
    data: newAdminHotel
  });
});

router.put('/hotels/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const hotel = adminHotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }

  const {
    name,
    pricePerNight,
    stayType,
    destinationSlug,
    nearestLandmark,
    address,
    ownerName,
    ownerEmail,
    pureSatvikKitchen,
    templeDarshanAssistance
  } = req.body;

  if (name) hotel.name = name;
  if (pricePerNight !== undefined) hotel.pricePerNight = Number(pricePerNight);
  if (stayType) hotel.stayType = stayType;
  if (destinationSlug) {
    hotel.destinationSlug = destinationSlug;
    const destMap: Record<string, string> = { vrindavan: 'Vrindavan', mathura: 'Mathura', barsana: 'Barsana', govardhan: 'Govardhan' };
    hotel.destinationName = destMap[destinationSlug] || hotel.destinationName;
  }
  if (ownerName) hotel.ownerName = ownerName;
  if (ownerEmail) hotel.ownerEmail = ownerEmail;
  if (nearestLandmark) hotel.nearestLandmark = nearestLandmark;
  if (address) hotel.address = address;
  if (pureSatvikKitchen !== undefined) hotel.pureSatvikKitchen = pureSatvikKitchen;
  if (templeDarshanAssistance !== undefined) hotel.templeDarshanAssistance = templeDarshanAssistance;

  updateBrajHotel(id, {
    name: hotel.name,
    pricePerNight: hotel.pricePerNight,
    stayType: hotel.stayType as any,
    destinationSlug: hotel.destinationSlug as any,
    destinationName: hotel.destinationName,
    ...(nearestLandmark ? { nearestLandmark } : {}),
    ...(address ? { address } : {}),
    ...(pureSatvikKitchen !== undefined ? { pureSatvikKitchen } : {}),
    ...(templeDarshanAssistance !== undefined ? { templeDarshanAssistance } : {})
  });

  logAudit(
    req.user?.name || 'Project Owner',
    'HOTEL_UPDATED',
    'Hotel',
    hotel.id,
    `Updated property '${hotel.name}' details and pricing.`,
    req.ip
  );

  res.json({
    success: true,
    message: `Hotel '${hotel.name}' updated successfully.`,
    data: hotel
  });
});

router.delete('/hotels/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const hotelIndex = adminHotels.findIndex((h) => h.id === id);

  if (hotelIndex === -1) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }

  const [removedHotel] = adminHotels.splice(hotelIndex, 1);
  deleteBrajHotel(id);

  logAudit(
    req.user?.name || 'Project Owner',
    'HOTEL_DELETED',
    'Hotel',
    id,
    `Deleted property '${removedHotel.name}' from Brijnidhi platform.`,
    req.ip
  );

  res.json({
    success: true,
    message: `Property '${removedHotel.name}' was permanently deleted.`,
    data: removedHotel
  });
});

router.patch('/hotels/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const hotel = adminHotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }

  hotel.status = 'APPROVED';
  hotel.documentsVerified = true;

  const existingInCatalog = brajHotels.find((h) => h.id === hotel.id);
  if (!existingInCatalog) {
    addBrajHotel({
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      destinationSlug: hotel.destinationSlug as any,
      destinationName: hotel.destinationName,
      stayType: hotel.stayType as any,
      pricePerNight: hotel.pricePerNight,
      nearestLandmark: hotel.nearestLandmark || 'Main Temple',
      address: hotel.address || `Near Main Temple, ${hotel.destinationName}`
    });
  }

  logAudit(
    req.user?.name || 'Project Owner',
    'HOTEL_APPROVED',
    'Hotel',
    hotel.id,
    `Approved property '${hotel.name}' (${hotel.destinationName}) after FSSAI Satvik & KYC verification. Published to live platform.`,
    req.ip
  );

  res.json({
    success: true,
    message: `Property '${hotel.name}' has been successfully APPROVED and is now LIVE on Brijnidhi.`,
    data: hotel
  });
});

router.patch('/hotels/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const hotel = adminHotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }

  hotel.status = 'REJECTED';
  deleteBrajHotel(id);

  logAudit(
    req.user?.name || 'Project Owner',
    'HOTEL_REJECTED',
    'Hotel',
    hotel.id,
    `Rejected property '${hotel.name}'. Reason: ${reason || 'Incomplete Satvik certification or invalid property title deed.'}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Property '${hotel.name}' has been REJECTED.`,
    data: hotel
  });
});

router.patch('/hotels/:id/suspend', (req: Request, res: Response) => {
  const { id } = req.params;
  const hotel = adminHotels.find((h) => h.id === id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }

  hotel.status = hotel.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';

  if (hotel.status === 'SUSPENDED') {
    deleteBrajHotel(id);
  } else {
    if (!brajHotels.some(h => h.id === id)) {
      addBrajHotel({
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
        destinationSlug: hotel.destinationSlug as any,
        destinationName: hotel.destinationName,
        stayType: hotel.stayType as any,
        pricePerNight: hotel.pricePerNight,
        nearestLandmark: hotel.nearestLandmark || 'Main Temple',
        address: hotel.address || `Near Main Temple, ${hotel.destinationName}`
      });
    }
  }

  logAudit(
    req.user?.name || 'Project Owner',
    hotel.status === 'SUSPENDED' ? 'HOTEL_SUSPENDED' : 'HOTEL_APPROVED',
    'Hotel',
    hotel.id,
    `Toggled hotel status to ${hotel.status}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Property '${hotel.name}' status is now ${hotel.status}.`,
    data: hotel
  });
});

// ==========================================
// 3. BHOJAN & RESTAURANTS MANAGEMENT
// ==========================================

router.get('/bhojan', async (req: Request, res: Response) => {
  try {
    const list = await getBhojanalayas({ status: 'ALL' });
    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bhojanalayas', error: err.message });
  }
});

router.post('/bhojan', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name) {
      return res.status(400).json({ success: false, message: 'Bhojanalaya name is required' });
    }

    const id = data.id || `bhojan-${Date.now().toString(36)}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const destSlug = (data.destinationSlug || 'vrindavan').toLowerCase();
    const destMap: Record<string, string> = { vrindavan: 'Vrindavan', mathura: 'Mathura', barsana: 'Barsana', govardhan: 'Govardhan' };

    const newBhojan: Bhojanalaya = {
      id,
      name: data.name.trim(),
      hindiName: data.hindiName || `${data.name} (ब्रज भोजनालय)`,
      slug,
      destinationSlug: destSlug as any,
      destinationName: destMap[destSlug] || 'Vrindavan',
      category: (data.category || 'thali') as any,
      categoryName: data.categoryName || 'Satvik Bhojanalaya',
      specialityDishes: Array.isArray(data.specialityDishes) && data.specialityDishes.length > 0
        ? data.specialityDishes
        : ['Radha Rani Kheer', 'Braj Peda', 'Makhan Roti', 'Dal Tadka'],
      priceRange: data.priceRange || '₹₹ (₹150 - ₹350)',
      avgCostForTwo: Number(data.avgCostForTwo) || 250,
      pureSatvik: data.pureSatvik !== false,
      pureDesiGhee: data.pureDesiGhee !== false,
      timings: data.timings || data.openingHours || '11:00 AM - 10:00 PM',
      nearestLandmark: data.nearestLandmark || 'Banke Bihari Mandir',
      distanceToLandmark: data.distanceToLandmark || '300m from Main Temple',
      walkMinutes: Number(data.walkMinutes) || 4,
      address: data.address || `Near ${data.nearestLandmark || 'Mandir'}, ${destMap[destSlug] || 'Vrindavan'}`,
      contactPhone: data.contactPhone || '+91 98765 43210',
      ratingScore: Number(data.ratingScore) || 4.9,
      reviewsCount: Number(data.reviewsCount || data.reviewCount) || 108,
      status: (data.status as any) || 'APPROVED',
      isFeatured: data.isFeatured === true,
      images: Array.isArray(data.images) && data.images.length > 0
        ? data.images
        : [
            'https://images.unsplash.com/photo-1613292443284-c772179f8006?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop'
          ],
      features: Array.isArray(data.features) && data.features.length > 0
        ? data.features
        : ['100% Satvik Pure Veg', 'Pure Desi Ghee', 'No Onion No Garlic', 'AC Family Dining'],
      description: data.description || 'Authentic divine Braj satvik prasad prepared with devotional purity.'
    };

    const saved = await saveBhojanalaya(newBhojan);

    logAudit(
      req.user?.name || 'Project Owner',
      'BHOJAN_ADDED',
      'Bhojanalaya',
      id,
      `Added new bhojan spot '${newBhojan.name}' in ${newBhojan.destinationName} (Avg for two: ₹${newBhojan.avgCostForTwo})`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: `Bhojanalaya '${newBhojan.name}' created and published successfully.`,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create bhojanalaya', error: err.message });
  }
});

router.put('/bhojan/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await getBhojanalayaByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bhojanalaya not found' });
    }

    const updated: Bhojanalaya = {
      ...existing,
      ...req.body,
      id: existing.id // protect ID
    };

    const saved = await saveBhojanalaya(updated);

    logAudit(
      req.user?.name || 'Project Owner',
      'BHOJAN_UPDATED',
      'Bhojanalaya',
      id,
      `Updated bhojan spot '${saved.name}' details and pricing.`,
      req.ip
    );

    res.json({
      success: true,
      message: `Bhojanalaya '${saved.name}' updated successfully.`,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update bhojanalaya', error: err.message });
  }
});

router.delete('/bhojan/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await deleteBhojanalaya(id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Bhojanalaya not found' });
    }

    logAudit(
      req.user?.name || 'Project Owner',
      'BHOJAN_DELETED',
      'Bhojanalaya',
      id,
      `Permanently deleted bhojan spot with ID ${id}`,
      req.ip
    );

    res.json({
      success: true,
      message: `Bhojanalaya deleted successfully.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete bhojanalaya', error: err.message });
  }
});

router.patch('/bhojan/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existing = await getBhojanalayaByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bhojanalaya not found' });
    }

    existing.status = status || (existing.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED');
    const saved = await saveBhojanalaya(existing);

    logAudit(
      req.user?.name || 'Project Owner',
      'BHOJAN_STATUS_CHANGED',
      'Bhojanalaya',
      id,
      `Changed '${saved.name}' status to ${saved.status}`,
      req.ip
    );

    res.json({
      success: true,
      message: `Status updated to ${saved.status}`,
      data: saved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update status', error: err.message });
  }
});

// View and manage Bhojan Reservations
router.get('/bhojan/reservations', async (req: Request, res: Response) => {
  try {
    const list = await getAllReservations();
    res.json({
      success: true,
      total: list.length,
      data: list
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch bhojan reservations', error: err.message });
  }
});

// ==========================================
// 4. STAY BOOKINGS MANAGEMENT
// ==========================================

router.get('/bookings', (req: Request, res: Response) => {
  const bookings = getAllBookings();
  res.json({
    success: true,
    total: bookings.length,
    data: bookings
  });
});

router.patch('/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const updated = updateBookingStatus(id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: `Booking '${id}' not found` });
  }

  logAudit(
    req.user?.name || 'Project Owner',
    'BOOKING_STATUS_CHANGED',
    'Booking',
    id,
    `Updated booking '${updated.bookingReference}' status to ${status}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Booking status updated to ${status}`,
    data: updated
  });
});

router.delete('/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = deleteBooking(id);
  if (!ok) {
    return res.status(404).json({ success: false, message: `Booking '${id}' not found` });
  }

  logAudit(
    req.user?.name || 'Project Owner',
    'BOOKING_DELETED',
    'Booking',
    id,
    `Deleted stay booking ${id}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Booking permanently deleted.`
  });
});

// ==========================================
// 5. USERS & DEVOTEES MANAGEMENT
// ==========================================

router.get('/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: adminUsers.length,
    data: adminUsers
  });
});

router.post('/users', (req: Request, res: Response) => {
  const { name, email, role = 'CUSTOMER', status = 'ACTIVE' } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const newUser = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    status,
    joined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  adminUsers.unshift(newUser);

  logAudit(
    req.user?.name || 'Project Owner',
    'USER_CREATED',
    'User',
    newUser.id,
    `Created user account ${newUser.email} with role ${newUser.role}`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `User '${newUser.name}' created successfully.`,
    data: newUser
  });
});

router.patch('/users/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = adminUsers.find(u => u.id === id);

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (!role) return res.status(400).json({ success: false, message: 'Role is required' });

  const oldRole = user.role;
  user.role = role;

  logAudit(
    req.user?.name || 'Project Owner',
    'USER_ROLE_CHANGED',
    'User',
    user.id,
    `Changed role of ${user.email} from ${oldRole} to ${role}`,
    req.ip
  );

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: user
  });
});

router.patch('/users/:id/suspend', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = adminUsers.find(u => u.id === id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.status = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';

  logAudit(
    req.user?.name || 'Project Owner',
    'USER_SUSPENDED',
    'User',
    user.id,
    `User ${user.email} marked as ${user.status}`,
    req.ip
  );

  res.json({ success: true, message: `User status updated to ${user.status}`, data: user });
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = adminUsers.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });

  const [deletedUser] = adminUsers.splice(idx, 1);

  logAudit(
    req.user?.name || 'Project Owner',
    'USER_DELETED',
    'User',
    id,
    `Deleted user account ${deletedUser.email}`,
    req.ip
  );

  res.json({ success: true, message: `User '${deletedUser.name}' removed.` });
});

// ==========================================
// 6. PLATFORM SETTINGS & SACRED BANNER
// ==========================================

router.get('/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: platformSettings
  });
});

router.put('/settings', (req: Request, res: Response) => {
  const {
    sacredNoticeText,
    sacredNoticeEnabled,
    platformCommissionPct,
    supportPhone,
    supportEmail,
    payoutsAutoApprove,
    maintenanceMode
  } = req.body;

  if (sacredNoticeText !== undefined) platformSettings.sacredNoticeText = sacredNoticeText;
  if (sacredNoticeEnabled !== undefined) platformSettings.sacredNoticeEnabled = Boolean(sacredNoticeEnabled);
  if (platformCommissionPct !== undefined) platformSettings.platformCommissionPct = Number(platformCommissionPct);
  if (supportPhone !== undefined) platformSettings.supportPhone = supportPhone;
  if (supportEmail !== undefined) platformSettings.supportEmail = supportEmail;
  if (payoutsAutoApprove !== undefined) platformSettings.payoutsAutoApprove = Boolean(payoutsAutoApprove);
  if (maintenanceMode !== undefined) platformSettings.maintenanceMode = Boolean(maintenanceMode);

  logAudit(
    req.user?.name || 'Project Owner',
    'SETTINGS_UPDATED',
    'Settings',
    'platform-config',
    `Updated platform settings (Commission: ${platformSettings.platformCommissionPct}%, Notice Enabled: ${platformSettings.sacredNoticeEnabled})`,
    req.ip
  );

  res.json({
    success: true,
    message: 'Platform settings updated successfully.',
    data: platformSettings
  });
});

// ==========================================
// 7. GLOBAL PAYMENTS & AUDIT LOGS
// ==========================================

router.get('/payments', async (req: Request, res: Response) => {
  try {
    const stayBookings = getAllBookings();
    const realStayRevenue = stayBookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    const estimatedApprovedRevenue = adminHotels.filter(h => h.status === 'APPROVED').reduce((sum, h) => sum + h.pricePerNight * 2, 0);
    const grossVolume = realStayRevenue > 0 ? realStayRevenue : estimatedApprovedRevenue;
    const commissions = Math.round(grossVolume * (platformSettings.platformCommissionPct / 100));
    const payouts = grossVolume - commissions;

    res.json({
      success: true,
      data: {
        totalGrossBookings: grossVolume,
        platformCommissions: commissions,
        payoutsToHotels: payouts,
        pendingPayouts: Math.round(payouts * 0.3),
        commissionRatePct: platformSettings.platformCommissionPct,
        recentTransactions: [
          {
            id: 'tx-101',
            type: 'STAY_PAYMENT',
            guest: 'Devotee Ramesh (Delhi)',
            amount: 3200,
            commission: 320,
            date: 'Today, 11:20 AM',
            status: 'SETTLED'
          },
          {
            id: 'tx-102',
            type: 'BHOJAN_PRASADAM',
            guest: 'Yatri Priyanshu',
            amount: 540,
            commission: 54,
            date: 'Today, 01:15 PM',
            status: 'SETTLED'
          }
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to calculate payments', error: err.message });
  }
});

router.get('/audit-logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: getAuditLogs()
  });
});

export default router;
