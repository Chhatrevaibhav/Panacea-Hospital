import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI, centersAPI, patientsAPI, callsAPI, appointmentsAPI } from '../../../services/api';
import FullScreenModal from '../../../components/modal/FullScreenModal';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdFileUpload, 
  MdSearch,
  MdFilterList,
  MdClear,
  MdPhone,
  MdPerson,
  MdSource,
  MdTrendingUp,
  MdPersonAdd,
  MdCalendarToday
} from 'react-icons/md';
import { 
  FaYoutube, 
  FaFacebook, 
  FaInstagram, 
  FaGlobe,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    source: '',
    status: '',
    assigned_to: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    source: 'YouTube',
    assigned_to: ''
  });
  const [importFile, setImportFile] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);
  const [centers, setCenters] = useState([]);
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    partner_name: '',
    partner_age: '',
    preferred_center_id: ''
  });
  const [showCallModal, setShowCallModal] = useState(false);
  const [callFormData, setCallFormData] = useState({
    lead_id: '',
    call_date: '',
    status: 'Follow-up',
    sentiment: 'Neutral',
    remarks: '',
    followup_date: ''
  });
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentFormData, setAppointmentFormData] = useState({
    patient_id: '',
    center_id: '',
    appointment_date: '',
    status: 'Scheduled',
    notes: ''
  });
  const [patients, setPatients] = useState([]);
  const [schedulingLead, setSchedulingLead] = useState(null);
  const [needsConversion, setNeedsConversion] = useState(false);
  const [appointmentPatientData, setAppointmentPatientData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    partner_name: '',
    partner_age: '',
    preferred_center_id: ''
  });
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchCenters();
    fetchPatients();
  }, [filters]);

  const fetchCenters = async () => {
    try {
      const response = await centersAPI.getAll();
      setCenters(response.data.centers || response.data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.data.patients || response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await leadsAPI.getAll(filters);
      setLeads(response.data.leads || response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'YouTube':
        return <FaYoutube className="text-red-600" />;
      case 'Facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'Instagram':
        return <FaInstagram className="text-pink-600" />;
      default:
        return <FaGlobe className="text-gray-600" />;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    return matchesSearch;
  });

  const stats = {
    total: filteredLeads.length,
    new: filteredLeads.filter(l => l.status === 'New').length,
    converted: filteredLeads.filter(l => l.status === 'Converted').length,
    conversionRate: filteredLeads.length > 0 
      ? ((filteredLeads.filter(l => l.status === 'Converted').length / filteredLeads.length) * 100).toFixed(1)
      : 0
  };

  const clearFilters = () => {
    setFilters({ source: '', status: '', assigned_to: '' });
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await leadsAPI.update(editingLead.id, formData);
      } else {
        await leadsAPI.create(formData);
      }
      setShowModal(false);
      setEditingLead(null);
      setFormData({ name: '', phone: '', source: 'YouTube', assigned_to: '' });
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      source: lead.source,
      assigned_to: lead.assigned_to || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(id);
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    
    try {
      await leadsAPI.import(importFile);
      setShowImportModal(false);
      setImportFile(null);
      fetchLeads();
    } catch (error) {
      console.error('Error importing leads:', error);
    }
  };

  const openConversionModal = (lead) => {
    setConvertingLead(lead);
    setPatientFormData({
      name: lead.name,
      age: '',
      email: '',
      phone: lead.phone,
      partner_name: '',
      partner_age: '',
      preferred_center_id: ''
    });
    setShowConvertModal(true);
  };

  const handleConvertToPatient = async (e) => {
    e.preventDefault();
    try {
      // Create patient with lead_id
      await patientsAPI.create({
        ...patientFormData,
        lead_id: convertingLead.id
      });

      // Update lead status to Converted
      await leadsAPI.update(convertingLead.id, {
        ...convertingLead,
        status: 'Converted'
      });

      setShowConvertModal(false);
      setConvertingLead(null);
      setPatientFormData({
        name: '',
        age: '',
        email: '',
        phone: '',
        partner_name: '',
        partner_age: '',
        preferred_center_id: ''
      });
      fetchLeads();
      alert('Lead successfully converted to patient!');
    } catch (error) {
      console.error('Error converting lead to patient:', error);
      alert('Failed to convert lead to patient. Please try again.');
    }
  };

  const openModal = () => {
    setEditingLead(null);
    setFormData({ name: '', phone: '', source: 'YouTube', assigned_to: '' });
    setShowModal(true);
  };

  const openCallModal = (lead) => {
    setCallFormData({
      lead_id: lead.id,
      call_date: new Date().toISOString().slice(0, 16),
      status: 'Follow-up',
      sentiment: 'Neutral',
      remarks: '',
      followup_date: ''
    });
    setShowCallModal(true);
  };

  const handleCallSubmit = async (e) => {
    e.preventDefault();
    try {
      await callsAPI.create(callFormData);
      setShowCallModal(false);
      setCallFormData({
        lead_id: '',
        call_date: '',
        status: 'Follow-up',
        sentiment: 'Neutral',
        remarks: '',
        followup_date: ''
      });
      alert('Call record created successfully!');
    } catch (error) {
      console.error('Error creating call:', error);
      alert('Failed to create call record. Please try again.');
    }
  };

  const openAppointmentModal = (lead) => {
    const leadPatient = patients.find(p => p.lead_id === lead.id);
    setSchedulingLead(lead);
    
    if (!leadPatient) {
      setNeedsConversion(true);
      setAppointmentPatientData({
        name: lead.name,
        age: '',
        email: '',
        phone: lead.phone,
        partner_name: '',
        partner_age: '',
        preferred_center_id: ''
      });
      setAppointmentFormData({
        patient_id: '',
        center_id: '',
        appointment_date: '',
        status: 'Scheduled',
        notes: ''
      });
    } else {
      setNeedsConversion(false);
      setAppointmentFormData({
        patient_id: leadPatient.id,
        center_id: '',
        appointment_date: '',
        status: 'Scheduled',
        notes: ''
      });
    }
    setShowAppointmentModal(true);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      let patientId = appointmentFormData.patient_id;

      if (needsConversion) {
        const patientResponse = await patientsAPI.create({
          ...appointmentPatientData,
          lead_id: schedulingLead.id
        });
        patientId = patientResponse.data.id;

        await leadsAPI.update(schedulingLead.id, {
          ...schedulingLead,
          status: 'Converted'
        });
      }

      await appointmentsAPI.create({
        ...appointmentFormData,
        patient_id: patientId
      });

      setShowAppointmentModal(false);
      setSchedulingLead(null);
      setNeedsConversion(false);
      setAppointmentFormData({
        patient_id: '',
        center_id: '',
        appointment_date: '',
        status: 'Scheduled',
        notes: ''
      });
      setAppointmentPatientData({
        name: '',
        age: '',
        email: '',
        phone: '',
        partner_name: '',
        partner_age: '',
        preferred_center_id: ''
      });
      
      fetchLeads();
      fetchPatients();
      
      if (needsConversion) {
        alert('Lead converted to patient and appointment created successfully!');
      } else {
        alert('Appointment created successfully!');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Converted': return 'bg-purple-100 text-purple-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
  
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <MdFileUpload className="text-lg" />
            Import Leads
          </button>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all shadow-md hover:shadow-lg"
          >
            <MdAdd className="text-lg" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Leads</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FaUsers className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">New Leads</p>
              <p className="text-3xl font-bold mt-2">{stats.new}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <MdTrendingUp className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Converted</p>
              <p className="text-3xl font-bold mt-2">{stats.converted}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <FaCheckCircle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold mt-2">{stats.conversionRate}%</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <MdTrendingUp className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-500 dark:text-gray-400 text-xl" />
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            >
              <option value="">All Sources</option>
              <option value="YouTube">YouTube</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              value={filters.assigned_to}
              onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            >
              <option value="">All Users</option>
              <option value={user?.id}>{user?.name} (Me)</option>
            </select>

            {(searchTerm || filters.source || filters.status || filters.assigned_to) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Clear filters"
              >
                <MdClear className="text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <FaTimesCircle className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.source || filters.status || filters.assigned_to
                ? 'Try adjusting your filters or search term'
                : 'Get started by importing leads or adding a new lead'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-navy-700 dark:to-navy-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Import Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <MdPhone className="text-gray-400" />
                        {lead.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(lead.source)}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {lead.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <MdPerson className="text-gray-400" />
                        {lead.assigned_to_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(lead.import_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openCallModal(lead)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Create Call"
                        >
                          <MdPhone className="text-lg" />
                        </button>
                        <button
                          onClick={() => openAppointmentModal(lead)}
                          className="p-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all"
                          title="Create Appointment"
                        >
                          <MdCalendarToday className="text-lg" />
                        </button>
                        {lead.status !== 'Converted' && (
                          <button
                            onClick={() => openConversionModal(lead)}
                            className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                            title="Convert to Patient"
                          >
                            <MdPersonAdd className="text-lg" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(lead)}
                          className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                          title="Edit lead"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        {hasRole('Admin') && (
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete lead"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white">
                <MdPersonAdd className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingLead ? 'Edit Lead' : 'Add New Lead'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingLead ? 'Update lead information' : 'Create a new lead entry'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source
                </label>
                <select
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign To
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  <option value={user?.id}>{user?.name} (Me)</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  <MdPersonAdd className="text-lg" />
                  {editingLead ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                <MdFileUpload className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Import Leads
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload your Excel or CSV file
                </p>
              </div>
            </div>
            
            <form onSubmit={handleImport} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-brand-500 dark:bg-navy-700 dark:text-white transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
                <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Required columns:</strong> name, phone, source
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Supported formats: .xlsx, .csv
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importFile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                >
                  <MdFileUpload className="text-lg" />
                  Import Leads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConvertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                <MdTrendingUp className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Convert Lead to Patient
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Convert this lead into a patient record
                </p>
              </div>
            </div>
            
            <form onSubmit={handleConvertToPatient} className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Converting Lead:</strong> {convertingLead?.name} ({convertingLead?.phone})
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              The lead will be marked as "Converted" and a new patient record will be created.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={patientFormData.name}
                onChange={(e) => setPatientFormData({ ...patientFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age
              </label>
              <input
                type="number"
                value={patientFormData.age}
                onChange={(e) => setPatientFormData({ ...patientFormData, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Enter age"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={patientFormData.email}
                onChange={(e) => setPatientFormData({ ...patientFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="patient@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={patientFormData.phone}
                onChange={(e) => setPatientFormData({ ...patientFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="+1-555-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partner Name
              </label>
              <input
                type="text"
                value={patientFormData.partner_name}
                onChange={(e) => setPatientFormData({ ...patientFormData, partner_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Enter partner name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partner Age
              </label>
              <input
                type="number"
                value={patientFormData.partner_age}
                onChange={(e) => setPatientFormData({ ...patientFormData, partner_age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Enter partner age"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferred Center
            </label>
            <select
              value={patientFormData.preferred_center_id}
              onChange={(e) => setPatientFormData({ ...patientFormData, preferred_center_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            >
              <option value="">Select a center</option>
              {centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name} - {center.city}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowConvertModal(false)}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <MdTrendingUp className="text-lg" />
              Convert to Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

      {showCallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                <MdPhone className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Call Record
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Record a call with this lead
                </p>
              </div>
            </div>
            
            <form onSubmit={handleCallSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Call Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={callFormData.call_date}
              onChange={(e) => setCallFormData({ ...callFormData, call_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                required
                value={callFormData.status}
                onChange={(e) => setCallFormData({ ...callFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
              >
                <option value="Appointment">Appointment</option>
                <option value="Reschedule">Reschedule</option>
                <option value="Rejected">Rejected</option>
                <option value="No Response">No Response</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sentiment
              </label>
              <select
                required
                value={callFormData.sentiment}
                onChange={(e) => setCallFormData({ ...callFormData, sentiment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
              >
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Follow-up Date
            </label>
            <input
              type="datetime-local"
              value={callFormData.followup_date}
              onChange={(e) => setCallFormData({ ...callFormData, followup_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remarks
            </label>
            <textarea
              rows={3}
              value={callFormData.remarks}
              onChange={(e) => setCallFormData({ ...callFormData, remarks: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
              placeholder="Call notes and remarks..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowCallModal(false)}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <MdPhone className="text-lg" />
              Create Call
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                <MdCalendarToday className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Schedule Appointment
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {needsConversion 
                    ? 'Create patient record and schedule appointment'
                    : 'Schedule an appointment with this patient'}
                </p>
              </div>
            </div>

            {needsConversion && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This lead will be converted to a patient and marked as "Converted" when the appointment is scheduled.
                </p>
              </div>
            )}
            
            <form onSubmit={handleAppointmentSubmit} className="space-y-6">
          {needsConversion && (
            <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">Patient Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={appointmentPatientData.name}
                    onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={appointmentPatientData.age}
                    onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={appointmentPatientData.email}
                    onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={appointmentPatientData.phone}
                    onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={appointmentPatientData.partner_name}
                    onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, partner_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Partner Age
                  </label>
                  <input
                    type="number"
                    value={appointmentPatientData.partner_age}
                    onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, partner_age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Center
                </label>
                <select
                  value={appointmentPatientData.preferred_center_id}
                  onChange={(e) => setAppointmentPatientData({ ...appointmentPatientData, preferred_center_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Select a center</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">Appointment Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Center *
              </label>
              <select
                required
                value={appointmentFormData.center_id}
                onChange={(e) => setAppointmentFormData({ ...appointmentFormData, center_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
              >
                <option value="">Select Center</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name} - {center.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appointment Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={appointmentFormData.appointment_date}
                onChange={(e) => setAppointmentFormData({ ...appointmentFormData, appointment_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                required
                value={appointmentFormData.status}
                onChange={(e) => setAppointmentFormData({ ...appointmentFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={appointmentFormData.notes}
                onChange={(e) => setAppointmentFormData({ ...appointmentFormData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Appointment notes..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowAppointmentModal(false);
                setSchedulingLead(null);
                setNeedsConversion(false);
              }}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <MdCalendarToday className="text-lg" />
              {needsConversion ? 'Convert & Schedule' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
    </div>
  );
};

export default Leads;
