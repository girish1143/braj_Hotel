import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import destinationRoutes from './routes/destinationRoutes';
import hotelRoutes from './routes/hotelRoutes';
import experienceRoutes from './routes/experienceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import systemAdminRoutes from './modules/system-admin/systemAdminRoutes';
import hotelAdminRoutes from './modules/hotel-admin/hotelAdminRoutes';
import onboardRoutes from './modules/hotels/onboardRoutes';
import authRoutes from './modules/auth/authRoutes';
import { authenticate } from './middleware/roleGuard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(authenticate); // Attach authenticated user / simulated role

// Public & Customer Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hotels/onboard', onboardRoutes);

// Role-Guarded Management Routes
app.use('/api/admin', systemAdminRoutes);           // SYSTEM_ADMIN only
app.use('/api/hotel-admin', hotelAdminRoutes);      // HOTEL_ADMIN only

import { initDatabase, getDbInfo, isDbConnected, query } from './db/mysql';
import { getHotelsFromDb, getOnboardingSubmissionsFromDb } from './db/repository';
import { brajHotels } from './data/hotels';
import { adminHotels } from './modules/system-admin/systemAdminRoutes';

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'Brijnidhi — Braj Hotel & Stay Platform API',
    database: getDbInfo(),
    rolesSupported: ['SYSTEM_ADMIN', 'HOTEL_ADMIN', 'CUSTOMER'],
    destinations: ['Mathura', 'Vrindavan', 'Barsana', 'Govardhan'],
    timestamp: new Date().toISOString()
  });
});

// Database status & inspection endpoint (useful for testing cPanel connection)
app.get('/api/db/status', async (req: Request, res: Response) => {
  const dbInfo = getDbInfo();
  let counts: Record<string, number> = {};

  if (isDbConnected()) {
    try {
      const [u] = await query<any[]>('SELECT COUNT(*) as c FROM users');
      const [h] = await query<any[]>('SELECT COUNT(*) as c FROM hotels');
      const [o] = await query<any[]>('SELECT COUNT(*) as c FROM onboarding_submissions');
      const [b] = await query<any[]>('SELECT COUNT(*) as c FROM bookings');
      counts = {
        users: u.c,
        hotels: h.c,
        onboardingQueue: o.c,
        bookings: b.c
      };
    } catch (err: any) {
      counts = { error: err.message };
    }
  }

  res.json({
    success: true,
    connected: dbInfo.connected,
    engine: 'MySQL / MariaDB (phpMyAdmin / cPanel compatible)',
    connection: {
      host: dbInfo.host,
      port: dbInfo.port,
      database: dbInfo.database,
      user: dbInfo.user
    },
    tables: counts,
    schemaFile: 'brijnidhi_cpanel_database.sql',
    inMemoryCatalogCounts: {
      publicHotels: brajHotels.length,
      adminQueueHotels: adminHotels.length
    }
  });
});

app.listen(PORT, async () => {
  console.log(`🌸 Brijnidhi API server running on http://localhost:${PORT}`);
  console.log(`✨ Role Architecture active: SYSTEM_ADMIN (/admin), HOTEL_ADMIN (/hotel-admin), CUSTOMER (/stays)`);

  // Initialize MySQL Connection
  const connected = await initDatabase();
  if (connected) {
    try {
      const dbHotels = await getHotelsFromDb();
      if (dbHotels && dbHotels.length > 0) {
        // Hydrate public catalog from MySQL
        brajHotels.length = 0;
        brajHotels.push(...dbHotels);
        console.log(`🚀 [MySQL] Hydrated ${dbHotels.length} live stays into public catalog from cPanel MySQL.`);
      }

      const dbOnboard = await getOnboardingSubmissionsFromDb();
      if (dbOnboard && dbOnboard.length > 0) {
        adminHotels.length = 0;
        adminHotels.push(...dbOnboard);
        console.log(`📋 [MySQL] Hydrated ${dbOnboard.length} property submissions into Admin Queue from cPanel MySQL.`);
      }
    } catch (err: any) {
      console.warn(`[MySQL] Warning during data hydration:`, err.message);
    }
  }
});

export default app;
