import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let dbConnected = false;

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brijnidhi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000 // 5 seconds timeout
};

export function isDbConnected(): boolean {
  return dbConnected;
}

export function getDbInfo() {
  return {
    connected: dbConnected,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
  };
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  if (!pool || !dbConnected) {
    throw new Error('Database is not connected');
  }
  const [results] = await pool.execute(sql, params);
  return results as T;
}

export async function initDatabase(): Promise<boolean> {
  try {
    console.log(`🔌 Attempting connection to MySQL/cPanel database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}...`);

    pool = mysql.createPool(dbConfig as PoolOptions);

    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    dbConnected = true;
    console.log(`✅ [MySQL] Successfully connected to cPanel MySQL / phpMyAdmin database: '${dbConfig.database}'`);

    // Ensure tables exist automatically
    await createTablesIfNotExist();

    return true;
  } catch (error: any) {
    dbConnected = false;
    console.warn(`⚠️ [MySQL] Could not connect to MySQL at ${dbConfig.host}:${dbConfig.port} (${error.message})`);
    console.warn(`💡 Tip: Update 'backend/.env' with your cPanel MySQL credentials. If connecting remotely, ensure your IP is added to cPanel -> 'Remote MySQL'.`);
    console.warn(`⚡ Brijnidhi is running in seamless Hybrid Fallback mode (in-memory caching active until DB connects).`);
    return false;
  }
}

async function createTablesIfNotExist(): Promise<void> {
  if (!pool) return;

  const usersTable = `
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` VARCHAR(64) NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`phone\` VARCHAR(50) DEFAULT NULL,
      \`role\` ENUM('SYSTEM_ADMIN', 'HOTEL_ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
      \`password_hash\` VARCHAR(255) DEFAULT NULL,
      \`status\` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`idx_users_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const hotelsTable = `
    CREATE TABLE IF NOT EXISTS \`hotels\` (
      \`id\` VARCHAR(64) NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`slug\` VARCHAR(255) NOT NULL,
      \`destination_slug\` VARCHAR(64) NOT NULL,
      \`destination_name\` VARCHAR(100) NOT NULL,
      \`stay_type\` VARCHAR(64) NOT NULL DEFAULT 'hotel',
      \`price_per_night\` DECIMAL(10,2) NOT NULL DEFAULT '1500.00',
      \`original_price\` DECIMAL(10,2) NOT NULL DEFAULT '2000.00',
      \`star_rating\` INT NOT NULL DEFAULT '3',
      \`rating_score\` DECIMAL(3,1) NOT NULL DEFAULT '4.8',
      \`reviews_count\` INT NOT NULL DEFAULT '0',
      \`address\` TEXT NOT NULL,
      \`nearest_landmark\` VARCHAR(255) NOT NULL,
      \`distance_to_main_temple\` VARCHAR(255) DEFAULT NULL,
      \`short_description\` TEXT,
      \`description\` LONGTEXT,
      \`pure_satvik_kitchen\` TINYINT(1) NOT NULL DEFAULT '1',
      \`temple_darshan_assistance\` TINYINT(1) NOT NULL DEFAULT '1',
      \`status\` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'APPROVED',
      \`owner_name\` VARCHAR(255) DEFAULT NULL,
      \`owner_email\` VARCHAR(255) DEFAULT NULL,
      \`owner_phone\` VARCHAR(50) DEFAULT NULL,
      \`trade_license_no\` VARCHAR(100) DEFAULT NULL,
      \`fssai_license_no\` VARCHAR(100) DEFAULT NULL,
      \`images\` LONGTEXT DEFAULT NULL,
      \`amenities\` LONGTEXT DEFAULT NULL,
      \`policies\` LONGTEXT DEFAULT NULL,
      \`rooms\` LONGTEXT DEFAULT NULL,
      \`landmark_distances\` LONGTEXT DEFAULT NULL,
      \`is_featured\` TINYINT(1) NOT NULL DEFAULT '0',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`idx_hotels_slug\` (\`slug\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const onboardingTable = `
    CREATE TABLE IF NOT EXISTS \`onboarding_submissions\` (
      \`id\` VARCHAR(64) NOT NULL,
      \`hotel_name\` VARCHAR(255) NOT NULL,
      \`slug\` VARCHAR(255) NOT NULL,
      \`destination_slug\` VARCHAR(64) NOT NULL,
      \`destination_name\` VARCHAR(100) NOT NULL,
      \`stay_type\` VARCHAR(64) NOT NULL DEFAULT 'hotel',
      \`base_price\` DECIMAL(10,2) NOT NULL DEFAULT '1500.00',
      \`owner_name\` VARCHAR(255) NOT NULL,
      \`owner_email\` VARCHAR(255) NOT NULL,
      \`owner_phone\` VARCHAR(50) DEFAULT NULL,
      \`nearest_landmark\` VARCHAR(255) DEFAULT NULL,
      \`address\` TEXT DEFAULT NULL,
      \`walk_minutes\` INT DEFAULT '5',
      \`trade_license_no\` VARCHAR(100) DEFAULT NULL,
      \`fssai_license_no\` VARCHAR(100) DEFAULT NULL,
      \`pure_satvik_kitchen\` TINYINT(1) NOT NULL DEFAULT '1',
      \`temple_darshan_assistance\` TINYINT(1) NOT NULL DEFAULT '1',
      \`documents_verified\` TINYINT(1) NOT NULL DEFAULT '0',
      \`status\` ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'SUBMITTED',
      \`raw_data\` LONGTEXT DEFAULT NULL,
      \`submitted_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const bookingsTable = `
    CREATE TABLE IF NOT EXISTS \`bookings\` (
      \`id\` VARCHAR(64) NOT NULL,
      \`booking_reference\` VARCHAR(64) NOT NULL,
      \`hotel_id\` VARCHAR(64) NOT NULL,
      \`hotel_name\` VARCHAR(255) NOT NULL,
      \`room_id\` VARCHAR(64) DEFAULT NULL,
      \`room_name\` VARCHAR(255) DEFAULT NULL,
      \`user_id\` VARCHAR(64) DEFAULT NULL,
      \`guest_name\` VARCHAR(255) NOT NULL,
      \`guest_email\` VARCHAR(255) NOT NULL,
      \`guest_phone\` VARCHAR(50) NOT NULL,
      \`check_in_date\` DATE NOT NULL,
      \`check_out_date\` DATE NOT NULL,
      \`total_nights\` INT NOT NULL DEFAULT '1',
      \`guests_count\` INT NOT NULL DEFAULT '2',
      \`rooms_count\` INT NOT NULL DEFAULT '1',
      \`special_requests\` TEXT DEFAULT NULL,
      \`darshan_assistance\` TINYINT(1) NOT NULL DEFAULT '0',
      \`parikrama_rickshaw\` TINYINT(1) NOT NULL DEFAULT '0',
      \`satvik_thali_meals\` TINYINT(1) NOT NULL DEFAULT '0',
      \`room_charges\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
      \`tax_amount\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
      \`addon_charges\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
      \`grand_total\` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
      \`booking_status\` ENUM('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
      \`payment_status\` ENUM('PENDING', 'PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PAID',
      \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'UPI',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`idx_booking_ref\` (\`booking_reference\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const auditLogsTable = `
    CREATE TABLE IF NOT EXISTS \`audit_logs\` (
      \`id\` VARCHAR(64) NOT NULL,
      \`admin_name\` VARCHAR(255) NOT NULL,
      \`action\` VARCHAR(100) NOT NULL,
      \`entity_type\` VARCHAR(100) NOT NULL,
      \`entity_id\` VARCHAR(64) DEFAULT NULL,
      \`details\` TEXT DEFAULT NULL,
      \`ip_address\` VARCHAR(100) DEFAULT NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await query(usersTable);
    await query(hotelsTable);
    await query(onboardingTable);
    await query(bookingsTable);
    await query(auditLogsTable);
    console.log(`📦 [MySQL] Database tables verified & ready.`);
  } catch (err: any) {
    console.warn(`⚠️ [MySQL] Auto table verification warning: ${err.message}`);
  }
}

export default {
  query,
  initDatabase,
  isDbConnected,
  getDbInfo
};
