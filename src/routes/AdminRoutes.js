import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default AdminRoutes;
