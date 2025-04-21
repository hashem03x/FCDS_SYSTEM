import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userPhoto , setUserPhoto] = useState("")
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem("AuthToken");
    const storedUser = sessionStorage.getItem("user");
    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

      sessionStorage.setItem("AuthToken", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setAuthToken(data.token);
      setUser(data.user);

      if (data.user.role === "admin") navigate("/admin/");
      if (data.user.role === "student") navigate("/student/");
    } catch (error) {
      alert(error.message);
    }
    setIsLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("AuthToken");
    sessionStorage.removeItem("user");

    // Ensure state updates complete before navigation
    setAuthToken(null);
    setUser(null);

    // Use a timeout to let React update the state first
    setTimeout(() => {
      navigate("/login");
    }, 0);
  };

  return (
    <AuthContext.Provider value={{ user, authToken, isLoading, login, logout , setUserPhoto , userPhoto}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
