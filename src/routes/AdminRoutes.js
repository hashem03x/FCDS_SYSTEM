import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";
import SystemSettings from "../pages/Admin/SystemSettings/SystemSettings";
import Analytics from "../pages/Admin/Analytics";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="system-settings" element={<SystemSettings />} />
      <Route path="analytics" element={<Analytics />} />
    </Routes>
  );
};

export default AdminRoutes;
