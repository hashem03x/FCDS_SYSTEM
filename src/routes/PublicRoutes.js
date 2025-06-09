import React, { useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Memoized public route protection
const PublicRoutes = React.memo(() => {
  const { user } = useAuth();

  // Memoize the route protection logic
  const publicRoute = useMemo(() => {
    // If user is authenticated, redirect based on role
    if (user) {
      const redirectPath = user.role === "admin" ? "/admin/" : "/student/";
      return <Navigate to={redirectPath} replace />;
    }

    // Return the public content
    return <Outlet />;
  }, [user]);

  return publicRoute;
});

PublicRoutes.displayName = "PublicRoutes";

export default PublicRoutes;
