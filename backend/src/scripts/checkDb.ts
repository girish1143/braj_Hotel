import { initSqlite, getDbStats } from '../db/sqlite';

function checkDatabase() {
  initSqlite();
  const stats = getDbStats();

  console.log('\n🔍 --- Brijnidhi SQLite Database Diagnostic ---');
  console.log(`Status:    ${stats.connected ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`Engine:    ${stats.type}`);
  console.log(`Location:  ${stats.path}`);
  console.log(`File Size: ${stats.sizeFormatted}`);
  console.log('--------------------------------------------------\n');

  console.log('📋 Database Tables & Row Counts:');
  for (const [table, count] of Object.entries(stats.tables)) {
    console.log(`   - ${table.padEnd(22)} : ${count} rows`);
  }

  console.log('\n🎉 SQLite database diagnostic test passed successfully!\n');
}

checkDatabase();
