import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import {
  AlertCircle,
  CheckCircle,
  KeyRound,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import logoSariAter from "../assets/Image/logo.jpg";

const DEMO_ACCOUNTS = [
  {
    username: "guest123",
    password: "guest123",
    nama: "Guest",
    role: "Guest",
    status: "Active",
    dibuat: "06/06/2026",
    note: "Read-only dan export-only untuk semua menu.",
  },
  {
    username: "staff123",
    password: "staff123",
    nama: "Staff",
    role: "Staff",
    status: "Active",
    dibuat: "06/06/2026",
    note: "Akses operasional untuk croscek dan monitoring.",
  },
  {
    username: "admin123",
    password: "admin123",
    nama: "Administrator",
    role: "Admin",
    status: "Active",
    dibuat: "06/06/2026",
    note: "Akses penuh untuk master data, jadwal, user, dan croscek.",
  },
];

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

  const useDemoAccount = (account) => {
    setFormData({
      username: account.username,
      password: account.password,
    });
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
        <div>
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

          {hasAdmin === false && (
            <div className="mb-6 animate-slide-in-down glass rounded-xl p-4 border border-amber-200/50 shadow-soft">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-1">Belum Ada Admin!</p>
                  <p className="text-sm text-amber-800 mb-3">
                    Sistem belum memiliki akun admin. Buat akun admin terlebih dahulu.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/register-admin")}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
                  >
                    Buat Admin Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-8 shadow-soft border border-white/20 backdrop-blur-xl animate-slide-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-lg p-4 flex gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div
                  className={`relative transition-all duration-300 ${
                    focusedField === "username" ? "scale-105" : ""
                  }`}
                >
                  <User className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div
                  className={`relative transition-all duration-300 ${
                    focusedField === "password" ? "scale-105" : ""
                  }`}
                >
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 ${
                  loading
                    ? "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
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

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <span className="text-xs text-gray-400 font-medium">DEMO</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Demo recruiter</p>
              <p className="text-xs text-gray-600 mt-1">
                Password sama dengan username. Pilih salah satu akun demo di panel kanan atau bawah.
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6 font-medium">
            2026 PT Sari Ater. Hak cipta dilindungi.
          </p>
        </div>

        <div className="glass rounded-2xl p-5 md:p-6 shadow-soft border border-white/20 backdrop-blur-xl animate-slide-in-up">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Akun Demo Recruiter</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Pilih role untuk mencoba aplikasi</h2>
              <p className="text-sm text-gray-600 mt-2">
                Tiga akun ini dibuat untuk demo. Klik Gunakan untuk mengisi form login otomatis.
              </p>
            </div>
            <div className="hidden md:flex w-12 h-12 rounded-xl bg-blue-600 text-white items-center justify-center shadow-lg">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white/70">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-50 text-gray-700">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Username</th>
                  <th className="px-3 py-3 text-left font-semibold">Password</th>
                  <th className="px-3 py-3 text-left font-semibold">Nama Lengkap</th>
                  <th className="px-3 py-3 text-left font-semibold">Role</th>
                  <th className="px-3 py-3 text-left font-semibold">Status</th>
                  <th className="px-3 py-3 text-left font-semibold">Dibuat</th>
                  <th className="px-3 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_ACCOUNTS.map((account) => (
                  <tr key={account.username} className="border-t border-blue-100 hover:bg-blue-50/60 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <code className="font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded">{account.username}</code>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <code className="font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded">{account.password}</code>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-800">{account.nama}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {account.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {account.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{account.dibuat}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => useDemoAccount(account)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow"
                      >
                        <KeyRound size={14} /> Gunakan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={`${account.username}-card`}
                type="button"
                onClick={() => useDemoAccount(account)}
                className="text-left rounded-xl border border-blue-100 bg-white/70 hover:bg-blue-50 hover:border-blue-200 p-4 transition-all"
              >
                <p className="text-xs font-semibold text-blue-700 uppercase">{account.role}</p>
                <p className="font-bold text-gray-900 mt-1">{account.nama}</p>
                <p className="text-xs text-gray-600 mt-2">{account.note}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
