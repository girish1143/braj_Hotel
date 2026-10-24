import crypto from 'crypto';

/**
 * Enterprise Password Hashing and Cryptographic Utilities
 * Using NIST-approved PBKDF2 with HMAC-SHA512 and random 128-bit salts.
 */

export interface PasswordHashResult {
  hash: string;
  salt: string;
}

/**
 * Securely hashes a plain text password with a random cryptographic salt.
 */
export function hashPassword(password: string, existingSalt?: string): PasswordHashResult {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Constant-time password verification to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  if (!password || !storedHash || !storedSalt) return false;
  try {
    const computedHash = crypto.pbkdf2Sync(password, storedSalt, 100000, 64, 'sha512').toString('hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (computedBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates an 8-12 character strong temporary password containing upper, lower, digits and special character.
 */
export function generateTempPassword(length = 10): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%&*';

  let pwd = '';
  pwd += uppers[crypto.randomInt(0, uppers.length)];
  pwd += lowers[crypto.randomInt(0, lowers.length)];
  pwd += digits[crypto.randomInt(0, digits.length)];
  pwd += specials[crypto.randomInt(0, specials.length)];

  const allChars = uppers + lowers + digits + specials;
  for (let i = 4; i < length; i++) {
    pwd += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Generates a unique employee ID formatted with hotel / dept prefix.
 */
export function generateEmployeeId(deptCode = 'STF'): string {
  const randomNum = crypto.randomInt(100, 999);
  return `EMP-${deptCode.toUpperCase()}-${randomNum}`;
}
