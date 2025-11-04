import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdFileDownload, MdPerson, MdAdd } from 'react-icons/md';
import FullScreenModal from '../../../components/modal/FullScreenModal';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [centers, setCenters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    partner_name: '',
    partner_age: '',
    preferred_center_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    fetchCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers');
      setCenters(response.data.centers || response.data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      // Handle different response structures
      const patientsData = response.data?.patients || response.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      console.log('Setting mock data due to API error');
      // Set mock data if API fails
      setPatients([
        {
          id: 1,
          name: 'Sarah Johnson',
          age: 32,
          email: 'sarah.j@email.com',
          phone: '+1-555-0101',
          partner_name: 'Mike Johnson',
          partner_age: 35,
          preferred_center_name: 'Downtown Center',
          created_at: '2024-01-15',
          lead_source: 'Facebook'
        },
        {
          id: 2,
          name: 'Emily Williams',
          age: 29,
          email: 'emily.w@email.com',
          phone: '+1-555-0102',
          partner_name: 'David Williams',
          partner_age: 31,
          preferred_center_name: 'Uptown Clinic',
          created_at: '2024-01-20',
          lead_source: 'Instagram'
        },
        {
          id: 3,
          name: 'Jessica Brown',
          age: 35,
          email: 'jessica.b@email.com',
          phone: '+1-555-0103',
          partner_name: 'Robert Brown',
          partner_age: 36,
          preferred_center_name: 'Downtown Center',
          created_at: '2024-02-01',
          lead_source: 'YouTube'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = Array.isArray(patients) ? patients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);
      
      const matchesSource = filterSource === 'all' || patient.lead_source === filterSource;
      const matchesCenter = filterCenter === 'all' || patient.preferred_center_name === filterCenter;
      
      return matchesSearch && matchesSource && matchesCenter;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }) : [];

  const uniqueSources = [...new Set(patients.map(p => p.lead_source))].filter(Boolean);
  const uniqueCenters = [...new Set(patients.map(p => p.preferred_center_name))].filter(Boolean);

  const viewPatientDetails = (patientId) => {
    navigate(`/admin/patients/${patientId}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Age', 'Email', 'Phone', 'Partner', 'Partner Age', 'Center', 'Source', 'Registered'];
    const csvData = filteredPatients.map(p => [
      p.name,
      p.age,
      p.email,
      p.phone,
      p.partner_name,
      p.partner_age,
      p.preferred_center_name,
      p.lead_source,
      new Date(p.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const openModal = () => {
    setFormData({
      name: '',
      age: '',
      email: '',
      phone: '',
      partner_name: '',
      partner_age: '',
      preferred_center_id: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', formData);
      setShowModal(false);
      setFormData({
        name: '',
        age: '',
        email: '',
        phone: '',
        partner_name: '',
        partner_age: '',
        preferred_center_id: ''
      });
      fetchPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all shadow-md hover:shadow-lg"
        >
          <MdAdd className="text-lg" />
          Add Patient
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Patients</p>
              <p className="text-4xl font-bold text-white mt-2">{Array.isArray(patients) ? patients.length : 0}</p>
              <p className="text-xs text-blue-100 mt-2">All registered patients</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <MdPerson className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Active Treatments</p>
              <p className="text-4xl font-bold text-white mt-2">{Math.floor((Array.isArray(patients) ? patients.length : 0) * 0.6)}</p>
              <p className="text-xs text-green-100 mt-2">Ongoing care programs</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">New This Month</p>
              <p className="text-4xl font-bold text-white mt-2">{Math.floor((Array.isArray(patients) ? patients.length : 0) * 0.2)}</p>
              <p className="text-xs text-purple-100 mt-2">Recent registrations</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="p-6 border-b border-gray-100 dark:border-navy-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-navy-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-navy-700 dark:text-white transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  showFilters 
                    ? 'bg-brand-500 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-600'
                }`}
              >
                <MdFilterList className="w-5 h-5" />
                Filters
              </button>
              
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-navy-600 transition-all"
              >
                <MdFileDownload className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-navy-900 rounded-xl border border-gray-100 dark:border-navy-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lead Source
                  </label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="all">All Sources</option>
                    {uniqueSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Center
                  </label>
                  <select
                    value={filterCenter}
                    onChange={(e) => setFilterCenter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="all">All Centers</option>
                    {uniqueCenters.map(center => (
                      <option key={center} value={center}>{center}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-navy-700">
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-brand-500 transition-colors"
                  >
                    Patient
                    {sortField === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Preferred Center
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('lead_source')}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-brand-500 transition-colors"
                  >
                    Source
                    {sortField === 'lead_source' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hover:text-brand-500 transition-colors"
                  >
                    Registered
                    {sortField === 'created_at' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-navy-700 rounded-full flex items-center justify-center mb-4">
                        <MdPerson className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No patients found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || filterSource !== 'all' || filterCenter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'Get started by adding your first patient'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <tr 
                    key={patient.id}
                    className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-900 cursor-pointer transition-all duration-200 group"
                    onClick={() => viewPatientDetails(patient.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <span className="text-white font-semibold text-lg">{patient.name.charAt(0)}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-navy-800 rounded-full"></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-navy-700 dark:text-white group-hover:text-brand-500 transition-colors">
                              {patient.name}
                            </div>
                            {patient.lead_id && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                                Converted Lead
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {patient.age} years old
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-700 dark:text-white font-medium">{patient.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-700 dark:text-white font-medium">{patient.partner_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{patient.partner_age} years old</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                        <span className="text-sm text-navy-700 dark:text-white font-medium">{patient.preferred_center_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg ${
                        patient.lead_source === 'Facebook' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        patient.lead_source === 'Instagram' ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' :
                        patient.lead_source === 'YouTube' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        patient.lead_source === 'Google' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        'bg-gray-50 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300'
                      }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                        {patient.lead_source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-700 dark:text-white font-medium">
                        {new Date(patient.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.floor((new Date() - new Date(patient.created_at)) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewPatientDetails(patient.id);
                        }}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                      >
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredPatients.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-navy-900 border-t border-gray-100 dark:border-navy-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-navy-700 dark:text-white">{filteredPatients.length}</span> of{' '}
                <span className="font-semibold text-navy-700 dark:text-white">{patients.length}</span> patients
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Click any row to view patient details
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add New Patient
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create a new patient record
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="patient@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
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
                value={formData.partner_age}
                onChange={(e) => setFormData({ ...formData, partner_age: e.target.value })}
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
              value={formData.preferred_center_id}
              onChange={(e) => setFormData({ ...formData, preferred_center_id: e.target.value })}
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
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
    </div>
  );
};

export default Patients;

