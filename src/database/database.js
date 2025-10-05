// For React environment, we'll use localStorage as a fallback
// In a real production app, you'd use a proper backend API

// Simulate database with localStorage
const DB_KEY = 'hospital_patients_db';
const APPOINTMENTS_KEY = 'hospital_appointments_db';
const CALLS_KEY = 'hospital_calls_db';
const MEDICAL_RECORDS_KEY = 'hospital_medical_records_db';

// Initialize localStorage if not exists
const initializeLocalStorage = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(APPOINTMENTS_KEY)) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CALLS_KEY)) {
    localStorage.setItem(CALLS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(MEDICAL_RECORDS_KEY)) {
    localStorage.setItem(MEDICAL_RECORDS_KEY, JSON.stringify([]));
  }
};

// Database simulation object
const db = {
  prepare: (sql) => ({
    all: () => {
      const data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
      return data;
    },
    get: (id) => {
      const data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
      return data.find(item => item.id === id);
    },
    run: (...params) => {
      const data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      const newItem = {
        id: newId,
        first_name: params[0],
        last_name: params[1],
        email: params[2],
        phone: params[3],
        date_of_birth: params[4],
        gender: params[5],
        partner_name: params[6],
        address: params[7],
        emergency_contact: params[8],
        emergency_phone: params[9],
        medical_history: params[10],
        status: params[11] || 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      data.push(newItem);
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      return { lastInsertRowid: newId, changes: 1 };
    }
  }),
  exec: (sql) => {
    // Initialize localStorage tables
    initializeLocalStorage();
  }
};

// Enable foreign keys (simulated)
db.pragma = () => {};

// Create patients table (simulated)
const createPatientsTable = () => {
  initializeLocalStorage();
  console.log('Patients table created successfully');
};

// Create appointments table (simulated)
const createAppointmentsTable = () => {
  initializeLocalStorage();
  console.log('Appointments table created successfully');
};

// Create medical records table (simulated)
const createMedicalRecordsTable = () => {
  initializeLocalStorage();
  console.log('Medical records table created successfully');
};

// Initialize database
const initializeDatabase = () => {
  try {
    createPatientsTable();
    createAppointmentsTable();
    createMedicalRecordsTable();
    
    // Insert sample data if tables are empty
    const existingData = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    if (existingData.length === 0) {
      insertSampleData();
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Insert sample data (simulated)
const insertSampleData = () => {
  const existingData = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  if (existingData.length > 0) return; // Don't insert if data already exists

  // Sample patients
  const samplePatients = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      date_of_birth: '1985-03-15',
      gender: 'male',
      partner_name: 'Jane Smith',
      address: '123 Main St, City, State 12345',
      emergency_contact: 'Jane Smith',
      emergency_phone: '+1 (555) 123-4568',
      medical_history: 'No known allergies',
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      date_of_birth: '1990-07-22',
      gender: 'female',
      partner_name: 'Mike Johnson',
      address: '456 Oak Ave, City, State 12345',
      emergency_contact: 'Mike Johnson',
      emergency_phone: '+1 (555) 234-5679',
      medical_history: 'Allergic to penicillin',
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'm.brown@email.com',
      phone: '+1 (555) 345-6789',
      date_of_birth: '1978-11-08',
      gender: 'male',
      partner_name: 'Lisa Brown',
      address: '789 Pine Rd, City, State 12345',
      emergency_contact: 'Lisa Brown',
      emergency_phone: '+1 (555) 345-6790',
      medical_history: 'Diabetes Type 2',
      status: 'Inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 456-7890',
      date_of_birth: '1992-05-14',
      gender: 'female',
      partner_name: 'Tom Davis',
      address: '321 Elm St, City, State 12345',
      emergency_contact: 'Tom Davis',
      emergency_phone: '+1 (555) 456-7891',
      medical_history: 'Hypertension',
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      first_name: 'David',
      last_name: 'Wilson',
      email: 'd.wilson@email.com',
      phone: '+1 (555) 567-8901',
      date_of_birth: '1988-09-30',
      gender: 'male',
      partner_name: 'Susan Wilson',
      address: '654 Maple Dr, City, State 12345',
      emergency_contact: 'Susan Wilson',
      emergency_phone: '+1 (555) 567-8902',
      medical_history: 'No significant history',
      status: 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  localStorage.setItem(DB_KEY, JSON.stringify(samplePatients));
  
  // Sample appointments
  const sampleAppointments = [
    {
      id: 1,
      patient_id: 1,
      patient_name: 'John Smith',
      appointment_date: '2024-01-15',
      appointment_time: '10:00',
      duration: 30,
      type: 'General Checkup',
      status: 'Scheduled',
      notes: 'Regular checkup appointment',
      doctor: 'Dr. Smith',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      patient_id: 2,
      patient_name: 'Sarah Johnson',
      appointment_date: '2024-01-16',
      appointment_time: '14:30',
      duration: 45,
      type: 'Follow-up',
      status: 'Completed',
      notes: 'Follow-up for allergy treatment',
      doctor: 'Dr. Johnson',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      patient_id: 3,
      patient_name: 'Michael Brown',
      appointment_date: '2024-01-17',
      appointment_time: '09:15',
      duration: 60,
      type: 'Consultation',
      status: 'Scheduled',
      notes: 'Diabetes management consultation',
      doctor: 'Dr. Smith',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleAppointments));

  // Sample calls
  const sampleCalls = [
    {
      id: 1,
      patient_id: 1,
      patient_name: 'John Smith',
      call_type: 'Outbound',
      call_date: '2024-01-10',
      call_time: '10:30',
      duration: 15,
      sentiment: 'Positive',
      notes: 'Patient confirmed appointment for next week. Very cooperative.',
      call_summary: 'Discussed upcoming appointment details. Patient asked about preparation requirements.',
      follow_up_required: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      patient_id: 2,
      patient_name: 'Sarah Johnson',
      call_type: 'Inbound',
      call_date: '2024-01-11',
      call_time: '15:45',
      duration: 8,
      sentiment: 'Neutral',
      notes: 'Patient called to reschedule appointment. No issues.',
      call_summary: 'Requested to move appointment from Friday to Monday due to work conflict.',
      follow_up_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      patient_id: 3,
      patient_name: 'Michael Brown',
      call_type: 'Outbound',
      call_date: '2024-01-12',
      call_time: '11:20',
      duration: 25,
      sentiment: 'Negative',
      notes: 'Patient expressed frustration about medication side effects.',
      call_summary: 'Patient reported increased fatigue and nausea. Discussed alternative treatment options.',
      follow_up_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  localStorage.setItem(CALLS_KEY, JSON.stringify(sampleCalls));
  console.log('Sample data inserted successfully');
};

// Export database instance and initialization function
export { db, initializeDatabase };
export default db;
