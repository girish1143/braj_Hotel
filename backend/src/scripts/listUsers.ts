import { getAllUsers } from '../data/userStore';

function listUsers() {
  const users = getAllUsers();
  console.log(`\n👥 Total Users in System (In-Memory / JSON Store): ${users.length}\n`);
  if (users.length === 0) {
    console.log('No users registered yet.');
  } else {
    console.table(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        joined: u.joined
      }))
    );
  }
}

listUsers();
