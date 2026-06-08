import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

// Create Auth Context
const AuthContext = createContext(null);
const ADMIN_TOUR_LOGIN_TRIGGER_KEY = "croscek.admin.tour.login-trigger";
const TOUR_ENABLED_ROLES = ["admin", "staff", "guest"];

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token dari localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Set token di axios default header
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/auth/login", { username, password });

      const { token: newToken, user: userData } = response.data;

      // Store di localStorage
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      if (TOUR_ENABLED_ROLES.includes(userData?.role?.toLowerCase())) {
        try {
          sessionStorage.setItem(ADMIN_TOUR_LOGIN_TRIGGER_KEY, "open");
        } catch {
          // Abaikan jika sessionStorage tidak tersedia.
        }
      }

      // Update state
      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login gagal";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    const currentRole = user.role?.toLowerCase?.() || "";
    if (typeof role === "string") {
      return currentRole === role.toLowerCase();
    }
    // Array of roles
    return Array.isArray(role) && role.map((item) => item.toLowerCase()).includes(currentRole);
  };

  // Check if authenticated
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan dalam AuthProvider");
  }
  return context;
};

export default AuthContext;
