import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Component untuk melindungi route yang memerlukan authentication
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#4b5563" }}>Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect ke login jika belum authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role jika diperlukan
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
        <div style={{ background: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", textAlign: "center", maxWidth: "448px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", marginBottom: "16px" }}>
            Akses Ditolak
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "24px" }}>
            Anda tidak memiliki akses ke halaman ini. Silakan hubungi administrator.
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            User Role: <strong>{user?.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
