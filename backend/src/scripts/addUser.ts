import { saveUser, getAllUsers, UserRecord } from '../data/userStore';

function getArg(flag: string, fallback: string = ''): string {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return fallback;
}

function addUser() {
  const name = getArg('--name', 'Girish Sharma');
  const email = getArg('--email', 'admin@brijnidhi.org');
  const phone = getArg('--phone', '+91 99999 88888');
  const role = (getArg('--role', 'SYSTEM_ADMIN') as any);
  const status = (getArg('--status', 'ACTIVE') as any);

  console.log('\n➕ Adding User:');
  console.log(`   Name:   ${name}`);
  console.log(`   Email:  ${email}`);
  console.log(`   Phone:  ${phone}`);
  console.log(`   Role:   ${role}`);
  console.log(`   Status: ${status}\n`);

  const userId = `usr-${Date.now().toString(36)}`;
  const newUser: UserRecord = {
    id: userId,
    name,
    email,
    phone,
    role,
    status,
    joined: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    created_at: new Date().toISOString()
  };

  saveUser(newUser);

  console.log(`✅ Success! User '${name}' (${email}) is now saved in user registry.`);
  const all = getAllUsers();
  console.log(`\n📋 Current users in system (${all.length}):`);
  console.table(
    all.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status
    }))
  );
}

addUser();
