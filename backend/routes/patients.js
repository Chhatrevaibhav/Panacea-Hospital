const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all patients with pagination and filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 10, center_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (center_id) {
      whereClause += ' AND p.preferred_center_id = ?';
      params.push(center_id);
    }

    const patients = db.prepare(`
      SELECT 
        p.*,
        c.name as center_name,
        c.city as center_city,
        l.name as lead_name,
        l.phone as lead_phone,
        l.source as lead_source,
        COUNT(apt.id) as appointment_count,
        MAX(apt.appointment_date) as last_appointment
      FROM patients p
      LEFT JOIN centers c ON p.preferred_center_id = c.id
      LEFT JOIN leads l ON p.lead_id = l.id
      LEFT JOIN appointments apt ON p.id = apt.patient_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM patients p ${whereClause}
    `).get(...params);

    res.json({
      patients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get patient by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const patient = db.prepare(`
      SELECT 
        p.*,
        c.name as center_name,
        c.city as center_city,
        c.address as center_address,
        l.name as lead_name,
        l.phone as lead_phone,
        l.source as lead_source
      FROM patients p
      LEFT JOIN centers c ON p.preferred_center_id = c.id
      LEFT JOIN leads l ON p.lead_id = l.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get patient timeline (calls and appointments merged chronologically)
router.get('/:id/timeline', authenticateToken, (req, res) => {
  try {
    const patientId = req.params.id;

    // Get patient info
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get calls for this patient's lead
    const calls = db.prepare(`
      SELECT 
        c.*,
        u.name as called_by_name,
        'call' as type
      FROM calls c
      LEFT JOIN users u ON c.called_by = u.id
      WHERE c.lead_id = ?
      ORDER BY c.call_date DESC
    `).all(patient.lead_id);

    // Get appointments for this patient
    const appointments = db.prepare(`
      SELECT 
        a.*,
        c.name as center_name,
        u.name as created_by_name,
        'appointment' as type
      FROM appointments a
      LEFT JOIN centers c ON a.center_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC
    `).all(patientId);

    // Merge and sort chronologically
    const timeline = [...calls, ...appointments].sort((a, b) => {
      const dateA = new Date(a.call_date || a.appointment_date);
      const dateB = new Date(b.call_date || b.appointment_date);
      return dateB - dateA; // Most recent first
    });

    res.json({
      patient,
      timeline
    });
  } catch (error) {
    console.error('Get patient timeline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new patient
router.post('/', authenticateToken, (req, res) => {
  try {
    const { 
      lead_id, 
      name, 
      age, 
      email, 
      partner_name, 
      partner_age, 
      preferred_center_id 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Patient name is required' });
    }

    const result = db.prepare(`
      INSERT INTO patients (lead_id, name, age, email, partner_name, partner_age, preferred_center_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(lead_id || null, name, age || null, email || null, partner_name || null, partner_age || null, preferred_center_id || null);

    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update patient
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { 
      lead_id, 
      name, 
      age, 
      email, 
      partner_name, 
      partner_age, 
      preferred_center_id 
    } = req.body;
    const patientId = req.params.id;

    if (!name) {
      return res.status(400).json({ message: 'Patient name is required' });
    }

    const result = db.prepare(`
      UPDATE patients 
      SET lead_id = ?, name = ?, age = ?, email = ?, partner_name = ?, partner_age = ?, preferred_center_id = ?
      WHERE id = ?
    `).run(lead_id || null, name, age || null, email || null, partner_name || null, partner_age || null, preferred_center_id || null, patientId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    res.json(updatedPatient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete patient
router.delete('/:id', authenticateToken, requireRole(['Admin']), (req, res) => {
  try {
    const patientId = req.params.id;

    // Check if patient has associated appointments
    const appointmentsCount = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE patient_id = ?').get(patientId);

    if (appointmentsCount.count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete patient. It has associated appointments.' 
      });
    }

    const result = db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
