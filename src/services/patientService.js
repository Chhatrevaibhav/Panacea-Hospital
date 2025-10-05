// import { db } from '../database/database.js'; // Not used in this service

class PatientService {
  // Get all patients
  getAllPatients() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Get patient by ID
  getPatientById(id) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      return data.find(patient => patient.id === parseInt(id));
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      throw error;
    }
  }

  // Create new patient
  createPatient(patientData) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      
      const newPatient = {
        id: newId,
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        partner_name: patientData.partnerName,
        address: patientData.address || null,
        emergency_contact: patientData.emergencyContact || null,
        emergency_phone: patientData.emergencyPhone || null,
        medical_history: patientData.medicalHistory || null,
        status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      data.push(newPatient);
      localStorage.setItem('hospital_patients_db', JSON.stringify(data));

      return newPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  // Update patient
  updatePatient(id, patientData) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      const patientIndex = data.findIndex(patient => patient.id === parseInt(id));
      
      if (patientIndex === -1) {
        throw new Error('Patient not found');
      }

      data[patientIndex] = {
        ...data[patientIndex],
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        partner_name: patientData.partnerName,
        address: patientData.address || null,
        emergency_contact: patientData.emergencyContact || null,
        emergency_phone: patientData.emergencyPhone || null,
        medical_history: patientData.medicalHistory || null,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_patients_db', JSON.stringify(data));
      return data[patientIndex];
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  // Delete patient
  deletePatient(id) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      const initialLength = data.length;
      const filteredData = data.filter(patient => patient.id !== parseInt(id));
      
      if (filteredData.length === initialLength) {
        throw new Error('Patient not found');
      }

      localStorage.setItem('hospital_patients_db', JSON.stringify(filteredData));
      return { success: true, message: 'Patient deleted successfully' };
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  // Search patients
  searchPatients(searchTerm) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      const searchLower = searchTerm.toLowerCase();
      
      return data.filter(patient => 
        patient.first_name.toLowerCase().includes(searchLower) ||
        patient.last_name.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchTerm)
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  // Get patient appointments
  getPatientAppointments(patientId) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      return data.filter(appointment => appointment.patient_id === parseInt(patientId))
        .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  }

  // Get patient medical records
  getPatientMedicalRecords(patientId) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_medical_records_db') || '[]');
      return data.filter(record => record.patient_id === parseInt(patientId))
        .sort((a, b) => new Date(b.date_recorded) - new Date(a.date_recorded));
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      throw error;
    }
  }

  // Get patient statistics
  getPatientStats() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_patients_db') || '[]');
      const total = data.length;
      const active = data.filter(patient => patient.status === 'Active').length;
      const inactive = data.filter(patient => patient.status === 'Inactive').length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recent = data.filter(patient => new Date(patient.created_at) >= thirtyDaysAgo).length;

      return {
        total,
        active,
        inactive,
        recent
      };
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const patientService = new PatientService();
export default patientService;
