import React, { useState, useEffect, useMemo } from 'react';
import { callsAPI, leadsAPI } from '../../../services/api';
import FullScreenModal from '../../../components/modal/FullScreenModal';
import { useAuth } from '../../../contexts/AuthContext';
import { MdPhone, MdEdit, MdDelete, MdFilterList, MdAdd, MdSearch, MdCalendarToday, MdPerson, MdSentimentSatisfied, MdTrendingUp } from 'react-icons/md';

const Calls = () => {
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCall, setEditingCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    lead_id: '',
    status: '',
    sentiment: '',
    called_by: ''
  });
  const [formData, setFormData] = useState({
    lead_id: '',
    call_date: '',
    status: 'Follow-up',
    sentiment: 'Neutral',
    remarks: '',
    followup_date: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchCalls();
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCalls = async () => {
    try {
      const response = await callsAPI.getAll(filters);
      setCalls(response.data.calls || response.data);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await leadsAPI.getAll();
      setLeads(response.data.leads || response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCall) {
        await callsAPI.update(editingCall.id, formData);
      } else {
        await callsAPI.create(formData);
      }
      setShowModal(false);
      setEditingCall(null);
      setFormData({
        lead_id: '',
        call_date: '',
        status: 'Follow-up',
        sentiment: 'Neutral',
        remarks: '',
        followup_date: ''
      });
      fetchCalls();
    } catch (error) {
      console.error('Error saving call:', error);
    }
  };

  const handleEdit = (call) => {
    setEditingCall(call);
    setFormData({
      lead_id: call.lead_id,
      call_date: call.call_date,
      status: call.status,
      sentiment: call.sentiment,
      remarks: call.remarks || '',
      followup_date: call.followup_date || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this call record?')) {
      try {
        await callsAPI.delete(id);
        fetchCalls();
      } catch (error) {
        console.error('Error deleting call:', error);
      }
    }
  };

  const openModal = () => {
    setEditingCall(null);
    setFormData({
      lead_id: '',
      call_date: new Date().toISOString().slice(0, 16),
      status: 'Follow-up',
      sentiment: 'Neutral',
      remarks: '',
      followup_date: ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Appointment': return 'bg-green-100 text-green-800';
      case 'Reschedule': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'No Response': return 'bg-gray-100 text-gray-800';
      case 'Follow-up': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Neutral': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return '😊';
      case 'Neutral': return '😐';
      case 'Negative': return '😟';
      default: return '😐';
    }
  };

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const matchesSearch = 
        call.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.lead_phone?.includes(searchTerm) ||
        call.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [calls, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: calls.length,
      appointments: calls.filter(c => c.status === 'Appointment').length,
      followUps: calls.filter(c => c.status === 'Follow-up').length,
      positiveRatio: calls.length > 0 
        ? Math.round((calls.filter(c => c.sentiment === 'Positive').length / calls.length) * 100)
        : 0
    };
  }, [calls]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <MdAdd className="text-xl" />
          Add Call Record
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-navy-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calls</p>
              <p className="mt-2 text-3xl font-bold text-navy-700 dark:text-white">{stats.total}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
              <MdPhone className="text-2xl text-brand-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Appointments</p>
              <p className="mt-2 text-3xl font-bold text-navy-700 dark:text-white">{stats.appointments}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <MdCalendarToday className="text-2xl text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Follow-ups</p>
              <p className="mt-2 text-3xl font-bold text-navy-700 dark:text-white">{stats.followUps}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
              <MdPerson className="text-2xl text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Positive Rate</p>
              <p className="mt-2 text-3xl font-bold text-navy-700 dark:text-white">{stats.positiveRatio}%</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
              <MdTrendingUp className="text-2xl text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-md p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by lead name, phone, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              showFilters 
                ? 'bg-brand-500 text-white border-brand-500' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700'
            }`}
          >
            <MdFilterList className="text-xl" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lead
                </label>
                <select
                  value={filters.lead_id}
                  onChange={(e) => setFilters({ ...filters, lead_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">All Leads</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} - {lead.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">All Status</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Reschedule">Reschedule</option>
                  <option value="Rejected">Rejected</option>
                  <option value="No Response">No Response</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sentiment
                </label>
                <select
                  value={filters.sentiment}
                  onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Called By
                </label>
                <select
                  value={filters.called_by}
                  onChange={(e) => setFilters({ ...filters, called_by: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">All Users</option>
                  <option value={user?.id}>{user?.name} (Me)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-md overflow-hidden">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-navy-700 mb-4">
              <MdPhone className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No calls found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding your first call record'}
            </p>
            {!searchTerm && (
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all duration-200"
              >
                <MdAdd className="text-xl" />
                Add Call Record
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-navy-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Call Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Called By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Follow-up
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 mr-3">
                          <MdPerson className="text-lg text-brand-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {call.lead_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {call.lead_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MdCalendarToday className="text-gray-400" />
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(call.call_date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${getSentimentColor(call.sentiment)}`}>
                        <span>{getSentimentIcon(call.sentiment)}</span>
                        {call.sentiment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {call.called_by_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {call.followup_date ? (
                          <div className="flex items-center gap-1">
                            <MdCalendarToday className="text-gray-400 text-xs" />
                            {new Date(call.followup_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(call)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(call.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                          title="Delete"
                        >
                          <MdDelete className="text-lg" />
                        </button>
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
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCall ? 'Edit Call Record' : 'Add New Call Record'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingCall ? 'Update call information' : 'Record a new call'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lead
                </label>
                <select
                  required
                  value={formData.lead_id}
                  onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} - {lead.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Call Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.call_date}
                  onChange={(e) => setFormData({ ...formData, call_date: e.target.value })}
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
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                    value={formData.sentiment}
                    onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
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
                  value={formData.followup_date}
                  onChange={(e) => setFormData({ ...formData, followup_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks
                </label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Call notes and remarks..."
                />
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {editingCall ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calls;
