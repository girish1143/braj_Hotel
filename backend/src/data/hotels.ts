import { Hotel } from '../types';

// Public Stays Catalog - starts empty, populated dynamically when properties are registered
export const brajHotels: Hotel[] = [];

export function getAllHotels(): Hotel[] {
  return brajHotels;
}

export function getHotelByIdOrSlug(idOrSlug: string): Hotel | undefined {
  const query = idOrSlug.toLowerCase();
  return brajHotels.find((h) => h.id.toLowerCase() === query || h.slug.toLowerCase() === query);
}

export function addHotel(data: Partial<Hotel>): Hotel {
  const id = data.id || `prop-${Date.now().toString(36)}`;
  const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `stay-${id}`);

  // Prevent duplicate additions
  const existingIdx = brajHotels.findIndex((h) => h.id === id || h.slug === slug);
  if (existingIdx !== -1) {
    brajHotels[existingIdx] = { ...brajHotels[existingIdx], ...data } as Hotel;
    return brajHotels[existingIdx];
  }

  const destinationSlug = (data.destinationSlug || 'vrindavan') as any;
  const destinationName = data.destinationName || (
    destinationSlug === 'vrindavan' ? 'Vrindavan' :
    destinationSlug === 'mathura' ? 'Mathura' :
    destinationSlug === 'barsana' ? 'Barsana' :
    destinationSlug === 'govardhan' ? 'Govardhan' : 'Braj Dham'
  );

  const newHotel: Hotel = {
    id,
    name: data.name || 'Braj Heritage Guest Stay',
    slug,
    destinationSlug,
    destinationName,
    stayType: data.stayType || 'hotel',
    starRating: data.starRating || 4,
    ratingScore: data.ratingScore || 4.8,
    reviewsCount: data.reviewsCount || 0,
    pricePerNight: Number(data.pricePerNight) || 1500,
    originalPrice: Number(data.originalPrice) || (Number(data.pricePerNight) ? Math.round(Number(data.pricePerNight) * 1.3) : 2000),
    images: data.images && data.images.length > 0 ? data.images : [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop'
    ],
    address: data.address || `Near ${data.nearestLandmark || 'Main Temple'}, ${destinationName}`,
    nearestLandmark: data.nearestLandmark || 'Main Temple',
    distanceToMainTemple: data.distanceToMainTemple || `300m from ${data.nearestLandmark || 'Main Temple'}`,
    landmarkDistances: data.landmarkDistances || [
      { landmark: data.nearestLandmark || 'Main Temple', distanceKm: 0.3, distanceMeters: 300, walkMinutes: 4 }
    ],
    amenities: data.amenities || ['100% Satvik Pure Veg', 'AC & Geyser', 'Free Wi-Fi', 'Temple Darshan Desk'],
    pureSatvikKitchen: data.pureSatvikKitchen !== false,
    templeDarshanAssistance: data.templeDarshanAssistance !== false,
    shortDescription: data.shortDescription || `Peaceful pilgrimage stay near ${data.nearestLandmark || 'temple'} in ${destinationName}.`,
    description: data.description || `Providing clean, pious satvik accommodation for Braj yatra devotees visiting ${destinationName}.`,
    policies: data.policies || {
      checkIn: '12:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Free cancellation up to 24 hours prior'
    },
    rooms: data.rooms || [
      { id: `r-${Date.now()}-1`, name: 'Deluxe Satvik AC Room', pricePerNight: Number(data.pricePerNight) || 1500, capacity: 2, bedType: 'Queen Bed', features: ['AC', 'Geyser', 'Wi-Fi'] }
    ],
    isFeatured: data.isFeatured || false
  };

  brajHotels.unshift(newHotel);
  return newHotel;
}

export function updateHotel(id: string, updates: Partial<Hotel>): Hotel | null {
  const index = brajHotels.findIndex((h) => h.id.toLowerCase() === id.toLowerCase() || h.slug.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;
  brajHotels[index] = { ...brajHotels[index], ...updates };
  return brajHotels[index];
}

export function deleteHotel(id: string): boolean {
  const index = brajHotels.findIndex((h) => h.id.toLowerCase() === id.toLowerCase() || h.slug.toLowerCase() === id.toLowerCase());
  if (index === -1) return false;
  brajHotels.splice(index, 1);
  return true;
}
