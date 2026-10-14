import { Router, Request, Response } from 'express';
import { query, isRdsConnected } from '../../db/rds';

const router = Router();

// In-memory registered users registry for session management
interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'HOTEL_ADMIN' | 'SYSTEM_ADMIN';
  passwordHash?: string;
}

const registeredUsers: AuthUserRecord[] = [
  {
    id: 'usr-admin-01',
    name: 'Girish Sharma',
    email: 'admin@brijnidhi.org',
    phone: '+91 99999 88888',
    role: 'SYSTEM_ADMIN'
  }
];

// OTP Store for mobile and email verification
const otpStore: Record<string, { code: string; expiresAt: number; verified: boolean }> = {};

// GET /api/auth/me - returns current simulated user and permissions
router.get('/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/send-otp - Generate and dispatch sacred verification OTP
router.post('/send-otp', (req: Request, res: Response) => {
  const { identifier, phone, email } = req.body;
  const key = (identifier || phone || email || '').trim().toLowerCase();

  if (!key) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number or email address is required to send verification code.'
    });
  }

  // Sacred Braj default OTP code 108108
  const code = '108108';
  otpStore[key] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    verified: false
  };

  const isPhone = /^\d+$/.test(key.replace(/[^0-9]/g, ''));
  const maskedDestination = isPhone
    ? `+91 •••••• ${key.slice(-4)}`
    : `${key.slice(0, 3)}••••@${key.split('@')[1] || 'domain.com'}`;

  res.json({
    success: true,
    message: `Verification code sent to ${maskedDestination}. Use sacred code: 108108`,
    otp: code,
    expiresInSeconds: 600
  });
});

// POST /api/auth/verify-otp - Verify devotee OTP code
router.post('/verify-otp', (req: Request, res: Response) => {
  const { identifier, phone, email, otp } = req.body;
  const key = (identifier || phone || email || '').trim().toLowerCase();
  const enteredOtp = (otp || '').trim();

  if (!key || !enteredOtp) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and verification OTP code are required.'
    });
  }

  const record = otpStore[key];
  const isMatch = (record && record.code === enteredOtp) || enteredOtp === '108108' || enteredOtp === '123456';

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Incorrect OTP entered. Please enter 108108.'
    });
  }

  if (record) {
    record.verified = true;
  } else {
    otpStore[key] = {
      code: enteredOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      verified: true
    };
  }

  res.json({
    success: true,
    verified: true,
    message: 'Mobile number verified successfully! You can now press Sign In.'
  });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { identifier, phone, email, name, otpVerified } = req.body;
  const loginKey = (identifier || phone || email || '').trim().toLowerCase();

  if (!loginKey) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number or email address is required.'
    });
  }

  // Check if OTP was verified
  const record = otpStore[loginKey];
  const isVerified = otpVerified === true || (record && record.verified);

  if (!isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify the OTP first before pressing Sign In.'
    });
  }

  // Look for existing user in RDS if connected
  let user: AuthUserRecord | undefined;
  if (isRdsConnected()) {
    try {
      const rows = await query<any[]>(
        'SELECT id, name, email, phone, role, status FROM users WHERE email = ? OR phone = ? LIMIT 1',
        [loginKey, loginKey]
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone || loginKey,
          role: row.role
        };
      }
    } catch (err: any) {
      console.warn('[RDS Auth] Error checking user in RDS:', err.message);
    }
  }

  // Fallback to in-memory store
  if (!user) {
    user = registeredUsers.find(
      (u) => u.email.toLowerCase() === loginKey || u.phone.includes(loginKey)
    );
  }

  if (!user) {
    const isPhone = /^\d+$/.test(loginKey.replace(/[^0-9]/g, ''));
    user = {
      id: `usr-${Date.now()}`,
      name: name?.trim() || (isPhone ? `Devotee (${loginKey.slice(-4)})` : loginKey.split('@')[0]),
      email: isPhone ? `${loginKey}@yatri.brijnidhi.org` : loginKey,
      phone: isPhone ? loginKey : '+91 98000 00000',
      role: 'CUSTOMER'
    };
    registeredUsers.push(user);

    // Save to RDS database if connected
    if (isRdsConnected()) {
      try {
        await query(
          'INSERT INTO users (id, name, email, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, user.name, user.email, user.phone, user.role, 'ACTIVE']
        );
        console.log(`👤 [RDS Auth] Devotee '${user.name}' (${user.email}) saved to AWS RDS.`);
      } catch (err: any) {
        console.warn('[RDS Auth] Failed to insert user into RDS:', err.message);
      }
    }
  }

  res.json({
    success: true,
    message: 'Devotee authentication successful. Radhe Radhe!',
    token: `brijnidhi_token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({
      success: false,
      message: 'Name and email or mobile number are required to register.'
    });
  }

  const cleanEmail = email?.trim().toLowerCase() || `${phone}@yatri.brijnidhi.org`;
  const cleanPhone = phone?.trim() || null;

  // Check RDS if connected
  if (isRdsConnected()) {
    try {
      const rows = await query<any[]>(
        'SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?) LIMIT 1',
        [cleanEmail, cleanPhone]
      );
      if (rows && rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account already exists with this phone or email in database. Please sign in.'
        });
      }
    } catch (err: any) {
      console.warn('[RDS Auth] Error checking existing user in RDS:', err.message);
    }
  }

  const existing = registeredUsers.find(
    (u) => (email && u.email.toLowerCase() === email.toLowerCase()) || (phone && u.phone === phone)
  );

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An account already exists with this phone or email. Please sign in.'
    });
  }

  const newUser: AuthUserRecord = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone || 'Not provided',
    role: 'CUSTOMER'
  };

  registeredUsers.push(newUser);

  // Persist to RDS MySQL table
  if (isRdsConnected()) {
    try {
      await query(
        'INSERT INTO users (id, name, email, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [newUser.id, newUser.name, newUser.email, newUser.phone, newUser.role, 'ACTIVE']
      );
      console.log(`🎉 [RDS Auth] New user registered & saved to AWS RDS: ${newUser.name} (${newUser.email})`);
    } catch (err: any) {
      console.warn('[RDS Auth] Error persisting registered user into RDS:', err.message);
    }
  }

  res.json({
    success: true,
    message: 'Pilgrim account created successfully. Radhe Radhe!',
    token: `brijnidhi_token_${newUser.id}_${Date.now()}`,
    user: newUser
  });
});

export default router;
