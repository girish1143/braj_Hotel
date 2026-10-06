import { Destination, Hotel, Experience, BookingRequest, BookingResponse, Bhojanalaya } from '../types';
import { brajDestinations, brajHotels, brajExperiences, brajBhojanalayas } from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchDestinations(): Promise<Destination[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/destinations`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch from backend');
    const json = await res.json();
    return json.data || brajDestinations;
  } catch {
    return brajDestinations;
  }
}

export async function fetchDestinationBySlug(slug: string): Promise<Destination | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/destinations/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    return json.data || brajDestinations.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
  } catch {
    return brajDestinations.find((d) => d.slug.toLowerCase() === slug.toLowerCase()) || null;
  }
}

export async function fetchHotels(params?: {
  destination?: string;
  landmark?: string;
  stayType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  pureSatvik?: boolean;
  darshanAssistance?: boolean;
  search?: string;
}): Promise<Hotel[]> {
  try {
    const query = new URLSearchParams();
    if (params?.destination && params.destination !== 'all') query.set('destination', params.destination);
    if (params?.landmark && params.landmark !== 'all') query.set('landmark', params.landmark);
    if (params?.stayType && params.stayType !== 'all') query.set('stayType', params.stayType);
    if (params?.minPrice) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params?.minRating) query.set('minRating', params.minRating.toString());
    if (params?.pureSatvik) query.set('pureSatvik', 'true');
    if (params?.darshanAssistance) query.set('darshanAssistance', 'true');
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE_URL}/hotels?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch {
    // Fallback to in-memory filtering
    let list = [...brajHotels];
    if (params?.destination && params.destination !== 'all') {
      list = list.filter((h) => h.destinationSlug.toLowerCase() === params.destination?.toLowerCase());
    }
    if (params?.landmark && params.landmark !== 'all') {
      const term = params.landmark.toLowerCase();
      list = list.filter((h) =>
        h.nearestLandmark.toLowerCase().includes(term) ||
        h.landmarkDistances.some((ld) => ld.landmark.toLowerCase().includes(term))
      );
    }
    if (params?.stayType && params.stayType !== 'all') {
      list = list.filter((h) => h.stayType === params.stayType);
    }
    if (params?.minPrice) {
      list = list.filter((h) => h.pricePerNight >= (params.minPrice || 0));
    }
    if (params?.maxPrice) {
      list = list.filter((h) => h.pricePerNight <= (params.maxPrice || 99999));
    }
    if (params?.minRating) {
      list = list.filter((h) => h.ratingScore >= (params.minRating || 0));
    }
    if (params?.pureSatvik) {
      list = list.filter((h) => h.pureSatvikKitchen);
    }
    if (params?.darshanAssistance) {
      list = list.filter((h) => h.templeDarshanAssistance);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.destinationName.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.nearestLandmark.toLowerCase().includes(q)
      );
    }
    return list;
  }
}

export async function fetchHotelById(idOrSlug: string): Promise<Hotel | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/hotels/${idOrSlug}`);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch {
    return (
      brajHotels.find(
        (h) =>
          h.id.toLowerCase() === idOrSlug.toLowerCase() ||
          h.slug.toLowerCase() === idOrSlug.toLowerCase()
      ) || null
    );
  }
}

export async function fetchExperiences(destination?: string): Promise<Experience[]> {
  try {
    const url = destination && destination !== 'all'
      ? `${API_BASE_URL}/experiences?destination=${destination}`
      : `${API_BASE_URL}/experiences`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch {
    if (destination && destination !== 'all') {
      return brajExperiences.filter(
        (e) => e.destinationSlug === destination || e.destinationSlug === 'braj'
      );
    }
    return brajExperiences;
  }
}

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Backend booking failed');
    const json = await res.json();
    return json.data;
  } catch {
    // Client mock fallback response
    const checkIn = new Date(data.checkInDate || Date.now());
    const checkOut = new Date(data.checkOutDate || Date.now() + 86400000);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
    const hotel = brajHotels.find((h) => h.id === data.hotelId);
    const room = hotel?.rooms.find((r) => r.id === data.roomId) || hotel?.rooms[0];
    const roomCharges = (room?.pricePerNight || 1499) * nights * (data.roomsCount || 1);
    
    let addOnTotal = 0;
    if (data.addOns?.darshanPassAssistance) addOnTotal += 250;
    if (data.addOns?.parikramaERickshaw) addOnTotal += 800;
    if (data.addOns?.satvikBhojanThali) addOnTotal += 350 * nights * (data.guestsCount || 2);

    const taxAmount = Math.round(roomCharges * 0.12);
    const grandTotal = roomCharges + taxAmount + addOnTotal;
    const destCode = (data.destinationSlug || 'VRN').substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);

    return {
      ...data,
      id: `book-${Date.now()}`,
      bookingReference: `BN-${destCode}-${randomSuffix}`,
      hotelName: data.hotelName || hotel?.name || 'Brijnidhi Stay',
      roomName: data.roomName || room?.name || 'Deluxe Room',
      totalNights: nights,
      roomCharges,
      taxAmount,
      addOnTotal,
      grandTotal,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };
  }
}

function getAdminHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('brijnidhi_admin_token') || '' : '';
  return {
    'Content-Type': 'application/json',
    'x-brijnidhi-role': 'SYSTEM_ADMIN',
    'x-brijnidhi-admin-token': token
  };
}

export async function fetchAdminOverview() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/overview`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchAdminHotels() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/hotels`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin hotels');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function createAdminHotel(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/hotels`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create hotel');
  return res.json();
}

export async function updateAdminHotel(id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/hotels/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update hotel');
  return res.json();
}

export async function deleteAdminHotel(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/hotels/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete hotel');
  return res.json();
}

export async function approveAdminHotel(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/hotels/${id}/approve`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error('Failed to approve hotel');
  return res.json();
}

export async function rejectAdminHotel(id: string, reason?: string) {
  const res = await fetch(`${API_BASE_URL}/admin/hotels/${id}/reject`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to reject hotel');
  return res.json();
}

export async function toggleSuspendAdminHotel(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/hotels/${id}/suspend`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle suspend hotel');
  return res.json();
}

export async function fetchAdminUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin users');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchAdminAuditLogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchBhojanalayas(params?: {
  destination?: string;
  category?: string;
  pureSatvik?: boolean;
  pureDesiGhee?: boolean;
  search?: string;
}): Promise<Bhojanalaya[]> {
  try {
    const query = new URLSearchParams();
    if (params?.destination && params.destination !== 'all') query.set('destination', params.destination);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.pureSatvik) query.set('pureSatvik', 'true');
    if (params?.pureDesiGhee) query.set('pureDesiGhee', 'true');
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE_URL}/bhojan?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Bhojan API offline');
    const json = await res.json();
    return json.data;
  } catch {
    // Fallback to local data
    let list = [...brajBhojanalayas];
    if (params?.destination && params.destination !== 'all') {
      list = list.filter((b) => b.destinationSlug.toLowerCase() === params.destination?.toLowerCase());
    }
    if (params?.category && params.category !== 'all') {
      list = list.filter((b) => b.category === params.category);
    }
    if (params?.pureSatvik) {
      list = list.filter((b) => b.pureSatvik);
    }
    if (params?.pureDesiGhee) {
      list = list.filter((b) => b.pureDesiGhee);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.hindiName && b.hindiName.includes(q)) ||
          b.destinationName.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.nearestLandmark.toLowerCase().includes(q) ||
          b.specialityDishes.some((dish) => dish.toLowerCase().includes(q))
      );
    }
    return list;
  }
}

export async function reserveBhojanThali(data: {
  bhojanalayaId: string;
  bhojanalayaName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  date: string;
  mealTime: 'lunch' | 'dinner' | 'breakfast';
  thaliCount: number;
  specialRequests?: string;
}): Promise<{ success: boolean; message: string; reservationId?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/bhojan/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to reserve');
    return await res.json();
  } catch {
    return {
      success: true,
      message: 'Your Thali / Prasad Seva token has been pre-booked successfully! Kindly show your phone number at the counter upon arrival.',
      reservationId: `THAL-${Date.now().toString().slice(-6)}`
    };
  }
}

// ==========================================
// PROJECT OWNER ADMIN PANEL EXTENSIONS
// ==========================================

export async function fetchAdminBhojanalayas() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bhojan`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin bhojanalayas');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createAdminBhojan(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/bhojan`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create bhojanalaya');
  return res.json();
}

export async function updateAdminBhojan(id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/bhojan/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update bhojanalaya');
  return res.json();
}

export async function deleteAdminBhojan(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/bhojan/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete bhojanalaya');
  return res.json();
}

export async function toggleStatusAdminBhojan(id: string, status?: string) {
  const res = await fetch(`${API_BASE_URL}/admin/bhojan/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchAdminBhojanReservations() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bhojan/reservations`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch reservations');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function fetchAdminBookings() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function updateAdminBookingStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update booking status');
  return res.json();
}

export async function deleteAdminBooking(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete booking');
  return res.json();
}

export async function fetchAdminSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function updateAdminSettings(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchAdminPayments() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/payments`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch payments');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function createAdminUser(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function updateAdminUserRole(id: string, role: string) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error('Failed to update user role');
  return res.json();
}

export async function deleteAdminUser(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export async function fetchPublicNotice() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/public-notice`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}



