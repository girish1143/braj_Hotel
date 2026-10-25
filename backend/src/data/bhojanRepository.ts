import fs from 'fs';
import path from 'path';
import { Bhojanalaya, BhojanMenuItem, BhojanReservation, BhojanReview } from '../types';

const STORE_PATH = path.join(__dirname, 'bhojanStore.json');

interface BhojanStoreSchema {
  bhojanalayas: Bhojanalaya[];
  reservations: BhojanReservation[];
  menuItems: BhojanMenuItem[];
  reviews: BhojanReview[];
}

let localStore: BhojanStoreSchema = {
  bhojanalayas: [],
  reservations: [],
  menuItems: [],
  reviews: []
};

function loadLocalStore(): void {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      localStore = JSON.parse(raw);
    }
  } catch (err: any) {
    console.warn('[BhojanStore] Error reading file store:', err.message);
  }
}

function persistLocalStore(): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[BhojanStore] Error writing file store:', err.message);
  }
}

// Initialize on module load
loadLocalStore();

// ==========================================
// BHOJANALAYAS CRUD
// ==========================================

export async function getBhojanalayas(filters?: {
  destination?: string;
  category?: string;
  pureSatvik?: boolean;
  pureDesiGhee?: boolean;
  search?: string;
  status?: string;
}): Promise<Bhojanalaya[]> {
  const reqStatus = filters?.status || 'APPROVED';

  let list = [...localStore.bhojanalayas];
  if (reqStatus !== 'ALL') {
    list = list.filter((b) => (b.status || 'APPROVED') === reqStatus);
  }
  if (filters?.destination && filters.destination !== 'all') {
    list = list.filter((b) => b.destinationSlug.toLowerCase() === filters.destination?.toLowerCase());
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter((b) => b.category === filters.category);
  }
  if (filters?.pureSatvik) {
    list = list.filter((b) => b.pureSatvik);
  }
  if (filters?.pureDesiGhee) {
    list = list.filter((b) => b.pureDesiGhee);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
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

export async function getBhojanalayaByIdOrSlug(idOrSlug: string): Promise<Bhojanalaya | null> {
  const norm = idOrSlug.toLowerCase();
  return (
    localStore.bhojanalayas.find(
      (b) => b.id.toLowerCase() === norm || b.slug.toLowerCase() === norm
    ) || null
  );
}

export async function saveBhojanalaya(bhojanalaya: Bhojanalaya): Promise<Bhojanalaya> {
  const idx = localStore.bhojanalayas.findIndex((b) => b.id === bhojanalaya.id);
  if (idx >= 0) {
    localStore.bhojanalayas[idx] = { ...bhojanalaya, updatedAt: new Date().toISOString() };
  } else {
    localStore.bhojanalayas.push({
      ...bhojanalaya,
      createdAt: bhojanalaya.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  persistLocalStore();
  return bhojanalaya;
}

export async function deleteBhojanalaya(id: string): Promise<boolean> {
  const initialLen = localStore.bhojanalayas.length;
  localStore.bhojanalayas = localStore.bhojanalayas.filter((b) => b.id !== id);
  persistLocalStore();
  return localStore.bhojanalayas.length < initialLen;
}

// ==========================================
// RESERVATIONS & SEVA TOKENS
// ==========================================

export async function saveReservation(reservation: BhojanReservation): Promise<BhojanReservation> {
  localStore.reservations.unshift(reservation);
  persistLocalStore();
  return reservation;
}

export async function getReservationByRef(ref: string): Promise<BhojanReservation | null> {
  return (
    localStore.reservations.find(
      (r) =>
        r.reservationReference.toLowerCase() === ref.toLowerCase() ||
        r.id.toLowerCase() === ref.toLowerCase()
    ) || null
  );
}

export async function getAllReservations(bhojanalayaId?: string): Promise<BhojanReservation[]> {
  if (bhojanalayaId) {
    return localStore.reservations.filter((r) => r.bhojanalayaId === bhojanalayaId);
  }
  return localStore.reservations;
}

export async function cancelReservation(refOrId: string): Promise<boolean> {
  const res = localStore.reservations.find(
    (r) => r.reservationReference === refOrId || r.id === refOrId
  );
  if (res) {
    res.status = 'CANCELLED';
    persistLocalStore();
    return true;
  }
  return false;
}

// ==========================================
// MENU ITEMS
// ==========================================

export async function getMenuItems(bhojanalayaId: string): Promise<BhojanMenuItem[]> {
  return localStore.menuItems.filter((m) => m.bhojanalayaId === bhojanalayaId && m.isAvailable);
}

export async function saveMenuItem(item: BhojanMenuItem): Promise<BhojanMenuItem> {
  const idx = localStore.menuItems.findIndex((m) => m.id === item.id);
  if (idx >= 0) {
    localStore.menuItems[idx] = item;
  } else {
    localStore.menuItems.push(item);
  }
  persistLocalStore();
  return item;
}

// ==========================================
// REVIEWS
// ==========================================

export async function getReviews(bhojanalayaId: string): Promise<BhojanReview[]> {
  return localStore.reviews.filter((r) => r.bhojanalayaId === bhojanalayaId);
}

export async function saveReview(review: BhojanReview): Promise<BhojanReview> {
  localStore.reviews.unshift(review);

  // Recalculate rating in local store
  const bReviews = localStore.reviews.filter((r) => r.bhojanalayaId === review.bhojanalayaId);
  const targetB = localStore.bhojanalayas.find((b) => b.id === review.bhojanalayaId);
  if (targetB) {
    targetB.reviewsCount = bReviews.length;
    const avg = bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length;
    targetB.ratingScore = Number(avg.toFixed(1));
  }

  persistLocalStore();
  return review;
}

// ==========================================
// SYSTEM STATS
// ==========================================

export async function getBhojanStats() {
  const allB = await getBhojanalayas({ status: 'ALL' });
  const allR = await getAllReservations();

  return {
    totalBhojanalayas: allB.length,
    approvedBhojanalayas: allB.filter((b) => b.status === 'APPROVED' || !b.status).length,
    pendingBhojanalayas: allB.filter((b) => b.status === 'SUBMITTED' || b.status === 'UNDER_REVIEW').length,
    totalReservations: allR.length,
    confirmedReservations: allR.filter((r) => r.status === 'CONFIRMED').length,
    destinationsRepresented: Array.from(new Set(allB.map((b) => b.destinationSlug))).length
  };
}
