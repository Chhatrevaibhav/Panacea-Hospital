const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, phone, specialization, status, navigation_permissions, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    
    // Parse navigation_permissions for each user
    const usersWithParsedPermissions = users.map(user => ({
      ...user,
      navigation_permissions: user.navigation_permissions ? JSON.parse(user.navigation_permissions) : []
    }));
    
    res.json(usersWithParsedPermissions);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single user (Admin only)
router.get('/:id', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, phone, specialization, status, navigation_permissions, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(req.params.id);
    
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

// Create new user (Admin only)
router.post('/', authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, navigation_permissions } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Name, email, password, and role are required' 
      });
    }

    // Validate role
    const validRoles = ['Admin', 'Doctor', 'Staff', 'Telecaller'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: Admin, Doctor, Staff, Telecaller' 
      });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default permissions based on role if not provided
    let permissions = navigation_permissions;
    if (!permissions || permissions.length === 0) {
      const defaultPermissions = {
        'Admin': ['dashboard', 'centers', 'leads', 'patients', 'calls', 'appointments', 'reports', 'users'],
        'Doctor': ['dashboard', 'leads', 'patients', 'calls', 'appointments', 'reports'],
        'Staff': ['dashboard', 'leads', 'patients', 'appointments'],
        'Telecaller': ['dashboard', 'leads', 'patients', 'calls', 'appointments']
      };
      permissions = defaultPermissions[role] || ['dashboard'];
    }

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, specialization, status, navigation_permissions)
      VALUES (?, ?, ?, ?, ?, ?, 'Active', ?)
    `).run(name, email, hashedPassword, role, phone || null, specialization || null, JSON.stringify(permissions));

    // Get the created user
    const newUser = db.prepare(`
      SELECT id, name, email, role, phone, specialization, status, navigation_permissions, created_at
      FROM users
      WHERE id = ?
    `).get(result.lastInsertRowid);

    newUser.navigation_permissions = newUser.navigation_permissions ? JSON.parse(newUser.navigation_permissions) : [];

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireRole(['Admin']), async (req, res) => {
  try {
    const { name, email, role, phone, specialization, status, password, navigation_permissions } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const emailTaken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (emailTaken) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['Admin', 'Doctor', 'Staff', 'Telecaller'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Invalid role. Must be one of: Admin, Doctor, Staff, Telecaller' 
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone || null);
    }
    if (specialization !== undefined) {
      updates.push('specialization = ?');
      params.push(specialization || null);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(hashedPassword);
    }
    if (navigation_permissions !== undefined) {
      updates.push('navigation_permissions = ?');
      params.push(JSON.stringify(navigation_permissions));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    if (updates.length > 1) { // More than just updated_at
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.prepare(query).run(...params);
    }

    // Get updated user
    const updatedUser = db.prepare(`
      SELECT id, name, email, role, phone, specialization, status, navigation_permissions, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(userId);

    updatedUser.navigation_permissions = updatedUser.navigation_permissions ? JSON.parse(updatedUser.navigation_permissions) : [];

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get users by role
router.get('/role/:role', authenticateToken, (req, res) => {
  try {
    const { role } = req.params;
    
    const users = db.prepare(`
      SELECT id, name, email, phone, specialization, status
      FROM users
      WHERE role = ? AND status = 'Active'
      ORDER BY name ASC
    `).all(role);
    
    res.json(users);
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

