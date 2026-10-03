export type StayType = 'hotel' | 'dharamshala' | 'guesthouse' | 'ashram' | 'haveli';

export interface LandmarkProximity {
  landmark: string;
  distanceKm: number;
  distanceMeters: number;
  walkMinutes: number;
}

export interface RoomOption {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  features: string[];
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  destinationSlug: 'mathura' | 'vrindavan' | 'barsana' | 'govardhan';
  destinationName: string;
  stayType: StayType;
  starRating: number;
  ratingScore: number;
  reviewsCount: number;
  pricePerNight: number;
  originalPrice: number;
  images: string[];
  address: string;
  nearestLandmark: string;
  distanceToMainTemple: string;
  landmarkDistances: LandmarkProximity[];
  amenities: string[];
  pureSatvikKitchen: boolean;
  templeDarshanAssistance: boolean;
  shortDescription: string;
  description: string;
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  rooms: RoomOption[];
  isFeatured?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  slug: 'mathura' | 'vrindavan' | 'barsana' | 'govardhan';
  hindiName: string;
  tagline: string;
  shortOverview: string;
  description: string;
  image: string;
  heroImage: string;
  videoUrl?: string;
  videoScenes?: {
    id: string;
    title: string;
    videoUrl: string;
    description: string;
  }[];
  landmarks: {
    name: string;
    distanceInfo: string;
    description: string;
    aartiTimings?: string;
  }[];
  popularStaysCount: number;
  spiritualSignificance: string;
  bestTimeToVisit: string;
}

export interface Experience {
  id: string;
  title: string;
  category: 'Darshan' | 'Parikrama' | 'Ghat & Boat' | 'Prasad & Food' | 'Spiritual Walk';
  destinationSlug: 'mathura' | 'vrindavan' | 'barsana' | 'govardhan' | 'braj';
  destinationName: string;
  duration: string;
  timings: string;
  description: string;
  image: string;
  highlights: string[];
  tips: string[];
}

export interface BookingRequest {
  hotelId: string;
  hotelName: string;
  destinationSlug: string;
  roomId: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  roomsCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  addOns?: {
    darshanPassAssistance?: boolean;
    parikramaERickshaw?: boolean;
    satvikBhojanThali?: boolean;
  };
}

export interface BookingResponse extends BookingRequest {
  id: string;
  bookingReference: string;
  totalNights: number;
  roomCharges: number;
  taxAmount: number;
  addOnTotal: number;
  grandTotal: number;
  status: 'CONFIRMED' | 'PENDING';
  createdAt: string;
}
