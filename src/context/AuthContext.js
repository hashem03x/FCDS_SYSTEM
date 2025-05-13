import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userPhoto, setUserPhoto] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (ID, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ID, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Set state only (no sessionStorage)
      setAuthToken(data.token);
      setUser(data.user);
      sessionStorage.setItem("IsLoggedIn", true);
      if (data.user.role === "admin") navigate("/admin/");
      if (data.user.role === "student") navigate("/student/");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setUserPhoto("");
    sessionStorage.setItem("IsLoggedIn", false);
    setTimeout(() => {
      navigate("/login");
    }, 0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        isLoading,
        login,
        logout,
        setUserPhoto,
        userPhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
