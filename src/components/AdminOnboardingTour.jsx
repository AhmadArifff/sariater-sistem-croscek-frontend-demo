import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckSquare,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  LineChart,
  ListChecks,
  Play,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
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
const OPEN_SCHEDULE_CREATE_MODAL_EVENT = "croscek:tour-open-schedule-create-modal";
const CLOSE_SCHEDULE_MODAL_EVENT = "croscek:tour-close-schedule-modal";
const SHOW_SCHEDULE_PREVIEW_EVENT = "croscek:tour-show-schedule-preview";
const CLEAR_SCHEDULE_PREVIEW_EVENT = "croscek:tour-clear-schedule-preview";
const OPEN_EMPLOYEE_CREATE_MODAL_EVENT = "croscek:tour-open-employee-create-modal";
const CLOSE_EMPLOYEE_MODAL_EVENT = "croscek:tour-close-employee-modal";
const OPEN_EMPLOYEE_GENERATOR_EVENT = "croscek:tour-open-employee-generator";
const CLOSE_EMPLOYEE_GENERATOR_EVENT = "croscek:tour-close-employee-generator";
const SHOW_EMPLOYEE_PREVIEW_EVENT = "croscek:tour-show-employee-preview";
const CLEAR_EMPLOYEE_PREVIEW_EVENT = "croscek:tour-clear-employee-preview";
const OPEN_CROSCEK_ROSTER_GENERATOR_EVENT = "croscek:tour-open-croscek-roster-generator";
const CLOSE_CROSCEK_ROSTER_GENERATOR_EVENT = "croscek:tour-close-croscek-roster-generator";
const OPEN_CROSCEK_ATTENDANCE_GENERATOR_EVENT = "croscek:tour-open-croscek-attendance-generator";
const CLOSE_CROSCEK_ATTENDANCE_GENERATOR_EVENT = "croscek:tour-close-croscek-attendance-generator";
const SHOW_CROSCEK_JADWAL_PREVIEW_EVENT = "croscek:tour-show-croscek-jadwal-preview";
const CLEAR_CROSCEK_JADWAL_PREVIEW_EVENT = "croscek:tour-clear-croscek-jadwal-preview";
const SHOW_CROSCEK_KEHADIRAN_PREVIEW_EVENT = "croscek:tour-show-croscek-kehadiran-preview";
const CLEAR_CROSCEK_KEHADIRAN_PREVIEW_EVENT = "croscek:tour-clear-croscek-kehadiran-preview";
const OPEN_CROSCEK_RESULT_MODAL_EVENT = "croscek:tour-open-croscek-result-modal";
const CLOSE_CROSCEK_RESULT_MODAL_EVENT = "croscek:tour-close-croscek-result-modal";
const OPEN_CROSCEK_EXPORT_PREVIEW_EVENT = "croscek:tour-open-croscek-export-preview";
const CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT = "croscek:tour-close-croscek-export-preview";
const OPEN_CROSCEK_SERVICE_PREVIEW_EVENT = "croscek:tour-open-croscek-service-preview";
const CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT = "croscek:tour-close-croscek-service-preview";
const OPEN_CROSCEK_UANG_MAKAN_PREVIEW_EVENT = "croscek:tour-open-croscek-uang-makan-preview";
const CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT = "croscek:tour-close-croscek-uang-makan-preview";
const OPEN_CROSCEK_HOD_PREVIEW_EVENT = "croscek:tour-open-croscek-hod-preview";
const CLOSE_CROSCEK_HOD_PREVIEW_EVENT = "croscek:tour-close-croscek-hod-preview";
const OPEN_CROSCEK_DW_PREVIEW_EVENT = "croscek:tour-open-croscek-dw-preview";
const CLOSE_CROSCEK_DW_PREVIEW_EVENT = "croscek:tour-close-croscek-dw-preview";

const DASHBOARD_STEPS = [
  {
    target: "dashboard-filter-card",
    title: "Filter Data",
    icon: Filter,
    body: "Area ini menentukan scope data yang akan dianalisis. Semua KPI, kualitas data, dan daftar terlambat mengikuti filter periode yang dipilih.",
  },
  {
    target: "dashboard-filter-type",
    title: "Pilihan Periode",
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
];

const MANAGEMENT_USER_STEPS = [
  {
    target: "users-add-button",
    title: "Tambah Pengguna",
    icon: UserPlus,
    action: "closeUserModal",
    body: "Tombol Tambah Pengguna adalah pintu masuk untuk membuat akun baru. Saat diklik, aplikasi membuka form modal sehingga admin bisa mengisi identitas user, menentukan role Admin, Staff, atau Guest, lalu menyimpan akun tanpa meninggalkan halaman ini.",
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

const SCHEDULE_STEPS = [
  {
    target: "schedule-upload-dropzone",
    title: "Dropzone Upload Excel",
    icon: UploadCloud,
    action: "closeScheduleHelpers",
    body: "Dropzone ini menerima file Excel dengan klik atau drag and drop. Setelah file dipilih, aplikasi membaca sheet pertama dan menampilkan preview, tetapi belum menyimpan data ke database sampai tombol simpan ditekan.",
  },
  {
    target: "schedule-template-button",
    title: "Download Template",
    icon: Download,
    action: "closeScheduleHelpers",
    body: "Tombol Download Template membuat file Excel contoh dengan header yang benar. Ini membantu user demo melihat format kolom seperti lokasi kerja, nama shift, kode, jam masuk, jam pulang, keterangan, group, status, dan kontrol.",
  },
  {
    target: "schedule-preview-card",
    title: "Preview Data Excel",
    icon: FileSpreadsheet,
    action: "showSchedulePreview",
    body: "Area preview muncul setelah file Excel dipilih. Tutorial menampilkan contoh preview agar user memahami bahwa data bisa diperiksa dulu sebelum benar-benar dikirim ke database.",
  },
  {
    target: "schedule-preview-save",
    title: "Simpan ke Database",
    icon: CheckSquare,
    action: "showSchedulePreview",
    body: "Tombol ini menyimpan file Excel yang sudah dipreview ke database. Saat tutorial, tombol hanya dijelaskan dan tidak ditekan, sehingga tidak ada data yang berubah.",
  },
  {
    target: "schedule-preview-table",
    title: "Isi Preview Excel",
    icon: ListChecks,
    action: "showSchedulePreview",
    body: "Tabel preview memperlihatkan isi Excel yang berhasil dibaca. User bisa memeriksa apakah kode shift, jam, status, dan kolom lain sudah rapi sebelum proses upload final.",
  },
  {
    target: "schedule-search-input",
    title: "Search Jadwal",
    icon: Filter,
    action: "clearSchedulePreview",
    body: "Input pencarian dipakai untuk mencari data berdasarkan kode atau nama shift. Saat diketik, halaman akan reset ke page pertama dan meminta data yang sesuai dari backend.",
  },
  {
    target: "schedule-add-button",
    title: "Tambah Manual",
    icon: UserPlus,
    action: "closeScheduleHelpers",
    body: "Tombol Tambah membuka form manual untuk membuat satu informasi jadwal baru. Ini berguna saat admin ingin menambah shift kecil tanpa membuat file Excel.",
  },
  {
    target: "schedule-modal-field-kode",
    title: "Field Kode",
    icon: CalendarDays,
    action: "openScheduleModal",
    body: "Field kode adalah identitas utama shift. Kode dipakai di proses croscek jadwal, sehingga nilainya harus unik dan mudah dikenali.",
  },
  {
    target: "schedule-modal-field-lokasi_kerja",
    title: "Field Lokasi Kerja",
    icon: CalendarDays,
    action: "openScheduleModal",
    body: "Field lokasi kerja menyimpan area atau tempat shift berlaku. Data ini membantu generator dan laporan membedakan jadwal berdasarkan lokasi operasional.",
  },
  {
    target: "schedule-modal-field-nama_shift",
    title: "Field Nama Shift",
    icon: CalendarDays,
    action: "openScheduleModal",
    body: "Field nama shift berisi nama deskriptif shift. Nama ini membuat kode shift lebih mudah dipahami oleh admin dan user demo.",
  },
  {
    target: "schedule-modal-field-jam_masuk",
    title: "Field Jam Masuk",
    icon: Clock,
    action: "openScheduleModal",
    body: "Field jam masuk memakai input waktu. Nilai ini menjadi batas utama untuk membaca apakah aktual masuk masih sesuai jadwal atau terlambat.",
  },
  {
    target: "schedule-modal-field-jam_pulang",
    title: "Field Jam Pulang",
    icon: Clock,
    action: "openScheduleModal",
    body: "Field jam pulang menyimpan waktu selesai shift. Data ini dipakai dalam croscek pulang cepat, normal, atau kompensasi pulang lebih lama.",
  },
  {
    target: "schedule-modal-field-keterangan",
    title: "Field Keterangan",
    icon: ListChecks,
    action: "openScheduleModal",
    body: "Field keterangan dipakai untuk catatan tambahan shift. Isinya membantu menjelaskan kondisi khusus tanpa mengubah kode atau jam utama.",
  },
  {
    target: "schedule-modal-field-group",
    title: "Field Group",
    icon: Users,
    action: "openScheduleModal",
    body: "Field group menyimpan pengelompokan shift. Ini berguna untuk membedakan shift berdasarkan kelompok kerja atau kategori operasional.",
  },
  {
    target: "schedule-modal-field-status",
    title: "Field Status",
    icon: ShieldCheck,
    action: "openScheduleModal",
    body: "Field status menentukan apakah informasi jadwal aktif atau tidak. Status ini membantu admin mengelola shift yang masih dipakai dan yang hanya menjadi arsip.",
  },
  {
    target: "schedule-modal-field-kontrol",
    title: "Field Kontrol",
    icon: CheckSquare,
    action: "openScheduleModal",
    body: "Field kontrol dipakai sebagai penanda tambahan sesuai kebutuhan sistem. Nilainya ikut tersimpan sebagai bagian dari master informasi jadwal.",
  },
  {
    target: "schedule-modal-cancel",
    title: "Tombol Batal",
    icon: X,
    action: "openScheduleModal",
    body: "Tombol Batal menutup modal tanpa menyimpan data. Ini memberi jalan keluar aman ketika admin hanya ingin melihat form atau membatalkan input.",
  },
  {
    target: "schedule-modal-save",
    title: "Tombol Simpan",
    icon: CheckSquare,
    action: "openScheduleModal",
    body: "Tombol Simpan menjalankan validasi dan mengirim data jadwal baru ke backend. Tutorial hanya menjelaskan tombol ini dan tidak menekannya, jadi database tetap aman.",
  },
  {
    target: "schedule-table-head",
    title: "Kolom Tabel Jadwal",
    icon: ListChecks,
    action: "closeScheduleHelpers",
    body: "Header kolom menjelaskan struktur data jadwal. Kolom No menunjukkan urutan, lalu kolom lain mengikuti format master shift yang dipakai aplikasi.",
  },
  {
    target: "schedule-table-actions",
    title: "Action Edit dan Hapus",
    icon: Trash2,
    action: "closeScheduleHelpers",
    body: "Kolom Action berisi tombol Edit dan Hapus untuk admin. Edit mengubah baris menjadi input inline, sedangkan Hapus meminta konfirmasi sebelum menghapus jadwal.",
  },
  {
    target: "schedule-pagination",
    title: "Pagination",
    icon: ListChecks,
    action: "closeScheduleHelpers",
    body: "Pagination membagi data jadwal menjadi beberapa halaman. Ini menjaga tabel tetap ringan dan mudah dibaca saat jumlah shift bertambah banyak.",
  },
];

const createEmployeeDataSteps = (label) => [
  {
    target: "employee-upload-dropzone",
    title: "Upload Excel",
    icon: UploadCloud,
    action: "closeEmployeeHelpers",
    body: `Dropzone ini dipakai untuk upload file Excel ${label}. User bisa klik atau drag and drop file, lalu sistem membaca file dan menampilkan preview sebelum data disimpan.`,
  },
  {
    target: "employee-template-button",
    title: "Download Template",
    icon: Download,
    action: "closeEmployeeHelpers",
    body: "Tombol ini mengunduh template Excel dengan format kolom yang benar: NAMA, NIK, JABATAN, DEPT, dan ID ABSEN. Ini penting agar upload tidak salah format.",
  },
  {
    target: "employee-generator-button",
    title: "Generate Dummy Data",
    icon: FileSpreadsheet,
    action: "closeEmployeeHelpers",
    body: `Tombol ini membuka generator data dummy ${label}. Fitur ini berguna untuk test manual dan demo tanpa memakai data real.`,
  },
  {
    target: "employee-generator-count",
    title: "Jumlah Data Dummy",
    icon: Filter,
    action: "openEmployeeGenerator",
    body: "Input jumlah data menentukan berapa baris dummy yang dibuat. User bisa memakai jumlah kecil untuk demo cepat atau jumlah besar untuk test upload.",
  },
  {
    target: "employee-generator-generate",
    title: "Generate Preview Dummy",
    icon: CheckSquare,
    action: "openEmployeeGenerator",
    body: "Tombol Generate membuat ulang data dummy sesuai jumlah yang dipilih. Tutorial hanya menjelaskan tombol ini, tidak mengubah database.",
  },
  {
    target: "employee-generator-export",
    title: "Export Dummy ke Excel",
    icon: Download,
    action: "openEmployeeGenerator",
    body: "Tombol Export Excel mengunduh hasil dummy dalam format yang bisa langsung diuji di upload data. Ini membantu user menjalankan test case manual.",
  },
  {
    target: "employee-preview-card",
    title: "Preview Excel",
    icon: FileSpreadsheet,
    action: "showEmployeePreview",
    body: "Preview muncul setelah file Excel dipilih. User bisa memeriksa isi data sebelum menekan tombol simpan ke database.",
  },
  {
    target: "employee-preview-save",
    title: "Simpan Upload",
    icon: CheckSquare,
    action: "showEmployeePreview",
    body: "Tombol Simpan mengirim file Excel yang sudah dipreview ke backend. Dalam tutorial tombol ini hanya dijelaskan dan tidak ditekan, jadi data tetap aman.",
  },
  {
    target: "employee-preview-table",
    title: "Isi Preview",
    icon: ListChecks,
    action: "showEmployeePreview",
    body: "Tabel preview memperlihatkan hasil pembacaan Excel. Informasi penting seperti NIK dan ID ABSEN bisa dicek sebelum proses upload final.",
  },
  {
    target: "employee-search-input",
    title: "Search Data",
    icon: Filter,
    action: "clearEmployeePreview",
    body: `Input search membantu mencari ${label} berdasarkan data yang tampil di tabel. Saat user mengetik, halaman kembali ke page pertama agar hasil pencarian mudah dibaca.`,
  },
  {
    target: "employee-add-button",
    title: "Tambah Manual",
    icon: UserPlus,
    action: "closeEmployeeHelpers",
    body: `Tombol Tambah membuka form manual untuk membuat satu data ${label}. Ini berguna saat admin hanya perlu menambahkan satu orang tanpa upload Excel.`,
  },
  {
    target: "employee-modal-field-nama",
    title: "Field Nama",
    icon: Users,
    action: "openEmployeeModal",
    body: "Field NAMA menyimpan nama lengkap orang yang akan dipakai di tabel dan proses croscek.",
  },
  {
    target: "employee-modal-field-nik",
    title: "Field NIK",
    icon: Users,
    action: "openEmployeeModal",
    body: "Field NIK adalah identitas karyawan di data master. Nilai ini dipakai untuk membedakan data setiap orang.",
  },
  {
    target: "employee-modal-field-jabatan",
    title: "Field Jabatan",
    icon: ListChecks,
    action: "openEmployeeModal",
    body: "Field JABATAN menjelaskan posisi kerja. Informasi ini penting untuk laporan dan pembacaan data oleh recruiter atau admin.",
  },
  {
    target: "employee-modal-field-dept",
    title: "Field Departemen",
    icon: ListChecks,
    action: "openEmployeeModal",
    body: "Field DEPT menyimpan departemen. Data ini membantu filter, rekap, dan analisis lintas bagian.",
  },
  {
    target: "employee-modal-field-id_absen",
    title: "Field ID Absen",
    icon: ShieldCheck,
    action: "openEmployeeModal",
    body: "Field ID ABSEN menjadi penghubung penting ke data jadwal dan scanlog. Proses croscek memakai ID absen atau PIN agar data kehadiran bisa cocok.",
  },
  {
    target: "employee-modal-cancel",
    title: "Tombol Batal",
    icon: X,
    action: "openEmployeeModal",
    body: "Tombol Batal menutup form tanpa menyimpan perubahan. Ini aman untuk keluar dari form saat user hanya ingin melihat alurnya.",
  },
  {
    target: "employee-modal-save",
    title: "Tombol Simpan",
    icon: CheckSquare,
    action: "openEmployeeModal",
    body: "Tombol Simpan menjalankan proses create atau update. Tutorial hanya menjelaskan tombol ini dan tidak menekannya, sehingga database tidak berubah.",
  },
  {
    target: "employee-table-head",
    title: "Kolom Tabel",
    icon: ListChecks,
    action: "closeEmployeeHelpers",
    body: "Header tabel menunjukkan struktur data utama: nama, NIK, jabatan, departemen, dan ID absen. Ini adalah format yang sama dengan file upload.",
  },
  {
    target: "employee-table-actions",
    title: "Action Edit dan Hapus",
    icon: Trash2,
    action: "closeEmployeeHelpers",
    body: "Kolom Action berisi Edit dan Hapus untuk admin. Edit membuka data untuk diperbaiki, sedangkan Hapus meminta konfirmasi sebelum data dihapus.",
  },
  {
    target: "employee-pagination",
    title: "Pagination",
    icon: ListChecks,
    action: "closeEmployeeHelpers",
    body: "Pagination membagi data menjadi beberapa halaman agar tabel tetap ringan saat jumlah data semakin banyak.",
  },
];

const createCroscekSteps = (label) => [
  {
    target: "croscek-jadwal-upload-dropzone",
    title: "Upload Jadwal",
    icon: UploadCloud,
    action: "closeCroscekHelpers",
    body: `Dropzone ini dipakai untuk upload file jadwal ${label}. User bisa klik atau drag and drop Excel, lalu aplikasi membaca jadwal sebelum disimpan.`,
  },
  {
    target: "croscek-jadwal-period-upload",
    title: "Bulan Template Jadwal",
    icon: CalendarDays,
    action: "closeCroscekHelpers",
    body: "Pilihan bulan menentukan periode template jadwal yang akan dibuat atau dipakai untuk generate data dummy.",
  },
  {
    target: "croscek-jadwal-template-button",
    title: "Template Jadwal",
    icon: Download,
    action: "closeCroscekHelpers",
    body: "Tombol ini mengunduh template Excel jadwal. Gunakan template ini supaya struktur kolom upload sesuai dengan parser aplikasi.",
  },
  {
    target: "croscek-roster-generator-button",
    title: "Generate Dummy Jadwal",
    icon: FileSpreadsheet,
    action: "closeCroscekHelpers",
    body: `Tombol ini membuka generator jadwal dummy ${label}. Fitur ini membantu membuat file testing tanpa menulis jadwal manual satu per satu.`,
  },
  {
    target: "roster-generator-period",
    title: "Periode Generator Jadwal",
    icon: CalendarDays,
    action: "openCroscekRosterGenerator",
    body: "Di sini user memilih bulan dan tahun jadwal dummy. Jumlah hari otomatis mengikuti bulan yang dipilih.",
  },
  {
    target: "roster-generator-count",
    title: "Jumlah Orang Jadwal",
    icon: Users,
    action: "openCroscekRosterGenerator",
    body: "Input jumlah orang membatasi berapa data dari database yang dipakai untuk dummy jadwal. Jumlahnya tidak melebihi data master yang tersedia.",
  },
  {
    target: "roster-generator-employee-search",
    title: "Cari Orang",
    icon: Filter,
    action: "openCroscekRosterGenerator",
    body: "Search ini memudahkan memilih karyawan atau DW berdasarkan nama, NIK, ID absen, jabatan, atau departemen.",
  },
  {
    target: "roster-generator-employee-table",
    title: "Pilih Orang",
    icon: ListChecks,
    action: "openCroscekRosterGenerator",
    body: "Tabel ini adalah sumber orang yang akan dibuatkan jadwal. User bisa memilih beberapa orang atau memakai tombol Select All/Pilih Jumlah.",
  },
  {
    target: "roster-generator-shift-card",
    title: "Shift Informasi Jadwal",
    icon: Clock,
    action: "openCroscekRosterGenerator",
    body: "Bagian ini memuat shift dari menu Informasi Jadwal, termasuk kode, jam, nama shift, dan lokasi. Generator memakai daftar ini untuk membagi jadwal random.",
  },
  {
    target: "roster-generator-generate",
    title: "Generate Jadwal",
    icon: CheckSquare,
    action: "openCroscekRosterGenerator",
    body: "Tombol Generate membuat preview jadwal dummy sesuai orang, bulan, dan shift yang dipilih. Tutorial tidak menyimpan data ke database.",
  },
  {
    target: "roster-generator-preview",
    title: "Preview Jadwal Dummy",
    icon: FileSpreadsheet,
    action: "openCroscekRosterGenerator",
    body: "Preview ini memperlihatkan jadwal hasil generator sebelum diexport. Formatnya dibuat agar bisa dipakai kembali di upload jadwal.",
  },
  {
    target: "roster-generator-export",
    title: "Export Jadwal Dummy",
    icon: Download,
    action: "openCroscekRosterGenerator",
    body: "Export Excel mengunduh jadwal dummy dalam format upload. Ini berguna untuk test case manual dari awal sampai croscek.",
  },
  {
    target: "croscek-jadwal-preview-card",
    title: "Preview Upload Jadwal",
    icon: FileSpreadsheet,
    action: "showCroscekJadwalPreview",
    body: "Setelah file jadwal dipilih, preview muncul di sini. User bisa mengecek isi Excel sebelum menyimpannya ke database.",
  },
  {
    target: "croscek-jadwal-preview-save",
    title: "Simpan Jadwal",
    icon: CheckSquare,
    action: "showCroscekJadwalPreview",
    body: "Tombol Simpan Jadwal mengirim hasil upload ke backend. Dalam tutorial tombol ini hanya dijelaskan, sehingga data tidak berubah.",
  },
  {
    target: "croscek-jadwal-table-card",
    title: "Data Jadwal",
    icon: ListChecks,
    action: "clearCroscekPreviews",
    body: "Tabel ini menampilkan jadwal yang sudah ada di database. Data inilah yang akan dibandingkan dengan scan kehadiran saat proses croscek.",
  },
  {
    target: "croscek-jadwal-table-filters",
    title: "Filter Tabel Jadwal",
    icon: Filter,
    action: "clearCroscekPreviews",
    body: "Filter periode, search, dan jumlah baris membantu user membaca jadwal yang sudah tersimpan tanpa membuka semua data sekaligus.",
  },
  {
    target: "croscek-jadwal-action-menu-button",
    title: "Menu Aksi Jadwal",
    icon: ListChecks,
    action: "clearCroscekPreviews",
    body: "Menu ini berisi aksi jadwal seperti tambah manual, tambah jadwal sebulan, hapus periode, dan kosongkan jadwal. Aksi destruktif tetap memakai konfirmasi.",
  },
  {
    target: "croscek-jadwal-table-actions",
    title: "Edit dan Hapus Jadwal",
    icon: Trash2,
    action: "clearCroscekPreviews",
    body: "Kolom Action dipakai untuk memperbaiki satu jadwal atau menghapus baris tertentu. Ini berguna saat ada koreksi setelah upload.",
  },
  {
    target: "croscek-kehadiran-upload-dropzone",
    title: "Upload Kehadiran",
    icon: UploadCloud,
    action: "clearCroscekPreviews",
    body: `Dropzone ini dipakai untuk upload file scanlog kehadiran ${label}. File ini nanti dicocokkan dengan jadwal berdasarkan ID absen atau PIN.`,
  },
  {
    target: "croscek-kehadiran-period-select",
    title: "Periode Kehadiran",
    icon: CalendarDays,
    action: "clearCroscekPreviews",
    body: "Pilihan periode kehadiran membantu user memilih data scanlog yang akan dikelola atau dihapus per periode.",
  },
  {
    target: "croscek-kehadiran-template-button",
    title: "Template Kehadiran",
    icon: Download,
    action: "clearCroscekPreviews",
    body: "Template kehadiran membantu memastikan format scanlog sesuai kolom yang dibaca sistem, termasuk PIN atau ID absen.",
  },
  {
    target: "croscek-attendance-generator-button",
    title: "Generate Dummy Kehadiran",
    icon: FileSpreadsheet,
    action: "clearCroscekPreviews",
    body: "Tombol ini membuka generator scanlog dummy. User bisa membuat skenario telat, pulang cepat, lupa scan, dan pindah shift.",
  },
  {
    target: "attendance-generator-dates",
    title: "Periode Scanlog Dummy",
    icon: CalendarDays,
    action: "openCroscekAttendanceGenerator",
    body: "Tanggal awal dan akhir menentukan rentang scanlog dummy yang akan dibuat.",
  },
  {
    target: "attendance-generator-categories",
    title: "Kategori Skenario",
    icon: Filter,
    action: "openCroscekAttendanceGenerator",
    body: "Input kategori menentukan berapa orang yang dibuat telat, pulang cepat, lupa check-in, lupa check-out, atau pindah shift.",
  },
  {
    target: "attendance-generator-employee-table",
    title: "Pilih Orang Scanlog",
    icon: ListChecks,
    action: "openCroscekAttendanceGenerator",
    body: "Tabel ini memilih orang yang akan dibuatkan scanlog. Data tetap mengikuti jumlah orang yang tersedia di database.",
  },
  {
    target: "attendance-generator-actions",
    title: "Generate dan Export Scanlog",
    icon: CheckSquare,
    action: "openCroscekAttendanceGenerator",
    body: "Generate membuat preview scanlog, sedangkan Export Excel mengunduh file dummy untuk diuji lewat upload kehadiran.",
  },
  {
    target: "attendance-generator-preview",
    title: "Preview Kehadiran Dummy",
    icon: FileSpreadsheet,
    action: "openCroscekAttendanceGenerator",
    body: "Preview ini menampilkan scan pertama hasil generator, sehingga user bisa melihat PIN, tanggal scan, jam, dan status sebelum export.",
  },
  {
    target: "croscek-kehadiran-preview-card",
    title: "Preview Upload Kehadiran",
    icon: FileSpreadsheet,
    action: "showCroscekKehadiranPreview",
    body: "Setelah file kehadiran dipilih, preview muncul di sini supaya user bisa memeriksa data scanlog sebelum menyimpan ke database.",
  },
  {
    target: "croscek-kehadiran-preview-save",
    title: "Simpan Kehadiran",
    icon: CheckSquare,
    action: "showCroscekKehadiranPreview",
    body: "Tombol Simpan Kehadiran mengirim data scanlog ke backend. Tutorial hanya menjelaskan tombol ini dan tidak menekannya.",
  },
  {
    target: "croscek-process-button",
    title: "Proses Croscek",
    icon: Play,
    action: "clearCroscekPreviews",
    body: "Tombol ini menjalankan pencocokan jadwal dan kehadiran. Hasilnya muncul dalam modal, lengkap dengan indikator warna dan status.",
  },
  {
    target: "croscek-result-modal",
    title: "Modal Hasil Croscek",
    icon: BarChart3,
    action: "openCroscekResult",
    body: "Hasil croscek ditampilkan di modal agar fokus user tidak pecah. Dari sini user bisa filter, cek indikator, export, dan simpan hasil.",
  },
  {
    target: "croscek-result-filters",
    title: "Filter Hasil",
    icon: Filter,
    action: "openCroscekResult",
    body: "Search dan filter tanggal membantu menemukan nama atau periode tertentu di hasil croscek.",
  },
  {
    target: "croscek-result-table",
    title: "Indikator Warna",
    icon: ShieldCheck,
    action: "openCroscekResult",
    body: "Indikator warna memisahkan data aman, telat, selisih lebih dari 2 jam, pindah shift/data kurang, dan tidak ada scan masuk-pulang.",
  },
  {
    target: "croscek-result-table",
    title: "Tabel Hasil",
    icon: ListChecks,
    action: "openCroscekResult",
    body: "Tabel ini memperlihatkan jadwal masuk-pulang, aktual masuk-pulang, prediksi shift, status kehadiran, status masuk, dan status pulang.",
  },
  {
    target: "croscek-result-status-controls",
    title: "Keterangan Manual",
    icon: CheckSquare,
    action: "openCroscekResult",
    body: "Jika ada status yang perlu alasan manual, select keterangan muncul di kolom status. Pilihan ini dipakai saat rekap dan simpan croscek.",
  },
  {
    target: "croscek-result-export-excel",
    title: "Export Excel",
    icon: FileSpreadsheet,
    action: "openCroscekResult",
    body: "Tombol ini mengunduh hasil croscek sesuai filter yang sedang aktif. Gunakan setelah search, tanggal, indikator, dan keterangan manual sudah dicek.",
  },
  {
    target: "croscek-export-preview-modal",
    title: "Preview File Export",
    icon: FileSpreadsheet,
    action: "openCroscekExportPreview",
    previewType: "hasil",
    body: "Sebelum download, user perlu memahami isi file export: nama, tanggal, shift, jadwal, actual, status kehadiran, status masuk, dan status pulang.",
  },
  ...(label === "daily worker" ? [
    {
      target: "croscek-result-rekap-dw",
      title: "Rekap Daily Worker",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol ini membuka preview rekap khusus Daily Worker. Rekap ini membaca hasil croscek DW dan mengelompokkan data untuk kebutuhan laporan DW.",
    },
    {
      target: "croscek-dw-preview-modal",
      title: "Preview Rekap DW",
      icon: ListChecks,
      action: "openCroscekDwPreview",
      body: "Modal preview ini memperlihatkan format rekap DW sebelum file diunduh. User bisa cek departemen, tanggal, periode mingguan, dan total HK.",
    },
    {
      target: "croscek-dw-preview-download",
      title: "Download Rekap DW",
      icon: Download,
      action: "openCroscekDwPreview",
      body: "Tombol Download Excel pada preview DW baru digunakan setelah isi preview sudah benar. Tutorial tidak menekan tombol download ini.",
    },
  ] : [
    {
      target: "croscek-result-rekap-harian",
      title: "Rekap Harian",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Rekap Harian membuat file per hari per sheet. Cocok untuk audit detail harian dari hasil croscek.",
    },
    {
      target: "croscek-export-preview-modal",
      title: "Preview Rekap Harian",
      icon: FileSpreadsheet,
      action: "openCroscekExportPreview",
      previewType: "rekapHarian",
      body: "Preview ini menjelaskan struktur file rekap harian sebelum download: setiap hari dipisahkan agar pemeriksaan per tanggal lebih mudah.",
    },
    {
      target: "croscek-result-rekap-periode",
      title: "Rekap Periode",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Rekap Periode menggabungkan data hasil croscek dalam rentang tanggal aktif. Gunakan untuk laporan bulanan atau periode tertentu.",
    },
    {
      target: "croscek-export-preview-modal",
      title: "Preview Rekap Periode",
      icon: FileSpreadsheet,
      action: "openCroscekExportPreview",
      previewType: "rekapPeriode",
      body: "Preview ini membantu user memahami isi file rekap periode: ringkasan status hadir, tidak hadir, telat, pulang awal, dan kategori keterangan.",
    },
    {
      target: "croscek-result-rekap-ytd",
      title: "Rekap YTD",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Rekap YTD membuat rekap dari awal tahun sampai periode aktif. Ini berguna untuk laporan tahunan atau monitoring akumulatif.",
    },
    {
      target: "croscek-export-preview-modal",
      title: "Preview Rekap YTD",
      icon: FileSpreadsheet,
      action: "openCroscekExportPreview",
      previewType: "rekapYtd",
      body: "Preview ini menjelaskan bahwa export YTD membawa ringkasan lintas bulan, sehingga user perlu memastikan periode dan data sudah lengkap.",
    },
    {
      target: "croscek-result-export-shift",
      title: "Export Shift",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Export Shift memisahkan data berdasarkan shift tertentu. Fitur ini membantu audit shift operasional seperti E1-E3 dan 1-1A.",
    },
    {
      target: "croscek-export-preview-modal",
      title: "Preview Export Shift",
      icon: FileSpreadsheet,
      action: "openCroscekExportPreview",
      previewType: "shift",
      body: "Preview ini menjelaskan isi file export shift sebelum download, supaya user tahu data akan dibagi berdasarkan kelompok shift.",
    },
    {
      target: "croscek-result-rekap-service",
      title: "Rekap Service",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Rekap Service membuka preview rekap layanan per departemen. Data ini menghitung hari kerja dan status yang mempengaruhi service.",
    },
    {
      target: "croscek-service-preview-modal",
      title: "Preview Rekap Service",
      icon: ListChecks,
      action: "openCroscekServicePreview",
      body: "Modal ini menampilkan preview rekap service sebelum download. User bisa cek tab departemen, total hari, HK, sakit, izin, alpa, cuti, dan nilai service.",
    },
    {
      target: "croscek-service-preview-download",
      title: "Download Rekap Service",
      icon: Download,
      action: "openCroscekServicePreview",
      body: "Tombol Download Excel pada preview service digunakan setelah isi preview sesuai. Tutorial tidak menekan tombol download ini.",
    },
    {
      target: "croscek-result-rekap-hod",
      title: "Rekap Harian HOD",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Rekap Harian HOD membuka preview laporan harian untuk Head of Department. User memilih tanggal dan karyawan sebelum download.",
    },
    {
      target: "croscek-hod-preview-modal",
      title: "Preview Rekap HOD",
      icon: ListChecks,
      action: "openCroscekHodPreview",
      body: "Modal HOD berisi filter tanggal, pilihan karyawan, tabel preview harian, dan tombol download. Ini dipakai untuk laporan detail per karyawan.",
    },
    {
      target: "croscek-hod-date-start",
      title: "Tanggal Mulai HOD",
      icon: CalendarDays,
      action: "openCroscekHodPreview",
      body: "Parameter tanggal mulai menentukan hari pertama yang akan masuk ke file Rekap Harian HOD.",
    },
    {
      target: "croscek-hod-date-end",
      title: "Tanggal Selesai HOD",
      icon: CalendarDays,
      action: "openCroscekHodPreview",
      body: "Parameter tanggal selesai menentukan batas akhir periode. File Excel HOD akan membuat kolom tanggal dari tanggal mulai sampai tanggal selesai.",
    },
    {
      target: "croscek-hod-employee-select",
      title: "Pilihan Karyawan HOD",
      icon: Users,
      action: "openCroscekHodPreview",
      body: "Dropdown ini dipakai untuk memilih karyawan yang akan masuk ke laporan HOD. User bisa memilih satu atau beberapa karyawan sesuai kebutuhan laporan.",
    },
    {
      target: "croscek-hod-employee-search",
      title: "Search Karyawan HOD",
      icon: Search,
      action: "openCroscekHodPreview",
      body: "Input search di dropdown membantu menemukan karyawan berdasarkan nama. Ini penting saat data karyawan sangat banyak.",
    },
    {
      target: "croscek-hod-selected-summary",
      title: "Ringkasan Pilihan HOD",
      icon: CheckSquare,
      action: "openCroscekHodPreview",
      body: "Badge ringkasan menampilkan jumlah record dan jumlah karyawan yang sudah dipilih. Ini menjadi pemeriksaan cepat sebelum export.",
    },
    {
      target: "croscek-hod-clear",
      title: "Hapus Pilihan HOD",
      icon: Trash2,
      action: "openCroscekHodPreview",
      body: "Tombol Hapus Semua membersihkan pilihan dan preview HOD. Gunakan jika user ingin mengulang pemilihan karyawan.",
    },
    {
      target: "croscek-hod-table",
      title: "Tabel Preview HOD",
      icon: ListChecks,
      action: "openCroscekHodPreview",
      body: "Tabel preview HOD memperlihatkan data yang akan dibentuk ke Excel: nama, jabatan, departemen, shift, status, check-in, dan check-out per tanggal.",
    },
    {
      target: "croscek-hod-download",
      title: "Download HOD",
      icon: Download,
      action: "openCroscekHodPreview",
      body: "Tombol Download Excel pada modal HOD mengunduh laporan setelah data preview sudah dipilih dan dicek.",
    },
    {
      target: "croscek-result-rekap-uang-makan",
      title: "Rekap Uang Makan",
      icon: FileSpreadsheet,
      action: "openCroscekResult",
      body: "Tombol Rekap Uang Makan membuka preview kalkulasi uang makan dari hasil kehadiran dan keterangan yang sudah dipilih.",
    },
    {
      target: "croscek-uang-makan-preview-modal",
      title: "Preview Uang Makan",
      icon: ListChecks,
      action: "openCroscekUangMakanPreview",
      body: "Modal ini memperlihatkan komponen H, OFF, S, I, A, EO, CUTI, TGS, dan TOTAL sebelum file uang makan didownload.",
    },
    {
      target: "croscek-uang-makan-download",
      title: "Download Uang Makan",
      icon: Download,
      action: "openCroscekUangMakanPreview",
      body: "Tombol Download Excel pada preview uang makan digunakan setelah user memastikan total dan kategori sudah benar.",
    },
  ]),
  {
    target: "croscek-result-save",
    title: "Simpan Croscek",
    icon: CheckSquare,
    action: "openCroscekResult",
    body: "Tombol Simpan Croscek menyimpan hasil croscek dan keterangan manual ke backend. Gunakan setelah export atau review selesai.",
  },
  ...(label === "daily worker" ? [] : [
    {
      target: "croscek-result-truncate",
      title: "Kosongkan Croscek",
      icon: Trash2,
      action: "openCroscekResult",
      body: "Tombol Kosongkan Croscek menghapus hasil croscek tersimpan. Karena aksinya besar, gunakan hanya saat admin benar-benar ingin reset data.",
    },
  ]),
  {
    target: "croscek-result-pagination",
    title: "Pagination Hasil",
    icon: ListChecks,
    action: "openCroscekResult",
    body: "Pagination membantu membaca hasil croscek yang besar tanpa membebani layar. User bisa berpindah halaman setelah filter diterapkan.",
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
  schedule: {
    id: "schedule",
    title: "Informasi Jadwal",
    label: "Informasi Jadwal Tutorial",
    subtitle: "Pelajari upload Excel, template, preview, tabel, form tambah, edit, hapus, dan pagination.",
    icon: CalendarDays,
    route: "/informasi-jadwal",
    steps: SCHEDULE_STEPS,
    enabled: true,
  },
  employees: {
    id: "employees",
    title: "Data Karyawan",
    label: "Data Karyawan Tutorial",
    subtitle: "Pelajari upload, template, generator dummy, preview, tambah manual, tabel, action, dan pagination.",
    icon: Users,
    route: "/karyawan",
    steps: createEmployeeDataSteps("karyawan"),
    enabled: true,
  },
  dw: {
    id: "dw",
    title: "Data Daily Worker (DW)",
    label: "Data Daily Worker Tutorial",
    subtitle: "Pelajari upload, template, generator dummy, preview, tambah manual, tabel, action, dan pagination.",
    icon: Users,
    route: "/dw",
    steps: createEmployeeDataSteps("daily worker"),
    enabled: true,
  },
  croscekEmployees: {
    id: "croscekEmployees",
    title: "Croscek Jadwal Karyawan",
    label: "Croscek Karyawan Tutorial",
    subtitle: "Pelajari upload/generate jadwal, upload/generate kehadiran, proses croscek, indikator, export, dan simpan hasil.",
    icon: CheckSquare,
    route: "/croscek-karyawan",
    steps: createCroscekSteps("karyawan"),
    enabled: true,
  },
  croscekDw: {
    id: "croscekDw",
    title: "Croscek Jadwal DW",
    label: "Croscek DW Tutorial",
    subtitle: "Pelajari upload/generate jadwal DW, upload/generate kehadiran DW, proses croscek, rekap DW, export, dan simpan hasil.",
    icon: CheckSquare,
    route: "/croscek-dw",
    steps: createCroscekSteps("daily worker"),
    enabled: true,
  },
};

const FLOW_OPTIONS = [
  TOUR_FLOWS.dashboard,
  TOUR_FLOWS.users,
  TOUR_FLOWS.schedule,
  TOUR_FLOWS.employees,
  TOUR_FLOWS.dw,
  TOUR_FLOWS.croscekEmployees,
  TOUR_FLOWS.croscekDw,
];

const getPlacement = (rect) => {
  if (!rect) {
    return {
      top: Math.max(24, window.innerHeight / 2 - 180),
      left: Math.max(16, window.innerWidth / 2 - 180),
    };
  }

  const tooltipWidth = Math.min(380, window.innerWidth - 32);
  const tooltipHeight = Math.min(520, window.innerHeight - 32);
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
  const closeCroscekHelpers = () => {
    window.dispatchEvent(new Event(CLOSE_CROSCEK_ROSTER_GENERATOR_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_ATTENDANCE_GENERATOR_EVENT));
    window.dispatchEvent(new Event(CLEAR_CROSCEK_JADWAL_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLEAR_CROSCEK_KEHADIRAN_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_RESULT_MODAL_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_HOD_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_CROSCEK_DW_PREVIEW_EVENT));
  };

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
    if (step.action === "openScheduleModal") {
      window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_SCHEDULE_CREATE_MODAL_EVENT));
    }
    if (step.action === "closeScheduleHelpers") {
      window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
    }
    if (step.action === "showSchedulePreview") {
      window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
      window.dispatchEvent(new Event(SHOW_SCHEDULE_PREVIEW_EVENT));
    }
    if (step.action === "clearSchedulePreview") {
      window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
    }
    if (step.action === "openEmployeeModal") {
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_EMPLOYEE_CREATE_MODAL_EVENT));
    }
    if (step.action === "openEmployeeGenerator") {
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_EMPLOYEE_GENERATOR_EVENT));
    }
    if (step.action === "showEmployeePreview") {
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(SHOW_EMPLOYEE_PREVIEW_EVENT));
    }
    if (step.action === "clearEmployeePreview") {
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
    }
    if (step.action === "closeEmployeeHelpers") {
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
    }
    if (step.action === "openCroscekRosterGenerator") {
      window.dispatchEvent(new Event(CLEAR_CROSCEK_JADWAL_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLEAR_CROSCEK_KEHADIRAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ATTENDANCE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_ROSTER_GENERATOR_EVENT));
    }
    if (step.action === "openCroscekAttendanceGenerator") {
      window.dispatchEvent(new Event(CLEAR_CROSCEK_JADWAL_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLEAR_CROSCEK_KEHADIRAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ROSTER_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_ATTENDANCE_GENERATOR_EVENT));
    }
    if (step.action === "showCroscekJadwalPreview") {
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ROSTER_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ATTENDANCE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_CROSCEK_KEHADIRAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(SHOW_CROSCEK_JADWAL_PREVIEW_EVENT));
    }
    if (step.action === "showCroscekKehadiranPreview") {
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ROSTER_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ATTENDANCE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_CROSCEK_JADWAL_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(SHOW_CROSCEK_KEHADIRAN_PREVIEW_EVENT));
    }
    if (step.action === "openCroscekResult") {
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ROSTER_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_ATTENDANCE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_CROSCEK_JADWAL_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLEAR_CROSCEK_KEHADIRAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_HOD_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_DW_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_RESULT_MODAL_EVENT));
    }
    if (step.action === "openCroscekExportPreview") {
      window.dispatchEvent(new Event(OPEN_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_HOD_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_DW_PREVIEW_EVENT));
      window.dispatchEvent(new CustomEvent(OPEN_CROSCEK_EXPORT_PREVIEW_EVENT, {
        detail: { type: step.previewType || "hasil" }
      }));
    }
    if (step.action === "openCroscekServicePreview") {
      window.dispatchEvent(new Event(OPEN_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_HOD_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_DW_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_SERVICE_PREVIEW_EVENT));
    }
    if (step.action === "openCroscekUangMakanPreview") {
      window.dispatchEvent(new Event(OPEN_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_HOD_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_DW_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
    }
    if (step.action === "openCroscekHodPreview") {
      window.dispatchEvent(new Event(OPEN_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_DW_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_HOD_PREVIEW_EVENT));
    }
    if (step.action === "openCroscekDwPreview") {
      window.dispatchEvent(new Event(OPEN_CROSCEK_RESULT_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_EXPORT_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_SERVICE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_UANG_MAKAN_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_CROSCEK_HOD_PREVIEW_EVENT));
      window.dispatchEvent(new Event(OPEN_CROSCEK_DW_PREVIEW_EVENT));
    }
    if (step.action === "clearCroscekPreviews" || step.action === "closeCroscekHelpers") {
      closeCroscekHelpers();
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
    window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
    window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
    window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
    window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
    closeCroscekHelpers();
    setMode("closed");
  };

  const startFlow = (flowId) => {
    const selectedFlow = TOUR_FLOWS[flowId] || TOUR_FLOWS.dashboard;
    window.dispatchEvent(new Event(CLOSE_USER_MODAL_EVENT));
    window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
    window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
    window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
    window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
    window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
    closeCroscekHelpers();
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
      window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
      window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
      window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
      closeCroscekHelpers();
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
          className="fixed w-[min(380px,calc(100vw-32px))] max-h-[calc(100vh-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto overflow-y-auto"
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
                  window.dispatchEvent(new Event(CLOSE_SCHEDULE_MODAL_EVENT));
                  window.dispatchEvent(new Event(CLEAR_SCHEDULE_PREVIEW_EVENT));
                  window.dispatchEvent(new Event(CLOSE_EMPLOYEE_MODAL_EVENT));
                  window.dispatchEvent(new Event(CLOSE_EMPLOYEE_GENERATOR_EVENT));
                  window.dispatchEvent(new Event(CLEAR_EMPLOYEE_PREVIEW_EVENT));
                  closeCroscekHelpers();
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
