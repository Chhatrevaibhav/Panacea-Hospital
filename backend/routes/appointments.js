const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all appointments with pagination and filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      patient_id, 
      center_id, 
      status,
      date_from,
      date_to
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (patient_id) {
      whereClause += ' AND a.patient_id = ?';
      params.push(patient_id);
    }

    if (center_id) {
      whereClause += ' AND a.center_id = ?';
      params.push(center_id);
    }

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (date_from) {
      whereClause += ' AND a.appointment_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND a.appointment_date <= ?';
      params.push(date_to);
    }

    const appointments = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.age as patient_age,
        p.email as patient_email,
        c.name as center_name,
        c.city as center_city,
        u.name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN centers c ON a.center_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.appointment_date DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM appointments a ${whereClause}
    `).get(...params);

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const appointment = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.age as patient_age,
        p.email as patient_email,
        c.name as center_name,
        c.city as center_city,
        c.address as center_address,
        u.name as created_by_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN centers c ON a.center_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get appointments by date range (for calendar view)
router.get('/calendar/range', authenticateToken, (req, res) => {
  try {
    const { start_date, end_date, center_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let whereClause = 'WHERE a.appointment_date BETWEEN ? AND ?';
    const params = [start_date, end_date];

    if (center_id) {
      whereClause += ' AND a.center_id = ?';
      params.push(center_id);
    }

    const appointments = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.age as patient_age,
        c.name as center_name,
        c.city as center_city
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN centers c ON a.center_id = c.id
      ${whereClause}
      ORDER BY a.appointment_date ASC
    `).all(...params);

    res.json(appointments);
  } catch (error) {
    console.error('Get calendar appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new appointment
router.post('/', authenticateToken, (req, res) => {
  try {
    const { 
      patient_id, 
      center_id, 
      appointment_date, 
      notes 
    } = req.body;

    if (!patient_id || !center_id || !appointment_date) {
      return res.status(400).json({ 
        message: 'Patient ID, center ID, and appointment date are required' 
      });
    }

    const result = db.prepare(`
      INSERT INTO appointments (patient_id, center_id, appointment_date, notes, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(patient_id, center_id, appointment_date, notes || null, req.user.id);

    const newAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { 
      patient_id, 
      center_id, 
      appointment_date, 
      status, 
      notes 
    } = req.body;
    const appointmentId = req.params.id;

    if (!patient_id || !center_id || !appointment_date) {
      return res.status(400).json({ 
        message: 'Patient ID, center ID, and appointment date are required' 
      });
    }

    const result = db.prepare(`
      UPDATE appointments 
      SET patient_id = ?, center_id = ?, appointment_date = ?, status = ?, notes = ?
      WHERE id = ?
    `).run(patient_id, center_id, appointment_date, status || 'Scheduled', notes || null, appointmentId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updatedAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const appointmentId = req.params.id;

    const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(appointmentId);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get upcoming appointments
router.get('/upcoming/list', authenticateToken, (req, res) => {
  try {
    const { days = 7 } = req.query;

    const upcomingAppointments = db.prepare(`
      SELECT 
        a.*,
        p.name as patient_name,
        p.age as patient_age,
        p.email as patient_email,
        c.name as center_name,
        c.city as center_city
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN centers c ON a.center_id = c.id
      WHERE a.appointment_date BETWEEN datetime('now') AND datetime('now', '+${days} days')
      AND a.status = 'Scheduled'
      ORDER BY a.appointment_date ASC
    `).all();

    res.json(upcomingAppointments);
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
