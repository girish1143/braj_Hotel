import { Router, Request, Response } from 'express';
import { BookingRequest, BookingResponse } from '../types';
import { brajHotels } from '../data/hotels';

const router = Router();

// In-memory store for bookings
const bookingsStore: BookingResponse[] = [];

// POST create a new pilgrimage stay booking
router.post('/', (req: Request, res: Response) => {
  try {
    const body: BookingRequest = req.body;

    if (!body.hotelId || !body.guestName || !body.guestPhone || !body.checkInDate || !body.checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking details (hotelId, guestName, guestPhone, checkInDate, checkOutDate)'
      });
    }

    const hotel = brajHotels.find((h) => h.id === body.hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `Hotel with ID ${body.hotelId} not found`
      });
    }

    const room = hotel.rooms.find((r) => r.id === body.roomId) || hotel.rooms[0];

    // Calculate dates & duration
    const checkIn = new Date(body.checkInDate);
    const checkOut = new Date(body.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const roomsCount = body.roomsCount || 1;
    const roomCharges = room.pricePerNight * nights * roomsCount;

    // Add-on charges
    let addOnTotal = 0;
    if (body.addOns?.darshanPassAssistance) addOnTotal += 250;
    if (body.addOns?.parikramaERickshaw) addOnTotal += 800;
    if (body.addOns?.satvikBhojanThali) addOnTotal += 350 * nights * (body.guestsCount || 2);

    const taxAmount = Math.round(roomCharges * 0.12); // 12% GST
    const grandTotal = roomCharges + taxAmount + addOnTotal;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const destCode = hotel.destinationSlug.substring(0, 3).toUpperCase();
    const bookingReference = `BN-${destCode}-${randomSuffix}`;

    const newBooking: BookingResponse = {
      ...body,
      id: `book-${Date.now()}`,
      bookingReference,
      hotelName: hotel.name,
      roomName: room.name,
      totalNights: nights,
      roomCharges,
      taxAmount,
      addOnTotal,
      grandTotal,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    bookingsStore.push(newBooking);

    return res.status(201).json({
      success: true,
      message: 'Radhe Radhe! Your pilgrimage stay has been confirmed successfully.',
      data: newBooking
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing booking request',
      error: (error as Error).message
    });
  }
});

// GET booking by reference or ID
router.get('/:referenceOrId', (req: Request, res: Response) => {
  const { referenceOrId } = req.params;
  const booking = bookingsStore.find(
    (b) =>
      b.id === referenceOrId ||
      b.bookingReference.toLowerCase() === referenceOrId.toLowerCase()
  );

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: `Booking '${referenceOrId}' not found`
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

export default router;
