/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box, Flex, Icon, Select, SimpleGrid, Text, useColorModeValue, Input, Button, Spinner } from "@chakra-ui/react";
// Custom components
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React, { useState, useEffect } from "react";
import { MdLocalHospital, MdPeople, MdCall, MdEvent, MdAlarm, MdRefresh } from "react-icons/md";
import PieChart from "components/charts/PieChart";
import { useDatabase } from "contexts/DatabaseContext";

export default function HospitalDashboard() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.700");
  
  // Database context
  const { patientService, callService, appointmentService, isInitialized } = useDatabase();
  
  // State management
  const [rangeMode, setRangeMode] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [centerFilter, setCenterFilter] = useState('all');

  // Set default dates when range mode changes
  useEffect(() => {
    if (rangeMode === 'range' && !startDate && !endDate) {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      
      setStartDate(weekAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  }, [rangeMode, startDate, endDate]);
  const [dashboardData, setDashboardData] = useState({
    totalCalls: 0,
    totalPatients: 0,
    callsInQueue: 0,
    appointmentsScheduled: 0,
    remindersSent: 0,
    leadsBySource: { facebook: 0, instagram: 0, youtube: 0 },
    centerDistribution: { thane: 0, nashik: 0, yeola: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const today = new Date();
    const start = new Date();
    const end = new Date();

    switch (rangeMode) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'range':
        if (startDate && endDate) {
          start.setTime(new Date(startDate).getTime());
          end.setTime(new Date(endDate).getTime());
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        } else {
          // Fallback to today if range dates are not set
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }
        break;
      default:
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    }

    return { 
      start: start.toISOString().split('T')[0], 
      end: end.toISOString().split('T')[0] 
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isInitialized) {
      console.log('Database not initialized yet');
      return;
    }

    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Fetch all data
      const [patients, calls, appointments] = await Promise.all([
        patientService.getAllPatients(),
        callService.getAllCalls(),
        appointmentService.getAllAppointments()
      ]);

      console.log('Dashboard data fetched:', { 
        patients: patients.length, 
        calls: calls.length, 
        appointments: appointments.length 
      });

      // Filter data based on date range
      const filteredCalls = calls.filter(call => {
        const callDate = new Date(call.call_date);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return callDate >= startDate && callDate <= endDate;
      });

      const filteredAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        const startDate = new Date(start);
        const endDate = new Date(end);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });

      console.log('Filtered data:', { 
        filteredCalls: filteredCalls.length, 
        filteredAppointments: filteredAppointments.length,
        dateRange: { start, end }
      });

      // Calculate statistics using filtered data where appropriate
      const totalCalls = filteredCalls.length;
      const totalPatients = patients.length; // Total patients is not date-filtered
      const callsInQueue = filteredCalls.filter(call => call.follow_up_required).length;
      const appointmentsScheduled = filteredAppointments.filter(apt => apt.status === 'Scheduled').length;
      const remindersSent = filteredCalls.filter(call => call.call_type === 'Outbound').length;

      // Calculate leads by source (simulated based on call sentiment)
      const leadsBySource = {
        facebook: Math.floor(filteredCalls.filter(call => call.sentiment === 'Positive').length * 0.4),
        instagram: Math.floor(filteredCalls.filter(call => call.sentiment === 'Positive').length * 0.3),
        youtube: Math.floor(filteredCalls.filter(call => call.sentiment === 'Positive').length * 0.3)
      };

      // Calculate center distribution (simulated based on patient distribution)
      // In a real app, this would be based on actual patient center assignments
      let centerDistribution = {
        thane: Math.floor(patients.length * 0.5),
        nashik: Math.floor(patients.length * 0.3),
        yeola: Math.floor(patients.length * 0.2)
      };

      // Apply center filter if not 'all'
      if (centerFilter !== 'all') {
        // Filter patients by center (simulated - in real app would have center field)
        const filteredPatients = patients.filter((patient, index) => {
          // Simulate center assignment based on patient ID
          const centerAssignment = index % 10;
          if (centerFilter === 'thane') return centerAssignment < 5;
          if (centerFilter === 'nashik') return centerAssignment >= 5 && centerAssignment < 8;
          if (centerFilter === 'yeola') return centerAssignment >= 8;
          return true;
        });

        // Recalculate center distribution based on filtered patients
        centerDistribution = {
          thane: centerFilter === 'thane' ? filteredPatients.length : 0,
          nashik: centerFilter === 'nashik' ? filteredPatients.length : 0,
          yeola: centerFilter === 'yeola' ? filteredPatients.length : 0
        };
      }

      setDashboardData({
        totalCalls,
        totalPatients,
        callsInQueue,
        appointmentsScheduled,
        remindersSent,
        leadsBySource,
        centerDistribution
      });

      console.log('Dashboard data updated:', {
        totalCalls,
        totalPatients,
        callsInQueue,
        appointmentsScheduled,
        remindersSent,
        leadsBySource,
        centerDistribution,
        filters: { rangeMode, startDate, endDate, centerFilter }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when filters change or database is initialized
  useEffect(() => {
    fetchDashboardData();
  }, [isInitialized, rangeMode, startDate, endDate, centerFilter]);

  // Chart data based on dynamic data
  const leadsChartData = [
    dashboardData.leadsBySource.facebook,
    dashboardData.leadsBySource.instagram,
    dashboardData.leadsBySource.youtube
  ];
  const leadsChartOptions = {
    labels: ["Facebook", "Instagram", "YouTube"],
    legend: { show: true },
    colors: ["#3b5998", "#E1306C", "#FF0000"],
    dataLabels: { enabled: false },
    plotOptions: { pie: { expandOnClick: false } },
  };
  
  const centerChartData = [
    dashboardData.centerDistribution.thane,
    dashboardData.centerDistribution.nashik,
    dashboardData.centerDistribution.yeola
  ];
  const centerChartOptions = {
    labels: ["Thane", "Nashik", "Yeola"],
    legend: { show: true },
    colors: ["#4318FF", "#05CD99", "#FFAB00"],
    dataLabels: { enabled: false },
    plotOptions: { pie: { expandOnClick: false } },
  };

  // Check if charts have data to display
  const hasLeadsData = leadsChartData.some(value => value > 0);
  const hasCenterData = centerChartData.some(value => value > 0);
  // Show loading state if database is not initialized
  if (!isInitialized) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Flex justify='center' align='center' h='400px'>
          <Flex direction='column' align='center' gap='20px'>
            <Spinner size='xl' color={brandColor} />
            <Text color={textColor} fontSize='lg'>Initializing Dashboard...</Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Filters */}
      <Flex gap='20px' mb='20px' align='center' flexWrap='wrap'>
        <Text color={textColor} fontSize='sm' fontWeight='600'>
          Active Filters: {rangeMode} {centerFilter !== 'all' ? `| ${centerFilter}` : ''}
        </Text>
        <Flex direction='column'>
          <Text color={textColor} fontSize='sm' fontWeight='600' mb='6px'>Date Filter</Text>
          <Select id='date_filter' variant='filled' value={rangeMode} onChange={(e) => setRangeMode(e.target.value)} w='220px'>
            <option value='today'>Today</option>
            <option value='week'>Week</option>
            <option value='month'>Month</option>
            <option value='range'>Date range</option>
          </Select>
        </Flex>
        {rangeMode === 'range' && (
          <>
            <Flex direction='column'>
              <Text color={textColor} fontSize='sm' fontWeight='600' mb='6px'>Start Date</Text>
              <Input 
                id='start_date' 
                type='date' 
                variant='filled' 
                w='200px' 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Flex>
            <Flex direction='column'>
              <Text color={textColor} fontSize='sm' fontWeight='600' mb='6px'>End Date</Text>
              <Input 
                id='end_date' 
                type='date' 
                variant='filled' 
                w='200px' 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Flex>
          </>
        )}
        <Flex direction='column'>
          <Text color={textColor} fontSize='sm' fontWeight='600' mb='6px'>Center</Text>
          <Select 
            id='center_filter' 
            variant='filled' 
            value={centerFilter} 
            onChange={(e) => setCenterFilter(e.target.value)}
            w='220px'
          >
            <option value='all'>All Centers</option>
            <option value='thane'>Thane</option>
            <option value='nashik'>Nashik</option>
            <option value='yeola'>Yeola</option>
          </Select>
        </Flex>
        <Flex direction='column' align='end' justify='end' gap='10px'>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
            loadingText="Refreshing"
          >
            Refresh Data
          </Button>
          <Button
            colorScheme="gray"
            variant="ghost"
            size="sm"
            onClick={() => {
              setRangeMode('today');
              setStartDate('');
              setEndDate('');
              setCenterFilter('all');
            }}
          >
            Clear Filters
          </Button>
          <Button
            colorScheme="purple"
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide' : 'Show'} Debug
          </Button>
        </Flex>
      </Flex>
      
      {/* Debug Panel */}
      {showDebug && (
        <Box bg={cardBg} borderRadius='10px' p='15px' mb='20px' border='1px solid' borderColor='gray.200'>
          <Text color={textColor} fontSize='sm' fontWeight='600' mb='10px'>Debug Information:</Text>
          <Text color={textColor} fontSize='xs' fontFamily='mono'>
            Database Initialized: {isInitialized ? 'Yes' : 'No'}<br/>
            Loading: {loading ? 'Yes' : 'No'}<br/>
            Range Mode: {rangeMode}<br/>
            Start Date: {startDate || 'Not set'}<br/>
            End Date: {endDate || 'Not set'}<br/>
            Center Filter: {centerFilter}<br/>
            Total Calls: {dashboardData.totalCalls}<br/>
            Total Patients: {dashboardData.totalPatients}<br/>
            Calls in Queue: {dashboardData.callsInQueue}<br/>
            Appointments Scheduled: {dashboardData.appointmentsScheduled}<br/>
            Reminders Sent: {dashboardData.remindersSent}
          </Text>
        </Box>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdLocalHospital} color={brandColor} />} />
          }
          name='Total Calls'
          value={loading ? '...' : dashboardData.totalCalls.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdPeople} color={brandColor} />} />
          }
          name='Total Patients'
          value={loading ? '...' : dashboardData.totalPatients.toLocaleString()}
        />
        <MiniStatistics
          startContent={
            <IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdCall} color={brandColor} />} />
          }
          name='Calls in Queue'
          value={loading ? '...' : dashboardData.callsInQueue.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdEvent} color={brandColor} />} />
          }
          name='Appointments Scheduled'
          value={loading ? '...' : dashboardData.appointmentsScheduled.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdAlarm} color={brandColor} />} />
          }
          name='Reminders Sent'
          value={loading ? '...' : dashboardData.remindersSent.toString()}
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
        <Box bg={cardBg} borderRadius='20px' p='20px'>
          <Flex justify='space-between' align='center' mb='10px'>
            <Text color={textColor} fontSize='md' fontWeight='600'>Leads by Source</Text>
          </Flex>
          {loading ? (
            <Flex justify='center' align='center' h='180px'>
              <Spinner size='lg' color={brandColor} />
            </Flex>
          ) : hasLeadsData ? (
          <PieChart h='180px' w='100%' chartData={leadsChartData} chartOptions={leadsChartOptions} />
          ) : (
            <Flex justify='center' align='center' h='180px'>
              <Text color={textColor} fontSize='sm'>No leads data available</Text>
            </Flex>
          )}
        </Box>
        <Box bg={cardBg} borderRadius='20px' p='20px'>
          <Flex justify='space-between' align='center' mb='10px'>
            <Text color={textColor} fontSize='md' fontWeight='600'>Center Distribution</Text>
          </Flex>
          {loading ? (
            <Flex justify='center' align='center' h='180px'>
              <Spinner size='lg' color={brandColor} />
            </Flex>
          ) : hasCenterData ? (
          <PieChart h='180px' w='100%' chartData={centerChartData} chartOptions={centerChartOptions} />
          ) : (
            <Flex justify='center' align='center' h='180px'>
              <Text color={textColor} fontSize='sm'>No center data available</Text>
            </Flex>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}
