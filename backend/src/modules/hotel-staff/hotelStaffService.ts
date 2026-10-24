import { hashPassword, verifyPassword, generateTempPassword, generateEmployeeId } from '../../utils/security';
import { addHotel } from '../../data/hotels';

export type StaffRole =
  | 'Admin'
  | 'Manager'
  | 'Receptionist'
  | 'Housekeeping'
  | 'Accountant'
  | 'Restaurant Staff';

export type StaffDepartment =
  | 'Administration'
  | 'Front Office'
  | 'Housekeeping'
  | 'Accounts & Finance'
  | 'Food & Beverage'
  | 'Operations & Management';

export type StaffStatus = 'Active' | 'Inactive' | 'Suspended';

export interface StaffAccount {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  phone: string;
  department: StaffDepartment;
  position: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  role: StaffRole;
  permissions: string[];
  status: StaffStatus;
  joiningDate: string;
  hotelId: string;
  hotelName: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffActivityLog {
  id: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  action: string;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
}

// Role Permissions Definitions
export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  Admin: [
    'ALL_PERMISSIONS',
    'STAFF_CREATE',
    'STAFF_EDIT',
    'STAFF_DELETE',
    'STAFF_RESET_PWD',
    'FRONT_DESK',
    'TAPE_CHART',
    'HOUSEKEEPING',
    'BILLING_POS',
    'AUDIT_LOGS',
    'HOTEL_SETTINGS'
  ],
  Manager: [
    'OPERATIONS_VIEW',
    'STAFF_VIEW',
    'FRONT_DESK',
    'TAPE_CHART',
    'HOUSEKEEPING',
    'REPORTS_VIEW'
  ],
  Receptionist: [
    'FRONT_DESK',
    'GUEST_CHECKIN',
    'GUEST_CHECKOUT',
    'RESERVATIONS_MANAGE',
    'FOLIO_ADD'
  ],
  Housekeeping: [
    'HOUSEKEEPING_VIEW',
    'ROOM_CLEAN_UPDATE',
    'MAINTENANCE_TICKET'
  ],
  Accountant: [
    'BILLING_VIEW',
    'INVOICES_MANAGE',
    'SHIFT_BALANCING',
    'SETTLE_PAYMENTS',
    'FINANCIAL_REPORTS'
  ],
  'Restaurant Staff': [
    'RESTAURANT_ORDERS',
    'ROOM_SERVICE_FOLIO',
    'BHOJAN_MENU'
  ]
};

// In-Memory Seed Staff Roster
const initialAdminPwd = hashPassword('BrijAdmin@2026');
const initialStaffPwd = hashPassword('BrijStaff@2026');

const staffRoster: StaffAccount[] = [
  {
    id: 'stf-001',
    fullName: 'Girish Sharma',
    employeeId: 'EMP-ADM-001',
    email: 'admin@brijnidhi.org',
    phone: '+91 98765 43210',
    department: 'Administration',
    position: 'General Director & Chief Admin',
    username: 'admin',
    passwordHash: initialAdminPwd.hash,
    passwordSalt: initialAdminPwd.salt,
    role: 'Admin',
    permissions: ROLE_PERMISSIONS['Admin'],
    status: 'Active',
    joiningDate: '2024-01-01',
    hotelId: 'prop-vrn-01',
    hotelName: 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: false,
    lastLoginAt: '2026-10-16 22:30:00',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-10-16T22:30:00Z'
  },
  {
    id: 'stf-002',
    fullName: 'Rajesh Verma',
    employeeId: 'EMP-MGR-002',
    email: 'rajesh.verma@brijnidhi.org',
    phone: '+91 98111 22334',
    department: 'Operations & Management',
    position: 'Hotel Operations Manager',
    username: 'manager',
    passwordHash: initialStaffPwd.hash,
    passwordSalt: initialStaffPwd.salt,
    role: 'Manager',
    permissions: ROLE_PERMISSIONS['Manager'],
    status: 'Active',
    joiningDate: '2024-03-15',
    hotelId: 'prop-vrn-01',
    hotelName: 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: false,
    lastLoginAt: '2026-10-16 18:45:00',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2026-10-16T18:45:00Z'
  },
  {
    id: 'stf-003',
    fullName: 'Priya Goswami',
    employeeId: 'EMP-REC-101',
    email: 'priya.goswami@brijnidhi.org',
    phone: '+91 98222 33445',
    department: 'Front Office',
    position: 'Front Desk Lead',
    username: 'reception',
    passwordHash: initialStaffPwd.hash,
    passwordSalt: initialStaffPwd.salt,
    role: 'Receptionist',
    permissions: ROLE_PERMISSIONS['Receptionist'],
    status: 'Active',
    joiningDate: '2024-06-01',
    hotelId: 'prop-vrn-01',
    hotelName: 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: false,
    lastLoginAt: '2026-10-17 06:15:00',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-10-17T06:15:00Z'
  },
  {
    id: 'stf-004',
    fullName: 'Kailash Yadav',
    employeeId: 'EMP-HK-201',
    email: 'kailash.yadav@brijnidhi.org',
    phone: '+91 98333 44556',
    department: 'Housekeeping',
    position: 'Housekeeping Supervisor',
    username: 'housekeeping',
    passwordHash: initialStaffPwd.hash,
    passwordSalt: initialStaffPwd.salt,
    role: 'Housekeeping',
    permissions: ROLE_PERMISSIONS['Housekeeping'],
    status: 'Active',
    joiningDate: '2024-07-10',
    hotelId: 'prop-vrn-01',
    hotelName: 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: false,
    lastLoginAt: '2026-10-16 14:00:00',
    createdAt: '2024-07-10T00:00:00Z',
    updatedAt: '2026-10-16T14:00:00Z'
  },
  {
    id: 'stf-005',
    fullName: 'Neha Mathur',
    employeeId: 'EMP-ACC-301',
    email: 'neha.mathur@brijnidhi.org',
    phone: '+91 98444 55667',
    department: 'Accounts & Finance',
    position: 'Head Cashier & Accountant',
    username: 'accountant',
    passwordHash: initialStaffPwd.hash,
    passwordSalt: initialStaffPwd.salt,
    role: 'Accountant',
    permissions: ROLE_PERMISSIONS['Accountant'],
    status: 'Active',
    joiningDate: '2024-08-01',
    hotelId: 'prop-vrn-01',
    hotelName: 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: false,
    lastLoginAt: '2026-10-16 17:30:00',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2026-10-16T17:30:00Z'
  },
  {
    id: 'stf-006',
    fullName: 'Vikas Sharma',
    employeeId: 'EMP-RES-401',
    email: 'vikas.sharma@brijnidhi.org',
    phone: '+91 98555 66778',
    department: 'Food & Beverage',
    position: 'Braj Satvik Dining Lead',
    username: 'restaurant',
    passwordHash: initialStaffPwd.hash,
    passwordSalt: initialStaffPwd.salt,
    role: 'Restaurant Staff',
    permissions: ROLE_PERMISSIONS['Restaurant Staff'],
    status: 'Active',
    joiningDate: '2024-09-01',
    hotelId: 'prop-vrn-01',
    hotelName: 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: false,
    lastLoginAt: '2026-10-16 19:15:00',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2026-10-16T19:15:00Z'
  }
];

// Activity and Login Audit Trail
const activityLogs: StaffActivityLog[] = [
  {
    id: 'act-01',
    timestamp: 'Today, 06:15 AM',
    staffId: 'stf-003',
    staffName: 'Priya Goswami (Receptionist)',
    action: 'STAFF_LOGIN',
    details: 'Signed in successfully for morning front desk shift.',
    ip: '192.168.1.101',
    status: 'SUCCESS'
  },
  {
    id: 'act-02',
    timestamp: 'Yesterday, 10:30 PM',
    staffId: 'stf-001',
    staffName: 'Girish Sharma (Admin)',
    action: 'STAFF_LOGIN',
    details: 'Admin verified night audit and security configuration.',
    ip: '192.168.1.1',
    status: 'SUCCESS'
  }
];

export function logActivity(
  staffId: string,
  staffName: string,
  action: string,
  details: string,
  ip = '127.0.0.1',
  status: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS'
) {
  const log: StaffActivityLog = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    staffId,
    staffName,
    action,
    details,
    ip,
    status
  };
  activityLogs.unshift(log);
  if (activityLogs.length > 200) activityLogs.pop();
  return log;
}

export function getAllActivityLogs(): StaffActivityLog[] {
  return activityLogs;
}

// Failed login attempts tracker for brute force protection (5 attempts = 15m lockout)
const failedAttemptsTracker: Record<string, { count: number; lockedUntil: number }> = {};

/**
 * Authenticate staff with email OR username and password.
 * Includes brute-force protection (lockout after 5 failed attempts).
 */
export function authenticateStaff(identifier: string, plainPassword: string, ip = '127.0.0.1') {
  const cleanId = (identifier || '').trim().toLowerCase();
  if (!cleanId || !plainPassword) {
    throw new Error('Please enter your email or username and password.');
  }

  // 1. Check for active lockout
  const lockout = failedAttemptsTracker[cleanId];
  if (lockout && lockout.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((lockout.lockedUntil - Date.now()) / (60 * 1000));
    throw new Error(`Account temporarily locked due to 5 consecutive failed login attempts. Please wait ${minutesLeft} minute(s) or contact your Hotel Administrator.`);
  }

  const staff = staffRoster.find(
    s => s.email.toLowerCase() === cleanId || s.username.toLowerCase() === cleanId
  );

  if (!staff) {
    logActivity('unknown', cleanId, 'LOGIN_FAILED', 'Account not found with provided identifier.', ip, 'FAILED');
    throw new Error('Invalid email/username or password.');
  }

  if (staff.status === 'Inactive') {
    logActivity(staff.id, staff.fullName, 'LOGIN_BLOCKED', 'Account is deactivated by Hotel Administrator.', ip, 'WARNING');
    throw new Error('This account has been deactivated. Please contact your Hotel Administrator.');
  }

  if (staff.status === 'Suspended') {
    logActivity(staff.id, staff.fullName, 'LOGIN_BLOCKED', 'Account is suspended due to security policy.', ip, 'WARNING');
    throw new Error('This account is suspended. Access denied.');
  }

  const isValid = verifyPassword(plainPassword, staff.passwordHash, staff.passwordSalt);
  if (!isValid) {
    const currentAttempts = (failedAttemptsTracker[cleanId]?.count || 0) + 1;
    if (currentAttempts >= 5) {
      failedAttemptsTracker[cleanId] = {
        count: currentAttempts,
        lockedUntil: Date.now() + 15 * 60 * 1000 // 15 mins
      };
      logActivity(staff.id, staff.fullName, 'ACCOUNT_LOCKED', 'Locked for 15 minutes due to 5 consecutive failed login attempts.', ip, 'WARNING');
      throw new Error('Account locked for 15 minutes due to 5 consecutive failed login attempts.');
    } else {
      failedAttemptsTracker[cleanId] = {
        count: currentAttempts,
        lockedUntil: 0
      };
      const attemptsLeft = 5 - currentAttempts;
      logActivity(staff.id, staff.fullName, 'LOGIN_FAILED', `Incorrect password. ${attemptsLeft} attempts remaining before temporary lockout.`, ip, 'FAILED');
      throw new Error(`Invalid email/username or password. ${attemptsLeft} attempt(s) remaining before temporary lockout.`);
    }
  }

  // Reset failed attempts upon successful authentication
  delete failedAttemptsTracker[cleanId];

  // Update last login
  staff.lastLoginAt = new Date().toISOString();
  staff.updatedAt = new Date().toISOString();

  logActivity(staff.id, staff.fullName, 'STAFF_LOGIN', `Logged in successfully as ${staff.role}.`, ip, 'SUCCESS');

  // Strip password fields
  const { passwordHash, passwordSalt, ...safeProfile } = staff;
  return {
    profile: safeProfile,
    token: `brij_staff_sec_${staff.id}_${Date.now()}`,
    mustChangePassword: staff.mustChangePassword
  };
}

/**
 * Staff Member Updates Their Own Permitted Profile Information.
 */
export function updateStaffProfile(
  staffId: string,
  data: { phone?: string; email?: string; fullName?: string },
  ip = '127.0.0.1'
) {
  const staff = staffRoster.find(s => s.id === staffId);
  if (!staff) throw new Error('Staff member not found.');

  if (data.email && data.email.toLowerCase() !== staff.email.toLowerCase()) {
    const cleanEmail = data.email.trim().toLowerCase();
    if (staffRoster.some(s => s.id !== staffId && s.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Email '${cleanEmail}' is already registered to another staff member.`);
    }
    staff.email = cleanEmail;
  }

  if (data.phone) staff.phone = data.phone.trim();
  if (data.fullName) staff.fullName = data.fullName.trim();
  staff.updatedAt = new Date().toISOString();

  logActivity(
    staff.id,
    staff.fullName,
    'PROFILE_UPDATED',
    'Staff member updated their permitted contact profile information.',
    ip,
    'SUCCESS'
  );

  const { passwordHash, passwordSalt, ...safeProfile } = staff;
  return safeProfile;
}

/**
 * Admin Creates a New Staff Account.
 */
export function createStaffAccount(
  data: {
    fullName: string;
    employeeId?: string;
    email: string;
    phone: string;
    department: StaffDepartment;
    position: string;
    username: string;
    temporaryPassword?: string;
    role: StaffRole;
    status?: StaffStatus;
    joiningDate?: string;
    hotelId?: string;
    hotelName?: string;
  },
  adminName = 'Admin',
  ip = '127.0.0.1'
) {
  // 1. Validation
  if (!data.fullName?.trim()) throw new Error('Full Name is required.');
  if (!data.email?.trim() || !data.email.includes('@')) throw new Error('A valid Email address is required.');
  if (!data.phone?.trim()) throw new Error('Phone Number is required.');
  if (!data.username?.trim()) throw new Error('Username is required.');
  if (!data.department) throw new Error('Department must be selected.');
  if (!data.position?.trim()) throw new Error('Job Position is required.');
  if (!data.role) throw new Error('Role must be assigned.');

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanUsername = data.username.trim().toLowerCase();
  const empId = data.employeeId?.trim() || generateEmployeeId(data.department.substring(0, 3));

  // 2. Uniqueness Checks
  if (staffRoster.some(s => s.email.toLowerCase() === cleanEmail)) {
    throw new Error(`Email '${cleanEmail}' is already registered to another staff member.`);
  }
  if (staffRoster.some(s => s.username.toLowerCase() === cleanUsername)) {
    throw new Error(`Username '${cleanUsername}' is already taken. Please choose another.`);
  }
  if (staffRoster.some(s => s.employeeId.toUpperCase() === empId.toUpperCase())) {
    throw new Error(`Employee ID '${empId}' is already assigned.`);
  }

  // 3. Password Generation & Hashing
  const tempPassword = data.temporaryPassword?.trim() || generateTempPassword();
  const { hash, salt } = hashPassword(tempPassword);

  const permissions = ROLE_PERMISSIONS[data.role] || [];

  const newStaff: StaffAccount = {
    id: `stf-${Date.now()}`,
    fullName: data.fullName.trim(),
    employeeId: empId,
    email: cleanEmail,
    phone: data.phone.trim(),
    department: data.department,
    position: data.position.trim(),
    username: cleanUsername,
    passwordHash: hash,
    passwordSalt: salt,
    role: data.role,
    permissions,
    status: data.status || 'Active',
    joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
    hotelId: data.hotelId || 'prop-vrn-01',
    hotelName: data.hotelName || 'Brijnidhi Braj Dham Heritage Suites',
    mustChangePassword: true, // Forces password change on first login
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  staffRoster.push(newStaff);

  logActivity(
    newStaff.id,
    newStaff.fullName,
    'STAFF_CREATED',
    `Created by ${adminName}. Role: ${newStaff.role}, Employee ID: ${newStaff.employeeId}`,
    ip,
    'SUCCESS'
  );

  const { passwordHash: _, passwordSalt: __, ...safeProfile } = newStaff;
  return {
    staff: safeProfile,
    generatedPassword: tempPassword
  };
}

/**
 * Admin Updates an Existing Staff Account.
 */
export function updateStaffAccount(
  staffId: string,
  updates: Partial<Omit<StaffAccount, 'id' | 'passwordHash' | 'passwordSalt'>>,
  adminName = 'Admin',
  ip = '127.0.0.1'
) {
  const staff = staffRoster.find(s => s.id === staffId);
  if (!staff) throw new Error('Staff member not found.');

  // Validate uniqueness if changing email or username
  if (updates.email && updates.email.toLowerCase() !== staff.email.toLowerCase()) {
    if (staffRoster.some(s => s.id !== staffId && s.email.toLowerCase() === updates.email!.toLowerCase())) {
      throw new Error(`Email '${updates.email}' is already in use.`);
    }
    staff.email = updates.email.trim().toLowerCase();
  }

  if (updates.username && updates.username.toLowerCase() !== staff.username.toLowerCase()) {
    if (staffRoster.some(s => s.id !== staffId && s.username.toLowerCase() === updates.username!.toLowerCase())) {
      throw new Error(`Username '${updates.username}' is already in use.`);
    }
    staff.username = updates.username.trim().toLowerCase();
  }

  if (updates.fullName) staff.fullName = updates.fullName.trim();
  if (updates.phone) staff.phone = updates.phone.trim();
  if (updates.department) staff.department = updates.department;
  if (updates.position) staff.position = updates.position.trim();
  if (updates.status) staff.status = updates.status;
  if (updates.role) {
    staff.role = updates.role;
    staff.permissions = ROLE_PERMISSIONS[updates.role] || [];
  }

  staff.updatedAt = new Date().toISOString();

  logActivity(
    staff.id,
    staff.fullName,
    'STAFF_UPDATED',
    `Profile details updated by ${adminName}. Status: ${staff.status}, Role: ${staff.role}`,
    ip,
    'SUCCESS'
  );

  const { passwordHash: _, passwordSalt: __, ...safeProfile } = staff;
  return safeProfile;
}

/**
 * Admin Resets Staff Password.
 */
export function adminResetStaffPassword(staffId: string, adminName = 'Admin', ip = '127.0.0.1') {
  const staff = staffRoster.find(s => s.id === staffId);
  if (!staff) throw new Error('Staff account not found.');

  const tempPassword = generateTempPassword();
  const { hash, salt } = hashPassword(tempPassword);

  staff.passwordHash = hash;
  staff.passwordSalt = salt;
  staff.mustChangePassword = true;
  staff.updatedAt = new Date().toISOString();

  logActivity(
    staff.id,
    staff.fullName,
    'PASSWORD_RESET_ADMIN',
    `Temporary password issued by ${adminName}. Must change on next login.`,
    ip,
    'WARNING'
  );

  return {
    staffId: staff.id,
    fullName: staff.fullName,
    username: staff.username,
    newTemporaryPassword: tempPassword
  };
}

/**
 * Staff changes their password (forced on first login or voluntarily in profile).
 */
export function changeStaffPassword(
  staffId: string,
  currentPassword: string,
  newPassword: string,
  ip = '127.0.0.1'
) {
  const staff = staffRoster.find(s => s.id === staffId);
  if (!staff) throw new Error('Staff account not found.');

  if (!staff.mustChangePassword) {
    const isCurrentValid = verifyPassword(currentPassword, staff.passwordHash, staff.passwordSalt);
    if (!isCurrentValid) throw new Error('The current password entered is incorrect.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const { hash, salt } = hashPassword(newPassword);
  staff.passwordHash = hash;
  staff.passwordSalt = salt;
  staff.mustChangePassword = false;
  staff.updatedAt = new Date().toISOString();

  logActivity(
    staff.id,
    staff.fullName,
    'PASSWORD_CHANGED',
    'Staff member successfully updated their account password.',
    ip,
    'SUCCESS'
  );

  return { success: true, message: 'Password updated successfully!' };
}

/**
 * Directory Search, Filtering, Sorting and Pagination.
 */
export function getStaffDirectory(filters: {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  let list = staffRoster.map(({ passwordHash, passwordSalt, ...rest }) => rest);

  // Search filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      s =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.position.toLowerCase().includes(q)
    );
  }

  // Department filter
  if (filters.department && filters.department !== 'ALL') {
    list = list.filter(s => s.department === filters.department);
  }

  // Role filter
  if (filters.role && filters.role !== 'ALL') {
    list = list.filter(s => s.role === filters.role);
  }

  // Status filter
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(s => s.status === filters.status);
  }

  const total = list.length;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 15);
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    staff: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Summary metrics for Admin Dashboard.
 */
export function getStaffMetrics() {
  const total = staffRoster.length;
  const active = staffRoster.filter(s => s.status === 'Active').length;
  const inactive = staffRoster.filter(s => s.status === 'Inactive').length;
  const suspended = staffRoster.filter(s => s.status === 'Suspended').length;

  const departmentCounts: Record<string, number> = {};
  const roleCounts: Record<string, number> = {};

  staffRoster.forEach(s => {
    departmentCounts[s.department] = (departmentCounts[s.department] || 0) + 1;
    roleCounts[s.role] = (roleCounts[s.role] || 0) + 1;
  });

  return {
    total,
    active,
    inactive,
    suspended,
    departmentCounts,
    roleCounts
  };
}

/**
 * Register a new Hotel Partner with its primary Admin account.
 */
export function registerHotelPartner(
  data: {
    hotelName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  },
  ip = '127.0.0.1'
) {
  // 1. Validation
  if (!data.hotelName?.trim()) throw new Error('Hotel name is required.');
  if (!data.ownerName?.trim()) throw new Error('Owner / General Manager name is required.');
  if (!data.email?.trim() || !data.email.includes('@')) throw new Error('A valid email address is required.');
  if (!data.phone?.trim() || data.phone.trim().length < 10) throw new Error('A valid 10-digit phone number is required.');
  if (!data.address?.trim()) throw new Error('Hotel address is required.');
  if (!data.password || data.password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.trim();
  const cleanHotelName = data.hotelName.trim();
  const cleanOwnerName = data.ownerName.trim();
  const cleanAddress = data.address.trim();

  // 2. Uniqueness Checks
  if (staffRoster.some(s => s.email.toLowerCase() === cleanEmail)) {
    throw new Error(`An account with email '${cleanEmail}' already exists. Please sign in instead.`);
  }

  // 3. Create Unique IDs
  const hotelId = `prop-${Date.now()}`;
  const empId = `EMP-OWN-${Math.floor(100 + Math.random() * 900)}`;

  // 4. Secure Password Hashing
  const { hash, salt } = hashPassword(data.password);

  // 5. Create Primary Hotel Admin Staff Account
  const newAdmin: StaffAccount = {
    id: `stf-${Date.now()}`,
    fullName: cleanOwnerName,
    employeeId: empId,
    email: cleanEmail,
    phone: cleanPhone,
    department: 'Administration',
    position: 'Hotel Owner & Lead Administrator',
    username: cleanEmail.split('@')[0],
    passwordHash: hash,
    passwordSalt: salt,
    role: 'Admin',
    permissions: ROLE_PERMISSIONS['Admin'],
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
    hotelId,
    hotelName: cleanHotelName,
    mustChangePassword: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  staffRoster.push(newAdmin);

  // Also register hotel in catalog so it can be seen
  try {
    addHotel({
      id: hotelId,
      name: cleanHotelName,
      address: cleanAddress,
      destinationSlug: 'vrindavan',
      destinationName: 'Vrindavan',
      pureSatvikKitchen: true
    });
  } catch {}

  logActivity(
    newAdmin.id,
    newAdmin.fullName,
    'HOTEL_REGISTERED',
    `New hotel '${cleanHotelName}' registered by owner ${cleanOwnerName}.`,
    ip,
    'SUCCESS'
  );

  const { passwordHash, passwordSalt, ...safeProfile } = newAdmin;
  const token = `brij_staff_sec_${newAdmin.id}_${Date.now()}`;

  return {
    hotel: {
      id: hotelId,
      name: cleanHotelName,
      address: cleanAddress,
      ownerName: cleanOwnerName,
      email: cleanEmail,
      phone: cleanPhone
    },
    profile: safeProfile,
    token
  };
}

/**
 * Verify session token and retrieve active staff profile.
 */
export function verifyStaffToken(token: string) {
  if (!token) throw new Error('Authentication token required.');
  const parts = token.split('_');
  // Token structure: brij_staff_sec_<id>_<timestamp>
  const staffId = parts[3];
  if (!staffId) throw new Error('Invalid authentication token.');

  const staff = staffRoster.find(s => s.id === staffId);
  if (!staff) throw new Error('Session expired or account not found.');
  if (staff.status !== 'Active') throw new Error(`Account is currently ${staff.status}. Please contact administrator.`);

  const { passwordHash, passwordSalt, ...safeProfile } = staff;
  return safeProfile;
}
