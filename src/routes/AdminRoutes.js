import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";
import SystemSettings from "../pages/Admin/SystemSettings/SystemSettings";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="system-settings" element={<SystemSettings />} />
    </Routes>
  );
};

export default AdminRoutes;
