import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const AuthContext = createContext();

// API request helper
const makeAuthRequest = async (endpoint, method = "POST", body = null) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Authentication failed");
    }
    
    return data;
  } catch (error) {
    console.error("Auth API Error:", error);
    throw error;
  }
};

export const AuthProvider = React.memo(({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    userPhoto: "",
    authToken: null,
    userRole: "",
    isLoading: false,
  });
  
  const navigate = useNavigate();

  // Memoized login function
  const login = useCallback(async (ID, password) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const data = await makeAuthRequest("login", "POST", { id: ID, password });
      
      // Update auth state
      setAuthState(prev => ({
        ...prev,
        user: data.user,
        authToken: data.token,
        userRole: data.user.role,
        isLoading: false,
      }));

      // Set session storage
      sessionStorage.setItem("IsLoggedIn", "true");
      sessionStorage.setItem("userRole", data.user.role);

      // Navigate based on role
      let redirectPath;
      switch (data.user.role) {
        case "admin":
          redirectPath = "/admin/";
          break;
        case "doctor":
          redirectPath = "/doctor/";
          break;
        case "student":
          redirectPath = "/student/";
          break;
        default:
          throw new Error("Invalid user role");
      }
      navigate(redirectPath);
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      alert(error.message);
    }
  }, [navigate]);

  // Memoized logout function
  const logout = useCallback(() => {
    setAuthState({
      user: null,
      userPhoto: "",
      authToken: null,
      userRole: "",
      isLoading: false,
    });
    
    sessionStorage.setItem("IsLoggedIn", "false");
    sessionStorage.removeItem("userRole");
    
    navigate("/login");
  }, [navigate]);

  // Memoized setUserPhoto function
  const setUserPhoto = useCallback((photo) => {
    setAuthState(prev => ({ ...prev, userPhoto: photo }));
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    user: authState.user,
    authToken: authState.authToken,
    isLoading: authState.isLoading,
    userPhoto: authState.userPhoto,
    userRole: authState.userRole,
    login,
    logout,
    setUserPhoto,
  }), [authState, login, logout, setUserPhoto]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
});

AuthProvider.displayName = "AuthProvider";

// Memoized hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
