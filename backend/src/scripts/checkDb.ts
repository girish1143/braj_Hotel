import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function checkDatabase() {
  console.log('🌸 ====================================================');
  console.log('   Brijnidhi AWS RDS MySQL Database Inspector');
  console.log('====================================================\n');

  const host = process.env.DB_HOST || '';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'admin';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'brijnidhi';

  console.log('📋 Connection Parameters:');
  console.log(`   - Host:     ${host || '(not configured in .env)'}`);
  console.log(`   - Port:     ${port}`);
  console.log(`   - User:     ${user}`);
  console.log(`   - Database: ${database}\n`);

  if (!host) {
    console.error('❌ DB_HOST is missing in backend/.env. Please configure your AWS RDS endpoint.');
    process.exit(1);
  }

  try {
    console.log(`🔌 Connecting to AWS RDS MySQL (${host})...`);
    let connection;
    try {
      connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
        connectTimeout: 10000
      });
    } catch (dbErr: any) {
      if (dbErr.code === 'ER_BAD_DB_ERROR') {
        console.log(`ℹ️ Database '${database}' does not exist yet. Creating database '${database}'...`);
        const rootConn = await mysql.createConnection({ host, port, user, password, connectTimeout: 10000 });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await rootConn.end();
        console.log(`✅ Database '${database}' created! Reconnecting...`);
        connection = await mysql.createConnection({ host, port, user, password, database, connectTimeout: 10000 });
      } else {
        throw dbErr;
      }
    }

    console.log('✅ Successfully connected to AWS RDS!\n');

    // 1. Show all tables
    console.log('📦 Existing Tables in Database:');
    const [tables]: any = await connection.query('SHOW TABLES;');
    const tableNames = tables.map((t: any) => Object.values(t)[0]);
    console.table(tableNames.map((name: string) => ({ Table: name })));

    // 2. Query users table
    if (tableNames.includes('users')) {
      console.log('\n👥 Users in `users` Table:');
      const [users]: any = await connection.query(
        'SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC;'
      );

      if (users.length === 0) {
        console.log('   (Table is currently empty. No users registered yet.)');
      } else {
        console.table(users);
        console.log(`✨ Total Registered Devotees/Users: ${users.length}`);
      }
    } else {
      console.warn('⚠️ Table `users` does not exist yet.');
    }

    // 3. Query bookings count
    if (tableNames.includes('bookings')) {
      const [bookings]: any = await connection.query('SELECT COUNT(*) as count FROM bookings;');
      console.log(`\n🏨 Total Bookings in RDS: ${bookings[0]?.count || 0}`);
    }

    await connection.end();
    console.log('\n🌸 Radhe Radhe! Check completed.');
  } catch (err: any) {
    console.error('\n❌ Could not connect to AWS RDS:');
    console.error(`   Message: ${err.message}`);
    if (err.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection timed out. Make sure:');
      console.error('   1. RDS "Publicly accessible" is set to "Yes".');
      console.error('   2. VPC Security Group inbound rule allows port 3306 from your IP.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Please verify DB_USER and DB_PASSWORD in backend/.env.');
    }
  }
}

checkDatabase();
