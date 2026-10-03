import { query, isRdsConnected } from './rds';
import { Hotel, BookingResponse } from '../types';
import { AdminHotelItem } from '../modules/system-admin/systemAdminRoutes';

function parseJson(val: any, fallback: any = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export async function fetchRdsHotels(): Promise<Hotel[] | null> {
  if (!isRdsConnected()) return null;
  try {
    const rows = await query<any[]>(
      `SELECT * FROM hotels WHERE status = 'APPROVED' ORDER BY created_at DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      destinationSlug: r.destination_slug,
      destinationName: r.destination_name,
      stayType: r.stay_type,
      pricePerNight: Number(r.price_per_night),
      originalPrice: Number(r.original_price),
      starRating: r.star_rating,
      ratingScore: Number(r.rating_score),
      reviewsCount: r.reviews_count,
      address: r.address,
      nearestLandmark: r.nearest_landmark,
      distanceToMainTemple: r.distance_to_main_temple,
      landmarkDistances: parseJson(r.landmark_distances, [{ landmark: r.nearest_landmark, distanceKm: 0.3, distanceMeters: 300, walkMinutes: 4 }]),
      amenities: parseJson(r.amenities, ['100% Satvik Pure Veg', 'AC & Geyser', 'Temple Darshan Desk']),
      images: parseJson(r.images, []),
      pureSatvikKitchen: Boolean(r.pure_satvik_kitchen),
      templeDarshanAssistance: Boolean(r.temple_darshan_assistance),
      shortDescription: r.short_description,
      description: r.description,
      policies: parseJson(r.policies, { checkIn: '12:00 PM', checkOut: '11:00 AM', cancellation: 'Free cancellation up to 24 hours prior' }),
      rooms: parseJson(r.rooms, [{ id: `r-${r.id}-1`, name: 'Deluxe Satvik AC Room', pricePerNight: Number(r.price_per_night), capacity: 2, bedType: 'Queen Bed', features: ['AC', 'Geyser', 'Wi-Fi'] }]),
      isFeatured: Boolean(r.is_featured)
    }));
  } catch (err: any) {
    console.error('[AWS RDS] Error fetching hotels:', err.message);
    return null;
  }
}

export async function saveRdsHotel(hotel: Hotel, status: string = 'APPROVED', ownerInfo?: any): Promise<void> {
  if (!isRdsConnected()) return;
  try {
    await query(
      `INSERT INTO hotels (
        id, name, slug, destination_slug, destination_name, stay_type,
        price_per_night, original_price, star_rating, rating_score, reviews_count,
        address, nearest_landmark, distance_to_main_temple, short_description, description,
        pure_satvik_kitchen, temple_darshan_assistance, status, owner_name, owner_email, owner_phone,
        trade_license_no, fssai_license_no, images, amenities, policies, rooms, landmark_distances, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        price_per_night = VALUES(price_per_night),
        status = VALUES(status),
        address = VALUES(address),
        images = VALUES(images),
        amenities = VALUES(amenities),
        rooms = VALUES(rooms)`,
      [
        hotel.id,
        hotel.name,
        hotel.slug,
        hotel.destinationSlug,
        hotel.destinationName,
        hotel.stayType,
        hotel.pricePerNight,
        hotel.originalPrice || Math.round(hotel.pricePerNight * 1.3),
        hotel.starRating || 4,
        hotel.ratingScore || 4.8,
        hotel.reviewsCount || 0,
        hotel.address || `Near ${hotel.nearestLandmark}, ${hotel.destinationName}`,
        hotel.nearestLandmark || 'Main Temple',
        hotel.distanceToMainTemple || '300m',
        hotel.shortDescription || '',
        hotel.description || '',
        hotel.pureSatvikKitchen ? 1 : 0,
        hotel.templeDarshanAssistance ? 1 : 0,
        status,
        ownerInfo?.ownerName || 'Braj Hotelier',
        ownerInfo?.ownerEmail || 'owner@brajstay.com',
        ownerInfo?.ownerPhone || '',
        ownerInfo?.tradeLicenseNo || '',
        ownerInfo?.fssaiLicenseNo || '',
        JSON.stringify(hotel.images || []),
        JSON.stringify(hotel.amenities || []),
        JSON.stringify(hotel.policies || {}),
        JSON.stringify(hotel.rooms || []),
        JSON.stringify(hotel.landmarkDistances || []),
        hotel.isFeatured ? 1 : 0
      ]
    );
  } catch (err: any) {
    console.error('[AWS RDS] Error saving hotel:', err.message);
  }
}

export async function deleteRdsHotel(id: string): Promise<void> {
  if (!isRdsConnected()) return;
  try {
    await query(`DELETE FROM hotels WHERE id = ? OR slug = ?`, [id, id]);
  } catch (err: any) {
    console.error('[AWS RDS] Error deleting hotel:', err.message);
  }
}

export async function saveRdsBooking(booking: BookingResponse): Promise<void> {
  if (!isRdsConnected()) return;
  try {
    await query(
      `INSERT INTO bookings (
        id, booking_reference, hotel_id, hotel_name, room_id, room_name,
        user_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date,
        total_nights, guests_count, rooms_count, special_requests,
        darshan_assistance, parikrama_rickshaw, satvik_thali_meals,
        room_charges, tax_amount, addon_charges, grand_total, booking_status,
        payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id,
        booking.bookingReference,
        booking.hotelId,
        booking.hotelName,
        booking.roomId || null,
        booking.roomName || 'Deluxe Room',
        booking.guestEmail || null,
        booking.guestName,
        booking.guestEmail,
        booking.guestPhone,
        booking.checkInDate,
        booking.checkOutDate,
        booking.totalNights,
        booking.guestsCount || 2,
        booking.roomsCount || 1,
        booking.specialRequests || null,
        booking.addOns?.darshanPassAssistance ? 1 : 0,
        booking.addOns?.parikramaERickshaw ? 1 : 0,
        booking.addOns?.satvikBhojanThali ? 1 : 0,
        booking.roomCharges,
        booking.taxAmount,
        booking.addOnTotal,
        booking.grandTotal,
        booking.status || 'CONFIRMED',
        'PAID',
        'UPI'
      ]
    );
  } catch (err: any) {
    console.error('[AWS RDS] Error saving booking:', err.message);
  }
}

export async function saveRdsOnboarding(submission: AdminHotelItem, rawData: any = {}): Promise<void> {
  if (!isRdsConnected()) return;
  try {
    await query(
      `INSERT INTO onboarding_submissions (
        id, hotel_name, slug, destination_slug, destination_name, stay_type,
        base_price, owner_name, owner_email, owner_phone, nearest_landmark,
        address, trade_license_no, fssai_license_no, pure_satvik_kitchen,
        temple_darshan_assistance, documents_verified, status, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        documents_verified = VALUES(documents_verified)`,
      [
        submission.id,
        submission.name,
        submission.slug,
        submission.destinationSlug,
        submission.destinationName,
        submission.stayType,
        submission.pricePerNight,
        submission.ownerName,
        submission.ownerEmail,
        submission.ownerPhone || '',
        submission.nearestLandmark || '',
        submission.address || '',
        submission.tradeLicenseNo || '',
        submission.fssaiLicenseNo || '',
        submission.pureSatvikKitchen ? 1 : 0,
        submission.templeDarshanAssistance ? 1 : 0,
        submission.documentsVerified ? 1 : 0,
        submission.status,
        JSON.stringify(rawData)
      ]
    );
  } catch (err: any) {
    console.error('[AWS RDS] Error saving onboarding:', err.message);
  }
}
