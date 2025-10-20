const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all centers
router.get('/', authenticateToken, (req, res) => {
  try {
    const centers = db.prepare('SELECT * FROM centers ORDER BY name').all();
    res.json(centers);
  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get center by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const center = db.prepare('SELECT * FROM centers WHERE id = ?').get(req.params.id);
    
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    
    res.json(center);
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new center (Admin only)
router.post('/', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const { name, city, address } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({ message: 'Name, city, and address are required' });
    }

    const result = db.prepare(`
      INSERT INTO centers (name, city, address)
      VALUES (?, ?, ?)
    `).run(name, city, address);

    const newCenter = db.prepare('SELECT * FROM centers WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newCenter);
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update center (Admin only)
router.put('/:id', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const { name, city, address } = req.body;
    const centerId = req.params.id;

    if (!name || !city || !address) {
      return res.status(400).json({ message: 'Name, city, and address are required' });
    }

    const result = db.prepare(`
      UPDATE centers 
      SET name = ?, city = ?, address = ?
      WHERE id = ?
    `).run(name, city, address, centerId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Center not found' });
    }

    const updatedCenter = db.prepare('SELECT * FROM centers WHERE id = ?').get(centerId);
    res.json(updatedCenter);
  } catch (error) {
    console.error('Update center error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete center (Admin only)
router.delete('/:id', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const centerId = req.params.id;

    // Check if center is being used by patients or appointments
    const patientsUsingCenter = db.prepare('SELECT COUNT(*) as count FROM patients WHERE preferred_center_id = ?').get(centerId);
    const appointmentsUsingCenter = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE center_id = ?').get(centerId);

    if (patientsUsingCenter.count > 0 || appointmentsUsingCenter.count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete center. It is being used by patients or appointments.' 
      });
    }

    const result = db.prepare('DELETE FROM centers WHERE id = ?').run(centerId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Center not found' });
    }

    res.json({ message: 'Center deleted successfully' });
  } catch (error) {
    console.error('Delete center error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
