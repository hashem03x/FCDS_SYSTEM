import React, { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Memoized role-based access control
const PrivateRoutes = React.memo(({ role, children }) => {
  const { user } = useAuth();

  // Memoize the route protection logic
  const protectedRoute = useMemo(() => {
    // Check if user is not authenticated
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has the required role
    if (user.role !== role) {
      return <Navigate to="/" replace />;
    }

    // Return the protected content
    return children ? children : <Outlet />;
  }, [user, role, children]);

  return protectedRoute;
});

PrivateRoutes.displayName = "PrivateRoutes";

export default PrivateRoutes;
