import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdPhone, MdCalendarToday, MdPerson, MdSource, MdTrendingUp } from 'react-icons/md';
import { FaYoutube, FaFacebook, FaInstagram, FaGlobe } from 'react-icons/fa';
import { leadsAPI } from '../../../services/api';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ calls: 0, upcoming: 0 });

  useEffect(() => {
    fetchLeadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const leadResponse = await leadsAPI.getById(id);
      const timelineResponse = await leadsAPI.getTimeline(id);
      
      setLead(leadResponse.data);
      const timelineData = timelineResponse.data.timeline || [];
      setTimeline(timelineData);
      
      // Calculate stats
      const calls = timelineData.length;
      const upcoming = timelineData.filter(item => {
        const itemDate = new Date(item.call_date);
        return itemDate > new Date();
      }).length;
      
      setStats({ calls, upcoming });
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'YouTube':
        return <FaYoutube className="text-2xl text-white" />;
      case 'Facebook':
        return <FaFacebook className="text-2xl text-white" />;
      case 'Instagram':
        return <FaInstagram className="text-2xl text-white" />;
      default:
        return <FaGlobe className="text-2xl text-white" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-500/30 text-white ring-1 ring-white/30';
      case 'Contacted': return 'bg-yellow-500/30 text-white ring-1 ring-white/30';
      case 'Qualified': return 'bg-green-500/30 text-white ring-1 ring-white/30';
      case 'Converted': return 'bg-purple-500/30 text-white ring-1 ring-white/30';
      case 'Lost': return 'bg-red-500/30 text-white ring-1 ring-white/30';
      default: return 'bg-gray-500/30 text-white ring-1 ring-white/30';
    }
  };

  const getTimelineIcon = (item) => {
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

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <button
        onClick={() => navigate('/admin/leads')}
        className="flex items-center gap-2 text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-all hover:gap-3 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Leads
      </button>

      <div className="bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0 h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <span className="text-white font-bold text-3xl">{lead.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{lead.name}</h1>
              <p className="text-white/80 text-sm">Lead ID: #{lead.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 text-sm font-semibold rounded-xl backdrop-blur-sm ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {getSourceIcon(lead.source)}
              </div>
              <div>
                <p className="text-xs text-white/70 font-medium">Source</p>
                <p className="text-xl font-bold text-white">{lead.source}</p>
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
                <p className="text-sm font-semibold text-white">{lead.phone}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdPerson className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70 font-medium">Assigned To</p>
                <p className="text-sm font-semibold text-white">{lead.assigned_to_name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MdCalendarToday className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70 font-medium">Import Date</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(lead.import_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Follow-ups Due</p>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-navy-700 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Call Timeline
          </h2>
        </div>
        
        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-navy-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No call records found</p>
          </div>
        ) : (
          <div className="space-y-5">
            {timeline.map((item, index) => {
              const { date, time } = formatDateTime(item.call_date);
              const isUpcoming = item.followup_date && new Date(item.followup_date) > new Date();
              
              return (
                <div key={item.id} className="relative">
                  {index !== timeline.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 to-transparent dark:from-brand-800"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      {getTimelineIcon(item)}
                    </div>
                    
                    <div className={`flex-1 transition-all hover:shadow-md ${
                      isUpcoming
                        ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/30 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-700' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-navy-900 dark:to-navy-800 border border-gray-200 dark:border-navy-700'
                    } rounded-xl p-5`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                              Call Record
                            </h3>
                            {isUpcoming && (
                              <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full animate-pulse shadow-lg">
                                FOLLOW-UP DUE
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
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                          item.sentiment === 'Positive' ? 'bg-green-500 text-white' :
                          item.sentiment === 'Negative' ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {item.sentiment}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-navy-800 rounded-lg">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                            <span className="text-brand-500 dark:text-brand-400 font-medium">{item.status}</span>
                          </div>
                          {item.called_by_name && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-navy-800 rounded-lg">
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Called by:</span>
                              <span className="text-navy-700 dark:text-white font-medium">{item.called_by_name}</span>
                            </div>
                          )}
                        </div>
                        {item.remarks && (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-navy-800/50 p-3 rounded-lg">
                            {item.remarks}
                          </p>
                        )}
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

export default LeadDetail;

