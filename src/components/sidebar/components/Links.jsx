/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { useAuth } from "contexts/AuthContext";
// chakra imports

export function SidebarLinks(props) {
  // Chakra color mode
  let location = useLocation();
  const { user } = useAuth();

  const { routes } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      // Skip admin-only routes for non-admin users
      if (route.adminOnly && user?.role !== 'Admin') {
        return null;
      }

      // Map route path to permission name
      const pathToPermission = {
        'dashboard': 'dashboard',
        'centers': 'centers',
        'leads': 'leads',
        'patients': 'patients',
        'calls': 'calls',
        'appointments': 'appointments',
        'reports': 'reports',
        'users': 'users'
      };

      const requiredPermission = pathToPermission[route.path];
      
      // Check if user has permission for this route (skip check if no permission mapping)
      if (requiredPermission && user?.navigation_permissions && !user.navigation_permissions.includes(requiredPermission)) {
        return null;
      }

      if (
        (route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl") &&
        !route.invisible
      ) {
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li
                className="my-[3px] flex cursor-pointer items-center px-8"
                key={index}
              >
                <span
                  className={`${
                    activeRoute(route.path) === true
                      ? "font-bold text-brand-500 dark:text-white"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {route.icon ? route.icon : <DashIcon />}{" "}
                </span>
                <p
                  className={`leading-1 ml-4 flex ${
                    activeRoute(route.path) === true
                      ? "font-bold text-navy-700 dark:text-white"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {route.name}
                </p>
              </li>
              {activeRoute(route.path) ? (
                <div class="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
              ) : null}
            </div>
          </Link>
        );
      }
    });
  };
  // BRAND
  return createLinks(routes);
}

export default SidebarLinks;
