import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'HOTEL_ADMIN' | 'SYSTEM_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  joined?: string;
  created_at?: string;
}

const STORE_PATH = path.join(__dirname, 'usersStore.json');

const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'usr-admin-01',
    name: 'Girish Sharma',
    email: 'admin@brijnidhi.org',
    phone: '+91 99999 88888',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    joined: '24 Oct 2026',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-admin-02',
    name: 'Girish Sharma',
    email: 'girish@braj.org',
    phone: '9999988888',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    joined: '24 Oct 2026',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-admin-03',
    name: 'System Administrator',
    email: 'admin@brijnidhi.com',
    phone: '+91 99999 00000',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    joined: '24 Oct 2026',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-devotee-01',
    name: 'Girish Sharma',
    email: 'girishsharma1143@gmail.com',
    phone: '9149026598',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    joined: '24 Oct 2026',
    created_at: new Date().toISOString()
  },
  {
    id: 'usr-devotee-02',
    name: 'Radhe Krishna Das',
    email: 'radhe.test@gmail.com',
    phone: 'Google Account',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    joined: '24 Oct 2026',
    created_at: new Date().toISOString()
  }
];

let users: UserRecord[] = [...DEFAULT_USERS];

function loadUsers(): void {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        users = parsed;
        return;
      }
    }
  } catch (err: any) {
    console.warn('[UserStore] Error loading users from disk:', err.message);
  }
  persistUsers();
}

function persistUsers(): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[UserStore] Error saving users to disk:', err.message);
  }
}

// Initialize on module load
loadUsers();

export function getAllUsers(): UserRecord[] {
  return [...users];
}

export function getUserById(id: string): UserRecord | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  const clean = (email || '').trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === clean);
}

export function getUserByPhone(phone: string): UserRecord | undefined {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  return users.find((u) => u.phone && u.phone.replace(/[^0-9]/g, '').includes(clean));
}

export function getUserByIdentifier(identifier: string): UserRecord | undefined {
  const clean = (identifier || '').trim().toLowerCase();
  return users.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.phone && u.phone.toLowerCase() === clean) ||
      (u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(clean.slice(-10)))
  );
}

export function saveUser(user: UserRecord): UserRecord {
  const idx = users.findIndex(
    (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.unshift(user);
  }
  persistUsers();
  return user;
}

export function deleteUser(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    users.splice(idx, 1);
    persistUsers();
    return true;
  }
  return false;
}
