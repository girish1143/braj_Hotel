import { Router, Request, Response } from 'express';
import { requireRole, requireHotelOwnership } from '../../middleware/roleGuard';
import { logAudit } from '../audit/auditService';
import { brajHotels } from '../../data/hotels';
import { Hotel, RoomOption } from '../../types';

const router = Router();

// Apply role guard: Only HOTEL_ADMIN (and SYSTEM_ADMIN) can access
router.use(requireRole('HOTEL_ADMIN', 'SYSTEM_ADMIN'));

// In-memory hotel rooms store for Hotel Admin
interface ExtendedRoom extends RoomOption {
  roomType: string;
  totalInventory: number;
  weekendPrice: number;
  isActive: boolean;
}

let managedHotel: Hotel = brajHotels.length > 0
  ? { ...brajHotels[0] }
  : {
      id: 'h-01',
      name: 'Unassigned Hotel Property',
      slug: 'unassigned-hotel',
      destinationSlug: 'vrindavan',
      destinationName: 'Vrindavan',
      stayType: 'hotel',
      starRating: 0,
      ratingScore: 0,
      reviewsCount: 0,
      pricePerNight: 0,
      originalPrice: 0,
      images: [],
      address: 'Braj Dham',
      nearestLandmark: 'Temple Sanctum',
      distanceToMainTemple: '0 km',
      landmarkDistances: [],
      amenities: ['24-Hour Hot Water', 'Pure Satvik Diet'],
      pureSatvikKitchen: true,
      templeDarshanAssistance: true,
      shortDescription: 'Register and configure your property details in Braj.',
      description: 'Clean verified pilgrimage listing starting with zero dummy data.',
      policies: {
        checkIn: '12:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before check-in.'
      },
      rooms: []
    };

let managedRooms: ExtendedRoom[] = [];
let hotelBookings: any[] = [];
let calendarMatrix: Record<string, string[]> = {};

// 1. Hotel Admin Dashboard Metrics (Zero-state clean dynamic calculation)
router.get('/dashboard', (req: Request, res: Response) => {
  const totalRoomsCount = managedRooms.reduce((acc, r) => acc + (r.totalInventory || 0), 0);
  const occupiedRooms = hotelBookings.filter((b) => b.bookingStatus === 'CHECKED_IN').length;
  const todaysRevenue = hotelBookings.reduce((acc, b) => acc + (b.paymentStatus === 'PAID' ? b.amount : 0), 0);
  const pendingCheckIns = hotelBookings.filter((b) => b.bookingStatus === 'PENDING_CHECKIN' || b.bookingStatus === 'CONFIRMED').length;

  res.json({
    success: true,
    hotelName: managedHotel.name,
    data: {
      todaysBookings: hotelBookings.length,
      availableRooms: Math.max(0, totalRoomsCount - occupiedRooms),
      occupiedRooms,
      todaysRevenue,
      pendingCheckIns,
      totalRoomsCount,
      occupancyRatePct: totalRoomsCount > 0 ? Math.round((occupiedRooms / totalRoomsCount) * 100) : 0,
      guestRating: managedHotel.ratingScore || 0,
      activeOffersCount: 0
    }
  });
});

// 2. Get Hotel Profile
router.get('/hotel', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: managedHotel
  });
});

// Update Hotel Profile
router.patch('/hotel', (req: Request, res: Response) => {
  managedHotel = {
    ...managedHotel,
    ...req.body
  };

  logAudit(
    req.user?.name || 'Hotel Admin',
    'HOTEL_UPDATED',
    'Hotel',
    managedHotel.id,
    `Updated hotel details, policies and satvik specifications for ${managedHotel.name}`,
    req.ip
  );

  res.json({
    success: true,
    message: 'Hotel profile successfully updated.',
    data: managedHotel
  });
});

// 3. Room Management
router.get('/rooms', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: managedRooms.length,
    data: managedRooms
  });
});

// Add new room
router.post('/rooms', (req: Request, res: Response) => {
  const { name, roomType, pricePerNight, weekendPrice, capacity, totalInventory, bedType, features } = req.body;

  if (!name || !pricePerNight) {
    return res.status(400).json({ success: false, message: 'Room name and price are required' });
  }

  const newRoom: ExtendedRoom = {
    id: `rm-${Date.now()}`,
    name,
    roomType: roomType || 'Deluxe Room',
    pricePerNight: Number(pricePerNight),
    weekendPrice: Number(weekendPrice || pricePerNight * 1.15),
    capacity: Number(capacity || 2),
    totalInventory: Number(totalInventory || 5),
    bedType: bedType || 'King Bed',
    isActive: true,
    features: features || ['AC', 'Hot Water', 'Wi-Fi']
  };

  managedRooms.push(newRoom);

  logAudit(
    req.user?.name || 'Hotel Admin',
    'ROOM_CREATED',
    'Room',
    newRoom.id,
    `Added new room '${newRoom.name}' (${newRoom.roomType}) priced at ₹${newRoom.pricePerNight}/night`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: 'Room successfully created and added to inventory.',
    data: newRoom
  });
});

// Delete/deactivate room
router.delete('/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = managedRooms.findIndex(r => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  const deleted = managedRooms.splice(idx, 1)[0];

  logAudit(
    req.user?.name || 'Hotel Admin',
    'ROOM_DELETED',
    'Room',
    id,
    `Deleted room inventory '${deleted.name}'`,
    req.ip
  );

  res.json({
    success: true,
    message: `Room '${deleted.name}' was successfully removed.`,
    data: deleted
  });
});

// 4. Bookings Management
router.get('/bookings', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: hotelBookings.length,
    data: hotelBookings
  });
});

// Update booking status (Check-in, Check-out, Confirm, Cancel)
router.patch('/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'CHECKED_IN' | 'CHECKED_OUT' | 'CONFIRMED' | 'CANCELLED'

  const booking = hotelBookings.find(b => b.id === id || b.bookingReference === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.bookingStatus = status;

  logAudit(
    req.user?.name || 'Hotel Admin',
    status === 'CANCELLED' ? 'BOOKING_CANCELLED' : 'BOOKING_CONFIRMED',
    'Booking',
    booking.id,
    `Changed booking ${booking.bookingReference} status to ${status}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Booking ${booking.bookingReference} status updated to ${status}.`,
    data: booking
  });
});

// 5. Calendar Management (October 2026 Matrix)
router.get('/calendar', (req: Request, res: Response) => {
  res.json({
    success: true,
    month: 'October 2026',
    days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    data: calendarMatrix
  });
});

// Toggle room date availability
router.post('/calendar/toggle', (req: Request, res: Response) => {
  const { roomKey, dayIndex } = req.body;
  if (calendarMatrix[roomKey] && calendarMatrix[roomKey][dayIndex] !== undefined) {
    const current = calendarMatrix[roomKey][dayIndex];
    calendarMatrix[roomKey][dayIndex] = current === 'B' ? '-' : 'B';
    return res.json({
      success: true,
      message: `Toggled ${roomKey} day ${dayIndex + 1} to ${calendarMatrix[roomKey][dayIndex]}`,
      data: calendarMatrix
    });
  }

  res.status(400).json({ success: false, message: 'Invalid room or day' });
});

export default router;
