import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoutes = () => {
  const { user } = useAuth();

  if (user) {
    return user.role === "admin" ? (
      <Navigate to="/admin/" replace />
    ) : (
      <Navigate to="/student/" replace />
    );
  }

  return <Outlet />;
};

export default PublicRoutes;
