import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;
let dbFilePath = '';

export function getDbPath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return path.isAbsolute(process.env.SQLITE_DB_PATH)
      ? process.env.SQLITE_DB_PATH
      : path.resolve(process.cwd(), process.env.SQLITE_DB_PATH);
  }
  return path.resolve(process.cwd(), 'data', 'brijnidhi.db');
}

export function initSqlite(): Database.Database {
  if (db) return db;

  dbFilePath = getDbPath();
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbFilePath);

  // Performance and concurrency optimizations
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('foreign_keys = ON');

  createTables(db);
  seedInitialData(db);

  console.log(`📦 [SQLite] Database initialized at: ${dbFilePath}`);
  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    return initSqlite();
  }
  return db;
}

export function isDbReady(): boolean {
  return db !== null;
}

export function getDbStats() {
  if (!db) {
    return {
      connected: false,
      type: 'SQLite Database',
      path: dbFilePath,
      sizeBytes: 0,
      tables: {}
    };
  }

  let sizeBytes = 0;
  try {
    if (fs.existsSync(dbFilePath)) {
      sizeBytes = fs.statSync(dbFilePath).size;
    }
  } catch {}

  const tables: Record<string, number> = {};
  const tableNames = ['users', 'hotels', 'bookings', 'bhojanalayas', 'bhojan_reservations', 'bhojan_menu_items', 'bhojan_reviews', 'audit_logs'];

  for (const name of tableNames) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get() as { count: number };
      tables[name] = row ? row.count : 0;
    } catch {
      tables[name] = 0;
    }
  }

  return {
    connected: true,
    type: 'SQLite Database',
    path: dbFilePath,
    sizeBytes,
    sizeFormatted: `${(sizeBytes / 1024).toFixed(2)} KB`,
    tables
  };
}

function createTables(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      destination_slug TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      stay_type TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'APPROVED',
      owner_name TEXT,
      owner_email TEXT,
      owner_phone TEXT,
      trade_license_no TEXT,
      fssai_license_no TEXT,
      nearest_landmark TEXT,
      address TEXT,
      walk_minutes INTEGER DEFAULT 5,
      pure_satvik_kitchen INTEGER DEFAULT 1,
      temple_darshan_assistance INTEGER DEFAULT 1,
      documents_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_reference TEXT UNIQUE NOT NULL,
      hotel_id TEXT NOT NULL,
      hotel_name TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL,
      rooms INTEGER NOT NULL,
      room_type TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bhojanalayas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      hindi_name TEXT,
      slug TEXT UNIQUE NOT NULL,
      destination_slug TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      category TEXT NOT NULL,
      category_name TEXT NOT NULL,
      rating_score REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      price_range TEXT DEFAULT '₹100 - ₹300',
      avg_cost_for_two REAL DEFAULT 300,
      address TEXT NOT NULL,
      nearest_landmark TEXT NOT NULL,
      distance_to_landmark TEXT DEFAULT 'Near Temple',
      walk_minutes INTEGER DEFAULT 5,
      timings TEXT NOT NULL,
      pure_satvik INTEGER DEFAULT 1,
      pure_desi_ghee INTEGER DEFAULT 1,
      speciality_dishes TEXT,
      images TEXT,
      description TEXT,
      features TEXT,
      contact_phone TEXT,
      owner_name TEXT,
      owner_email TEXT,
      fssai_license_no TEXT,
      status TEXT DEFAULT 'APPROVED',
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bhojan_reservations (
      id TEXT PRIMARY KEY,
      reservation_reference TEXT UNIQUE NOT NULL,
      bhojanalaya_id TEXT NOT NULL,
      bhojanalaya_name TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      guest_email TEXT,
      reservation_date TEXT NOT NULL,
      meal_time TEXT NOT NULL,
      thali_count INTEGER NOT NULL,
      special_requests TEXT,
      token_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bhojan_menu_items (
      id TEXT PRIMARY KEY,
      bhojanalaya_id TEXT NOT NULL,
      name TEXT NOT NULL,
      hindi_name TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      pure_desi_ghee INTEGER DEFAULT 1,
      is_speciality INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bhojan_reviews (
      id TEXT PRIMARY KEY,
      bhojanalaya_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_city TEXT,
      rating REAL NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      darshan_experience TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedInitialData(database: Database.Database) {
  const countRow = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (countRow.count > 0) return;

  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, phone, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialUsers = [
    ['usr-admin-01', 'Girish Sharma', 'admin@brijnidhi.org', '+91 99999 88888', 'SYSTEM_ADMIN', 'ACTIVE'],
    ['usr-admin-02', 'Girish Sharma', 'girish@braj.org', '9999988888', 'SYSTEM_ADMIN', 'ACTIVE'],
    ['usr-admin-03', 'System Administrator', 'admin@brijnidhi.com', '+91 99999 00000', 'SYSTEM_ADMIN', 'ACTIVE'],
    ['usr-devotee-01', 'Girish Sharma', 'girishsharma1143@gmail.com', '9149026598', 'CUSTOMER', 'ACTIVE'],
    ['usr-devotee-02', 'Radhe Krishna Das', 'radhe.test@gmail.com', 'Google Account', 'CUSTOMER', 'ACTIVE']
  ];

  const insertMany = database.transaction((usersList) => {
    for (const u of usersList) {
      insertUser.run(u[0], u[1], u[2], u[3], u[4], u[5]);
    }
  });

  insertMany(initialUsers);
  console.log('🌱 [SQLite] Seeded initial system admin & devotee accounts into SQLite.');
}
