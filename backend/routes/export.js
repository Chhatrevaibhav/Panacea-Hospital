const express = require('express');
const xlsx = require('xlsx');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Export leads to Excel
router.get('/leads', authenticateToken, (req, res) => {
  try {
    const { source, status, assigned_to, date_from, date_to } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (source) {
      whereClause += ' AND l.source = ?';
      params.push(source);
    }

    if (status) {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }

    if (assigned_to) {
      whereClause += ' AND l.assigned_to = ?';
      params.push(assigned_to);
    }

    if (date_from) {
      whereClause += ' AND l.import_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND l.import_date <= ?';
      params.push(date_to);
    }

    const leads = db.prepare(`
      SELECT 
        l.id,
        l.name,
        l.phone,
        l.source,
        l.status,
        l.import_date,
        u.name as assigned_to_name,
        COUNT(c.id) as call_count,
        MAX(c.call_date) as last_call_date
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN calls c ON l.id = c.lead_id
      ${whereClause}
      GROUP BY l.id
      ORDER BY l.import_date DESC
    `).all(...params);

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(leads);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.xlsx');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export calls to Excel
router.get('/calls', authenticateToken, (req, res) => {
  try {
    const { lead_id, status, sentiment, called_by, date_from, date_to } = req.query;

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
        c.id,
        c.call_date,
        c.status,
        c.sentiment,
        c.remarks,
        c.followup_date,
        l.name as lead_name,
        l.phone as lead_phone,
        u.name as called_by_name
      FROM calls c
      LEFT JOIN leads l ON c.lead_id = l.id
      LEFT JOIN users u ON c.called_by = u.id
      ${whereClause}
      ORDER BY c.call_date DESC
    `).all(...params);

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(calls);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Calls');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=calls_export.xlsx');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export calls error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export appointments to Excel
router.get('/appointments', authenticateToken, (req, res) => {
  try {
    const { patient_id, center_id, status, date_from, date_to } = req.query;

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
        a.id,
        a.appointment_date,
        a.status,
        a.notes,
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
    `).all(...params);

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(appointments);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Appointments');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments_export.xlsx');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export appointments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export comprehensive report
router.get('/comprehensive', authenticateToken, (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date_from) {
      whereClause += ' AND l.import_date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND l.import_date <= ?';
      params.push(date_to);
    }

    // Get comprehensive data
    const comprehensiveData = db.prepare(`
      SELECT 
        l.id as lead_id,
        l.name as lead_name,
        l.phone as lead_phone,
        l.source as lead_source,
        l.status as lead_status,
        l.import_date,
        u.name as assigned_to_name,
        p.id as patient_id,
        p.name as patient_name,
        p.age as patient_age,
        p.email as patient_email,
        c.name as center_name,
        c.city as center_city,
        COUNT(calls.id) as total_calls,
        MAX(calls.call_date) as last_call_date,
        COUNT(apt.id) as total_appointments,
        MAX(apt.appointment_date) as last_appointment_date
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN patients p ON l.id = p.lead_id
      LEFT JOIN centers c ON p.preferred_center_id = c.id
      LEFT JOIN calls ON l.id = calls.lead_id
      LEFT JOIN appointments apt ON p.id = apt.patient_id
      ${whereClause}
      GROUP BY l.id
      ORDER BY l.import_date DESC
    `).all(...params);

    // Create workbook with multiple sheets
    const workbook = xlsx.utils.book_new();
    
    // Main comprehensive sheet
    const mainSheet = xlsx.utils.json_to_sheet(comprehensiveData);
    xlsx.utils.book_append_sheet(workbook, mainSheet, 'Comprehensive Report');

    // Summary sheet
    const summaryData = [
      { Metric: 'Total Leads', Value: comprehensiveData.length },
      { Metric: 'Total Patients', Value: comprehensiveData.filter(row => row.patient_id).length },
      { Metric: 'Total Calls', Value: comprehensiveData.reduce((sum, row) => sum + row.total_calls, 0) },
      { Metric: 'Total Appointments', Value: comprehensiveData.reduce((sum, row) => sum + row.total_appointments, 0) }
    ];
    const summarySheet = xlsx.utils.json_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=comprehensive_report.xlsx');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Export comprehensive report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
