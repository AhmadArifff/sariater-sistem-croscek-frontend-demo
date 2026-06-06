import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { LoadingSkeleton } from "../components/ui/decorative";
import logoSariAter from "../assets/Image/logo.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkAdminExists = async () => {
      try {
        const response = await api.get("/auth/check-admin");
        if (isMounted) setHasAdmin(response.data.hasAdmin);
      } catch (err) {
        console.error("Error checking admin:", err);
        if (isMounted) setHasAdmin(true);
      }
    };

    checkAdminExists();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Username dan password harus diisi");
      return;
    }

    try {
      await login(formData.username, formData.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Header with gradient */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg">
            <img 
              src={logoSariAter} 
              alt="Logo Sari Ater" 
              className="w-14 h-14 object-contain rounded-full"
            />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">CROSCEK</h1>
          <p className="text-gray-600 text-lg font-medium">Sistem Absensi & Cek Kehadiran</p>
          <p className="text-gray-500 text-sm mt-1">PT Sari Ater</p>
        </div>

        {/* Admin banner */}
        {hasAdmin === false && (
          <div className="mb-6 animate-slide-in-down glass rounded-xl p-4 border border-amber-200/50 shadow-soft">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">Belum Ada Admin!</p>
                <p className="text-sm text-amber-800 mb-3">Sistem belum memiliki akun admin. Buat akun admin terlebih dahulu.</p>
                <button
                  onClick={() => navigate("/register-admin")}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
                >
                  Buat Admin Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login card with glass effect */}
        <div className="glass rounded-2xl p-8 shadow-soft border border-white/20 backdrop-blur-xl animate-slide-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message with animation */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-lg p-4 flex gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Username field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === 'username' ? 'scale-105' : ''
                }`}
              >
                <User className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === 'password' ? 'scale-105' : ''
                }`}
              >
                <Lock className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer hover:text-gray-700 transition-colors">
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 ${
                loading
                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sedang Login...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Login</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs text-gray-400 font-medium">DEMO</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Demo credentials */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Akun Demo (Development Only)</p>
            <div className="space-y-2 text-xs">
              <div>
                <p className="font-semibold text-blue-700 mb-1">👤 Admin Account</p>
                <p className="text-gray-600">Username: <code className="bg-white/50 px-2 py-1 rounded font-mono text-blue-600">stafsariater2026</code></p>
                <p className="text-gray-600">Password: <code className="bg-white/50 px-2 py-1 rounded font-mono text-blue-600">staf12345</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6 font-medium">
          © 2026 PT Sari Ater. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
