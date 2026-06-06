import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Lock, User, AlertCircle, CheckCircle, Shield, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [hasAdmin, setHasAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nama: "",
  });

  useEffect(() => {
    let isMounted = true;

    const checkAdminExists = async () => {
      try {
        const response = await api.get("/auth/check-admin");
        if (isMounted) {
          setHasAdmin(response.data.hasAdmin);
          setLoading(false);

          if (response.data.hasAdmin) {
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          }
        }
      } catch (err) {
        console.error("Error checking admin:", err);
        if (isMounted) {
          setError("Error memeriksa status admin");
          setLoading(false);
        }
      }
    };

    checkAdminExists();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username tidak boleh kosong");
      return false;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(formData.username)) {
      setError("Username harus 3-20 karakter, hanya a-z, 0-9, _, -");
      return false;
    }

    if (!formData.password.trim()) {
      setError("Password tidak boleh kosong");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return false;
    }

    if (!formData.nama.trim()) {
      setError("Nama tidak boleh kosong");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setRegistering(true);
    setError("");

    try {
      const response = await api.post("/auth/register-admin", formData);

      setSuccess(response.data.message);
      setFormData({ username: "", password: "", nama: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Gagal membuat admin user"
      );
    } finally {
      setRegistering(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Memeriksa status admin...</p>
        </div>
      </div>
    );
  }

  // Admin sudah ada
  if (hasAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-8 shadow-soft border border-white/20 backdrop-blur-xl animate-slide-in-up space-y-6">
            {/* Success icon */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg animate-bounce-slow">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Sudah Ada!</h1>
              <p className="text-gray-600">Sistem sudah memiliki admin user.</p>
            </div>

            {/* Message */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
              <p className="text-gray-700 text-sm">
                Silakan login dengan akun admin atau hubungi admin untuk membuat user baru.
              </p>
            </div>

            {/* Redirect message */}
            <p className="text-center text-sm text-gray-500 font-medium">
              Mengalihkan ke halaman login dalam 3 detik...
            </p>

            {/* Button */}
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Ke Halaman Login</span>
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6 font-medium">
            © 2026 PT Sari Ater. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    );
  }

  // Register form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">SETUP ADMIN</h1>
          <p className="text-gray-600 text-lg font-medium">Buat akun admin pertama kali</p>
          <p className="text-gray-500 text-sm mt-1">PT Sari Ater - Croscek Absen</p>
        </div>

        {/* Register card */}
        <div className="glass rounded-2xl p-8 shadow-soft border border-white/20 backdrop-blur-xl animate-slide-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 rounded-lg p-4 flex gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg p-4 flex gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-700">{success}</p>
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
                  placeholder="Contoh: admin"
                  disabled={registering}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">3-20 karakter, hanya a-z, 0-9, _, -</p>
            </div>

            {/* Full name field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focusedField === 'nama' ? 'scale-105' : ''
                }`}
              >
                <User className="absolute left-3 top-3 w-5 h-5 text-blue-400 pointer-events-none" />
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('nama')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Contoh: Administrator"
                  disabled={registering}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50"
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Min 8 karakter"
                  disabled={registering}
                  className="w-full pl-10 pr-12 py-3 bg-white/50 border border-gray-200 rounded-lg focus:border-blue-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-gray-400 focus:shadow-lg focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">✅ Minimal 8 karakter, kombinasi huruf, angka, simbol direkomendasikan</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={registering}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 ${
                registering
                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {registering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Membuat Admin...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Buat Admin User</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs text-gray-400 font-medium">PENTING</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Important info */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
            <p className="text-sm font-semibold text-amber-900 mb-3">⚠️ Perhatian:</p>
            <ul className="space-y-2 text-xs text-amber-800">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Form ini hanya bisa diakses SEKALI (saat belum ada admin)</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Setelah admin dibuat, form tidak akan muncul lagi</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>User baru ditambah via admin panel setelah login</span>
              </li>
            </ul>
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
