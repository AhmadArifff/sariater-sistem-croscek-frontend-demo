import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckSquare,
  FileSpreadsheet,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "croscek.admin.tour.v1";
const OPEN_EVENT = "croscek:open-admin-tour";

const TOUR_STEPS = [
  {
    title: "Mulai dari Dashboard",
    icon: BarChart3,
    path: "/dashboard",
    body: "Dashboard adalah pusat ringkasan: pilih filter hari, range, atau bulan, lalu cek KPI karyawan, check-in, check-out, hadir, terlambat, tidak hadir, kualitas data, dan tren analytics.",
    checklist: [
      "Gunakan filter periode sebelum membaca angka.",
      "Cek kualitas data untuk tahu apakah data siap dianalisis.",
      "Lihat daftar karyawan terlambat untuk investigasi cepat.",
    ],
  },
  {
    title: "Siapkan Informasi Jadwal",
    icon: FileSpreadsheet,
    path: "/informasi-jadwal",
    body: "Menu Informasi Jadwal berisi master shift. Admin dapat upload Excel atau mengelola kode shift, lokasi, nama shift, jam masuk, dan jam pulang.",
    checklist: [
      "Pastikan kode shift sudah lengkap sebelum upload roster.",
      "Jam masuk dan pulang dipakai sebagai dasar croscek.",
      "Lokasi shift membantu validasi dan generator dummy jadwal.",
    ],
  },
  {
    title: "Kelola Data Karyawan",
    icon: Users,
    path: "/karyawan",
    body: "Menu Data Karyawan menyimpan master karyawan tetap. Data pentingnya adalah nama, NIK, ID absen, jabatan, dan departemen.",
    checklist: [
      "Upload atau generate dummy data sesuai format Excel.",
      "Pastikan ID absen terisi karena jadwal dan scanlog dicocokkan lewat ID absen/PIN.",
      "Gunakan search untuk cek data sebelum proses croscek.",
    ],
  },
  {
    title: "Kelola Data Daily Worker",
    icon: Users,
    path: "/dw",
    body: "Menu Data Daily Worker memiliki alur yang sama dengan data karyawan, tetapi khusus pekerja DW agar proses croscek dan report tidak bercampur.",
    checklist: [
      "Upload atau generate dummy DW sesuai kebutuhan test case.",
      "Pastikan ID absen DW tidak kosong.",
      "Pisahkan validasi DW dari karyawan tetap.",
    ],
  },
  {
    title: "Croscek Jadwal Karyawan",
    icon: CheckSquare,
    path: "/croscek-karyawan",
    body: "Di menu ini admin menyiapkan roster, mengupload atau generate scanlog, menjalankan croscek, membaca indikator warna, lalu export rekap.",
    checklist: [
      "Generate atau upload jadwal sesuai bulan yang ingin diuji.",
      "Upload atau generate data kehadiran berdasarkan jadwal.",
      "Jalankan croscek, cek indikator merah/kuning/orange/ungu/hijau, lalu export report.",
    ],
  },
  {
    title: "Croscek Jadwal DW",
    icon: CheckSquare,
    path: "/croscek-dw",
    body: "Alur DW sama seperti karyawan tetap, tetapi sumber master data dan jadwalnya memakai kategori Daily Worker.",
    checklist: [
      "Pilih data DW yang akan dibuatkan jadwal.",
      "Generate atau upload scanlog DW.",
      "Export hasil croscek DW setelah indikator sudah sesuai.",
    ],
  },
  {
    title: "Manajemen User dan Role",
    icon: Users,
    path: "/manajemen-user",
    body: "Admin dapat mengelola akun demo atau user internal dengan role admin, staff, dan guest. Guest bersifat read-only dan export-only.",
    checklist: [
      "Admin memiliki akses penuh.",
      "Staff fokus pada menu operasional.",
      "Guest bisa melihat semua menu, tetapi tidak bisa mengubah data.",
    ],
  },
  {
    title: "Export dan Review Akhir",
    icon: FileSpreadsheet,
    path: "/dashboard",
    body: "Setelah croscek selesai, gunakan export Excel dan dashboard analytics untuk menunjukkan hasil demo kepada reviewer atau recruiter.",
    checklist: [
      "Export hasil croscek, rekap harian, periode, YTD, HOD, service, atau uang makan sesuai kebutuhan.",
      "Gunakan dashboard untuk membuktikan data sudah terbaca di analytics.",
      "Jika perlu test manual, ulangi generator dummy dengan jumlah data berbeda.",
    ],
  },
];

export default function AdminOnboardingTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isAdmin = user?.role === "admin";
  const step = TOUR_STEPS[stepIndex];
  const Icon = step.icon;
  const progress = Math.round(((stepIndex + 1) / TOUR_STEPS.length) * 100);

  const hasStoredDecision = useMemo(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "done";
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || hasStoredDecision) return;
    setIsOpen(true);
  }, [hasStoredDecision, isAdmin]);

  useEffect(() => {
    const openTour = () => {
      setStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener(OPEN_EVENT, openTour);
    return () => window.removeEventListener(OPEN_EVENT, openTour);
  }, []);

  if (!isAdmin || !isOpen) return null;

  const closeTour = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      // Abaikan jika localStorage tidak tersedia.
    }
    setIsOpen(false);
  };

  const nextStep = () => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      closeTour();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const previousStep = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const openStepPage = () => {
    navigate(step.path);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Tutorial Admin
              </p>
              <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
            </div>
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

        <div className="p-6">
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Step {stepIndex + 1} dari {TOUR_STEPS.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-sm md:text-base leading-7 text-slate-700 mb-5">
            {step.body}
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800 mb-3">Yang perlu dicek:</p>
            <ul className="space-y-2">
              {step.checklist.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-700">
                  <CheckSquare size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
          <button
            type="button"
            onClick={closeTour}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
          >
            Lewati Tutorial
          </button>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={openStepPage}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold"
            >
              Buka Halaman Ini
            </button>
            <button
              type="button"
              onClick={previousStep}
              disabled={stepIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Sebelumnya
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold inline-flex items-center gap-2"
            >
              {stepIndex >= TOUR_STEPS.length - 1 ? "Selesai" : "Lanjut"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const openAdminOnboardingTour = () => {
  window.dispatchEvent(new Event(OPEN_EVENT));
};
