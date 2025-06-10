import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "./AuthContext";

const DoctorContext = createContext();

export const DoctorProvider = React.memo(({ children }) => {
  const [doctorState, setDoctorState] = useState({
    courses: [],
    isLoading: false,
    error: null,
  });

  const { authToken } = useAuth();

  // Memoized fetch courses function
  const fetchCourses = useCallback(async () => {
    setDoctorState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(
        "https://college-system-two.vercel.app/api/gpa/doctor/courses",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      if (data.success) {
        setDoctorState(prev => ({
          ...prev,
          courses: data.data,
          isLoading: false,
        }));
        console.log("Fetched doctor courses:", data.data);
      } else {
        throw new Error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      setDoctorState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
      console.error("Error fetching doctor courses:", error);
    }
  }, [authToken]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    courses: doctorState.courses,
    isLoading: doctorState.isLoading,
    error: doctorState.error,
    fetchCourses,
  }), [doctorState, fetchCourses]);
  useEffect(()=>{
    fetchCourses()
  } , [])
  return (
    <DoctorContext.Provider value={contextValue}>
      {children}
    </DoctorContext.Provider>
  );
});

DoctorProvider.displayName = "DoctorProvider";

// Memoized hook
export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctor must be used within a DoctorProvider");
  }
  return context;
}; 