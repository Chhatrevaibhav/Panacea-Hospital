const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'), false);
    }
  }
});

// Get all leads with pagination and filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 10, source, status, assigned_to } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (source) {
      whereClause += ' AND source = ?';
      params.push(source);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (assigned_to) {
      whereClause += ' AND assigned_to = ?';
      params.push(assigned_to);
    }

    const leads = db.prepare(`
      SELECT 
        l.*,
        u.name as assigned_to_name,
        COUNT(c.id) as call_count,
        MAX(c.call_date) as last_call_date
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN calls c ON l.id = c.lead_id
      ${whereClause}
      GROUP BY l.id
      ORDER BY l.import_date DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM leads ${whereClause}
    `).get(...params);

    res.json({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get lead timeline (calls only, since appointments require patient conversion)
router.get('/:id/timeline', authenticateToken, (req, res) => {
  try {
    const leadId = req.params.id;

    // Get all calls for this lead
    const calls = db.prepare(`
      SELECT 
        c.id,
        c.call_date,
        c.status,
        c.sentiment,
        c.remarks,
        c.followup_date,
        u.name as called_by_name,
        'call' as type
      FROM calls c
      LEFT JOIN users u ON c.called_by = u.id
      WHERE c.lead_id = ?
      ORDER BY c.call_date DESC
    `).all(leadId);

    res.json({
      timeline: calls
    });
  } catch (error) {
    console.error('Get lead timeline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get lead by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const lead = db.prepare(`
      SELECT 
        l.*,
        u.name as assigned_to_name,
        p.id as patient_id,
        p.name as patient_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN patients p ON l.id = p.lead_id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new lead
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, phone, source, assigned_to } = req.body;

    if (!name || !phone || !source) {
      return res.status(400).json({ message: 'Name, phone, and source are required' });
    }

    const result = db.prepare(`
      INSERT INTO leads (name, phone, source, assigned_to)
      VALUES (?, ?, ?, ?)
    `).run(name, phone, source, assigned_to || null);

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update lead
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, phone, source, assigned_to, status } = req.body;
    const leadId = req.params.id;

    if (!name || !phone || !source) {
      return res.status(400).json({ message: 'Name, phone, and source are required' });
    }

    const result = db.prepare(`
      UPDATE leads 
      SET name = ?, phone = ?, source = ?, assigned_to = ?, status = ?
      WHERE id = ?
    `).run(name, phone, source, assigned_to || null, status || 'New', leadId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
    res.json(updatedLead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete lead
router.delete('/:id', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const leadId = req.params.id;

    // Check if lead has associated patients or calls
    const patientsCount = db.prepare('SELECT COUNT(*) as count FROM patients WHERE lead_id = ?').get(leadId);
    const callsCount = db.prepare('SELECT COUNT(*) as count FROM calls WHERE lead_id = ?').get(leadId);

    if (patientsCount.count > 0 || callsCount.count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete lead. It has associated patients or calls.' 
      });
    }

    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(leadId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Import leads from Excel/CSV
router.post('/import', authenticateToken, requireRole(['Admin']), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const importedLeads = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { name, phone, source } = row;

      if (!name || !phone || !source) {
        errors.push(`Row ${i + 2}: Missing required fields (name, phone, source)`);
        continue;
      }

      try {
        const result = db.prepare(`
          INSERT INTO leads (name, phone, source)
          VALUES (?, ?, ?)
        `).run(name, phone, source);

        const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
        importedLeads.push(newLead);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      message: `Imported ${importedLeads.length} leads successfully`,
      imported: importedLeads,
      errors: errors
    });
  } catch (error) {
    console.error('Import leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
