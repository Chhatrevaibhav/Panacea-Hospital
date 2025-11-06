const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received');
    console.log('Request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('Email:', email);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Parse navigation_permissions
    const navigation_permissions = user.navigation_permissions ? JSON.parse(user.navigation_permissions) : [];

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        navigation_permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, navigation_permissions FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse navigation_permissions
    user.navigation_permissions = user.navigation_permissions ? JSON.parse(user.navigation_permissions) : [];

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
