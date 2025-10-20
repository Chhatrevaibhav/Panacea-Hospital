const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all calls with pagination and filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      lead_id, 
      status, 
      sentiment, 
      called_by,
      date_from,
      date_to
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (lead_id) {
      whereClause += ' AND c.lead_id = ?';
      params.push(lead_id);
    }

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }

    if (sentiment) {
      whereClause += ' AND c.sentiment = ?';
      params.push(sentiment);
    }

    if (called_by) {
      whereClause += ' AND c.called_by = ?';
      params.push(called_by);
    }

    if (date_from) {
      whereClause += ' AND c.call_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND c.call_date <= ?';
      params.push(date_to);
    }

    const calls = db.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.phone as lead_phone,
        u.name as called_by_name,
        p.name as patient_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.called_by = u.id
      LEFT JOIN patients p ON l.id = p.lead_id
      ${whereClause}
      ORDER BY c.call_date DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM calls c ${whereClause}
    `).get(...params);

    res.json({
      calls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get call by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const call = db.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.phone as lead_phone,
        u.name as called_by_name,
        p.name as patient_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.called_by = u.id
      LEFT JOIN patients p ON l.id = p.lead_id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.json(call);
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new call
router.post('/', authenticateToken, (req, res) => {
  try {
    const { 
      lead_id, 
      call_date, 
      status, 
      sentiment, 
      remarks, 
      followup_date 
    } = req.body;

    if (!lead_id || !call_date || !status || !sentiment) {
      return res.status(400).json({ 
        message: 'Lead ID, call date, status, and sentiment are required' 
      });
    }

    const result = db.prepare(`
      INSERT INTO calls (lead_id, call_date, status, sentiment, remarks, followup_date, called_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(lead_id, call_date, status, sentiment, remarks || null, followup_date || null, req.user.id);

    const newCall = db.prepare('SELECT * FROM calls WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCall);
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update call
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { 
      call_date, 
      status, 
      sentiment, 
      remarks, 
      followup_date 
    } = req.body;
    const callId = req.params.id;

    if (!call_date || !status || !sentiment) {
      return res.status(400).json({ 
        message: 'Call date, status, and sentiment are required' 
      });
    }

    const result = db.prepare(`
      UPDATE calls 
      SET call_date = ?, status = ?, sentiment = ?, remarks = ?, followup_date = ?
      WHERE id = ?
    `).run(call_date, status, sentiment, remarks || null, followup_date || null, callId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Call not found' });
    }

    const updatedCall = db.prepare('SELECT * FROM calls WHERE id = ?').get(callId);
    res.json(updatedCall);
  } catch (error) {
    console.error('Update call error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete call
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const callId = req.params.id;

    const result = db.prepare('DELETE FROM calls WHERE id = ?').run(callId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.json({ message: 'Call deleted successfully' });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get follow-up calls needed
router.get('/followups/needed', authenticateToken, (req, res) => {
  try {
    const followupCalls = db.prepare(`
      SELECT 
        c.*,
        l.name as lead_name,
        l.phone as lead_phone,
        u.name as called_by_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.called_by = u.id
      WHERE c.followup_date <= datetime('now', '+1 day')
      AND c.status = 'Follow-up'
      ORDER BY c.followup_date ASC
    `).all();

    res.json(followupCalls);
  } catch (error) {
    console.error('Get follow-up calls error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
