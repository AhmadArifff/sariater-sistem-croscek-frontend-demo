import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy load page components for better code splitting
const UploadJadwal = lazy(() => import("./pages/UploadJadwal"));
const Croscek = lazy(() => import("./pages/Croscek"));
const UploadKaryawan = lazy(() => import("./pages/DataKaryawan"));
const Croscek_DW = lazy(() => import("./pages/Croscek-DW"));
const UploadKaryawan_DW = lazy(() => import("./pages/DataKaryawan-DW"));
const ManajemenUser = lazy(() => import("./pages/ManajemenUser"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmployeeDetail = lazy(() => import("./pages/EmployeeDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register-admin" element={<Register />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/informasi-jadwal" element={<UploadJadwal />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/croscek-karyawan" element={<Croscek />} />
              <Route path="/croscek-dw" element={<Croscek_DW />} />
              
              {/* Admin Only */}
              <Route
                path="/karyawan"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UploadKaryawan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dw"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UploadKaryawan_DW />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manajemen-user"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ManajemenUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/:id_karyawan"
                element={
                  <ProtectedRoute>
                    <EmployeeDetail />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback - Default to Dashboard after login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
