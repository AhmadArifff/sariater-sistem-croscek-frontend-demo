import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  CheckSquare,
  Menu,
  X,
  Users,
  ChevronDown,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import sariAter from "../assets/sari-ater.png";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const isDesktop = window.innerWidth >= 768;

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // state expand parent menu
  const [expanded, setExpanded] = useState({
    karyawan: true,
    dw: true,
  });

  const sidebarRef = useRef(null);
  const containerRef = useRef(null);

  /* ================= MOBILE GESTURE (UNCHANGED) ================= */
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const touchStart = (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
    };

    const touchMove = (e) => {
      if (!dragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;

      if (mobileOpen) {
        el.style.transform = `translateX(${Math.min(0, diff)}px)`;
      }
    };

    const touchEnd = () => {
      if (!dragging) return;
      dragging = false;

      if (currentX - startX < -80) setMobileOpen(false);
      el.style.transform = "";
    };

    el.addEventListener("touchstart", touchStart);
    el.addEventListener("touchmove", touchMove);
    el.addEventListener("touchend", touchEnd);

    return () => {
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (isDesktop || !containerRef.current) return;

    const el = containerRef.current;
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const touchStart = (e) => {
      startX = e.touches[0].clientX;
      if (startX > 50) return;
      dragging = true;
    };

    const touchMove = (e) => {
      if (!dragging) return;
      currentX = e.touches[0].clientX;

      if (!mobileOpen && currentX - startX > 0) {
        sidebarRef.current.style.transform = `translateX(${Math.max(
          -256,
          -256 + (currentX - startX)
        )}px)`;
      }
    };

    const touchEnd = () => {
      if (!dragging) return;
      dragging = false;

      if (currentX - startX > 80) setMobileOpen(true);
      sidebarRef.current.style.transform = "";
    };

    el.addEventListener("touchstart", touchStart);
    el.addEventListener("touchmove", touchMove);
    el.addEventListener("touchend", touchEnd);

    return () => {
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
    };
  }, [mobileOpen, isDesktop]);

  const handleMouseEnter = () => isDesktop && setOpen(true);
  const handleMouseLeave = () => isDesktop && setOpen(false);

  /* ================= MENU TREE - Role Based ================= */
  // Staff hanya bisa lihat: Croscek Karyawan & Croscek DW & Dashboard
  // Admin bisa lihat semua
  const getMenuTree = () => {
    const baseMenu = [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: BarChart3,
        requiredRole: null, // Semua bisa lihat
        path: "/dashboard",
      },
      {
        key: "manajemen-user",
        label: "Manajemen User",
        icon: Users,
        requiredRole: "admin", // Hanya admin
        path: "/manajemen-user",
      },
      {
        key: "upload-jadwal",
        label: "Informasi Jadwal",
        icon: FileSpreadsheet,
        requiredRole: "admin", // Hanya admin
        path: "/informasi-jadwal",
      },
      {
        key: "karyawan",
        label: "Croscek Karyawan",
        icon: Users,
        requiredRole: null, // Semua bisa lihat
        children: [
          {
            label: "Croscek Jadwal Karyawan",
            icon: CheckSquare,
            path: "/croscek-karyawan",
          },
          {
            label: "Data Karyawan",
            icon: Users,
            path: "/karyawan",
            requiredRole: "admin", // Hanya admin
          },
        ],
      },
      {
        key: "dw",
        label: "Croscek Daily Worker (DW)",
        icon: Users,
        requiredRole: null, // Semua bisa lihat
        children: [
          {
            label: "Croscek Jadwal DW",
            icon: CheckSquare,
            path: "/croscek-dw",
          },
          {
            label: "Data Daily Worker (DW)",
            icon: Users,
            path: "/dw",
            requiredRole: "admin", // Hanya admin
          },
        ],
      },
    ];

    // Filter menu berdasarkan role
    return baseMenu.filter(menu => {
      if (menu.requiredRole && !hasRole(menu.requiredRole)) {
        return false;
      }
      // Filter children juga
      if (menu.children) {
        menu.children = menu.children.filter(child => {
          if (child.requiredRole && !hasRole(child.requiredRole)) {
            return false;
          }
          return true;
        });
      }
      return true;
    });
  };

  const menuTree = getMenuTree();

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0f6160] text-white p-2 rounded-full"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`z-50 h-screen 
        bg-gradient-to-b from-[#0f6160] via-[#0d4f48] to-[#0a3a34]
        text-white flex flex-col transition-all duration-300 overflow-y-auto
        ${open ? "md:w-64" : "md:w-20"}
        ${mobileOpen ? "fixed left-0 w-64 top-0" : "fixed -left-64 md:static md:translate-x-0"}
        md:flex-shrink-0`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(15, 97, 96, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(13, 79, 72, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0f6160 0%, #0a3a34 100%)
          `,
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-5 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center py-8">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
            <img
              src={sariAter}
              className={`${open ? "w-28 h-28" : "w-10 h-10"} transition-all`}
              alt="logo"
            />
          </div>
          {open && (
            <h1 className="text-xl font-bold mt-4 text-center bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Sari Ater Hot Spring
            </h1>
          )}
        </div>

        <nav className="px-3 space-y-3 relative z-10 flex-1 overflow-y-auto">
          {menuTree.map((group) => {
            const Icon = group.icon;
            
            // Jika item adalah direct link (tidak punya children)
            if (!group.children || group.children.length === 0) {
              const active = pathname === group.path;
              return (
                <Link
                  key={group.key}
                  to={group.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all
                    ${
                      active
                        ? "bg-gradient-to-r from-white to-blue-100 text-[#0f6160] border-white shadow-lg"
                        : "hover:bg-white/20 border-white/10 hover:border-white/30"
                    }`}
                >
                  <Icon size={20} />
                  {open && <span className="font-medium">{group.label}</span>}
                </Link>
              );
            }
            
            // Jika item memiliki children (collapsible)
            return (
              <div key={group.key}>
                {/* PARENT */}
                <button
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [group.key]: !prev[group.key],
                    }))
                  }
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {open && <span className="font-medium">{group.label}</span>}
                  </div>
                  {open && (
                    <ChevronDown
                      size={18}
                      className={`transition ${
                        expanded[group.key] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* CHILD */}
                {expanded[group.key] &&
                  group.children &&
                  group.children.map((item) => {
                    const ActiveIcon = item.icon;
                    const active = pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`ml-6 mt-1 flex items-center gap-3 px-4 py-2 rounded-xl text-sm
                        backdrop-blur-sm border transition-all
                        ${
                          active
                            ? "bg-gradient-to-r from-white to-blue-100 text-[#0f6160] border-white shadow-lg"
                            : "hover:bg-white/20 border-white/10 hover:border-white/30"
                        }`}
                      >
                        <ActiveIcon size={16} />
                        {open && item.label}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="relative z-10 mt-auto border-t border-white/20 pt-4">
          {user && (
            <div className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 mb-3">
              <p className="text-xs text-white/70">User</p>
              <p className={`font-semibold truncate ${open ? "text-sm" : "text-xs"}`}>
                {user.nama}
              </p>
              <p className={`text-xs text-white/60 capitalize ${open ? "text-xs" : "text-[10px]"}`}>
                Role: {user.role}
              </p>
            </div>
          )}
          
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-200 hover:text-red-100 transition-all"
          >
            <LogOut size={18} />
            {open && "Logout"}
          </button>
        </div>
      </aside>
    </div>
  );
}
