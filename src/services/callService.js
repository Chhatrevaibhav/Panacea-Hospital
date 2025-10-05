// import { db } from '../database/database.js'; // Not used in this service

class CallService {
  // Get all calls
  getAllCalls() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  }

  // Get call by ID
  getCallById(id) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.find(call => call.id === parseInt(id));
    } catch (error) {
      console.error('Error fetching call by ID:', error);
      throw error;
    }
  }

  // Get calls by patient ID
  getCallsByPatientId(patientId) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.filter(call => call.patient_id === parseInt(patientId))
        .sort((a, b) => new Date(b.call_date) - new Date(a.call_date));
    } catch (error) {
      console.error('Error fetching calls by patient ID:', error);
      throw error;
    }
  }

  // Create new call record
  createCall(callData) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      
      const newCall = {
        id: newId,
        patient_id: callData.patientId,
        patient_name: callData.patientName,
        call_type: callData.callType, // 'Inbound' or 'Outbound'
        call_date: callData.callDate,
        call_time: callData.callTime,
        duration: callData.duration || 0,
        sentiment: callData.sentiment || 'Neutral', // 'Positive', 'Negative', 'Neutral'
        notes: callData.notes || '',
        call_summary: callData.callSummary || '',
        follow_up_required: callData.followUpRequired || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      data.push(newCall);
      localStorage.setItem('hospital_calls_db', JSON.stringify(data));

      return newCall;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  // Update call record
  updateCall(id, callData) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      const callIndex = data.findIndex(call => call.id === parseInt(id));
      
      if (callIndex === -1) {
        throw new Error('Call not found');
      }

      data[callIndex] = {
        ...data[callIndex],
        patient_id: callData.patientId,
        patient_name: callData.patientName,
        call_type: callData.callType,
        call_date: callData.callDate,
        call_time: callData.callTime,
        duration: callData.duration,
        sentiment: callData.sentiment,
        notes: callData.notes,
        call_summary: callData.callSummary,
        follow_up_required: callData.followUpRequired,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_calls_db', JSON.stringify(data));
      return data[callIndex];
    } catch (error) {
      console.error('Error updating call:', error);
      throw error;
    }
  }

  // Delete call record
  deleteCall(id) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      const initialLength = data.length;
      const filteredData = data.filter(call => call.id !== parseInt(id));
      
      if (filteredData.length === initialLength) {
        throw new Error('Call not found');
      }

      localStorage.setItem('hospital_calls_db', JSON.stringify(filteredData));
      return { success: true, message: 'Call deleted successfully' };
    } catch (error) {
      console.error('Error deleting call:', error);
      throw error;
    }
  }

  // Get calls by date range
  getCallsByDateRange(startDate, endDate) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.filter(call => {
        const callDate = new Date(call.call_date);
        return callDate >= new Date(startDate) && callDate <= new Date(endDate);
      }).sort((a, b) => new Date(b.call_date) - new Date(a.call_date));
    } catch (error) {
      console.error('Error fetching calls by date range:', error);
      throw error;
    }
  }

  // Get calls by sentiment
  getCallsBySentiment(sentiment) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.filter(call => call.sentiment === sentiment)
        .sort((a, b) => new Date(b.call_date) - new Date(a.call_date));
    } catch (error) {
      console.error('Error fetching calls by sentiment:', error);
      throw error;
    }
  }

  // Get calls by type
  getCallsByType(callType) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.filter(call => call.call_type === callType)
        .sort((a, b) => new Date(b.call_date) - new Date(a.call_date));
    } catch (error) {
      console.error('Error fetching calls by type:', error);
      throw error;
    }
  }

  // Get calls requiring follow-up
  getCallsRequiringFollowUp() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      return data.filter(call => call.follow_up_required === true)
        .sort((a, b) => new Date(a.call_date) - new Date(b.call_date));
    } catch (error) {
      console.error('Error fetching calls requiring follow-up:', error);
      throw error;
    }
  }

  // Mark follow-up as completed
  markFollowUpCompleted(id, followUpNotes = '') {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      const callIndex = data.findIndex(call => call.id === parseInt(id));
      
      if (callIndex === -1) {
        throw new Error('Call not found');
      }

      data[callIndex] = {
        ...data[callIndex],
        follow_up_required: false,
        notes: followUpNotes ? `${data[callIndex].notes}\nFollow-up completed: ${followUpNotes}` : data[callIndex].notes,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem('hospital_calls_db', JSON.stringify(data));
      return data[callIndex];
    } catch (error) {
      console.error('Error marking follow-up as completed:', error);
      throw error;
    }
  }

  // Get call statistics
  getCallStats() {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      const total = data.length;
      const inbound = data.filter(call => call.call_type === 'Inbound').length;
      const outbound = data.filter(call => call.call_type === 'Outbound').length;
      const positive = data.filter(call => call.sentiment === 'Positive').length;
      const negative = data.filter(call => call.sentiment === 'Negative').length;
      const neutral = data.filter(call => call.sentiment === 'Neutral').length;
      const followUpRequired = data.filter(call => call.follow_up_required === true).length;
      
      const totalDuration = data.reduce((sum, call) => sum + (call.duration || 0), 0);
      const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0;

      return {
        total,
        inbound,
        outbound,
        positive,
        negative,
        neutral,
        followUpRequired,
        totalDuration,
        averageDuration
      };
    } catch (error) {
      console.error('Error fetching call statistics:', error);
      throw error;
    }
  }

  // Search calls
  searchCalls(searchTerm) {
    try {
      const data = JSON.parse(localStorage.getItem('hospital_calls_db') || '[]');
      const searchLower = searchTerm.toLowerCase();
      
      return data.filter(call => 
        call.patient_name.toLowerCase().includes(searchLower) ||
        call.notes.toLowerCase().includes(searchLower) ||
        call.call_summary.toLowerCase().includes(searchLower) ||
        call.sentiment.toLowerCase().includes(searchLower)
      ).sort((a, b) => new Date(b.call_date) - new Date(a.call_date));
    } catch (error) {
      console.error('Error searching calls:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const callService = new CallService();
export default callService;
