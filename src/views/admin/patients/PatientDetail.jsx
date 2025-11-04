import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdEmail, MdPhone, MdCalendarToday, MdPerson, MdLocationOn } from 'react-icons/md';
import api from '../../../services/api';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ calls: 0, appointments: 0, upcoming: 0 });

  useEffect(() => {
    fetchPatientDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      const patientResponse = await api.get(`/patients/${id}`);
      const timelineResponse = await api.get(`/patients/${id}/timeline`);
      
      setPatient(patientResponse.data);
      const timelineData = timelineResponse.data.timeline || [];
      setTimeline(timelineData);
      
      // Calculate stats
      const calls = timelineData.filter(item => item.type === 'call').length;
      const appointments = timelineData.filter(item => item.type === 'appointment').length;
      const upcoming = timelineData.filter(item => {
        const itemDate = new Date(item.call_date || item.appointment_date);
        return itemDate > new Date();
      }).length;
      
      setStats({ calls, appointments, upcoming });
    } catch (error) {
      console.error('Error fetching patient details:', error);
      // Set mock data if API fails
      setPatient({
        id: parseInt(id),
        name: 'Sarah Johnson',
        age: 32,
        email: 'sarah.j@email.com',
        phone: '+1-555-0101',
        partner_name: 'Mike Johnson',
        partner_age: 35,
        preferred_center_name: 'Downtown Center',
        created_at: '2024-01-15',
        lead_source: 'Facebook'
      });
      
      const mockTimeline = [
        {
          type: 'call',
          id: 1,
          date: '2024-03-01 10:30:00',
          status: 'Appointment',
          sentiment: 'Positive',
          remarks: 'Patient interested in IVF treatment. Scheduled initial consultation.',
          called_by: 'John Telecaller',
          followup_date: null
        },
        {
          type: 'appointment',
          id: 1,
          date: '2024-03-05 14:00:00',
          center_name: 'Downtown Center',
          created_by: 'Dr. Smith',
          notes: 'Initial consultation - discussed treatment options and timeline'
        },
        {
          type: 'call',
          id: 2,
          date: '2024-03-06 11:00:00',
          status: 'Follow-up',
          sentiment: 'Neutral',
          remarks: 'Follow-up after consultation. Patient needs more time to decide.',
          called_by: 'John Telecaller',
          followup_date: '2024-03-15'
        },
        {
          type: 'call',
          id: 3,
          date: '2024-03-15 15:30:00',
          status: 'Appointment',
          sentiment: 'Positive',
          remarks: 'Patient ready to proceed. Scheduled for treatment planning.',
          called_by: 'John Telecaller',
          followup_date: null
        },
        {
          type: 'appointment',
          id: 2,
          date: '2024-03-20 10:00:00',
          center_name: 'Downtown Center',
          created_by: 'Dr. Smith',
          notes: 'Treatment planning session - outlined IVF protocol'
        },
        {
          type: 'appointment',
          id: 3,
          date: '2024-04-01 09:00:00',
          center_name: 'Downtown Center',
          created_by: 'Dr. Smith',
          notes: 'Treatment start - baseline ultrasound and blood work (UPCOMING)'
        }
      ];
      
      setTimeline(mockTimeline);
      setStats({ calls: 3, appointments: 3, upcoming: 1 });
    } finally {
      setLoading(false);
    }
  };

  const getTimelineIcon = (item) => {
    if (item.type === 'call') {
      return (
        <div className={`p-2 rounded-full ${
          item.sentiment === 'Positive' ? 'bg-green-100 dark:bg-green-900' :
          item.sentiment === 'Negative' ? 'bg-red-100 dark:bg-red-900' :
          'bg-yellow-100 dark:bg-yellow-900'
        }`}>
          <svg className={`w-4 h-4 ${
            item.sentiment === 'Positive' ? 'text-green-600 dark:text-green-300' :
            item.sentiment === 'Negative' ? 'text-red-600 dark:text-red-300' :
            'text-yellow-600 dark:text-yellow-300'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      );
    } else {
      const isUpcoming = new Date(item.date) > new Date();
      return (
        <div className={`p-2 rounded-full ${
          isUpcoming ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'
        }`}>
          <svg className={`w-4 h-4 ${
            isUpcoming ? 'text-purple-600 dark:text-purple-300' : 'text-blue-600 dark:text-blue-300'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <button
        onClick={() => navigate('/admin/patients')}
        className="flex items-center gap-2 text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-all hover:gap-3 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Patients
      </button>

      <div className="bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0 h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <span className="text-white font-bold text-3xl">{patient.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{patient.name}</h1>
              <p className="text-white/80 text-sm">Patient ID: #{patient.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 text-sm font-semibold rounded-xl backdrop-blur-sm ${
              patient.lead_source === 'Facebook' ? 'bg-blue-500/30 text-white ring-1 ring-white/30' :
              patient.lead_source === 'Instagram' ? 'bg-pink-500/30 text-white ring-1 ring-white/30' :
              patient.lead_source === 'YouTube' ? 'bg-red-500/30 text-white ring-1 ring-white/30' :
              'bg-white/20 text-white ring-1 ring-white/30'
            }`}>
              From {patient.lead_source}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdPerson className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70 font-medium">Age</p>
                <p className="text-xl font-bold text-white">{patient.age} years</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdEmail className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/70 font-medium">Email</p>
                <p className="text-sm font-semibold text-white truncate">{patient.email}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdPhone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70 font-medium">Phone</p>
                <p className="text-sm font-semibold text-white">{patient.phone}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdCalendarToday className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70 font-medium">Registered</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Calls</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.calls}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Appointments</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.appointments}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.upcoming}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-navy-700">
        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-5 flex items-center gap-2">
          <MdPerson className="w-6 h-6 text-brand-500" />
          Partner Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Partner Name</p>
            <p className="text-lg font-semibold text-navy-700 dark:text-white">{patient.partner_name}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Partner Age</p>
            <p className="text-lg font-semibold text-navy-700 dark:text-white">{patient.partner_age} years</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-navy-900 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <MdLocationOn className="w-4 h-4" />
              <span>Preferred Center</span>
            </div>
            <p className="text-lg font-semibold text-navy-700 dark:text-white">{patient.preferred_center_name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-navy-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-700 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Patient Timeline
          </h2>
        </div>
        
        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-navy-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No timeline entries found</p>
          </div>
        ) : (
          <div className="space-y-5">
            {timeline.map((item, index) => {
              const dateField = item.call_date || item.appointment_date;
              const { date, time } = formatDateTime(dateField);
              const isUpcoming = new Date(dateField) > new Date();
              
              return (
                <div key={`${item.type}-${item.id}`} className="relative">
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 to-transparent dark:from-brand-800"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      {getTimelineIcon(item)}
                    </div>
                    
                    <div className={`flex-1 transition-all hover:shadow-md ${
                      isUpcoming && item.type === 'appointment' 
                        ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-700' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-navy-900 dark:to-navy-800 border border-gray-200 dark:border-navy-700'
                    } rounded-xl p-5`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                              {item.type === 'call' ? 'Call Record' : 'Appointment'}
                            </h3>
                            {isUpcoming && item.type === 'appointment' && (
                              <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full animate-pulse shadow-lg">
                                UPCOMING
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">{date}</span>
                            <span className="text-gray-400">•</span>
                            <span>{time}</span>
                          </div>
                        </div>
                        {item.type === 'call' && (
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                            item.sentiment === 'Positive' ? 'bg-green-500 text-white' :
                            item.sentiment === 'Negative' ? 'bg-red-500 text-white' :
                            'bg-yellow-500 text-white'
                          }`}>
                            {item.sentiment}
                          </span>
                        )}
                      </div>
                      
                      {item.type === 'call' ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-navy-800 rounded-lg">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                              <span className="text-brand-500 dark:text-brand-400 font-medium">{item.status}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-navy-800 rounded-lg">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Called by:</span>
                              <span className="text-navy-700 dark:text-white font-medium">{item.called_by_name}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-navy-800/50 p-3 rounded-lg">
                            {item.remarks}
                          </p>
                          {item.followup_date && (
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-300 dark:border-navy-700">
                              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                                Follow-up scheduled: {new Date(item.followup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-navy-800 rounded-lg">
                              <MdLocationOn className="w-4 h-4 text-brand-500" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Center:</span>
                              <span className="text-brand-500 dark:text-brand-400 font-medium">{item.center_name}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-navy-800 rounded-lg">
                              <MdPerson className="w-4 h-4 text-purple-500" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Created by:</span>
                              <span className="text-navy-700 dark:text-white font-medium">{item.created_by_name}</span>
                            </div>
                          </div>
                          {item.notes && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-navy-800/50 p-3 rounded-lg">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;

