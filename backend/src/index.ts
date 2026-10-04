import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import destinationRoutes from './routes/destinationRoutes';
import hotelRoutes from './routes/hotelRoutes';
import experienceRoutes from './routes/experienceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import bhojanRoutes from './routes/bhojanRoutes';
import systemAdminRoutes from './modules/system-admin/systemAdminRoutes';
import hotelAdminRoutes from './modules/hotel-admin/hotelAdminRoutes';
import onboardRoutes from './modules/hotels/onboardRoutes';
import authRoutes from './modules/auth/authRoutes';
import { authenticate } from './middleware/roleGuard';
import { initRdsDatabase, getRdsInfo, isRdsConnected } from './db/rds';

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
app.use('/api/bhojan', bhojanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hotels/onboard', onboardRoutes);

// Role-Guarded Management Routes
app.use('/api/admin', systemAdminRoutes);           // SYSTEM_ADMIN only
app.use('/api/hotel-admin', hotelAdminRoutes);      // HOTEL_ADMIN only

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'Brijnidhi — Braj Hotel & Stay Platform API',
    database: getRdsInfo(),
    rolesSupported: ['SYSTEM_ADMIN', 'HOTEL_ADMIN', 'CUSTOMER'],
    destinations: ['Mathura', 'Vrindavan', 'Barsana', 'Govardhan'],
    timestamp: new Date().toISOString()
  });
});

// AWS RDS Database Status endpoint
app.get('/api/db/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    awsRds: getRdsInfo()
  });
});

app.listen(PORT, async () => {
  console.log(`🌸 Brijnidhi API server running on http://localhost:${PORT}`);
  console.log(`✨ Role Architecture active: SYSTEM_ADMIN (/admin), HOTEL_ADMIN (/hotel-admin), CUSTOMER (/stays)`);

  // Attempt connection to AWS RDS if configured
  await initRdsDatabase();
});

export default app;
