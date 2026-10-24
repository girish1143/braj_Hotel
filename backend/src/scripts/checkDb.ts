import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('\n🔍 --- Brijnidhi MySQL® Database Connection Diagnostic ---');
  console.log('Host:    ', process.env.DB_HOST || '(not set)');
  console.log('Port:    ', process.env.DB_PORT || '3306');
  console.log('User:    ', process.env.DB_USER || '(not set)');
  console.log('Database:', process.env.DB_NAME || 'brijnidhi');
  console.log('SSL:     ', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');
  console.log('-----------------------------------------------------------\n');

  if (!process.env.DB_HOST) {
    console.error('❌ Error: DB_HOST is not set in backend/.env.');
    console.error('   Please define DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.');
    process.exit(1);
  }

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'brijnidhi',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const [verRows]: any = await conn.query('SELECT VERSION() as version');
    const version = verRows[0]?.version || 'Unknown';
    console.log(`✅ Successfully connected to MySQL Server! Version: ${version}`);

    const [tableRows]: any = await conn.query('SHOW TABLES');
    console.log(`📋 Found ${tableRows.length} tables in database '${process.env.DB_NAME}':`);
    tableRows.forEach((row: any) => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });

    await conn.end();
    console.log('\n🎉 MySQL diagnostic test passed successfully.\n');
  } catch (err: any) {
    console.error(`\n❌ Failed to connect to MySQL database: ${err.message}`);
    console.error(`   Code: ${err.code || 'UNKNOWN'}`);
    process.exit(1);
  }
}

testConnection();
