import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckSquare,
  Clock,
  Filter,
  LineChart,
  ListChecks,
  Play,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "croscek.admin.tour.v2";
const LOGIN_TRIGGER_KEY = "croscek.admin.tour.login-trigger";
const OPEN_EVENT = "croscek:open-admin-tour";
const OPEN_USER_CREATE_MODAL_EVENT = "croscek:tour-open-user-create-modal";
const CLOSE_USER_MODAL_EVENT = "croscek:tour-close-user-modal";

const DASHBOARD_STEPS = [
  {
    target: "dashboard-header",
    title: "Dashboard Analytics",
    icon: BarChart3,
    body: "Ini halaman ringkasan utama. Recruiter atau admin bisa melihat kondisi kehadiran, tren, kualitas data, dan daftar keterlambatan dari satu tempat.",
  },
  {
    target: "dashboard-filter-card",
    title: "Filter Data",
    icon: Filter,
    body: "Area ini menentukan scope data yang akan dianalisis. Semua KPI, kualitas data, dan daftar terlambat mengikuti filter periode yang dipilih.",
  },
  {
    target: "dashboard-filter-type",
    title: "Tipe Filter",
    icon: Filter,
    body: "Pilih Hari Ini untuk monitoring cepat, Range Tanggal untuk audit periode tertentu, atau Bulan untuk laporan bulanan seperti Juni 2026.",
  },
  {
    target: "dashboard-period",
    title: "Periode Aktif",
    icon: CalendarDays,
    body: "Label ini mengonfirmasi periode yang sedang aktif. Gunakan ini untuk memastikan report dan angka dashboard sedang membaca tanggal yang benar.",
  },
  {
    target: "dashboard-data-quality",
    title: "Kualitas Data",
    icon: ShieldCheck,
    body: "Bagian ini menjelaskan apakah data sudah lengkap, sebagian memakai prediksi, atau masih banyak data hilang. Ini penting sebelum mengambil kesimpulan analytics.",
  },
  {
    target: "dashboard-scan-kpis",
    title: "KPI Scan Aktual",
    icon: Users,
    body: "Baris KPI ini berisi total karyawan, jumlah check-in aktual, check-out aktual, dan total record. Dipakai untuk membaca volume data mentah yang masuk.",
  },
  {
    target: "dashboard-work-kpis",
    title: "KPI Hasil Kerja",
    icon: CheckSquare,
    body: "Baris ini merangkum hasil croscek: hadir, terlambat, dan tidak hadir. Angka ini sudah berasal dari logic croscek, bukan hanya hitungan scan mentah.",
  },
  {
    target: "dashboard-late-kpi",
    title: "Metrik Terlambat",
    icon: Clock,
    body: "Kartu ini fokus pada keterlambatan. Logic-nya mengikuti status croscek dan kompensasi pulang lebih lama sesuai aturan yang sudah diterapkan.",
  },
  {
    target: "dashboard-latecomers",
    title: "Daftar Karyawan Terlambat",
    icon: ListChecks,
    body: "Bagian ini menampilkan karyawan dengan frekuensi keterlambatan tertinggi dalam periode aktif. Cocok untuk demo investigasi cepat.",
  },
  {
    target: "dashboard-daily-trend",
    title: "Tren Harian per Departemen",
    icon: LineChart,
    body: "Chart ini membantu melihat pola croscek harian lintas departemen. Gunakan untuk membandingkan departemen yang datanya paling aktif atau bermasalah.",
  },
  {
    target: "dashboard-delay-trend",
    title: "Tren Keterlambatan",
    icon: LineChart,
    body: "Chart ini fokus pada tren keterlambatan harian per departemen. Ini membantu membaca apakah keterlambatan hanya sporadis atau berulang.",
  },
  {
    target: "dashboard-last-updated",
    title: "Waktu Refresh Tampilan",
    icon: Clock,
    body: "Bagian ini menunjukkan kapan dashboard terakhir dirender di browser. Jika data baru diimport, refresh atau ubah filter untuk memastikan tampilan terbaru.",
  },
];

const MANAGEMENT_USER_STEPS = [
  {
    target: "users-page",
    title: "Halaman Manajemen User",
    icon: Users,
    action: "closeUserModal",
    body: "Halaman Manajemen User adalah pusat kontrol akun aplikasi. Anggap seperti ruang admin yang menyimpan beberapa bagian kecil: tombol tambah user, tabel data, status aktif, role, dan aksi akun. Setiap bagian punya tugas sendiri, lalu semuanya bekerja bersama untuk mengatur siapa yang boleh masuk dan apa yang boleh dilakukan.",
  },
  {
    target: "users-header",
    title: "Konteks Halaman",
    icon: Users,
    action: "closeUserModal",
    body: "Header ini memberi konteks sebelum admin mulai bekerja. Teks judul dan deskripsi membantu user demo memahami bahwa menu ini dipakai untuk mengelola username, nama lengkap, role akses, dan status aktivitas akun.",
  },
  {
    target: "users-add-button",
    title: "Tambah Pengguna",
    icon: UserPlus,
    action: "closeUserModal",
    body: "Tombol Tambah Pengguna adalah pintu masuk untuk membuat akun baru. Saat diklik, aplikasi membuka form modal sehingga admin bisa mengisi identitas user, menentukan role Admin, Staff, atau Guest, lalu menyimpan akun tanpa meninggalkan halaman ini.",
  },
  {
    target: "users-modal-shell",
    title: "Modal Buat Pengguna",
    icon: UserPlus,
    action: "openUserModal",
    body: "Modal ini adalah form khusus untuk membuat akun. Konsepnya seperti formulir kecil yang muncul di atas halaman utama, supaya admin bisa fokus mengisi data user tanpa kehilangan konteks halaman Manajemen User.",
  },
  {
    target: "users-modal-title",
    title: "Judul Modal",
    icon: UserPlus,
    action: "openUserModal",
    body: "Judul modal memberi tahu mode kerja yang sedang aktif. Saat membuat user baru akan tertulis Buat Pengguna Baru, sedangkan saat edit akan berubah menjadi Edit Pengguna.",
  },
  {
    target: "users-modal-username",
    title: "Input Username",
    icon: Users,
    action: "openUserModal",
    body: "Field Username dipakai sebagai identitas login. Untuk user baru, admin wajib mengisi minimal 3 karakter. Saat mode edit, username dikunci agar identitas login utama tidak berubah sembarangan.",
  },
  {
    target: "users-modal-name",
    title: "Input Nama Lengkap",
    icon: Users,
    action: "openUserModal",
    body: "Field Nama Lengkap menyimpan nama tampilan user di aplikasi. Data ini dipakai supaya akun mudah dikenali oleh admin, recruiter, atau pemilik sistem ketika melihat daftar pengguna.",
  },
  {
    target: "users-modal-role",
    title: "Pilihan Role",
    icon: ShieldCheck,
    action: "openUserModal",
    body: "Dropdown Role menentukan hak akses user. Staff dipakai untuk akses operasional terbatas, Guest untuk baca dan export saja, sedangkan Admin punya akses penuh ke pengaturan dan data sistem.",
  },
  {
    target: "users-modal-password",
    title: "Input Password",
    icon: ShieldCheck,
    action: "openUserModal",
    body: "Field Password dipakai sebagai kunci login akun. Untuk user baru wajib diisi minimal 8 karakter. Saat edit, password boleh dikosongkan kalau admin tidak ingin mengganti password lama.",
  },
  {
    target: "users-modal-confirm-password",
    title: "Konfirmasi Password",
    icon: ShieldCheck,
    action: "openUserModal",
    body: "Field Konfirmasi Password memastikan password yang diketik sudah benar. Nilainya harus sama dengan field Password, sehingga risiko salah ketik saat membuat akun bisa dikurangi.",
  },
  {
    target: "users-modal-cancel",
    title: "Tombol Batal",
    icon: X,
    action: "openUserModal",
    body: "Tombol Batal menutup modal tanpa menyimpan data. Ini penting untuk demo karena admin bisa keluar dari form kapan saja tanpa membuat perubahan ke database.",
  },
  {
    target: "users-modal-submit",
    title: "Tombol Buat Pengguna",
    icon: UserPlus,
    action: "openUserModal",
    body: "Tombol Buat Pengguna menjalankan validasi form lalu menyimpan akun baru jika semua field valid. Tutorial ini hanya menjelaskan tombolnya dan tidak menekan tombol simpan, jadi data tidak berubah.",
  },
  {
    target: "users-table-card",
    title: "Tabel Pengguna",
    icon: ListChecks,
    action: "closeUserModal",
    body: "Tabel ini adalah daftar kerja utama. Di sini admin bisa membaca semua akun, mencari user tertentu, sorting kolom, membuka edit lewat baris, serta memakai action seperti Edit, Aktifkan atau Nonaktifkan, dan Hapus. Jadi tabel ini bukan hanya tampilan data, tapi juga kontrol operasional akun.",
  },
  {
    target: "users-table-search",
    title: "Search User",
    icon: Filter,
    action: "closeUserModal",
    body: "Input search di tabel membantu admin menemukan akun dengan cepat berdasarkan data yang terlihat di kolom, seperti username, nama lengkap, role, status, atau tanggal dibuat.",
  },
  {
    target: "users-table-columns",
    title: "Header dan Sorting Kolom",
    icon: ListChecks,
    action: "closeUserModal",
    body: "Header kolom menjelaskan struktur data user. Kolom yang sortable bisa diklik untuk mengurutkan data, sehingga admin dapat membaca daftar pengguna dengan urutan yang paling nyaman.",
  },
  {
    target: "users-table-actions",
    title: "Action per User",
    icon: CheckSquare,
    action: "closeUserModal",
    body: "Area Actions berisi kontrol per akun. Edit membuka modal edit, Aktifkan atau Nonaktifkan mengubah status login, dan Hapus akan meminta konfirmasi sebelum data user dihapus.",
  },
  {
    target: "users-role-info",
    title: "Panduan Role",
    icon: ShieldCheck,
    action: "closeUserModal",
    body: "Panduan role menjelaskan batas akses setiap tipe akun. Admin punya akses penuh, Staff fokus ke proses operasional croscek, sedangkan Guest bisa membuka semua menu untuk membaca dan export saja. Ini membantu recruiter memahami desain permission aplikasi dengan cepat.",
  },
];

const TOUR_FLOWS = {
  dashboard: {
    id: "dashboard",
    title: "Dashboard Analytics",
    label: "Dashboard Tutorial",
    subtitle: "Pelajari filter, KPI, kualitas data, daftar terlambat, dan chart satu per satu.",
    icon: BarChart3,
    route: "/dashboard",
    steps: DASHBOARD_STEPS,
    enabled: true,
  },
  users: {
    id: "users",
    title: "Manajemen User",
    label: "Manajemen User Tutorial",
    subtitle: "Pelajari tambah user, tabel, pencarian, action akun, dan panduan role.",
    icon: Users,
    route: "/manajemen-user",
    steps: MANAGEMENT_USER_STEPS,
    enabled: true,
  },
};

const FLOW_OPTIONS = [
  TOUR_FLOWS.dashboard,
  TOUR_FLOWS.users,
  {
    id: "jadwal",
    title: "Informasi Jadwal",
    subtitle: "Flow master shift dan upload jadwal akan ditambahkan pada tahap berikutnya.",
    icon: CalendarDays,
    steps: [],
    enabled: false,
  },
  {
    id: "croscek",
    title: "Croscek Karyawan",
    subtitle: "Flow upload, generate dummy, indikator, dan export akan dibuat berikutnya.",
    icon: CheckSquare,
    steps: [],
    enabled: false,
  },
];

const getPlacement = (rect) => {
  if (!rect) {
    return {
      top: Math.max(24, window.innerHeight / 2 - 180),
      left: Math.max(16, window.innerWidth / 2 - 180),
    };
  }

  const tooltipWidth = Math.min(380, window.innerWidth - 32);
  const tooltipHeight = Math.min(360, window.innerHeight - 32);
  const spacing = 16;
  const rightFits = rect.right + tooltipWidth + spacing < window.innerWidth;
  const leftFits = rect.left - tooltipWidth - spacing > 0;
  const top = Math.min(
    Math.max(16, rect.top),
    Math.max(16, window.innerHeight - tooltipHeight - 16)
  );

  if (rightFits) return { top, left: rect.right + spacing };
  if (leftFits) return { top, left: rect.left - tooltipWidth - spacing };

  const belowFits = rect.bottom + tooltipHeight + spacing < window.innerHeight;
  const verticalTop = belowFits
    ? rect.bottom + spacing
    : Math.max(16, rect.top - tooltipHeight - spacing);
  return {
    top: verticalTop,
    left: Math.min(Math.max(16, rect.left), window.innerWidth - tooltipWidth - 16),
  };
};

export default function AdminOnboardingTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("closed");
  const [activeFlowId, setActiveFlowId] = useState("dashboard");
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const activeFlow = TOUR_FLOWS[activeFlowId] || TOUR_FLOWS.dashboard;
  const activeSteps = activeFlow.steps;
  const step = activeSteps[stepIndex];
  const StepIcon = step?.icon || BarChart3;
  const progress = Math.round(((stepIndex + 1) / activeSteps.length) * 100);
  const tooltipPosition = getPlacement(targetRect);

  const hasStoredDecision = useMemo(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "done";
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    try {
      if (sessionStorage.getItem(LOGIN_TRIGGER_KEY) === "open") {
        sessionStorage.removeItem(LOGIN_TRIGGER_KEY);
        setMode("launcher");
        return;
      }
    } catch {
      // Abaikan jika sessionStorage tidak tersedia.
    }

    if (hasStoredDecision) return;
    setMode("launcher");
  }, [hasStoredDecision, isAdmin]);

  useEffect(() => {
    const openTour = () => {
      setStepIndex(0);
      setMode("launcher");
    };

    window.addEventListener(OPEN_EVENT, openTour);
    return () => window.removeEventListener(OPEN_EVENT, openTour);
  }, []);

  useEffect(() => {
    if (mode !== "walkthrough" || !step) return;

    let frame = 0;
    if (step.action === "openUserModal") {
      window.dispatchEvent(new Event(OPEN_USER_CREATE_MODAL_EVENT));
    }
    if (step.action === "closeUserModal") {
      window.dispatchEvent(new Event(CLOSE_USER_MODAL_EVENT));
    }

    const updateRect = () => {
      const target = document.querySelector(`[data-tour="${step.target}"]`);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
    };

    const scrollToTarget = () => {
      const target = document.querySelector(`[data-tour="${step.target}"]`);
      if (!target) {
        setTargetRect(null);
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      frame = window.setTimeout(updateRect, 280);
    };

    frame = window.setTimeout(scrollToTarget, 80);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.clearTimeout(frame);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [location.pathname, mode, step]);

  if (!isAdmin || mode === "closed") return null;

  const closeTour = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }
    window.dispatchEvent(new Event(CLOSE_USER_MODAL_EVENT));
    setMode("closed");
  };

  const startFlow = (flowId) => {
    const selectedFlow = TOUR_FLOWS[flowId] || TOUR_FLOWS.dashboard;
    window.dispatchEvent(new Event(CLOSE_USER_MODAL_EVENT));
    setActiveFlowId(selectedFlow.id);
    setStepIndex(0);
    setTargetRect(null);
    setMode("walkthrough");
    if (location.pathname !== selectedFlow.route) {
      navigate(selectedFlow.route);
    }
  };

  const startDashboardFlow = () => startFlow("dashboard");

  const nextStep = () => {
    if (stepIndex >= activeSteps.length - 1) {
      window.dispatchEvent(new Event(CLOSE_USER_MODAL_EVENT));
      setStepIndex(0);
      setTargetRect(null);
      setMode("launcher");
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const previousStep = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const renderLauncher = () => (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 to-blue-50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Tutorial Interaktif Admin
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Pilih flow tutorial</h2>
            <p className="text-sm text-slate-600 mt-2">
              Pilih halaman yang ingin dipandu. Setelah satu flow selesai, modal ini akan muncul lagi supaya admin bisa lanjut ke tutorial halaman lain.
            </p>
          </div>
          <button
            type="button"
            onClick={closeTour}
            className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900"
            aria-label="Tutup tutorial"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {FLOW_OPTIONS.map((flow) => {
            const Icon = flow.icon;
            return (
              <button
                key={flow.id}
                type="button"
                onClick={flow.enabled ? () => startFlow(flow.id) : undefined}
                disabled={!flow.enabled}
                className={`text-left rounded-xl border p-4 transition-all ${
                  flow.enabled
                    ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:shadow-md"
                    : "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  flow.enabled ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900">{flow.title}</h3>
                <p className="text-xs leading-5 text-slate-600 mt-2">{flow.subtitle}</p>
                <div className="mt-4 text-xs font-semibold text-slate-500">
                  {flow.enabled ? `${flow.steps.length} langkah` : "Segera dibuat"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex justify-between gap-3">
          <button
            type="button"
            onClick={closeTour}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
          >
            Lewati Tutorial
          </button>
          <button
            type="button"
            onClick={startDashboardFlow}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Play size={16} /> Mulai Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const renderWalkthrough = () => {
    const padding = 10;
    const rect = targetRect && {
      top: Math.max(8, targetRect.top - padding),
      left: Math.max(8, targetRect.left - padding),
      width: Math.min(window.innerWidth - 16, targetRect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, targetRect.height + padding * 2),
    };

    return (
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {rect ? (
          <>
            <div className="fixed left-0 top-0 right-0 bg-slate-950/65 backdrop-blur-[1px]" style={{ height: rect.top }} />
            <div className="fixed left-0 bg-slate-950/65 backdrop-blur-[1px]" style={{ top: rect.top, width: rect.left, height: rect.height }} />
            <div className="fixed bg-slate-950/65 backdrop-blur-[1px]" style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }} />
            <div className="fixed left-0 right-0 bottom-0 bg-slate-950/65 backdrop-blur-[1px]" style={{ top: rect.top + rect.height }} />
            <div
              className="fixed rounded-2xl border-4 border-blue-500 shadow-[0_0_0_6px_rgba(37,99,235,0.20),0_0_30px_rgba(37,99,235,0.45)] bg-transparent"
              style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            />
          </>
        ) : (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" />
        )}

        <div
          className="fixed w-[min(380px,calc(100vw-32px))] bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto overflow-hidden"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3 bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                <StepIcon size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                  {activeFlow.label}
                </p>
                <h2 className="text-base font-bold text-slate-900">{step.title}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={closeTour}
              className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900"
              aria-label="Tutup tutorial"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Elemen {stepIndex + 1} dari {activeSteps.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm leading-6 text-slate-700">{step.body}</p>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 flex flex-col gap-2 bg-white">
            <div className="flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new Event(CLOSE_USER_MODAL_EVENT));
                  setMode("launcher");
                }}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Pilih Flow
              </button>
              <button
                type="button"
                onClick={closeTour}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Skip
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={previousStep}
                disabled={stepIndex === 0}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold inline-flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold inline-flex items-center gap-2"
              >
                {stepIndex >= activeSteps.length - 1 ? "Selesai Flow" : "Next"}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return mode === "launcher" ? renderLauncher() : renderWalkthrough();
}

export const openAdminOnboardingTour = () => {
  window.dispatchEvent(new Event(OPEN_EVENT));
};
