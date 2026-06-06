import Sidebar from "../components/Sidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for header blur effect
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const handleScroll = () => {
      setIsScrolled(main.scrollTop > 20);
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Redirect jika belum login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
      {/* Sidebar - Fixed/Sticky */}
      <div className="sticky top-0 h-screen flex-shrink-0 shadow-lg">
        <Sidebar />
      </div>

      {/* Main Content - Scrollable */}
      <main
        className={`flex-1 overflow-auto w-full transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        {/* Floating header effect */}
        <div
          className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 pointer-events-none ${
            isScrolled
              ? 'glass shadow-soft backdrop-blur-lg'
              : 'bg-transparent'
          }`}
          style={{
            marginLeft: '280px',
            height: '80px',
          }}
        />

        {/* Content wrapper with padding for floating header */}
        <div className="pt-8 md:pt-12 pb-8 px-4 md:px-8">
          {/* Decorative background elements */}
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
          </div>

          {/* Page content */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
