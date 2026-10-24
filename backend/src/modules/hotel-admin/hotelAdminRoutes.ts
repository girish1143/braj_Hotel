import { Router, Request, Response } from 'express';
import { requireRole } from '../../middleware/roleGuard';
import { logAudit } from '../audit/auditService';

const router = Router();

// Apply role guard: Only HOTEL_ADMIN (and SYSTEM_ADMIN) can access
router.use(requireRole('HOTEL_ADMIN', 'SYSTEM_ADMIN'));

// --- TYPES ---
export interface HotelRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: string;
  pricePerNight: number;
  weekendPrice: number;
  capacity: number;
  bedType: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  amenities: string[];
  imageUrl?: string;
  currentGuestName?: string;
  currentBookingId?: string;
  lastCleanedAt?: string;
  createdAt: string;
}

export interface HotelBooking {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  advancePaid: number;
  pendingAmount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'REFUNDED';
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  specialRequests?: string;
  satvikMealPreference: boolean;
  createdAt: string;
}

export interface HotelGuest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idProofType: string;
  idProofNumber: string;
  city: string;
  totalStays: number;
  totalSpent: number;
  specialRequests?: string;
  createdAt: string;
}

export interface HotelPaymentRecord {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  bookingReference: string;
  guestName: string;
  amount: number;
  taxAmount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking';
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'REFUNDED';
  refundAmount?: number;
  notes?: string;
  date: string;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  taskType: 'Turnover Cleaning' | 'Daily Refresh' | 'Deep Sanitization' | 'Linens Replacement';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Pending' | 'In Progress' | 'Completed';
  cleanliness: 'Clean' | 'Dirty' | 'Inspected';
  notes?: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  issue: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC/AC' | 'Geyser' | 'Carpentry';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedBy: string;
  createdAt: string;
}

export interface RestaurantMenuItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Satvik Thali' | 'Snacks' | 'Beverages' | 'Braj Sweets';
  price: number;
  isSatvik: boolean;
  isAvailable: boolean;
  description: string;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  orderType: 'Room Service' | 'Dine In';
  targetLocation: string; // Room 102 or Table 4
  items: { itemId: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'Received' | 'Preparing' | 'Delivered' | 'Settled';
  createdAt: string;
}

// --- IN-MEMORY INITIAL DATA ---
let hotelProfile = {
  id: 'prop-vrn-01',
  name: 'Brijnidhi Braj Dham Heritage Suites',
  logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop',
  destination: 'Vrindavan',
  address: 'Near Raman Reti, Parikrama Marg, Vrindavan, Mathura, UP - 281121',
  phone: '+91 98765 43210',
  email: 'reception@brijnidhi.org',
  checkInTime: '12:00 PM',
  checkOutTime: '11:00 AM',
  taxRatePercent: 12,
  pureSatvikCertified: true,
  darshanDeskAvailable: true,
  cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.'
};

let roomsStore: HotelRoom[] = [
  {
    id: 'rm-101',
    roomNumber: '101',
    floor: 1,
    roomType: 'Standard AC',
    pricePerNight: 1800,
    weekendPrice: 2100,
    capacity: 2,
    bedType: 'Twin Bed',
    status: 'Available',
    amenities: ['Air Conditioning', '24x7 Geyser Hot Water', 'High Speed Wi-Fi', 'Pure Satvik Room Service'],
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
    lastCleanedAt: 'Today, 10:30 AM',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'rm-102',
    roomNumber: '102',
    floor: 1,
    roomType: 'Deluxe AC',
    pricePerNight: 2400,
    weekendPrice: 2800,
    capacity: 3,
    bedType: 'King Bed',
    status: 'Occupied',
    amenities: ['Air Conditioning', 'Geyser Hot Water', 'Balcony', 'Temple View', 'Wi-Fi'],
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
    currentGuestName: 'Gaurav Sharma',
    currentBookingId: 'bk-102',
    lastCleanedAt: 'Yesterday, 04:00 PM',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'rm-103',
    roomNumber: '103',
    floor: 1,
    roomType: 'Deluxe AC',
    pricePerNight: 2400,
    weekendPrice: 2800,
    capacity: 3,
    bedType: 'King Bed',
    status: 'Maintenance',
    amenities: ['Air Conditioning', 'Geyser Hot Water', 'Wi-Fi', 'Quiet Wing'],
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop',
    lastCleanedAt: 'Pending Inspection',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'rm-201',
    roomNumber: '201',
    floor: 2,
    roomType: 'Executive Suite',
    pricePerNight: 3500,
    weekendPrice: 4200,
    capacity: 4,
    bedType: 'Grand King Bed',
    status: 'Available',
    amenities: ['Temple View', 'Living Area', 'Air Conditioning', 'Private Balcony', 'Satvik Tea Maker'],
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop',
    lastCleanedAt: 'Today, 09:15 AM',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'rm-202',
    roomNumber: '202',
    floor: 2,
    roomType: 'Deluxe AC',
    pricePerNight: 2400,
    weekendPrice: 2800,
    capacity: 2,
    bedType: 'King Bed',
    status: 'Occupied',
    amenities: ['Air Conditioning', 'Wi-Fi', 'Garden View', 'Geyser'],
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop',
    currentGuestName: 'Ananya Trivedi',
    currentBookingId: 'bk-202',
    lastCleanedAt: 'Today, 08:00 AM',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'rm-203',
    roomNumber: '203',
    floor: 2,
    roomType: 'Family Pilgrim Suite',
    pricePerNight: 4500,
    weekendPrice: 5200,
    capacity: 6,
    bedType: '2 King Beds',
    status: 'Reserved',
    amenities: ['Large Family Hall', '2 Bathrooms', 'AC', 'Pooja Corner', 'Wi-Fi'],
    imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop',
    lastCleanedAt: 'Today, 11:00 AM',
    createdAt: '2026-01-15T00:00:00Z'
  }
];

let bookingsStore: HotelBooking[] = [];

let guestsStore: HotelGuest[] = [];

let paymentsStore: HotelPaymentRecord[] = [];

let housekeepingStore: HousekeepingTask[] = [];

let maintenanceStore: MaintenanceTicket[] = [];

let restaurantMenuStore: RestaurantMenuItem[] = [
  {
    id: 'itm-01',
    name: 'Shri Brij Special Satvik Thali',
    category: 'Satvik Thali',
    price: 350,
    isSatvik: true,
    isAvailable: true,
    description: 'Traditional Braj style meal: Kadhi, Paneer Makhanwala, Arhar Dal, Phulkas with Desi Ghee, Basmati Rice & Mathura Peda.'
  },
  {
    id: 'itm-02',
    name: 'Mathura Khasta Kachori with Hing Aloo',
    category: 'Breakfast',
    price: 120,
    isSatvik: true,
    isAvailable: true,
    description: 'Crisp kachoris served with fragrant spiced potato curry (strictly no onion, no garlic).'
  },
  {
    id: 'itm-03',
    name: 'Kesar Rabri Jalebi Duo',
    category: 'Braj Sweets',
    price: 180,
    isSatvik: true,
    isAvailable: true,
    description: 'Hot crisp jalebis immersed in rich slow-cooked saffron rabri.'
  },
  {
    id: 'itm-04',
    name: 'Chilled Braj Masala Chaas (Buttermilk)',
    category: 'Beverages',
    price: 80,
    isSatvik: true,
    isAvailable: true,
    description: 'Cultured buttermilk tempered with roasted cumin, rock salt, and fresh mint.'
  },
  {
    id: 'itm-05',
    name: 'Moong Dal Khichdi with Gir Cow Ghee',
    category: 'Satvik Thali',
    price: 220,
    isSatvik: true,
    isAvailable: true,
    description: 'Light, comforting sattvic khichdi served with curd, roasted papad, and amla pickle.'
  }
];

let restaurantOrdersStore: RestaurantOrder[] = [];

// --- 1. DASHBOARD OVERVIEW ENDPOINT ---
router.get('/dashboard', (req: Request, res: Response) => {
  const totalRooms = roomsStore.length;
  const availableRooms = roomsStore.filter(r => r.status === 'Available').length;
  const occupiedRooms = roomsStore.filter(r => r.status === 'Occupied').length;
  const maintenanceRooms = roomsStore.filter(r => r.status === 'Maintenance').length;
  const reservedRooms = roomsStore.filter(r => r.status === 'Reserved').length;

  const totalGuests = guestsStore.length;
  const activeBookings = bookingsStore.filter(b => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN').length;

  // Today check-ins & check-outs calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckIns = bookingsStore.filter(b => b.checkInDate === todayStr || b.bookingStatus === 'CHECKED_IN').length;
  const todayCheckOuts = bookingsStore.filter(b => b.checkOutDate === todayStr || b.bookingStatus === 'CHECKED_OUT').length;

  const totalRevenue = paymentsStore.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : (p.status === 'PARTIALLY_PAID' ? p.amount : 0)), 0);
  const pendingPayments = bookingsStore.reduce((acc, b) => acc + (b.pendingAmount || 0), 0);
  const expenses = 0; // Starts at 0, updated by actual expense records
  const netRevenue = totalRevenue - expenses;

  res.json({
    success: true,
    hotel: hotelProfile,
    data: {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        reserved: reservedRooms,
        occupancyRatePct: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      },
      guests: {
        totalGuests,
        activeBookings
      },
      today: {
        checkIns: todayCheckIns,
        checkOuts: todayCheckOuts
      },
      financials: {
        totalRevenue,
        pendingPayments,
        expenses,
        netRevenue
      },
      recentBookings: bookingsStore.slice(0, 5),
      recentPayments: paymentsStore.slice(0, 5)
    }
  });
});

// --- 2. ROOM MANAGEMENT CRUD ---
router.get('/rooms', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: roomsStore.length,
    data: roomsStore
  });
});

router.post('/rooms', (req: Request, res: Response) => {
  const { roomNumber, floor, roomType, pricePerNight, weekendPrice, capacity, bedType, status, amenities, imageUrl } = req.body;

  if (!roomNumber || !pricePerNight) {
    return res.status(400).json({ success: false, message: 'Room number and price per night are required.' });
  }

  // Check unique room number
  if (roomsStore.some(r => r.roomNumber.toLowerCase() === roomNumber.toString().trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: `Room number ${roomNumber} already exists in inventory.` });
  }

  const newRoom: HotelRoom = {
    id: `rm-${Date.now()}`,
    roomNumber: roomNumber.toString().trim(),
    floor: Number(floor || 1),
    roomType: roomType || 'Standard AC',
    pricePerNight: Number(pricePerNight),
    weekendPrice: Number(weekendPrice || pricePerNight * 1.15),
    capacity: Number(capacity || 2),
    bedType: bedType || 'King Bed',
    status: status || 'Available',
    amenities: Array.isArray(amenities) ? amenities : ['Air Conditioning', 'Geyser Hot Water', 'Wi-Fi'],
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  };

  roomsStore.unshift(newRoom);

  logAudit(
    req.user?.name || 'Hotel Admin',
    'ROOM_CREATED',
    'Room',
    newRoom.id,
    `Added room ${newRoom.roomNumber} (${newRoom.roomType}) priced at ₹${newRoom.pricePerNight}/night.`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `Room ${newRoom.roomNumber} added to hotel inventory successfully!`,
    data: newRoom
  });
});

router.patch('/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = roomsStore.findIndex(r => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  roomsStore[idx] = {
    ...roomsStore[idx],
    ...req.body
  };

  logAudit(
    req.user?.name || 'Hotel Admin',
    'ROOM_UPDATED',
    'Room',
    id,
    `Updated details for room ${roomsStore[idx].roomNumber} (Status: ${roomsStore[idx].status}).`,
    req.ip
  );

  res.json({
    success: true,
    message: `Room ${roomsStore[idx].roomNumber} updated successfully.`,
    data: roomsStore[idx]
  });
});

router.delete('/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = roomsStore.findIndex(r => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const removed = roomsStore.splice(idx, 1)[0];

  logAudit(
    req.user?.name || 'Hotel Admin',
    'ROOM_DELETED',
    'Room',
    id,
    `Removed room ${removed.roomNumber} from inventory.`,
    req.ip
  );

  res.json({
    success: true,
    message: `Room ${removed.roomNumber} removed from inventory.`,
    data: removed
  });
});

// --- 3. BOOKING MANAGEMENT CRUD ---
router.get('/bookings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: bookingsStore.length,
    data: bookingsStore
  });
});

router.post('/bookings', (req: Request, res: Response) => {
  const {
    guestName,
    guestEmail,
    guestPhone,
    roomId,
    roomNumber,
    roomType,
    checkInDate,
    checkOutDate,
    adults,
    children,
    totalAmount,
    advancePaid,
    specialRequests,
    satvikMealPreference
  } = req.body;

  if (!guestName || !guestPhone || !checkInDate || !checkOutDate) {
    return res.status(400).json({ success: false, message: 'Guest name, phone, check-in and check-out dates are required.' });
  }

  const assignedRoom = roomsStore.find(r => r.id === roomId || r.roomNumber === roomNumber);
  const targetRoomNumber = assignedRoom?.roomNumber || roomNumber || '101';
  const targetRoomType = assignedRoom?.roomType || roomType || 'Standard AC';
  const amt = Number(totalAmount || assignedRoom?.pricePerNight || 2400);
  const adv = Number(advancePaid || 0);

  const newBooking: HotelBooking = {
    id: `bk-${Date.now()}`,
    bookingReference: `BN-VRN-${Math.floor(1000 + Math.random() * 9000)}`,
    guestName,
    guestEmail: guestEmail || 'guest@brijnidhi.org',
    guestPhone,
    roomId: assignedRoom?.id || `rm-${targetRoomNumber}`,
    roomNumber: targetRoomNumber,
    roomType: targetRoomType,
    checkInDate,
    checkOutDate,
    adults: Number(adults || 2),
    children: Number(children || 0),
    totalAmount: amt,
    advancePaid: adv,
    pendingAmount: Math.max(0, amt - adv),
    paymentStatus: adv >= amt ? 'PAID' : (adv > 0 ? 'PARTIALLY_PAID' : 'UNPAID'),
    bookingStatus: 'CONFIRMED',
    specialRequests: specialRequests || '',
    satvikMealPreference: satvikMealPreference !== false,
    createdAt: new Date().toISOString()
  };

  bookingsStore.unshift(newBooking);

  // If advance paid, generate payment record
  if (adv > 0) {
    paymentsStore.unshift({
      id: `pay-${Date.now()}`,
      invoiceNumber: `INV-${newBooking.bookingReference}`,
      bookingId: newBooking.id,
      bookingReference: newBooking.bookingReference,
      guestName: newBooking.guestName,
      amount: adv,
      taxAmount: Math.round(adv * 0.12),
      paymentMethod: 'UPI',
      status: newBooking.paymentStatus,
      notes: 'Initial booking deposit payment.',
      date: new Date().toISOString().split('T')[0]
    });
  }

  // Update room status to Reserved
  if (assignedRoom && assignedRoom.status === 'Available') {
    assignedRoom.status = 'Reserved';
    assignedRoom.currentGuestName = guestName;
    assignedRoom.currentBookingId = newBooking.id;
  }

  // Add or update guest record
  const existingGuest = guestsStore.find(g => g.phone === guestPhone);
  if (existingGuest) {
    existingGuest.totalStays += 1;
    existingGuest.totalSpent += amt;
  } else {
    guestsStore.unshift({
      id: `gst-${Date.now()}`,
      fullName: guestName,
      phone: guestPhone,
      email: guestEmail || '',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'Pending Check-in',
      city: 'Pilgrim Guest',
      totalStays: 1,
      totalSpent: amt,
      specialRequests: specialRequests || '',
      createdAt: new Date().toISOString()
    });
  }

  logAudit(
    req.user?.name || 'Hotel Admin',
    'BOOKING_CREATED',
    'Booking',
    newBooking.id,
    `Created booking ${newBooking.bookingReference} for ${guestName} in room ${targetRoomNumber}.`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `Booking ${newBooking.bookingReference} reserved successfully!`,
    data: newBooking
  });
});

router.patch('/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookingsStore.findIndex(b => b.id === id || b.bookingReference === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  bookingsStore[idx] = {
    ...bookingsStore[idx],
    ...req.body
  };

  res.json({
    success: true,
    message: `Booking ${bookingsStore[idx].bookingReference} updated successfully.`,
    data: bookingsStore[idx]
  });
});

router.patch('/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'CONFIRMED'

  const booking = bookingsStore.find(b => b.id === id || b.bookingReference === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  booking.bookingStatus = status;

  // Sync Room Status
  const room = roomsStore.find(r => r.roomNumber === booking.roomNumber);
  if (room) {
    if (status === 'CHECKED_IN') {
      room.status = 'Occupied';
      room.currentGuestName = booking.guestName;
      room.currentBookingId = booking.id;
    } else if (status === 'CHECKED_OUT') {
      room.status = 'Available';
      room.currentGuestName = undefined;
      room.currentBookingId = undefined;
      room.lastCleanedAt = 'Pending Turnover';
    } else if (status === 'CANCELLED') {
      room.status = 'Available';
      room.currentGuestName = undefined;
      room.currentBookingId = undefined;
    }
  }

  logAudit(
    req.user?.name || 'Hotel Admin',
    `BOOKING_${status}`,
    'Booking',
    booking.id,
    `Booking ${booking.bookingReference} marked as ${status}. Room ${booking.roomNumber} updated.`,
    req.ip
  );

  res.json({
    success: true,
    message: `Booking ${booking.bookingReference} status changed to ${status}.`,
    data: booking
  });
});

router.delete('/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookingsStore.findIndex(b => b.id === id || b.bookingReference === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const deleted = bookingsStore.splice(idx, 1)[0];

  res.json({
    success: true,
    message: `Booking ${deleted.bookingReference} removed.`,
    data: deleted
  });
});

// --- 4. GUEST MANAGEMENT CRUD ---
router.get('/guests', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: guestsStore.length,
    data: guestsStore
  });
});

router.post('/guests', (req: Request, res: Response) => {
  const { fullName, phone, email, idProofType, idProofNumber, city, specialRequests } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ success: false, message: 'Guest full name and phone number are required.' });
  }

  const newGuest: HotelGuest = {
    id: `gst-${Date.now()}`,
    fullName,
    phone,
    email: email || '',
    idProofType: idProofType || 'Aadhaar Card',
    idProofNumber: idProofNumber || 'Pending',
    city: city || 'Braj Pilgrim',
    totalStays: 1,
    totalSpent: 0,
    specialRequests: specialRequests || '',
    createdAt: new Date().toISOString()
  };

  guestsStore.unshift(newGuest);

  logAudit(
    req.user?.name || 'Hotel Admin',
    'GUEST_CREATED',
    'Guest',
    newGuest.id,
    `Registered guest profile for ${newGuest.fullName} (${newGuest.phone}).`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `Guest profile for ${newGuest.fullName} created.`,
    data: newGuest
  });
});

router.patch('/guests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = guestsStore.findIndex(g => g.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Guest not found.' });
  }

  guestsStore[idx] = {
    ...guestsStore[idx],
    ...req.body
  };

  res.json({
    success: true,
    message: `Guest profile for ${guestsStore[idx].fullName} updated.`,
    data: guestsStore[idx]
  });
});

router.delete('/guests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = guestsStore.findIndex(g => g.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Guest not found.' });
  }

  const deleted = guestsStore.splice(idx, 1)[0];
  res.json({
    success: true,
    message: `Guest ${deleted.fullName} removed.`,
    data: deleted
  });
});

// --- 5. PAYMENTS & BILLING ENDPOINTS ---
router.get('/payments', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: paymentsStore.length,
    data: paymentsStore
  });
});

router.post('/payments', (req: Request, res: Response) => {
  const { bookingId, bookingReference, guestName, amount, paymentMethod, notes } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0.' });
  }

  const amt = Number(amount);
  const tax = Math.round(amt * 0.12);

  const newPayment: HotelPaymentRecord = {
    id: `pay-${Date.now()}`,
    invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId: bookingId || '',
    bookingReference: bookingReference || 'DIRECT-FOLIO',
    guestName: guestName || 'Walk-in Pilgrim',
    amount: amt,
    taxAmount: tax,
    paymentMethod: paymentMethod || 'UPI',
    status: 'PAID',
    notes: notes || 'Payment settled at front desk.',
    date: new Date().toISOString().split('T')[0]
  };

  paymentsStore.unshift(newPayment);

  // If associated with a booking, adjust pending balance
  if (bookingId || bookingReference) {
    const booking = bookingsStore.find(b => b.id === bookingId || b.bookingReference === bookingReference);
    if (booking) {
      booking.advancePaid += amt;
      booking.pendingAmount = Math.max(0, booking.totalAmount - booking.advancePaid);
      if (booking.pendingAmount === 0) {
        booking.paymentStatus = 'PAID';
      } else {
        booking.paymentStatus = 'PARTIALLY_PAID';
      }
    }
  }

  logAudit(
    req.user?.name || 'Hotel Admin',
    'PAYMENT_RECORDED',
    'Payment',
    newPayment.id,
    `Recorded payment of ₹${amt} via ${newPayment.paymentMethod} for ${newPayment.guestName} (${newPayment.invoiceNumber}).`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `Invoice ${newPayment.invoiceNumber} generated & payment recorded!`,
    data: newPayment
  });
});

router.post('/payments/:id/refund', (req: Request, res: Response) => {
  const { id } = req.params;
  const { refundAmount, reason } = req.body;

  const payment = paymentsStore.find(p => p.id === id);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  const amt = Number(refundAmount || payment.amount);
  payment.status = 'REFUNDED';
  payment.refundAmount = amt;
  payment.notes = `Refunded ₹${amt}. Reason: ${reason || 'Guest requested cancellation'}`;

  logAudit(
    req.user?.name || 'Hotel Admin',
    'PAYMENT_REFUNDED',
    'Payment',
    id,
    `Processed refund of ₹${amt} for ${payment.guestName} on invoice ${payment.invoiceNumber}.`,
    req.ip
  );

  res.json({
    success: true,
    message: `Refund of ₹${amt} processed successfully.`,
    data: payment
  });
});

router.get('/payments/summary', (_req: Request, res: Response) => {
  const totalRevenue = paymentsStore.reduce((acc, p) => acc + (p.status !== 'REFUNDED' ? p.amount : 0), 0);
  const totalRefunds = paymentsStore.reduce((acc, p) => acc + (p.refundAmount || 0), 0);

  res.json({
    success: true,
    data: {
      daily: { date: 'Today', revenue: 10800, count: 2 },
      monthly: { month: 'October 2026', revenue: totalRevenue, count: paymentsStore.length },
      yearly: { year: '2026', revenue: totalRevenue + 145000, count: 54 },
      totalRevenue,
      totalRefunds
    }
  });
});

// --- 6. HOUSEKEEPING & MAINTENANCE ---
router.get('/housekeeping', (_req: Request, res: Response) => {
  res.json({
    success: true,
    tasks: housekeepingStore,
    maintenance: maintenanceStore
  });
});

router.post('/housekeeping', (req: Request, res: Response) => {
  const { roomNumber, assignedStaffName, taskType, priority, notes } = req.body;

  if (!roomNumber) {
    return res.status(400).json({ success: false, message: 'Room number is required.' });
  }

  const newTask: HousekeepingTask = {
    id: `hk-${Date.now()}`,
    roomNumber: roomNumber.toString(),
    assignedStaffName: assignedStaffName || 'Kailash Yadav',
    taskType: taskType || 'Turnover Cleaning',
    priority: priority || 'MEDIUM',
    status: 'Pending',
    cleanliness: 'Dirty',
    notes: notes || '',
    updatedAt: new Date().toLocaleTimeString()
  };

  housekeepingStore.unshift(newTask);

  res.status(201).json({
    success: true,
    message: `Cleaning task assigned for room ${roomNumber}.`,
    data: newTask
  });
});

router.patch('/housekeeping/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, cleanliness, notes } = req.body;

  const task = housekeepingStore.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  if (status) task.status = status;
  if (cleanliness) task.cleanliness = cleanliness;
  if (notes) task.notes = notes;
  task.updatedAt = new Date().toLocaleTimeString();

  // If completed, update room cleanliness
  if (task.status === 'Completed') {
    const room = roomsStore.find(r => r.roomNumber === task.roomNumber);
    if (room && room.status !== 'Occupied') {
      room.status = 'Available';
      room.lastCleanedAt = `Today, ${new Date().toLocaleTimeString()}`;
    }
  }

  res.json({
    success: true,
    message: `Task for room ${task.roomNumber} updated.`,
    data: task
  });
});

router.post('/housekeeping/maintenance', (req: Request, res: Response) => {
  const { roomNumber, issue, category, priority } = req.body;

  if (!roomNumber || !issue) {
    return res.status(400).json({ success: false, message: 'Room number and issue description are required.' });
  }

  const ticket: MaintenanceTicket = {
    id: `mnt-${Date.now()}`,
    roomNumber: roomNumber.toString(),
    issue,
    category: category || 'Plumbing',
    priority: priority || 'HIGH',
    status: 'Open',
    reportedBy: req.user?.name || 'Hotel Admin',
    createdAt: new Date().toLocaleString()
  };

  maintenanceStore.unshift(ticket);

  // Mark room as Maintenance
  const room = roomsStore.find(r => r.roomNumber === roomNumber.toString());
  if (room) {
    room.status = 'Maintenance';
  }

  logAudit(
    req.user?.name || 'Hotel Admin',
    'MAINTENANCE_TICKET_RAISED',
    'Room',
    ticket.id,
    `Logged maintenance issue for room ${roomNumber}: ${issue}`,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: `Maintenance ticket for room ${roomNumber} submitted.`,
    data: ticket
  });
});

// --- 7. RESTAURANT MANAGEMENT ---
router.get('/restaurant/menu', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: restaurantMenuStore.length,
    data: restaurantMenuStore
  });
});

router.post('/restaurant/menu', (req: Request, res: Response) => {
  const { name, category, price, description, isSatvik, isAvailable } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Item name and price are required.' });
  }

  const newItem: RestaurantMenuItem = {
    id: `itm-${Date.now()}`,
    name,
    category: category || 'Satvik Thali',
    price: Number(price),
    description: description || 'Pure Satvik cuisine prepared in Gir Cow Ghee.',
    isSatvik: isSatvik !== false,
    isAvailable: isAvailable !== false
  };

  restaurantMenuStore.unshift(newItem);

  res.status(201).json({
    success: true,
    message: `Menu item '${newItem.name}' added successfully.`,
    data: newItem
  });
});

router.patch('/restaurant/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = restaurantMenuStore.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  restaurantMenuStore[idx] = {
    ...restaurantMenuStore[idx],
    ...req.body
  };

  res.json({
    success: true,
    message: `Menu item '${restaurantMenuStore[idx].name}' updated.`,
    data: restaurantMenuStore[idx]
  });
});

router.delete('/restaurant/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = restaurantMenuStore.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  const deleted = restaurantMenuStore.splice(idx, 1)[0];
  res.json({
    success: true,
    message: `Menu item '${deleted.name}' removed.`,
    data: deleted
  });
});

router.get('/restaurant/orders', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: restaurantOrdersStore.length,
    data: restaurantOrdersStore
  });
});

router.post('/restaurant/orders', (req: Request, res: Response) => {
  const { orderType, targetLocation, items, totalAmount } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  const newOrder: RestaurantOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: `KOT-2026-${Math.floor(100 + Math.random() * 900)}`,
    orderType: orderType || 'Room Service',
    targetLocation: targetLocation || 'Room 102',
    items,
    totalAmount: Number(totalAmount || 500),
    status: 'Received',
    createdAt: `Today, ${new Date().toLocaleTimeString()}`
  };

  restaurantOrdersStore.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: `Food order ${newOrder.orderNumber} placed for ${newOrder.targetLocation}!`,
    data: newOrder
  });
});

router.patch('/restaurant/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = restaurantOrdersStore.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.status = status;
  res.json({
    success: true,
    message: `Order ${order.orderNumber} updated to ${status}.`,
    data: order
  });
});

// --- 8. REPORTS & ANALYTICS ---
router.get('/reports', (_req: Request, res: Response) => {
  const totalRooms = roomsStore.length;
  const occupiedRooms = roomsStore.filter(r => r.status === 'Occupied').length;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalRev = paymentsStore.reduce((acc, p) => acc + (p.status !== 'REFUNDED' ? p.amount : 0), 0);
  const totalRefunds = paymentsStore.reduce((acc, p) => acc + (p.refundAmount || 0), 0);
  const totalBookings = bookingsStore.length;
  const cancelledBookings = bookingsStore.filter(b => b.bookingStatus === 'CANCELLED').length;
  const cancellationRatePct = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;

  res.json({
    success: true,
    data: {
      occupancy: {
        occupancyPercentage: occupancyPct,
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        averageDailyRate: 2650,
        revPAR: Math.round((occupancyPct / 100) * 2650)
      },
      revenueExpenses: {
        grossRevenue: totalRev,
        roomRevenue: Math.round(totalRev * 0.85),
        restaurantRevenue: Math.round(totalRev * 0.15),
        operatingExpenses: 0,
        refundsIssued: totalRefunds,
        netProfit: totalRev - totalRefunds
      },
      bookings: {
        totalBookings,
        confirmed: bookingsStore.filter(b => b.bookingStatus === 'CONFIRMED').length,
        checkedIn: bookingsStore.filter(b => b.bookingStatus === 'CHECKED_IN').length,
        checkedOut: bookingsStore.filter(b => b.bookingStatus === 'CHECKED_OUT').length,
        cancelled: cancelledBookings,
        cancellationRate: cancellationRatePct
      },
      staffPerformance: []
    }
  });
});

// --- 9. SETTINGS & HOTEL PROFILE ---
router.get('/settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: hotelProfile
  });
});

router.patch('/settings', (req: Request, res: Response) => {
  hotelProfile = {
    ...hotelProfile,
    ...req.body
  };

  logAudit(
    req.user?.name || 'Hotel Admin',
    'SETTINGS_UPDATED',
    'HotelProfile',
    hotelProfile.id,
    `Updated hotel settings for ${hotelProfile.name}`,
    req.ip
  );

  res.json({
    success: true,
    message: 'Hotel settings & policies updated successfully.',
    data: hotelProfile
  });
});

export default router;
