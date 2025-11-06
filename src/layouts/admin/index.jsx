import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import { useAuth } from "../../contexts/AuthContext";
import routes from "routes.js";

export default function Admin(props) {
  const { ...rest } = props;
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);
  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes) => {
    let activeRoute = "Main Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        // Verify user has permission to view this route
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
        const requiredPermission = pathToPermission[routes[i].path];
        
        // If route requires permission and user doesn't have it, redirect to dashboard
        if (requiredPermission && user?.navigation_permissions && !user.navigation_permissions.includes(requiredPermission)) {
          // Redirect will be handled by Routes component, just set to Dashboard
          setCurrentRoute("Dashboard");
        } else if (routes[i].adminOnly && user?.role !== 'Admin') {
          setCurrentRoute("Dashboard");
        } else {
          setCurrentRoute(routes[i].name);
        }
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes) => {
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

    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        // Check admin-only routes
        if (prop.adminOnly && user?.role !== 'Admin') {
          return null;
        }

        // Check navigation permissions
        const requiredPermission = pathToPermission[prop.path];
        if (requiredPermission && user?.navigation_permissions && !user.navigation_permissions.includes(requiredPermission)) {
          return null;
        }

        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";
  return (
    <div className="flex h-full w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {/* Navbar & Main Content */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]`}
        >
          {/* Routes */}
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              logoText={"IVF Hospital Management"}
              brandText={currentRoute}
              secondary={getActiveNavbar(routes)}
              user={user}
              onLogout={logout}
              {...rest}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getRoutes(routes)}

                <Route
                  path="/"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
