import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FaYoutube, FaFacebook, FaInstagram, FaGlobe, FaUsers, FaThumbsUp, FaThumbsDown, FaMeh, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data if API fails
      setDashboardData({
        summary: {
          totalLeads: 150,
          totalPatients: 45,
          totalAppointments: 23,
          recentLeads: 12,
          upcomingAppointments: 8,
          followupCalls: 5
        },
        sentimentStats: [
          { sentiment: 'Positive', count: 25 },
          { sentiment: 'Neutral', count: 15 },
          { sentiment: 'Negative', count: 8 }
        ],
        leadsBySource: [
          { name: 'Facebook', count: 45 },
          { name: 'Instagram', count: 38 },
          { name: 'YouTube', count: 32 },
          { name: 'Referral', count: 20 },
          { name: 'Other', count: 15 }
        ],
        monthlyTrends: [
          { month: 'Jan', leads_count: 12 },
          { month: 'Feb', leads_count: 18 },
          { month: 'Mar', leads_count: 25 },
          { month: 'Apr', leads_count: 22 },
          { month: 'May', leads_count: 30 },
          { month: 'Jun', leads_count: 28 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const { summary, sentimentStats, leadsBySource, monthlyTrends } = dashboardData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getSourceIcon = (sourceName) => {
    if (!sourceName || typeof sourceName !== 'string') {
      return <FaGlobe className="w-4 h-4" style={{ color: '#6B7280' }} />;
    }
    
    const normalizedName = sourceName.toLowerCase().trim();
    
    switch (normalizedName) {
      case 'facebook':
        return <FaFacebook className="w-4 h-4" style={{ color: '#1877F2' }} />;
      case 'instagram':
        return <FaInstagram className="w-4 h-4" style={{ color: '#E4405F' }} />;
      case 'youtube':
        return <FaYoutube className="w-4 h-4" style={{ color: '#FF0000' }} />;
      case 'referral':
        return <FaUsers className="w-4 h-4" style={{ color: '#10B981' }} />;
      case 'other':
        return <FaGlobe className="w-4 h-4" style={{ color: '#6B7280' }} />;
      default:
        return <FaGlobe className="w-4 h-4" style={{ color: '#6B7280' }} />;
    }
  };

  const getSentimentIcon = (sentiment) => {
    const normalizedSentiment = sentiment.toLowerCase().trim();
    
    switch (normalizedSentiment) {
      case 'positive':
        return <FaThumbsUp className="w-4 h-4" style={{ color: '#10B981' }} />;
      case 'negative':
        return <FaThumbsDown className="w-4 h-4" style={{ color: '#EF4444' }} />;
      case 'neutral':
        return <FaMeh className="w-4 h-4" style={{ color: '#6B7280' }} />;
      default:
        return <FaMeh className="w-4 h-4" style={{ color: '#6B7280' }} />;
    }
  };

  return (
    <div className="mt-3 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Leads</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white mt-3 mb-1">{summary.totalLeads}</p>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>+12% from last month</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Patients</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white mt-3 mb-1">{summary.totalPatients}</p>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>+8% from last month</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Appointments</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white mt-3 mb-1">{summary.totalAppointments}</p>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>+15% from last month</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Leads</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white mt-3 mb-1">{summary.recentLeads}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Last 7 days</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white mt-3 mb-1">{summary.upcomingAppointments}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Next 7 days</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-navy-800 dark:to-navy-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Follow-ups</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white mt-3 mb-1">{summary.followupCalls}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Needed</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 mb-6">
            <FaUsers className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white">Leads by Source</h3>
          </div>
          <div className="space-y-3">
            {leadsBySource.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getSourceIcon(source.source)}
                  <span className="text-sm text-gray-600 dark:text-gray-300">{source.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(source.count / Math.max(...leadsBySource.map(s => s.count))) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-navy-700 dark:text-white w-8">{source.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 mb-6">
            <FaThumbsUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white">Call Sentiment</h3>
          </div>
          <div className="space-y-4">
            {sentimentStats.map((sentiment, index) => (
              <div key={sentiment.sentiment} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getSentimentIcon(sentiment.sentiment)}
                  <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{sentiment.sentiment}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ 
                        width: `${(sentiment.count / Math.max(...sentimentStats.map(s => s.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-navy-700 dark:text-white w-8">{sentiment.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-2 mb-6">
          <FaChartLine className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white">Monthly Lead Trends</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {monthlyTrends.map((trend, index) => (
            <div key={trend.month} className="text-center">
              <div className="flex flex-col items-center justify-end h-32 mb-2">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                  style={{ 
                    height: `${(trend.leads_count / Math.max(...monthlyTrends.map(t => t.leads_count))) * 100}%`,
                    minHeight: '20px'
                  }}
                ></div>
              </div>
              <div className="text-sm font-semibold text-navy-700 dark:text-white mb-1">{trend.leads_count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{trend.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
