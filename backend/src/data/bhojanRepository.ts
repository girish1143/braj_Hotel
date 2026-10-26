import fs from 'fs';
import path from 'path';
import { getDb } from '../db/sqlite';
import { Bhojanalaya, BhojanMenuItem, BhojanReservation, BhojanReview } from '../types';

const STORE_PATH = path.join(__dirname, 'bhojanStore.json');

function parseJson(val: any, fallback: any = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Seed initial bhojanalayas from bhojanStore.json if SQLite table is empty
function seedFromLocalStoreIfEmpty() {
  try {
    const db = getDb();
    const countRow = db.prepare('SELECT COUNT(*) as count FROM bhojanalayas').get() as { count: number };
    if (countRow.count > 0) return;

    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.bhojanalayas) && data.bhojanalayas.length > 0) {
        for (const b of data.bhojanalayas) {
          saveBhojanalaya(b);
        }
      }
      if (Array.isArray(data.menuItems) && data.menuItems.length > 0) {
        for (const m of data.menuItems) {
          saveMenuItem(m);
        }
      }
      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        for (const r of data.reviews) {
          saveReview(r);
        }
      }
      if (Array.isArray(data.reservations) && data.reservations.length > 0) {
        for (const res of data.reservations) {
          saveReservation(res);
        }
      }
      console.log('🌱 [SQLite] Seeded bhojan data from bhojanStore.json into SQLite.');
    }
  } catch (err: any) {
    console.warn('[BhojanRepository] Migration note:', err.message);
  }
}

seedFromLocalStoreIfEmpty();

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
  const db = getDb();
  const reqStatus = filters?.status || 'APPROVED';

  let sql = 'SELECT * FROM bhojanalayas WHERE 1=1';
  const params: any[] = [];

  if (reqStatus !== 'ALL') {
    sql += ' AND status = ?';
    params.push(reqStatus);
  }
  if (filters?.destination && filters.destination !== 'all') {
    sql += ' AND destination_slug = ?';
    params.push(filters.destination.toLowerCase());
  }
  if (filters?.category && filters.category !== 'all') {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters?.pureSatvik) {
    sql += ' AND pure_satvik = 1';
  }
  if (filters?.pureDesiGhee) {
    sql += ' AND pure_desi_ghee = 1';
  }

  sql += ' ORDER BY is_featured DESC, rating_score DESC, created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];

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
        b.destinationName.toLowerCase().includes(q) ||
        b.nearestLandmark.toLowerCase().includes(q) ||
        b.specialityDishes.some((dish) => dish.toLowerCase().includes(q))
    );
  }

  return results;
}

export async function getBhojanalayaByIdOrSlug(idOrSlug: string): Promise<Bhojanalaya | null> {
  const norm = idOrSlug.toLowerCase();
  const db = getDb();
  const r = db.prepare('SELECT * FROM bhojanalayas WHERE LOWER(id) = ? OR LOWER(slug) = ? LIMIT 1').get(norm, norm) as any;

  if (!r) return null;

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

export async function saveBhojanalaya(b: Bhojanalaya): Promise<Bhojanalaya> {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO bhojanalayas (
      id, name, hindi_name, slug, destination_slug, destination_name,
      category, category_name, rating_score, reviews_count, price_range,
      avg_cost_for_two, address, nearest_landmark, distance_to_landmark,
      walk_minutes, timings, pure_satvik, pure_desi_ghee, speciality_dishes,
      images, description, features, contact_phone, owner_name, owner_email,
      fssai_license_no, status, is_featured, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, hindi_name=excluded.hindi_name, slug=excluded.slug,
      destination_slug=excluded.destination_slug, destination_name=excluded.destination_name,
      category=excluded.category, category_name=excluded.category_name,
      rating_score=excluded.rating_score, reviews_count=excluded.reviews_count,
      price_range=excluded.price_range, avg_cost_for_two=excluded.avg_cost_for_two,
      address=excluded.address, nearest_landmark=excluded.nearest_landmark,
      distance_to_landmark=excluded.distance_to_landmark, walk_minutes=excluded.walk_minutes,
      timings=excluded.timings, pure_satvik=excluded.pure_satvik, pure_desi_ghee=excluded.pure_desi_ghee,
      speciality_dishes=excluded.speciality_dishes, images=excluded.images,
      description=excluded.description, features=excluded.features,
      contact_phone=excluded.contact_phone, owner_name=excluded.owner_name,
      owner_email=excluded.owner_email, fssai_license_no=excluded.fssai_license_no,
      status=excluded.status, is_featured=excluded.is_featured, updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    b.id,
    b.name,
    b.hindiName || null,
    b.slug,
    b.destinationSlug,
    b.destinationName,
    b.category,
    b.categoryName,
    b.ratingScore || 5.0,
    b.reviewsCount || 0,
    b.priceRange || '₹100 - ₹300',
    b.avgCostForTwo || 300,
    b.address,
    b.nearestLandmark,
    b.distanceToLandmark || 'Near Temple',
    b.walkMinutes || 5,
    b.timings,
    b.pureSatvik ? 1 : 0,
    b.pureDesiGhee ? 1 : 0,
    JSON.stringify(b.specialityDishes || []),
    JSON.stringify(b.images || []),
    b.description || '',
    JSON.stringify(b.features || []),
    b.contactPhone || null,
    b.ownerName || null,
    b.ownerEmail || null,
    b.fssaiLicenseNo || null,
    b.status || 'APPROVED',
    b.isFeatured ? 1 : 0
  );

  return b;
}

export async function deleteBhojanalaya(id: string): Promise<boolean> {
  const db = getDb();
  const res = db.prepare('DELETE FROM bhojanalayas WHERE id = ?').run(id);
  return res.changes > 0;
}

// ==========================================
// RESERVATIONS & SEVA TOKENS
// ==========================================

export async function saveReservation(r: BhojanReservation): Promise<BhojanReservation> {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO bhojan_reservations (
      id, reservation_reference, bhojanalaya_id, bhojanalaya_name,
      guest_name, guest_phone, guest_email, reservation_date,
      meal_time, thali_count, special_requests, token_number, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status=excluded.status, special_requests=excluded.special_requests
  `);

  stmt.run(
    r.id,
    r.reservationReference,
    r.bhojanalayaId,
    r.bhojanalayaName,
    r.guestName,
    r.guestPhone,
    r.guestEmail || null,
    r.date,
    r.mealTime,
    r.thaliCount,
    r.specialRequests || null,
    r.tokenNumber,
    r.status || 'CONFIRMED'
  );

  return r;
}

export async function getReservationByRef(ref: string): Promise<BhojanReservation | null> {
  const db = getDb();
  const r = db.prepare(`
    SELECT * FROM bhojan_reservations 
    WHERE LOWER(reservation_reference) = ? OR LOWER(id) = ? 
    LIMIT 1
  `).get(ref.toLowerCase(), ref.toLowerCase()) as any;

  if (!r) return null;

  return {
    id: r.id,
    reservationReference: r.reservation_reference,
    bhojanalayaId: r.bhojanalaya_id,
    bhojanalayaName: r.bhojanalaya_name,
    guestName: r.guest_name,
    guestPhone: r.guest_phone,
    guestEmail: r.guest_email,
    date: r.reservation_date,
    mealTime: r.meal_time,
    thaliCount: r.thali_count,
    specialRequests: r.special_requests,
    status: r.status,
    tokenNumber: r.token_number,
    createdAt: r.created_at
  };
}

export async function getAllReservations(bhojanalayaId?: string): Promise<BhojanReservation[]> {
  const db = getDb();
  let sql = 'SELECT * FROM bhojan_reservations';
  const params: any[] = [];
  if (bhojanalayaId) {
    sql += ' WHERE bhojanalaya_id = ?';
    params.push(bhojanalayaId);
  }
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map((r) => ({
    id: r.id,
    reservationReference: r.reservation_reference,
    bhojanalayaId: r.bhojanalaya_id,
    bhojanalayaName: r.bhojanalaya_name,
    guestName: r.guest_name,
    guestPhone: r.guest_phone,
    guestEmail: r.guest_email,
    date: r.reservation_date,
    mealTime: r.meal_time,
    thaliCount: r.thali_count,
    specialRequests: r.special_requests,
    status: r.status,
    tokenNumber: r.token_number,
    createdAt: r.created_at
  }));
}

export async function cancelReservation(refOrId: string): Promise<boolean> {
  const db = getDb();
  const res = db.prepare(`
    UPDATE bhojan_reservations 
    SET status = 'CANCELLED' 
    WHERE reservation_reference = ? OR id = ?
  `).run(refOrId, refOrId);

  return res.changes > 0;
}

// ==========================================
// MENU ITEMS
// ==========================================

export async function getMenuItems(bhojanalayaId: string): Promise<BhojanMenuItem[]> {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM bhojan_menu_items 
    WHERE bhojanalaya_id = ? AND is_available = 1 
    ORDER BY category, price ASC
  `).all(bhojanalayaId) as any[];

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
}

export async function saveMenuItem(item: BhojanMenuItem): Promise<BhojanMenuItem> {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO bhojan_menu_items (
      id, bhojanalaya_id, name, hindi_name, category, price,
      description, pure_desi_ghee, is_speciality, is_available, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, hindi_name=excluded.hindi_name, category=excluded.category,
      price=excluded.price, description=excluded.description, pure_desi_ghee=excluded.pure_desi_ghee,
      is_speciality=excluded.is_speciality, is_available=excluded.is_available, image_url=excluded.image_url
  `);

  stmt.run(
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
  );

  return item;
}

// ==========================================
// REVIEWS
// ==========================================

export async function getReviews(bhojanalayaId: string): Promise<BhojanReview[]> {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM bhojan_reviews WHERE bhojanalaya_id = ? ORDER BY created_at DESC').all(bhojanalayaId) as any[];
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
}

export async function saveReview(review: BhojanReview): Promise<BhojanReview> {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO bhojan_reviews (
      id, bhojanalaya_id, author_name, author_city, rating, title, comment, darshan_experience
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    review.id,
    review.bhojanalayaId,
    review.authorName,
    review.authorCity || null,
    review.rating,
    review.title || null,
    review.comment,
    review.darshanExperience || null
  );

  // Update Bhojanalaya rating
  const avgRow = db.prepare(`
    SELECT ROUND(AVG(rating), 1) as avgRating, COUNT(*) as count 
    FROM bhojan_reviews 
    WHERE bhojanalaya_id = ?
  `).get(review.bhojanalayaId) as any;

  if (avgRow) {
    db.prepare(`
      UPDATE bhojanalayas 
      SET rating_score = ?, reviews_count = ? 
      WHERE id = ?
    `).run(avgRow.avgRating || 5.0, avgRow.count || 0, review.bhojanalayaId);
  }

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
