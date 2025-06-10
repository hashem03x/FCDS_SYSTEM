import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { BASE_URL } from "../utils/api";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { authToken } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all admin data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const coursesResponse = await fetch(`${BASE_URL}/api/admin/courses`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Fetch users
      const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Filter doctors from users
      const doctorsData = usersData.filter((user) => user.role === "doctor");
      const taData = usersData.filter((user) => user.role === "ta");
      setDoctors(doctorsData);
      setTeachingAssistants(taData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch admin data");
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh specific data
  const refreshCourses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/courses`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error refreshing courses:", err);
    }
  };

  const refreshUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      setUsers(data);
      // Update doctors list as well
      const doctorsData = data.filter((user) => user.role === "doctor");
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Error refreshing users:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (authToken) {
      fetchAdminData();
    }
  }, [authToken]);

  const data = {
    courses,
    users,
    doctors,
    teachingAssistants,
    loading,
    error,
    refreshCourses,
    refreshUsers,
    fetchAdminData,
  };

  return <AdminContext.Provider value={data}>{children}</AdminContext.Provider>;
};

export default AdminContext;
