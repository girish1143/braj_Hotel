import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import destinationRoutes from './routes/destinationRoutes';
import hotelRoutes from './routes/hotelRoutes';
import experienceRoutes from './routes/experienceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import bhojanRoutes from './routes/bhojanRoutes';
import systemAdminRoutes from './modules/system-admin/systemAdminRoutes';
import hotelAdminRoutes from './modules/hotel-admin/hotelAdminRoutes';
import hotelStaffRoutes from './modules/hotel-staff/hotelStaffRoutes';
import onboardRoutes from './modules/hotels/onboardRoutes';
import authRoutes from './modules/auth/authRoutes';
import { authenticate } from './middleware/roleGuard';
import { initSqlite, getDbStats } from './db/sqlite';

import path from 'path';
import uploadRoutes from './routes/uploadRoutes';
import { getS3Info, testS3Connection } from './config/s3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(authenticate); // Attach authenticated user / simulated role

// Local static upload directory (fallback when S3 is in local mode)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public & Customer Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bhojan', bhojanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hotels/onboard', onboardRoutes);
app.use('/api/upload', uploadRoutes);

// Forward all /api/admin requests to Dockerized Rust Admin Backend (port 5001)
app.use('/api/admin', async (req: Request, res: Response, next) => {
  try {
    const targetUrl = `http://localhost:5001${req.originalUrl}`;
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-brijnidhi-role': (req.headers['x-brijnidhi-role'] as string) || 'SYSTEM_ADMIN',
      'x-brijnidhi-admin-token': (req.headers['x-brijnidhi-admin-token'] as string) || ''
    };
    const options: RequestInit = {
      method: req.method,
      headers
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }
    const response = await fetch(targetUrl, options);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    // If Rust service is unreachable, fallback to express systemAdminRoutes
    next();
  }
});
app.use('/api/admin', systemAdminRoutes);           // Fallback only
app.use('/api/hotel', hotelStaffRoutes);             // Hotel Partner Public Auth & Operations
app.use('/api/hotel-admin', hotelStaffRoutes);       // Hotel Staff Auth & Management
app.use('/api/hotel-admin', hotelAdminRoutes);      // HOTEL_ADMIN only

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'Brijnidhi — Braj Hotel & Stay Platform API',
    database: getDbStats(),
    storage: getS3Info(),
    rolesSupported: ['SYSTEM_ADMIN', 'HOTEL_ADMIN', 'CUSTOMER'],
    destinations: ['Mathura', 'Vrindavan', 'Barsana', 'Govardhan'],
    timestamp: new Date().toISOString()
  });
});

// Database Status endpoint
app.get('/api/db/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    sqlite: getDbStats()
  });
});

// AWS S3 Storage Status endpoint
app.get('/api/s3/status', async (req: Request, res: Response) => {
  const info = getS3Info();
  const connection = await testS3Connection();
  res.json({
    success: true,
    info,
    connection
  });
});

app.listen(PORT, async () => {
  console.log(`🌸 Brijnidhi API server running on http://localhost:${PORT}`);
  console.log(`✨ Role Architecture active: SYSTEM_ADMIN (/admin), HOTEL_ADMIN (/hotel-admin), CUSTOMER (/stays)`);

  // Initialize SQLite Database
  initSqlite();

  // Test AWS S3 bucket connection
  const s3Status = await testS3Connection();
  if (s3Status.connected) {
    console.log(`☁️ [AWS S3] Connected to bucket '${s3Status.bucket}' in ${s3Status.region}`);
  } else {
    console.log(`ℹ️ [AWS S3] Running in ${getS3Info().storageMode} mode (${s3Status.message})`);
  }
});

export default app;
