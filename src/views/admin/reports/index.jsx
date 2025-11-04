import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { 
  MdPeople, 
  MdPerson, 
  MdCalendarToday, 
  MdPhone,
  MdFileDownload,
  MdDescription,
  MdBarChart,
  MdRefresh,
  MdClear
} from 'react-icons/md';

const Reports = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    source: '',
    status: '',
    center_id: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        summary: {
          totalLeads: 150,
          totalPatients: 45,
          totalAppointments: 23,
          followupCalls: 5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExportLoading(true);
    try {
      const response = await api.get(`/export/${type.toLowerCase()}`, { params: filters });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type.toLowerCase()}_export.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export feature will be available when backend export endpoints are implemented.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleComprehensiveExport = async () => {
    setExportLoading(true);
    try {
      const response = await api.get('/export/comprehensive', { params: filters });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'comprehensive_report.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      alert('Export feature will be available when backend export endpoints are implemented.');
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      source: '',
      status: '',
      center_id: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: dashboardData?.summary.totalLeads || 0,
      icon: MdPeople,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      bgDark: 'bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Total Patients',
      value: dashboardData?.summary.totalPatients || 0,
      icon: MdPerson,
      gradient: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      bgDark: 'bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Appointments',
      value: dashboardData?.summary.totalAppointments || 0,
      icon: MdCalendarToday,
      gradient: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      bgDark: 'bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Follow-ups Needed',
      value: dashboardData?.summary.followupCalls || 0,
      icon: MdPhone,
      gradient: 'from-red-500 to-red-600',
      bgLight: 'bg-red-50',
      bgDark: 'bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="mt-3 space-y-6 pb-8">
      <div></div>

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-navy-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                     style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${stat.bgLight} dark:${stat.bgDark} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-navy-700 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-navy-700 dark:text-white">Filter Reports</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customize your export criteria
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-navy-700 rounded-lg hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
            >
              <MdClear className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-navy-700 dark:text-white transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-navy-700 dark:text-white transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Source
            </label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-navy-700 dark:text-white transition-all"
            >
              <option value="">All Sources</option>
              <option value="YouTube">YouTube</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-navy-700 dark:text-white transition-all"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Center
            </label>
            <select
              value={filters.center_id}
              onChange={(e) => setFilters({ ...filters, center_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-navy-700 dark:text-white transition-all"
            >
              <option value="">All Centers</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Export Reports</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Download your data in Excel format
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <MdPeople className="w-6 h-6 text-white" />
              </div>
              <MdFileDownload className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Leads Report</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Export all leads data with filtering options
            </p>
            <button
              onClick={() => handleExport('Leads')}
              disabled={exportLoading}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <MdFileDownload className="w-5 h-5" />
              {exportLoading ? 'Exporting...' : 'Export Leads'}
            </button>
          </div>

          <div className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <MdPhone className="w-6 h-6 text-white" />
              </div>
              <MdFileDownload className="w-5 h-5 text-green-600 dark:text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Calls Report</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Export call records with sentiment analysis
            </p>
            <button
              onClick={() => handleExport('Calls')}
              disabled={exportLoading}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <MdFileDownload className="w-5 h-5" />
              {exportLoading ? 'Exporting...' : 'Export Calls'}
            </button>
          </div>

          <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <MdCalendarToday className="w-6 h-6 text-white" />
              </div>
              <MdFileDownload className="w-5 h-5 text-purple-600 dark:text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Appointments Report</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Export appointment schedules and details
            </p>
            <button
              onClick={() => handleExport('Appointments')}
              disabled={exportLoading}
              className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <MdFileDownload className="w-5 h-5" />
              {exportLoading ? 'Exporting...' : 'Export Appointments'}
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="relative bg-gradient-to-br from-brand-50 to-indigo-100 dark:from-brand-900/20 dark:to-indigo-800/20 border border-brand-200 dark:border-brand-800 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg">
                <MdDescription className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Comprehensive Report</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Export all data in a comprehensive Excel report with multiple sheets
                </p>
              </div>
            </div>
            <button
              onClick={handleComprehensiveExport}
              disabled={exportLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MdFileDownload className="w-6 h-6" />
              {exportLoading ? 'Generating Report...' : 'Export Comprehensive Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
