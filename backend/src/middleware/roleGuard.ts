import { Request, Response, NextFunction } from 'express';

export type UserRole = 'SYSTEM_ADMIN' | 'HOTEL_ADMIN' | 'CUSTOMER';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedHotelIds?: string[]; // IDs of hotels this HotelAdmin manages
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Mock auth middleware (extracts token or simulates authenticated user from headers)
// System authentications
const authenticatedProfiles: Record<UserRole, AuthenticatedUser> = {
  SYSTEM_ADMIN: {
    id: 'usr-sys-admin-01',
    email: 'admin@brijnidhi.org',
    name: 'Girish (Brijnidhi Super Admin)',
    role: 'SYSTEM_ADMIN',
  },
  HOTEL_ADMIN: {
    id: 'usr-hotel-admin-01',
    email: 'hoteladmin@brijnidhi.org',
    name: 'Verified Hotel Partner',
    role: 'HOTEL_ADMIN',
    assignedHotelIds: [],
  },
  CUSTOMER: {
    id: 'usr-customer-01',
    email: 'yatri@brijnidhi.org',
    name: 'Braj Yatri',
    role: 'CUSTOMER',
  },
};

// Auth middleware (validates security token or role header)
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const adminTokenHeader = (req.headers['x-brijnidhi-admin-token'] as string) || '';
  const roleHeader = (req.headers['x-brijnidhi-role'] as UserRole) || '';
  const hotelIdHeader = (req.headers['x-brijnidhi-hotel-id'] as string) || '';

  // 1. Check for verified Super Admin token or explicit system admin header
  if (
    adminTokenHeader.startsWith('brijnidhi_admin_sec_') ||
    authHeader.includes('brijnidhi_admin_sec_') ||
    roleHeader === 'SYSTEM_ADMIN'
  ) {
    req.user = { ...authenticatedProfiles.SYSTEM_ADMIN };
    return next();
  }

  // 2. Check for Hotel Admin or Hotel Staff
  const staffTokenHeader = (req.headers['x-staff-token'] as string) || (req.headers['x-brijnidhi-staff-token'] as string) || '';
  if (
    roleHeader === 'HOTEL_ADMIN' ||
    staffTokenHeader.startsWith('brij_staff_sec_') ||
    authHeader.includes('brij_staff_sec_') ||
    adminTokenHeader.startsWith('brij_staff_sec_')
  ) {
    req.user = {
      ...authenticatedProfiles.HOTEL_ADMIN,
      assignedHotelIds: hotelIdHeader ? [hotelIdHeader] : ['prop-vrn-01']
    };
    return next();
  }

  // 3. Default to CUSTOMER (safe zero privilege)
  req.user = { ...authenticatedProfiles.CUSTOMER };
  next();
}

// Role guard middleware
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this Braj portal resource.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized. Required: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
}

// Guard ensuring Hotel Admin can only access their assigned hotel
export function requireHotelOwnership(paramKey: string = 'hotelId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // System Admins bypass hotel ownership check
    if (req.user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    if (req.user.role === 'HOTEL_ADMIN') {
      const requestedHotelId = req.params[paramKey] || req.body[paramKey] || (req.query[paramKey] as string);
      const assigned = req.user.assignedHotelIds || [];

      if (requestedHotelId && !assigned.includes(requestedHotelId)) {
        return res.status(403).json({
          success: false,
          message: `Security Violation: You do not have permissions to manage hotel '${requestedHotelId}'.`,
        });
      }
    }

    next();
  };
}
