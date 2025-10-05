import React from 'react';

import { Icon } from '@chakra-ui/react';
import { MdLocalHospital, MdPeople, MdCall, MdEvent, MdAlarm, MdHistory } from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import Patients from 'views/admin/patients';
import Calls from 'views/admin/calls';
import Appointments from 'views/admin/appointments';
import Reminders from 'views/admin/reminders';
import CallHistory from 'views/admin/callHistory';

// Auth Imports

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdLocalHospital} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Patients',
    layout: '/admin',
    path: '/patients',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <Patients />,
  },
  {
    name: 'Calls',
    layout: '/admin',
    path: '/calls',
    icon: <Icon as={MdCall} width="20px" height="20px" color="inherit" />,
    component: <Calls />,
  },
  {
    name: 'Appointments',
    layout: '/admin',
    path: '/appointments',
    icon: <Icon as={MdEvent} width="20px" height="20px" color="inherit" />,
    component: <Appointments />,
  },
  {
    name: 'Reminders',
    layout: '/admin',
    path: '/reminders',
    icon: <Icon as={MdAlarm} width="20px" height="20px" color="inherit" />,
    component: <Reminders />,
  },
  {
    name: 'Call History',
    layout: '/admin',
    path: '/call-history',
    icon: <Icon as={MdHistory} width="20px" height="20px" color="inherit" />,
    component: <CallHistory />,
  },
];

export default routes;
