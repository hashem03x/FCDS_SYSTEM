import { Navigate, Outlet } from "react-router-dom";

const PublicRoutes = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));

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
