const express = require('express');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary/KPIs
router.get('/summary', authenticateToken, (req, res) => {
  try {
    // Total leads
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
    
    // Total appointments
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
    
    // Total patients
    const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get();
    
    // Sentiment ratio
    const sentimentStats = db.prepare(`
      SELECT 
        sentiment,
        COUNT(*) as count
      FROM calls 
      GROUP BY sentiment
    `).all();
    
    // Recent leads (last 7 days)
    const recentLeads = db.prepare(`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE import_date >= datetime('now', '-7 days')
    `).get();
    
    // Upcoming appointments (next 7 days)
    const upcomingAppointments = db.prepare(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE appointment_date BETWEEN datetime('now') AND datetime('now', '+7 days')
      AND status = 'Scheduled'
    `).get();
    
    // Follow-up calls needed
    const followupCalls = db.prepare(`
      SELECT COUNT(*) as count 
      FROM calls 
      WHERE followup_date <= datetime('now', '+1 day')
      AND status = 'Follow-up'
    `).get();
    
    // Leads by source
    const leadsBySource = db.prepare(`
      SELECT 
        source,
        COUNT(*) as count
      FROM leads 
      GROUP BY source
    `).all();
    
    // Monthly trends (last 6 months)
    const monthlyTrends = db.prepare(`
      SELECT 
        strftime('%Y-%m', import_date) as month,
        COUNT(*) as leads_count
      FROM leads 
      WHERE import_date >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', import_date)
      ORDER BY month
    `).all();

    res.json({
      summary: {
        totalLeads: totalLeads.count,
        totalAppointments: totalAppointments.count,
        totalPatients: totalPatients.count,
        recentLeads: recentLeads.count,
        upcomingAppointments: upcomingAppointments.count,
        followupCalls: followupCalls.count
      },
      sentimentStats,
      leadsBySource,
      monthlyTrends
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
