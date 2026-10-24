import fs from 'fs';
import path from 'path';
import { query, isDbConnected } from '../db/mysql';
import { Bhojanalaya, BhojanMenuItem, BhojanReservation, BhojanReview } from '../types';

const STORE_PATH = fs.existsSync(path.join(__dirname, 'bhojanStore.json'))
  ? path.join(__dirname, 'bhojanStore.json')
  : path.resolve(process.cwd(), 'src', 'data', 'bhojanStore.json');

interface BhojanStoreSchema {
  bhojanalayas: Bhojanalaya[];
  reservations: BhojanReservation[];
  menuItems: BhojanMenuItem[];
  reviews: BhojanReview[];
}

function parseJson(val: any, fallback: any = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// In-memory store initialized from disk file if exists
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

  if (isDbConnected()) {
    try {
      let sql = `SELECT * FROM bhojanalayas WHERE 1=1`;
      const params: any[] = [];

      if (reqStatus !== 'ALL') {
        sql += ` AND status = ?`;
        params.push(reqStatus);
      }
      if (filters?.destination && filters.destination !== 'all') {
        sql += ` AND destination_slug = ?`;
        params.push(filters.destination.toLowerCase());
      }
      if (filters?.category && filters.category !== 'all') {
        sql += ` AND category = ?`;
        params.push(filters.category);
      }
      if (filters?.pureSatvik) {
        sql += ` AND pure_satvik = 1`;
      }
      if (filters?.pureDesiGhee) {
        sql += ` AND pure_desi_ghee = 1`;
      }

      sql += ` ORDER BY is_featured DESC, rating_score DESC, created_at DESC`;

      const rows = await query<any[]>(sql, params);
      let results: Bhojanalaya[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        hindiName: r.hindi_name,
        slug: r.slug,
        destinationSlug: r.destination_slug,
        destinationName: r.destination_name,
        category: r.category,
        categoryName: r.category_name,
        ratingScore: Number(r.rating_score),
        reviewsCount: r.reviews_count,
        priceRange: r.price_range,
        avgCostForTwo: r.avg_cost_for_two,
        address: r.address,
        nearestLandmark: r.nearest_landmark,
        distanceToLandmark: r.distance_to_landmark,
        walkMinutes: r.walk_minutes,
        timings: r.timings,
        pureSatvik: Boolean(r.pure_satvik),
        pureDesiGhee: Boolean(r.pure_desi_ghee),
        specialityDishes: parseJson(r.speciality_dishes, []),
        images: parseJson(r.images, []),
        description: r.description,
        features: parseJson(r.features, []),
        contactPhone: r.contact_phone,
        ownerName: r.owner_name,
        ownerEmail: r.owner_email,
        fssaiLicenseNo: r.fssai_license_no,
        status: r.status,
        isFeatured: Boolean(r.is_featured),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            (b.hindiName && b.hindiName.includes(q)) ||
            b.nearestLandmark.toLowerCase().includes(q) ||
            b.specialityDishes.some((dish) => dish.toLowerCase().includes(q))
        );
      }
      return results;
    } catch (err: any) {
      console.warn('[MySQL] Failed to fetch bhojanalayas from MySQL, using local store:', err.message);
    }
  }

  // Fallback to local store
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

  if (isDbConnected()) {
    try {
      const rows = await query<any[]>(
        `SELECT * FROM bhojanalayas WHERE LOWER(id) = ? OR LOWER(slug) = ? LIMIT 1`,
        [norm, norm]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          hindiName: r.hindi_name,
          slug: r.slug,
          destinationSlug: r.destination_slug,
          destinationName: r.destination_name,
          category: r.category,
          categoryName: r.category_name,
          ratingScore: Number(r.rating_score),
          reviewsCount: r.reviews_count,
          priceRange: r.price_range,
          avgCostForTwo: r.avg_cost_for_two,
          address: r.address,
          nearestLandmark: r.nearest_landmark,
          distanceToLandmark: r.distance_to_landmark,
          walkMinutes: r.walk_minutes,
          timings: r.timings,
          pureSatvik: Boolean(r.pure_satvik),
          pureDesiGhee: Boolean(r.pure_desi_ghee),
          specialityDishes: parseJson(r.speciality_dishes, []),
          images: parseJson(r.images, []),
          description: r.description,
          features: parseJson(r.features, []),
          contactPhone: r.contact_phone,
          ownerName: r.owner_name,
          ownerEmail: r.owner_email,
          fssaiLicenseNo: r.fssai_license_no,
          status: r.status,
          isFeatured: Boolean(r.is_featured),
          createdAt: r.created_at,
          updatedAt: r.updated_at
        };
      }
    } catch (err: any) {
      console.warn('[MySQL] Failed to fetch bhojanalaya by slug from MySQL:', err.message);
    }
  }

  return (
    localStore.bhojanalayas.find(
      (b) => b.id.toLowerCase() === norm || b.slug.toLowerCase() === norm
    ) || null
  );
}

export async function saveBhojanalaya(bhojanalaya: Bhojanalaya): Promise<Bhojanalaya> {
  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO bhojanalayas (
          id, name, hindi_name, slug, destination_slug, destination_name,
          category, category_name, rating_score, reviews_count, price_range,
          avg_cost_for_two, address, nearest_landmark, distance_to_landmark,
          walk_minutes, timings, pure_satvik, pure_desi_ghee, speciality_dishes,
          images, description, features, contact_phone, owner_name, owner_email,
          fssai_license_no, status, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name), hindi_name=VALUES(hindi_name), category=VALUES(category),
          rating_score=VALUES(rating_score), reviews_count=VALUES(reviews_count),
          price_range=VALUES(price_range), avg_cost_for_two=VALUES(avg_cost_for_two),
          address=VALUES(address), nearest_landmark=VALUES(nearest_landmark),
          distance_to_landmark=VALUES(distance_to_landmark), walk_minutes=VALUES(walk_minutes),
          timings=VALUES(timings), pure_satvik=VALUES(pure_satvik), pure_desi_ghee=VALUES(pure_desi_ghee),
          speciality_dishes=VALUES(speciality_dishes), images=VALUES(images), description=VALUES(description),
          features=VALUES(features), contact_phone=VALUES(contact_phone), status=VALUES(status)`,
        [
          bhojanalaya.id,
          bhojanalaya.name,
          bhojanalaya.hindiName || null,
          bhojanalaya.slug,
          bhojanalaya.destinationSlug,
          bhojanalaya.destinationName,
          bhojanalaya.category,
          bhojanalaya.categoryName,
          bhojanalaya.ratingScore || 5.0,
          bhojanalaya.reviewsCount || 0,
          bhojanalaya.priceRange || '₹100 - ₹300',
          bhojanalaya.avgCostForTwo || 300,
          bhojanalaya.address,
          bhojanalaya.nearestLandmark,
          bhojanalaya.distanceToLandmark || 'Near Temple',
          bhojanalaya.walkMinutes || 5,
          bhojanalaya.timings,
          bhojanalaya.pureSatvik ? 1 : 0,
          bhojanalaya.pureDesiGhee ? 1 : 0,
          JSON.stringify(bhojanalaya.specialityDishes || []),
          JSON.stringify(bhojanalaya.images || []),
          bhojanalaya.description || '',
          JSON.stringify(bhojanalaya.features || []),
          bhojanalaya.contactPhone || null,
          bhojanalaya.ownerName || null,
          bhojanalaya.ownerEmail || null,
          bhojanalaya.fssaiLicenseNo || null,
          bhojanalaya.status || 'APPROVED',
          bhojanalaya.isFeatured ? 1 : 0
        ]
      );
    } catch (err: any) {
      console.warn('[MySQL] Failed to save bhojanalaya to MySQL:', err.message);
    }
  }

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
  if (isDbConnected()) {
    try {
      await query(`DELETE FROM bhojanalayas WHERE id = ?`, [id]);
    } catch (err: any) {
      console.warn('[MySQL] Error deleting bhojanalaya from MySQL:', err.message);
    }
  }

  const initialLen = localStore.bhojanalayas.length;
  localStore.bhojanalayas = localStore.bhojanalayas.filter((b) => b.id !== id);
  persistLocalStore();
  return localStore.bhojanalayas.length < initialLen;
}

// ==========================================
// RESERVATIONS & SEVA TOKENS
// ==========================================

export async function saveReservation(reservation: BhojanReservation): Promise<BhojanReservation> {
  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO bhojan_reservations (
          id, reservation_reference, bhojanalaya_id, bhojanalaya_name,
          guest_name, guest_phone, guest_email, reservation_date,
          meal_time, thali_count, special_requests, token_number, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reservation.id,
          reservation.reservationReference,
          reservation.bhojanalayaId,
          reservation.bhojanalayaName,
          reservation.guestName,
          reservation.guestPhone,
          reservation.guestEmail || null,
          reservation.date,
          reservation.mealTime,
          reservation.thaliCount,
          reservation.specialRequests || null,
          reservation.tokenNumber,
          reservation.status
        ]
      );
    } catch (err: any) {
      console.warn('[MySQL] Failed to save reservation to MySQL:', err.message);
    }
  }

  localStore.reservations.unshift(reservation);
  persistLocalStore();
  return reservation;
}

export async function getReservationByRef(ref: string): Promise<BhojanReservation | null> {
  if (isDbConnected()) {
    try {
      const rows = await query<any[]>(
        `SELECT * FROM bhojan_reservations WHERE reservation_reference = ? OR id = ? LIMIT 1`,
        [ref, ref]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          reservationReference: r.reservation_reference,
          bhojanalayaId: r.bhojanalaya_id,
          bhojanalayaName: r.bhojanalaya_name,
          guestName: r.guest_name,
          guestPhone: r.guest_phone,
          guestEmail: r.guest_email,
          date: r.reservation_date ? String(r.reservation_date).split('T')[0] : '',
          mealTime: r.meal_time,
          thaliCount: r.thali_count,
          specialRequests: r.special_requests,
          status: r.status,
          tokenNumber: r.token_number,
          createdAt: r.created_at
        };
      }
    } catch (err: any) {
      console.warn('[MySQL] Error querying reservation by ref:', err.message);
    }
  }

  return (
    localStore.reservations.find(
      (r) =>
        r.reservationReference.toLowerCase() === ref.toLowerCase() ||
        r.id.toLowerCase() === ref.toLowerCase()
    ) || null
  );
}

export async function getAllReservations(bhojanalayaId?: string): Promise<BhojanReservation[]> {
  if (isDbConnected()) {
    try {
      let sql = `SELECT * FROM bhojan_reservations`;
      const params: any[] = [];
      if (bhojanalayaId) {
        sql += ` WHERE bhojanalaya_id = ?`;
        params.push(bhojanalayaId);
      }
      sql += ` ORDER BY created_at DESC`;
      const rows = await query<any[]>(sql, params);
      return rows.map((r) => ({
        id: r.id,
        reservationReference: r.reservation_reference,
        bhojanalayaId: r.bhojanalaya_id,
        bhojanalayaName: r.bhojanalaya_name,
        guestName: r.guest_name,
        guestPhone: r.guest_phone,
        guestEmail: r.guest_email,
        date: r.reservation_date ? String(r.reservation_date).split('T')[0] : '',
        mealTime: r.meal_time,
        thaliCount: r.thali_count,
        specialRequests: r.special_requests,
        status: r.status,
        tokenNumber: r.token_number,
        createdAt: r.created_at
      }));
    } catch (err: any) {
      console.warn('[MySQL] Error querying all reservations:', err.message);
    }
  }

  if (bhojanalayaId) {
    return localStore.reservations.filter((r) => r.bhojanalayaId === bhojanalayaId);
  }
  return localStore.reservations;
}

export async function cancelReservation(refOrId: string): Promise<boolean> {
  if (isDbConnected()) {
    try {
      await query(
        `UPDATE bhojan_reservations SET status = 'CANCELLED' WHERE reservation_reference = ? OR id = ?`,
        [refOrId, refOrId]
      );
    } catch (err: any) {
      console.warn('[MySQL] Error cancelling reservation:', err.message);
    }
  }

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
  if (isDbConnected()) {
    try {
      const rows = await query<any[]>(
        `SELECT * FROM bhojan_menu_items WHERE bhojanalaya_id = ? AND is_available = 1 ORDER BY category, price ASC`,
        [bhojanalayaId]
      );
      return rows.map((r) => ({
        id: r.id,
        bhojanalayaId: r.bhojanalaya_id,
        name: r.name,
        hindiName: r.hindi_name,
        category: r.category,
        price: Number(r.price),
        description: r.description,
        pureDesiGhee: Boolean(r.pure_desi_ghee),
        isSpeciality: Boolean(r.is_speciality),
        isAvailable: Boolean(r.is_available),
        imageUrl: r.image_url
      }));
    } catch (err: any) {
      console.warn('[MySQL] Error fetching menu items:', err.message);
    }
  }

  return localStore.menuItems.filter((m) => m.bhojanalayaId === bhojanalayaId && m.isAvailable);
}

export async function saveMenuItem(item: BhojanMenuItem): Promise<BhojanMenuItem> {
  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO bhojan_menu_items (
          id, bhojanalaya_id, name, hindi_name, category, price,
          description, pure_desi_ghee, is_speciality, is_available, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name), hindi_name=VALUES(hindi_name), category=VALUES(category),
          price=VALUES(price), description=VALUES(description), pure_desi_ghee=VALUES(pure_desi_ghee),
          is_speciality=VALUES(is_speciality), is_available=VALUES(is_available), image_url=VALUES(image_url)`,
        [
          item.id,
          item.bhojanalayaId,
          item.name,
          item.hindiName || null,
          item.category,
          item.price,
          item.description || null,
          item.pureDesiGhee ? 1 : 0,
          item.isSpeciality ? 1 : 0,
          item.isAvailable ? 1 : 0,
          item.imageUrl || null
        ]
      );
    } catch (err: any) {
      console.warn('[MySQL] Error saving menu item:', err.message);
    }
  }

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
  if (isDbConnected()) {
    try {
      const rows = await query<any[]>(
        `SELECT * FROM bhojan_reviews WHERE bhojanalaya_id = ? ORDER BY created_at DESC`,
        [bhojanalayaId]
      );
      return rows.map((r) => ({
        id: r.id,
        bhojanalayaId: r.bhojanalaya_id,
        authorName: r.author_name,
        authorCity: r.author_city,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        darshanExperience: r.darshan_experience,
        createdAt: r.created_at
      }));
    } catch (err: any) {
      console.warn('[MySQL] Error fetching reviews:', err.message);
    }
  }

  return localStore.reviews.filter((r) => r.bhojanalayaId === bhojanalayaId);
}

export async function saveReview(review: BhojanReview): Promise<BhojanReview> {
  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO bhojan_reviews (
          id, bhojanalaya_id, author_name, author_city, rating, title, comment, darshan_experience
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          review.id,
          review.bhojanalayaId,
          review.authorName,
          review.authorCity || null,
          review.rating,
          review.title || null,
          review.comment,
          review.darshanExperience || null
        ]
      );
      // Recalculate average rating on MySQL
      await query(
        `UPDATE bhojanalayas SET
          rating_score = (SELECT ROUND(AVG(rating), 1) FROM bhojan_reviews WHERE bhojanalaya_id = ?),
          reviews_count = (SELECT COUNT(*) FROM bhojan_reviews WHERE bhojanalaya_id = ?)
         WHERE id = ?`,
        [review.bhojanalayaId, review.bhojanalayaId, review.bhojanalayaId]
      );
    } catch (err: any) {
      console.warn('[MySQL] Error saving review:', err.message);
    }
  }

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
