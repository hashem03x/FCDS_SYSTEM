import React, { useMemo } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { DoctorProvider } from "./context/DoctorContext";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";

// Public Pages
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound/PageNotFound";

// Admin Pages
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Courses from "./pages/Admin/Courses";
import Sections from "./pages/Admin/Sections";
import Complaints from "./pages/Admin/Complaints";
import Fees from "./pages/Admin/Fees";
import Exams from "./pages/Admin/Exams";
import Grades from "./pages/Admin/Grades";
import Analytics from "./pages/Admin/Analytics";

// Student Pages
import StudentLayout from "./pages/Student/StudentLayout";
import StudentDashboard from "./pages/Student/Dashboard";
import StudentPerformance from "./pages/Student/StudentPerformance";
import Registration from "./pages/Student/Registration";
import TimeTable from "./pages/Student/TimeTable";
import ExamsTable from "./pages/Student/Exams";
import Attendance from "./pages/Student/Attendance";
import StudentComplaints from "./pages/Student/Complaints";
import Profile from "./pages/Student/Profile";
import Chat from "./pages/Student/Chat/Chat";

// Doctor Pages
import DoctorLayout from "./pages/Doctor/DoctorLayout";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import DoctorCourses from "./pages/Doctor/Courses";
import DoctorStudents from "./pages/Doctor/Students";
import DoctorGrades from "./pages/Doctor/Grades";
import DoctorSettings from "./pages/Doctor/Settings";
import DoctorLectures from "./pages/Doctor/Lectures";
import DoctorComplaints from "./pages/Doctor/Complaints";
import SystemSettings from "./pages/Admin/SystemSettings/SystemSettings";
import Schedule from "./pages/Doctor/Schedule/Schedule";
import DoctorAttendance from "./pages/Doctor/Attendance/Attendance";

// Memoized route components
const MemoizedLogin = React.memo(Login);
const MemoizedPageNotFound = React.memo(PageNotFound);
const MemoizedAdminLayout = React.memo(AdminLayout);
const MemoizedStudentLayout = React.memo(StudentLayout);
const MemoizedDoctorLayout = React.memo(DoctorLayout);

const App = React.memo(() => {
  // Memoize route configurations
  const publicRoutes = useMemo(
    () => (
      <Route element={<PublicRoutes />}>
        <Route index path="/" element={<MemoizedLogin />} />
        <Route path="/login" element={<MemoizedLogin />} />
      </Route>
    ),
    []
  );

  const adminRoutes = useMemo(
    () => (
      <Route
        path="/admin/*"
        element={
          <PrivateRoutes role="admin">
            <AdminProvider>
              <MemoizedAdminLayout />
            </AdminProvider>
          </PrivateRoutes>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Courses />} />
        <Route path="sections" element={<Sections />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="fees" element={<Fees />} />
        <Route path="exams" element={<Exams />} />
        <Route path="grades" element={<Grades />} />
        <Route path="system-settings" element={<SystemSettings />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    ),
    []
  );

  const studentRoutes = useMemo(
    () => (
      <Route
        path="/student/*"
        element={
          <PrivateRoutes role="student">
            <MemoizedStudentLayout />
          </PrivateRoutes>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="performance" element={<StudentPerformance />} />
        <Route path="registration" element={<Registration />} />
        <Route path="lectures-table" element={<TimeTable />} />
        <Route path="exams-table" element={<ExamsTable />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="complaints" element={<StudentComplaints />} />
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    ),
    []
  );

  const doctorRoutes = useMemo(
    () => (
      <Route
        path="/doctor/*"
        element={
          <PrivateRoutes role="doctor">
            <DoctorProvider>
              <MemoizedDoctorLayout />
            </DoctorProvider>
          </PrivateRoutes>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="courses" element={<DoctorCourses />} />
        <Route path="students" element={<DoctorStudents />} />
        <Route path="grades" element={<DoctorGrades />} />
        <Route path="settings" element={<DoctorSettings />} />
        <Route path="complaints" element={<DoctorComplaints />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="attendance" element={<DoctorAttendance />} />
      </Route>
    ),
    []
  );

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {publicRoutes}
          {adminRoutes}
          {studentRoutes}
          {doctorRoutes}
          <Route path="*" element={<MemoizedPageNotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
});

App.displayName = "App";

export default App;
