import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import Dashboard from "views/admin/dashboard";
import Centers from "views/admin/centers";
import Leads from "views/admin/leads";
import LeadDetail from "views/admin/leads/LeadDetail";
import Patients from "views/admin/patients";
import PatientDetail from "views/admin/patients/PatientDetail";
import Calls from "views/admin/calls";
import Appointments from "views/admin/appointments";
import Reports from "views/admin/reports";
import Users from "views/admin/users";
import NFTMarketplace from "views/admin/marketplace";
import Profile from "views/admin/profile";
import DataTables from "views/admin/tables";
import RTLDefault from "views/rtl/default";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
  MdDashboard,
  MdBusiness,
  MdPeople,
  MdPhone,
  MdEvent,
  MdAssessment,
  MdSupervisorAccount,
} from "react-icons/md";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "dashboard",
    icon: <MdDashboard className="h-6 w-6" />,
    component: <Dashboard />,
  },
  {
    name: "Centers",
    layout: "/admin",
    path: "centers",
    icon: <MdBusiness className="h-6 w-6" />,
    component: <Centers />,
  },
  {
    name: "Leads",
    layout: "/admin",
    path: "leads",
    icon: <MdPeople className="h-6 w-6" />,
    component: <Leads />,
  },
  {
    name: "Lead Detail",
    layout: "/admin",
    path: "leads/:id",
    component: <LeadDetail />,
    invisible: true,
  },
  {
    name: "Patients",
    layout: "/admin",
    path: "patients",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Patients />,
  },
  {
    name: "Patient Detail",
    layout: "/admin",
    path: "patients/:id",
    component: <PatientDetail />,
    invisible: true,
  },
  {
    name: "Calls",
    layout: "/admin",
    path: "calls",
    icon: <MdPhone className="h-6 w-6" />,
    component: <Calls />,
  },
  {
    name: "Appointments",
    layout: "/admin",
    path: "appointments",
    icon: <MdEvent className="h-6 w-6" />,
    component: <Appointments />,
  },
  {
    name: "Reports",
    layout: "/admin",
    path: "reports",
    icon: <MdAssessment className="h-6 w-6" />,
    component: <Reports />,
  },
  {
    name: "Users",
    layout: "/admin",
    path: "users",
    icon: <MdSupervisorAccount className="h-6 w-6" />,
    component: <Users />,
    adminOnly: true,
  },
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
    invisible: true,
  },
  {
    name: "NFT Marketplace",
    layout: "/admin",
    path: "nft-marketplace",
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    component: <NFTMarketplace />,
    secondary: true,
    invisible: true,
  },
  {
    name: "Data Tables",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "data-tables",
    component: <DataTables />,
    invisible: true,
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
    invisible: true,
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
    invisible: true,
  },
  {
    name: "RTL Admin",
    layout: "/rtl",
    path: "rtl",
    icon: <MdHome className="h-6 w-6" />,
    component: <RTLDefault />,
    invisible: true,
  },
];
export default routes;
