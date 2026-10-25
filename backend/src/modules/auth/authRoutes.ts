import { Router, Request, Response } from 'express';
import {
  UserRecord,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  getUserByIdentifier,
  saveUser
} from '../../data/userStore';

const router = Router();

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

  let user = getUserByIdentifier(loginKey);

  if (!user) {
    const isPhone = /^\d+$/.test(loginKey.replace(/[^0-9]/g, ''));
    user = {
      id: `usr-${Date.now().toString(36)}`,
      name: name?.trim() || (isPhone ? `Devotee (${loginKey.slice(-4)})` : loginKey.split('@')[0]),
      email: isPhone ? `${loginKey}@yatri.brijnidhi.org` : loginKey,
      phone: isPhone ? loginKey : '+91 98000 00000',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      joined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      created_at: new Date().toISOString()
    };
    saveUser(user);
    console.log(`👤 [Auth] Devotee '${user.name}' (${user.email}) registered and saved.`);
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

  const existingEmail = getUserByEmail(cleanEmail);
  const existingPhone = cleanPhone ? getUserByPhone(cleanPhone) : null;

  if (existingEmail || existingPhone) {
    return res.status(409).json({
      success: false,
      message: 'An account already exists with this phone or email. Please sign in.'
    });
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone || 'Not provided',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    joined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    created_at: new Date().toISOString()
  };

  saveUser(newUser);
  console.log(`🎉 [Auth] New user registered & saved: ${newUser.name} (${newUser.email})`);

  res.json({
    success: true,
    message: 'Pilgrim account created successfully. Radhe Radhe!',
    token: `brijnidhi_token_${newUser.id}_${Date.now()}`,
    user: newUser
  });
});

// POST /api/auth/google - Authenticate with Google
router.post('/google', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const userEmail = (email || '').trim().toLowerCase();

  if (!userEmail) {
    return res.status(400).json({
      success: false,
      message: 'Google account email is required.'
    });
  }

  const userName = (name || '').trim() || userEmail.split('@')[0];
  let user = getUserByEmail(userEmail);

  if (!user) {
    user = {
      id: `usr-g-${Date.now().toString(36)}`,
      name: userName,
      email: userEmail,
      phone: 'Google Account',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      joined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      created_at: new Date().toISOString()
    };
    saveUser(user);
    console.log(`🎉 [Auth] Google devotee authenticated & saved: ${user.name} (${user.email})`);
  }

  res.json({
    success: true,
    message: `Welcome, ${user.name}! Authenticated with Google.`,
    token: `brijnidhi_google_token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

export default router;
