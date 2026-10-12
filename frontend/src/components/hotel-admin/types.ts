export type RoomStatus = 'CLEAN' | 'OCCUPIED' | 'DIRTY' | 'BLOCKED';

export interface PMSRoom {
  id: string;
  roomNumber: string;
  floor: number;
  category: 'Standard AC' | 'Deluxe AC' | 'Executive Suite' | 'Family Dham Suite';
  basePrice: number;
  status: RoomStatus;
  currentBookingId?: string;
  guestName?: string;
  cleanerAssigned?: string;
  isEmergencyLocked: boolean;
  lockReason?: string;
  tags: string[]; // e.g., ['Ground Floor', 'Temple View', 'Quiet Wing', 'Balcony']
  lastCleanedAt?: string;
  inspectionPhoto?: string;
}

export interface PMSBooking {
  id: string;
  bookingReference: string;
  customer: string;
  phone: string;
  idProofType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License';
  idProofNumber: string;
  guestCity: string;
  roomId: string;
  roomNumber: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  roomRate: number;
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  specialRequests?: string;
  ocrExtracted?: boolean;
}

export interface FolioItem {
  id: string;
  bookingId: string;
  roomNumber: string;
  description: string;
  category: 'ROOM_CHARGE' | 'RESTAURANT' | 'LAUNDRY' | 'DARSHAN_PASS' | 'TRANSPORT' | 'TAX' | 'DISCOUNT';
  amount: number;
  timestamp: string;
  paid: boolean;
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  floor: number;
  dispatchedAt: string;
  completedAt?: string;
  assignedStaff: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PHOTO_SUBMITTED' | 'INSPECTED_CLEAN';
  checklist: {
    linenBedding: boolean;
    bathroomSanitized: boolean;
    satvikAmenities: boolean;
    acGeyserInspected: boolean;
    floorCleaned: boolean;
  };
  photoEvidence?: string;
  notes?: string;
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  category: 'AC / Climate' | 'Plumbing / Geyser' | 'Electrical' | 'Locks / Keycard' | 'Carpentry';
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  reportedAt: string;
  assignedTechnician: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface ShiftCashRecord {
  operatorId: string;
  operatorName: string;
  shiftType: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night Audit (22:00 - 06:00)';
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  cashCollections: number;
  digitalCollections: number;
  cashPayouts: number;
  actualDrawerCount: number;
  discrepancy: number;
  isClosed: boolean;
  notes?: string;
}

export interface OperatorSession {
  id: string;
  pin: string;
  name: string;
  role: 'Desk Lead' | 'Front Desk Agent' | 'Night Auditor' | 'Duty Manager';
  shift: string;
}

export interface AuditActionLog {
  id: string;
  timestamp: string;
  operatorName: string;
  action: string;
  module: 'Front Desk' | 'Tape Chart' | 'Housekeeping' | 'POS & Billing' | 'Shift Balance';
  details: string;
}
