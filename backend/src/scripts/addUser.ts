import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

// Helper to parse CLI arguments like --name "Devotee" --email "devotee@braj.org"
function getArg(flag: string, fallback: string = ''): string {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return fallback;
}

async function addUser() {
  const name = getArg('--name', 'Girish Sharma');
  const email = getArg('--email', 'admin@brijnidhi.org');
  const phone = getArg('--phone', '+91 99999 88888');
  const role = getArg('--role', 'SYSTEM_ADMIN'); // CUSTOMER | HOTEL_ADMIN | SYSTEM_ADMIN
  const status = getArg('--status', 'ACTIVE');

  console.log('\n➕ Adding User to MySQL Database:');
  console.log(`   Name:   ${name}`);
  console.log(`   Email:  ${email}`);
  console.log(`   Phone:  ${phone}`);
  console.log(`   Role:   ${role}`);
  console.log(`   Status: ${status}\n`);

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const userId = `usr-${Date.now().toString(36)}`;

    await conn.query(
      `INSERT INTO users (id, name, email, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), role=VALUES(role), status=VALUES(status)`,
      [userId, name, email, phone, role, status]
    );

    console.log(`✅ Success! User '${name}' (${email}) is now saved in table 'users'.`);

    const [rows]: any = await conn.query('SELECT id, name, email, phone, role, status FROM users ORDER BY created_at DESC');
    console.log(`\n📋 Current users in database (${rows.length}):`);
    console.table(rows);

    await conn.end();
  } catch (err: any) {
    console.error(`❌ Error inserting user into MySQL: ${err.message}`);
  }
}

addUser();
