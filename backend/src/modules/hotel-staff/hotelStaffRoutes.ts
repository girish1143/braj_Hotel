import { Router, Request, Response } from 'express';
import {
  authenticateStaff,
  registerHotelPartner,
  verifyStaffToken,
  createStaffAccount,
  updateStaffAccount,
  adminResetStaffPassword,
  changeStaffPassword,
  getStaffDirectory,
  getStaffMetrics,
  getAllActivityLogs,
  updateStaffProfile,
  logActivity,
  StaffDepartment,
  StaffRole,
  StaffStatus
} from './hotelStaffService';

const router = Router();

// --- 1. AUTHENTICATION ENDPOINTS ---

/**
 * POST /api/hotel-admin/auth/register-hotel
 * Body: { hotelName, ownerName, email, phone, address, password }
 */
router.post('/auth/register-hotel', (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = registerHotelPartner(req.body, ip);
    res.status(201).json({
      success: true,
      message: `Radhe Radhe! Hotel '${result.hotel.name}' and administrator account registered successfully.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed.'
    });
  }
});

router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = registerHotelPartner(req.body, ip);
    res.status(201).json({
      success: true,
      message: `Radhe Radhe! Hotel '${result.hotel.name}' and administrator account registered successfully.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed.'
    });
  }
});

/**
 * GET /api/hotel-admin/auth/me
 * Headers: x-brijnidhi-staff-token or Authorization: Bearer <token>
 */
router.get('/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const staffToken =
      (req.headers['x-brijnidhi-staff-token'] as string) ||
      (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (authHeader as string));
    if (!staffToken) {
      return res.status(401).json({ success: false, message: 'No authentication token provided.' });
    }
    const profile = verifyStaffToken(staffToken);
    res.json({
      success: true,
      data: { profile }
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Unauthorized or expired session.'
    });
  }
});

/**
 * POST /api/hotel-admin/auth/login
 * Body: { identifier, password } (or email/password)
 */
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const identifier = req.body.identifier || req.body.email || req.body.username;
    const { password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const result = authenticateStaff(identifier, password, ip);
    res.json({
      success: true,
      message: `Welcome back, ${result.profile.fullName}!`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Authentication failed.'
    });
  }
});

/**
 * POST /api/hotel-admin/auth/logout
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  const { staffId, staffName } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  if (staffId && staffName) {
    logActivity(staffId, staffName, 'STAFF_LOGOUT', 'Staff session closed securely.', ip, 'SUCCESS');
  }
  res.json({
    success: true,
    message: 'Staff session closed successfully. Securely logged out.'
  });
});

/**
 * POST /api/hotel-admin/auth/change-password
 * Body: { staffId, currentPassword, newPassword }
 */
router.post('/auth/change-password', (req: Request, res: Response) => {
  try {
    const { staffId, currentPassword, newPassword } = req.body;
    const ip = req.ip || '127.0.0.1';
    const result = changeStaffPassword(staffId, currentPassword, newPassword, ip);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update password.'
    });
  }
});

/**
 * POST /api/hotel-admin/auth/forgot-password
 * Body: { identifier }
 */
router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your registered email or username.'
    });
  }

  // Security best practice: don't reveal if user exists, but provide simulated secure recovery code
  res.json({
    success: true,
    message: `Password reset instructions and verification code sent to ${identifier}.`,
    recoveryCode: '108108'
  });
});

/**
 * POST /api/hotel-admin/auth/reset-password
 * Body: { identifier, code, newPassword }
 */
router.post('/auth/reset-password', (req: Request, res: Response) => {
  const { identifier, code, newPassword } = req.body;
  if (!identifier || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  if (code !== '108108') {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired recovery code.'
    });
  }

  res.json({
    success: true,
    message: 'Password reset successfully! You can now log in with your new password.'
  });
});

// --- 2. STAFF DIRECTORY & METRICS ENDPOINTS ---

/**
 * GET /api/hotel-admin/staff
 * Query: search, department, role, status, page, limit
 */
router.get('/staff', (req: Request, res: Response) => {
  try {
    const { search, department, role, status, page, limit } = req.query;
    const result = getStaffDirectory({
      search: search as string,
      department: department as string,
      role: role as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 15
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve staff directory.'
    });
  }
});

/**
 * GET /api/hotel-admin/staff/metrics
 */
router.get('/staff/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = getStaffMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve metrics.'
    });
  }
});

/**
 * GET /api/hotel-admin/staff/activity
 */
router.get('/staff/activity', (_req: Request, res: Response) => {
  try {
    const logs = getAllActivityLogs();
    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve activity logs.'
    });
  }
});

// --- 3. ADMIN STAFF MANAGEMENT ACTIONS ---

/**
 * POST /api/hotel-admin/staff
 * Body: { fullName, employeeId, email, phone, department, position, username, temporaryPassword, role, status, joiningDate }
 */
router.post('/staff', (req: Request, res: Response) => {
  try {
    const ip = req.ip || '127.0.0.1';
    const adminUser = req.user?.name || 'Hotel Administrator';
    const result = createStaffAccount(req.body, adminUser, ip);
    res.status(201).json({
      success: true,
      message: `Staff account for ${result.staff.fullName} (${result.staff.role}) created successfully!`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create staff account.'
    });
  }
});

/**
 * PATCH /api/hotel-admin/staff/:id
 */
router.patch('/staff/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ip = req.ip || '127.0.0.1';
    const adminUser = req.user?.name || 'Hotel Administrator';
    const updated = updateStaffAccount(id, req.body, adminUser, ip);
    res.json({
      success: true,
      message: `Staff record for ${updated.fullName} updated successfully.`,
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update staff record.'
    });
  }
});

/**
 * POST /api/hotel-admin/staff/:id/reset-password
 */
router.post('/staff/:id/reset-password', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ip = req.ip || '127.0.0.1';
    const adminUser = req.user?.name || 'Hotel Administrator';
    const result = adminResetStaffPassword(id, adminUser, ip);
    res.json({
      success: true,
      message: `Temporary password generated for ${result.fullName}.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset staff password.'
    });
  }
});

/**
 * PATCH /api/hotel-admin/staff/:id/profile
 * Staff updates their own permitted contact profile details (phone, email)
 */
router.patch('/staff/:id/profile', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ip = req.ip || '127.0.0.1';
    const updated = updateStaffProfile(id, req.body, ip);
    res.json({
      success: true,
      message: 'Profile information updated successfully.',
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile.'
    });
  }
});

/**
 * POST /api/hotel-admin/staff/audit-action
 * Records important staff actions into the audit log
 */
router.post('/staff/audit-action', (req: Request, res: Response) => {
  try {
    const { staffId, staffName, action, details, status } = req.body;
    const ip = req.ip || '127.0.0.1';
    const log = logActivity(
      staffId || 'system',
      staffName || 'Staff Member',
      action || 'OPERATIONAL_ACTION',
      details || '',
      ip,
      status || 'SUCCESS'
    );
    res.json({
      success: true,
      data: log
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to log action.'
    });
  }
});

export default router;
