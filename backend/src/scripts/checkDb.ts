import { getAllUsers } from '../data/userStore';

function checkStorage() {
  console.log('\n🔍 --- Brijnidhi Storage Diagnostic ---');
  console.log('Mode:       Standalone In-Memory & Local JSON Store');
  console.log('Database:   None required (Zero external DB dependency)');
  console.log('-----------------------------------------------------\n');

  const users = getAllUsers();
  console.log(`✅ Storage subsystem active. Registered users in store: ${users.length}`);
  console.log('\n🎉 Storage diagnostic test passed. System is ready to run without MySQL!\n');
}

checkStorage();
