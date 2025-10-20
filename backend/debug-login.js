const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');

// Test the complete login flow
const db = new Database('./database/hospital.db');
const JWT_SECRET = 'your-secret-key';

async function testLogin() {
  console.log('Testing login flow...');
  
  const email = 'admin@hospital.com';
  const password = 'admin123';
  
  // Step 1: Find user
  console.log('Step 1: Finding user with email:', email);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('User found:', user ? 'Yes' : 'No');
  
  if (!user) {
    console.log('ERROR: User not found');
    return;
  }
  
  console.log('User details:', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password_hash: user.password_hash.substring(0, 20) + '...'
  });
  
  // Step 2: Check password
  console.log('Step 2: Checking password...');
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  console.log('Password valid:', isValidPassword);
  
  if (!isValidPassword) {
    console.log('ERROR: Invalid password');
    return;
  }
  
  // Step 3: Generate token
  console.log('Step 3: Generating JWT token...');
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  console.log('Token generated successfully');
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Step 4: Test token verification
  console.log('Step 4: Testing token verification...');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verification successful:', decoded);
  } catch (error) {
    console.log('ERROR: Token verification failed:', error.message);
  }
  
  console.log('Login flow test completed successfully!');
}

testLogin().catch(console.error);
