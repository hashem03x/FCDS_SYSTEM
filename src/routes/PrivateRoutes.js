import React, { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Memoized role-based access control
const PrivateRoutes = React.memo(({ role, children }) => {
  const { user, userRole } = useAuth();

  // Memoize the route protection logic
  const protectedRoute = useMemo(() => {
    // Check if user is not authenticated
    if (!user || !userRole) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has the required role
    if (userRole !== role) {
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case "admin":
          return <Navigate to="/admin" replace />;
        case "doctor":
          return <Navigate to="/doctor" replace />;
        case "student":
          return <Navigate to="/student" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }

    // Return the protected content
    return children ? children : <Outlet />;
  }, [user, userRole, role, children]);

  return protectedRoute;
});

PrivateRoutes.displayName = "PrivateRoutes";

export default PrivateRoutes;
