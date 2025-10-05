// import { db } from '../database/database.js'; // Not used in this service

class AppointmentService {
  // Get all appointments
  getAllAppointments() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  // Get appointment by ID
  getAppointmentById(id) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      return data.find(appointment => appointment.id === parseInt(id));
    } catch (error) {
      console.error('Error fetching appointment by ID:', error);
      throw error;
    }
  }

  // Get appointments by patient ID
  getAppointmentsByPatientId(patientId) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      return data.filter(appointment => appointment.patient_id === parseInt(patientId))
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    } catch (error) {
      console.error('Error fetching appointments by patient ID:', error);
      throw error;
    }
  }

  // Create new appointment
  createAppointment(appointmentData) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      
      const newAppointment = {
        id: newId,
        patient_id: appointmentData.patientId,
        patient_name: appointmentData.patientName,
        appointment_date: appointmentData.appointmentDate,
        appointment_time: appointmentData.appointmentTime,
        duration: appointmentData.duration || 30,
        type: appointmentData.type,
        status: appointmentData.status || 'Scheduled',
        notes: appointmentData.notes || '',
        doctor: appointmentData.doctor || 'Dr. Smith',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      data.push(newAppointment);
      localStorage.setItem('hospital_appointments_db', JSON.stringify(data));

      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Update appointment
  updateAppointment(id, appointmentData) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const appointmentIndex = data.findIndex(appointment => appointment.id === parseInt(id));
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      data[appointmentIndex] = {
        ...data[appointmentIndex],
        patient_id: appointmentData.patientId,
        patient_name: appointmentData.patientName,
        appointment_date: appointmentData.appointmentDate,
        appointment_time: appointmentData.appointmentTime,
        duration: appointmentData.duration,
        type: appointmentData.type,
        status: appointmentData.status,
        notes: appointmentData.notes,
        doctor: appointmentData.doctor,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_appointments_db', JSON.stringify(data));
      return data[appointmentIndex];
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  // Reschedule appointment
  rescheduleAppointment(id, newDate, newTime, notes = '') {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const appointmentIndex = data.findIndex(appointment => appointment.id === parseInt(id));
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      data[appointmentIndex] = {
        ...data[appointmentIndex],
        appointment_date: newDate,
        appointment_time: newTime,
        notes: notes ? `${data[appointmentIndex].notes}\nRescheduled: ${notes}` : data[appointmentIndex].notes,
        status: 'Rescheduled',
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_appointments_db', JSON.stringify(data));
      return data[appointmentIndex];
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  // Cancel appointment
  cancelAppointment(id, reason = '') {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const appointmentIndex = data.findIndex(appointment => appointment.id === parseInt(id));
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      data[appointmentIndex] = {
        ...data[appointmentIndex],
        status: 'Cancelled',
        notes: reason ? `${data[appointmentIndex].notes}\nCancelled: ${reason}` : data[appointmentIndex].notes,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_appointments_db', JSON.stringify(data));
      return data[appointmentIndex];
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  // Complete appointment
  completeAppointment(id, notes = '') {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const appointmentIndex = data.findIndex(appointment => appointment.id === parseInt(id));
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      data[appointmentIndex] = {
        ...data[appointmentIndex],
        status: 'Completed',
        notes: notes ? `${data[appointmentIndex].notes}\nCompleted: ${notes}` : data[appointmentIndex].notes,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_appointments_db', JSON.stringify(data));
      return data[appointmentIndex];
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  }

  // Delete appointment
  deleteAppointment(id) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const initialLength = data.length;
      const filteredData = data.filter(appointment => appointment.id !== parseInt(id));
      
      if (filteredData.length === initialLength) {
        throw new Error('Appointment not found');
      }

      localStorage.setItem('hospital_appointments_db', JSON.stringify(filteredData));
      return { success: true, message: 'Appointment deleted successfully' };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // Get appointments by date range
  getAppointmentsByDateRange(startDate, endDate) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      return data.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        return appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate);
      }).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      throw error;
    }
  }

  // Get appointments by status
  getAppointmentsByStatus(status) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      return data.filter(appointment => appointment.status === status)
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      throw error;
    }
  }

  // Get appointment statistics
  getAppointmentStats() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_appointments_db') || '[]');
      const total = data.length;
      const scheduled = data.filter(appointment => appointment.status === 'Scheduled').length;
      const completed = data.filter(appointment => appointment.status === 'Completed').length;
      const cancelled = data.filter(appointment => appointment.status === 'Cancelled').length;
      const rescheduled = data.filter(appointment => appointment.status === 'Rescheduled').length;

      return {
        total,
        scheduled,
        completed,
        cancelled,
        rescheduled
      };
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;
