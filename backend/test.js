const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

// Test database connection and user authentication
const db = new Database('./database/hospital.db');

console.log('Testing database connection...');

// Get all users
const users = db.prepare('SELECT * FROM users').all();
console.log('Users in database:', users);

// Test password comparison
const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@hospital.com');
console.log('Admin user found:', adminUser ? 'Yes' : 'No');

if (adminUser) {
  console.log('Testing password comparison...');
  bcrypt.compare('admin123', adminUser.password_hash).then(result => {
    console.log('Password match:', result);
    process.exit(0);
  });
} else {
  console.log('Admin user not found');
  process.exit(1);
}
