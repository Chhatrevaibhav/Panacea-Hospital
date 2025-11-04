const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'hospital.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Staff', 'Telecaller')),
      phone TEXT,
      specialization TEXT,
      status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Centers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS centers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('YouTube', 'Facebook', 'Instagram', 'Other')),
      assigned_to INTEGER,
      import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Patients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      name TEXT NOT NULL,
      age INTEGER,
      email TEXT,
      partner_name TEXT,
      partner_age INTEGER,
      preferred_center_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (preferred_center_id) REFERENCES centers(id)
    )
  `);

  // Calls table
  db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      call_date DATETIME NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Appointment', 'Reschedule', 'Rejected', 'No Response', 'Follow-up')),
      sentiment TEXT NOT NULL CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
      remarks TEXT,
      followup_date DATETIME,
      called_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (called_by) REFERENCES users(id)
    )
  `);

  // Appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      center_id INTEGER NOT NULL,
      appointment_date DATETIME NOT NULL,
      status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
      notes TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (center_id) REFERENCES centers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
};

// Initialize database with default data
const initializeDatabase = async () => {
  createTables();
  
  // Check if admin user exists
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('Admin');
  
  if (!adminExists) {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Admin User', 'admin@hospital.com', hashedPassword, 'Admin');

    // Create default telecaller
    const telecallerPassword = await bcrypt.hash('telecaller123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run('Telecaller User', 'telecaller@hospital.com', telecallerPassword, 'Telecaller');

    // Create sample centers
    db.prepare(`
      INSERT INTO centers (name, city, address)
      VALUES (?, ?, ?)
    `).run('Main Center', 'Mumbai', '123 Main Street, Mumbai, Maharashtra');

    db.prepare(`
      INSERT INTO centers (name, city, address)
      VALUES (?, ?, ?)
    `).run('Branch Center', 'Delhi', '456 Branch Avenue, Delhi, NCR');

    console.log('Database initialized with default data');
  }
};

// Initialize database
initializeDatabase();

module.exports = db;
