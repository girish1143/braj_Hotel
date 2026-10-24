import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function listUsers() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const [rows]: any = await conn.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    console.log(`\n👥 Total Users in Database '${process.env.DB_NAME}': ${rows.length}\n`);
    if (rows.length === 0) {
      console.log('No users stored in database yet. Register a user from the web app or API.');
    } else {
      console.table(rows);
    }

    await conn.end();
  } catch (err: any) {
    console.error('Error querying users:', err.message);
  }
}

listUsers();
