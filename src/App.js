import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import AdminDashboard from "./pages/Admin/Dashboard";
import StudentDashboard from "./pages/Student/Dashboard";
import StudentPerformance from "./pages/Student/StudentPerformance";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import StudentLayout from "./pages/Student/StudentLayout";
import Registration from "./pages/Student/Registration";
import TimeTable from "./pages/Student/TimeTable";
import ExamsTable from "./pages/Student/Exams";
import Settings from "./pages/Student/Settings";
import Attendance from "./pages/Student/Attendance";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./pages/Admin/AdminLayout";
import Users from "./pages/Admin/Users";
import Courses from "./pages/Admin/Courses";
import Sections from "./pages/Admin/Sections";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route (Prevents logged-in users from accessing login page) */}
          <Route element={<PublicRoutes />}>
            <Route index path="/" element={<Login />} />
            <Route index path="/login" element={<Login />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoutes role="admin">
                <AdminLayout />
              </PrivateRoutes>
            }
          >
            <Route index path="" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="courses" element={<Courses />} />
            <Route path="sections" element={<Sections />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <PrivateRoutes role="student">
                <StudentLayout />
              </PrivateRoutes>
            }
          >
            {/* Student Pages */}
            <Route index path="" element={<StudentDashboard />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="registration" element={<Registration />} />
            <Route path="lectures-table" element={<TimeTable />} />
            <Route path="exams-table" element={<ExamsTable />} />
            <Route path="settings" element={<Settings />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* Catch-All Page */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
