import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Student/Dashboard";
import Courses from "../pages/Student/Courses";

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="courses" element={<Courses />} />
    </Routes>
  );
};

export default StudentRoutes;
