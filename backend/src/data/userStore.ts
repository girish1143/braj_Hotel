import { getDb } from '../db/sqlite';

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

export function getAllUsers(): UserRecord[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      id, name, email, phone, role, status, created_at,
      strftime('%d %b %Y', created_at) as joined
    FROM users
    ORDER BY created_at DESC
  `).all() as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone || '',
    role: r.role,
    status: r.status,
    joined: r.joined || 'Recent',
    created_at: r.created_at
  }));
}

export function getUserById(id: string): UserRecord | undefined {
  const db = getDb();
  const r = db.prepare(`
    SELECT 
      id, name, email, phone, role, status, created_at,
      strftime('%d %b %Y', created_at) as joined
    FROM users 
    WHERE id = ?
  `).get(id) as any;

  if (!r) return undefined;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone || '',
    role: r.role,
    status: r.status,
    joined: r.joined || 'Recent',
    created_at: r.created_at
  };
}

export function getUserByEmail(email: string): UserRecord | undefined {
  const clean = (email || '').trim().toLowerCase();
  const db = getDb();
  const r = db.prepare(`
    SELECT 
      id, name, email, phone, role, status, created_at,
      strftime('%d %b %Y', created_at) as joined
    FROM users 
    WHERE LOWER(email) = ?
  `).get(clean) as any;

  if (!r) return undefined;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone || '',
    role: r.role,
    status: r.status,
    joined: r.joined || 'Recent',
    created_at: r.created_at
  };
}

export function getUserByPhone(phone: string): UserRecord | undefined {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (!clean) return undefined;

  const db = getDb();
  const r = db.prepare(`
    SELECT 
      id, name, email, phone, role, status, created_at,
      strftime('%d %b %Y', created_at) as joined
    FROM users 
    WHERE phone LIKE ?
  `).get(`%${clean.slice(-10)}%`) as any;

  if (!r) return undefined;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone || '',
    role: r.role,
    status: r.status,
    joined: r.joined || 'Recent',
    created_at: r.created_at
  };
}

export function getUserByIdentifier(identifier: string): UserRecord | undefined {
  const clean = (identifier || '').trim().toLowerCase();
  const byEmail = getUserByEmail(clean);
  if (byEmail) return byEmail;
  return getUserByPhone(clean);
}

export function saveUser(user: UserRecord): UserRecord {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, phone, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      phone = excluded.phone,
      role = excluded.role,
      status = excluded.status
  `);

  stmt.run(
    user.id,
    user.name,
    user.email.trim().toLowerCase(),
    user.phone || null,
    user.role || 'CUSTOMER',
    user.status || 'ACTIVE'
  );

  return getUserByEmail(user.email) || user;
}

export function deleteUser(id: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return res.changes > 0;
}
