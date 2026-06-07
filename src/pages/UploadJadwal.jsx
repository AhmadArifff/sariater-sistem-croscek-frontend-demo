// InformasiJadwal.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Trash2, Plus, Download } from "lucide-react";
import * as XLSX from "xlsx";
import sariAter from "../assets/sari-ater.png";
import { useAuth } from "../context/AuthContext";
import { excelDropzoneClassName, getExcelDropzoneHandlers } from "../utils/excelDropzone";

const COLS = [
  "kode", "lokasi_kerja", "nama_shift",
  "jam_masuk", "jam_pulang", "keterangan",
  "group", "status", "kontrol"
];

const TIME_COLS = new Set(["jam_masuk", "jam_pulang"]);

// Normalisasi time untuk dikirim ke backend
function normalizeTimeForBackend(t) {
  if (!t) return null;
  const s = String(t).trim();
  if (!s) return null;
  if (/^\d{1,2}:\d{2}$/.test(s)) return s.padStart(5, "0") + ":00";
  if (/^\d{1,2}:\d{2}:\d{2}/.test(s)) {
    const p = s.split(":");
    return `${p[0].padStart(2,"0")}:${p[1].padStart(2,"0")}:${p[2].slice(0,2).padStart(2,"0")}`;
  }
  return s;
}

// Format time "HH:MM:SS" → "HH:MM" untuk input[type=time]
function toTimeInput(t) {
  if (!t) return "";
  return String(t).slice(0, 5); // ambil "HH:MM"
}

const EMPTY_FORM = {
  kode: "", lokasi_kerja: "", nama_shift: "",
  jam_masuk: "", jam_pulang: "", keterangan: "",
  group: "", status: "non-active", kontrol: ""
};

const TOUR_OPEN_SCHEDULE_CREATE_MODAL_EVENT = "croscek:tour-open-schedule-create-modal";
const TOUR_CLOSE_SCHEDULE_MODAL_EVENT = "croscek:tour-close-schedule-modal";
const TOUR_SHOW_SCHEDULE_PREVIEW_EVENT = "croscek:tour-show-schedule-preview";
const TOUR_CLEAR_SCHEDULE_PREVIEW_EVENT = "croscek:tour-clear-schedule-preview";
const TOUR_PREVIEW_HTML = `
  <table class='min-w-full border border-gray-300 text-sm bg-white'>
    <thead>
      <tr>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>No.</th>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>Lokasi Kerja</th>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>Nama</th>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>Kode</th>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>Jam Masuk</th>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>Jam Pulang</th>
        <th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class='border border-gray-300 px-2 py-2'>1</td>
        <td class='border border-gray-300 px-2 py-2'>Front Office</td>
        <td class='border border-gray-300 px-2 py-2'>Morning Shift</td>
        <td class='border border-gray-300 px-2 py-2'>M1</td>
        <td class='border border-gray-300 px-2 py-2'>07:00</td>
        <td class='border border-gray-300 px-2 py-2'>15:00</td>
        <td class='border border-gray-300 px-2 py-2'>active</td>
      </tr>
    </tbody>
  </table>
`;

export default function InformasiJadwal() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // State utama
  const [data, setData]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  
  const { token, user } = useAuth();
  const isGuest = user?.role === "guest";

  // Debug logging
  useEffect(() => {
    console.log("[UploadJadwal] Component mounted");
    console.log("[UploadJadwal] API_URL:", API_URL);
    console.log("[UploadJadwal] Auth token present:", !!token);
  }, [API_URL, token]);

  // Upload Excel
  const [previewTable, setPreviewTable] = useState("");
  const [currentFile, setCurrentFile]   = useState(null);
  const [isDraggingExcel, setIsDraggingExcel] = useState(false);
  const tourPreviewRef = useRef(false);

  // Inline edit
  const [editingKode, setEditingKode] = useState(null);
  const [editForm, setEditForm]       = useState({});

  // Modal tambah
  const [showModal, setShowModal] = useState(false);
  const [newForm, setNewForm]     = useState(EMPTY_FORM);

  const rowsPerPage = 10;
  const totalPages  = Math.ceil(total / rowsPerPage);

  // =============================================
  // FETCH DATA (server-side search + pagination)
  // =============================================
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const url = `${API_URL}/informasi-jadwal/list?search=${encodeURIComponent(search)}&page=${currentPage}`;
      console.log(`[fetchData] Request URL: ${url}`);
      console.log(`[fetchData] Headers: Accept: application/json`);
      
      const headers = { "Accept": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: "GET",
        headers,
      });
      
      console.log(`[fetchData] Response status: ${res.status}`);
      
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[fetchData] Fetch gagal: ${res.status} ${res.statusText}`);
        console.error(`[fetchData] Response body: ${errText}`);
        setError(`Error ${res.status}: ${res.statusText}`);
        setData([]);
        setTotal(0);
        return;
      }
      
      const json = await res.json();
      console.log(`[fetchData] Success! Data length: ${json.data?.length || 0}, Total: ${json.total || 0}`);
      console.log(`[fetchData] Response data:`, json);

      // Handle object response shape {data, total}
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      console.error(`[fetchData] Network error:`, e);
      setError(`Network error: ${e.message}`);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, search, currentPage]);

  useEffect(() => { 
    console.log(`[useEffect] fetchData triggered: page=${currentPage}, search="${search}"`);
    fetchData(); 
  }, [currentPage, search, fetchData]);

  useEffect(() => {
    const openCreateModalForTour = () => {
      setShowModal(true);
      setNewForm(EMPTY_FORM);
    };

    const closeModalForTour = () => {
      setShowModal(false);
      setNewForm(EMPTY_FORM);
    };

    const showPreviewForTour = () => {
      tourPreviewRef.current = true;
      setCurrentFile(null);
      setPreviewTable(TOUR_PREVIEW_HTML);
    };

    const clearPreviewForTour = () => {
      if (!tourPreviewRef.current) return;
      tourPreviewRef.current = false;
      setPreviewTable("");
      setCurrentFile(null);
    };

    window.addEventListener(TOUR_OPEN_SCHEDULE_CREATE_MODAL_EVENT, openCreateModalForTour);
    window.addEventListener(TOUR_CLOSE_SCHEDULE_MODAL_EVENT, closeModalForTour);
    window.addEventListener(TOUR_SHOW_SCHEDULE_PREVIEW_EVENT, showPreviewForTour);
    window.addEventListener(TOUR_CLEAR_SCHEDULE_PREVIEW_EVENT, clearPreviewForTour);

    return () => {
      window.removeEventListener(TOUR_OPEN_SCHEDULE_CREATE_MODAL_EVENT, openCreateModalForTour);
      window.removeEventListener(TOUR_CLOSE_SCHEDULE_MODAL_EVENT, closeModalForTour);
      window.removeEventListener(TOUR_SHOW_SCHEDULE_PREVIEW_EVENT, showPreviewForTour);
      window.removeEventListener(TOUR_CLEAR_SCHEDULE_PREVIEW_EVENT, clearPreviewForTour);
    };
  }, []);

  // =============================================
  // UPLOAD EXCEL — preview saja (belum simpan)
  // =============================================
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCurrentFile(file);

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const sheet = wb.Sheets[wb.SheetNames[0]];

    let html = XLSX.utils.sheet_to_html(sheet);
    html = html
      .replace(/<table/g, `<table class='min-w-full border border-gray-300 text-sm bg-white'`)
      .replace(/<td/g,    `<td class='border border-gray-300 px-2 py-2'`)
      .replace(/<th/g,    `<th class='border border-gray-300 bg-gray-100 px-2 py-2 text-center font-bold'`);

    setPreviewTable(html);
    // Reset input supaya file yang sama bisa diupload ulang
    e.target.value = "";
  };

  // =============================================
  // SIMPAN EXCEL KE DB
  // =============================================
  const saveExcelToDB = async () => {
    if (!currentFile) return alert("Tidak ada file");

    const formData = new FormData();
    formData.append("file", currentFile);

    try {
      setLoading(true);
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/informasi-jadwal/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      let json = null;
      try { json = await res.json(); } catch { /* non-JSON response */ }

      if (!res.ok) {
        alert("Upload gagal: " + (json?.error || res.statusText || "Server Error"));
        return;
      }

      alert(json?.message || "Upload sukses!");
      setPreviewTable("");
      setCurrentFile(null);
      fetchData();
    } catch (e) {
      alert("Upload gagal: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // DOWNLOAD TEMPLATE EXCEL (format 2 header)
  // =============================================
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ["No.", "Lokasi Kerja", "Nama", "Kode", "Jam", "",       "Keterangan", "Group", "Status",     "Kontrol"],
      ["",    "",             "",     "",     "Masuk","Pulang", "",           "",      "",           ""],
    ]);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } }, // "Jam" merge
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },
      { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
      { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },
    ];

    ws["!cols"] = [
      { wch: 5  }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Template Jadwal");
    XLSX.writeFile(wb, "template_informasi_jadwal.xlsx");
  };

  // =============================================
  // CREATE (modal)
  // =============================================
  const handleCreate = async () => {
    if (!newForm.kode.trim()) return alert("Kode tidak boleh kosong");

    try {
      setLoading(true);
      const payload = {
        ...newForm,
        jam_masuk:  normalizeTimeForBackend(newForm.jam_masuk),
        jam_pulang: normalizeTimeForBackend(newForm.jam_pulang),
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/informasi-jadwal/create`, {
        method:  "POST",
        headers,
        body:    JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        alert("Gagal simpan: " + (json?.error || res.statusText));
        return;
      }

      setShowModal(false);
      setNewForm(EMPTY_FORM);
      fetchData();
    } catch (e) {
      alert("Gagal simpan: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // INLINE EDIT — mulai edit
  // =============================================
  const startEdit = (item) => {
    setEditingKode(item.kode);
    setEditForm({
      lokasi_kerja: item.lokasi_kerja ?? "",
      nama_shift:   item.nama_shift   ?? "",
      jam_masuk:    toTimeInput(item.jam_masuk),
      jam_pulang:   toTimeInput(item.jam_pulang),
      keterangan:   item.keterangan   ?? "",
      group:        item.group        ?? "",
      status:       item.status       ?? "non-active",
      kontrol:      item.kontrol      ?? "",
    });
  };

  // =============================================
  // UPDATE (inline)
  // =============================================
  const handleUpdate = async (kode) => {
    try {
      setLoading(true);
      const payload = {
        ...editForm,
        jam_masuk:  normalizeTimeForBackend(editForm.jam_masuk),
        jam_pulang: normalizeTimeForBackend(editForm.jam_pulang),
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/informasi-jadwal/update/${encodeURIComponent(kode)}`, {
        method:  "PUT",
        headers,
        body:    JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        alert("Gagal update: " + (json?.error || res.statusText));
        return;
      }

      setEditingKode(null);
      setEditForm({});
      fetchData();
    } catch (e) {
      alert("Update gagal: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // DELETE
  // =============================================
  const handleDelete = async (kode) => {
    if (!confirm(`Hapus jadwal "${kode}"?`)) return;
    try {
      setLoading(true);
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/informasi-jadwal/delete/${encodeURIComponent(kode)}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const json = await res.json();
        alert("Gagal hapus: " + (json?.error || res.statusText));
        return;
      }
      fetchData();
    } catch (e) {
      alert("Gagal hapus: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // SMART PAGINATION (sama persis seperti karyawan)
  // =============================================
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage !== 4) pages.push("...");
    }

    const start = Math.max(1, currentPage - 1);
    const end   = Math.min(totalPages, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) {
      if (currentPage !== totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex justify-center mt-4 gap-2 flex-wrap">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-3 py-1">...</span>
          ) : (
            <button
              key={idx}
              className={`px-3 py-1 border rounded ${currentPage === p ? "bg-green-600 text-white" : ""}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="w-full" data-tour="schedule-page">
      {/* HEADER */}
      <div
        className="bg-white p-4 md:p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
        data-tour="schedule-header"
      >
        <img src={sariAter} alt="Logo" className="w-20 md:w-28 object-contain" data-tour="schedule-logo" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold" data-tour="schedule-title">
            Upload Informasi Jadwal
          </h1>
          <p className="text-gray-600" data-tour="schedule-description">
            Unggah file Excel atau tambah jadwal manual.
          </p>
        </div>
      </div>

      {/* UPLOAD & TEMPLATE */}
      <div className="mt-6 flex flex-col md:flex-row gap-4" data-tour="schedule-upload-section">
        {!isGuest && (
          <label
            className={`block w-full border-2 border-dashed border-[#1BA39C] bg-white hover:bg-[#e9f7f7] transition cursor-pointer rounded-xl p-10 md:p-14 text-center${excelDropzoneClassName(isDraggingExcel)}`}
            data-tour="schedule-upload-dropzone"
            {...getExcelDropzoneHandlers(handleFileChange, setIsDraggingExcel)}
          >
            <UploadCloud size={40} className="text-[#1BA39C] mx-auto" />
            <p className="text-gray-700 font-medium mt-3 text-sm md:text-base">
              Klik untuk Upload File Excel
            </p>
            <input type="file" hidden accept=".xlsx,.xls" onChange={handleFileChange} />
          </label>
        )}

        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 bg-[#1BA39C] hover:bg-[#158f89] text-white px-6 py-4 rounded-xl shadow-md text-sm md:text-base"
          data-tour="schedule-template-button"
        >
          <Download size={20} /> Download Template Excel
        </button>
      </div>

      {/* PREVIEW */}
      {previewTable && (
        <div className="bg-white mt-10 p-4 md:p-6 rounded-2xl shadow-md" data-tour="schedule-preview-card">
          <div
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3"
            data-tour="schedule-preview-header"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="text-green-700" size={28} />
              <h2 className="text-xl font-bold">Preview Data Excel</h2>
            </div>
            {!isGuest && (
              <button
                onClick={saveExcelToDB}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow text-sm md:text-base"
                data-tour="schedule-preview-save"
              >
                {loading ? "Menyimpan..." : "Simpan ke Database"}
              </button>
            )}
          </div>
          <div className="overflow-auto max-h-[400px] border rounded-xl p-3 text-xs md:text-sm" data-tour="schedule-preview-table">
            <div dangerouslySetInnerHTML={{ __html: previewTable }} />
          </div>
        </div>
      )}

      {/* TABLE + CRUD */}
      <div className="bg-white mt-10 p-4 md:p-6 rounded-2xl shadow-md" data-tour="schedule-table-card">
        {/* HEADER + SEARCH */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3"
          data-tour="schedule-table-header"
        >
          <h2 className="text-xl font-bold">Data Informasi Jadwal</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari kode / nama shift..."
              className="border p-2 rounded-lg text-sm"
              value={search}
              data-tour="schedule-search-input"
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            {!isGuest && (
              <button
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg"
                onClick={() => { setShowModal(true); setNewForm(EMPTY_FORM); }}
                data-tour="schedule-add-button"
              >
                <Plus size={16} /> Tambah
              </button>
            )}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg" data-tour="schedule-error-state">
            <p className="font-semibold">⚠️ Error Loading Data:</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-gray-600">Check browser console (F12) for more details</p>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg" data-tour="schedule-loading-state">
            <p>Loading data...</p>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-auto" data-tour="schedule-table-wrapper">
          <table className="min-w-full border text-xs md:text-sm">
            <thead className="bg-gray-100" data-tour="schedule-table-head">
              <tr>
                <th className="border p-2" data-tour="schedule-table-col-no">No</th>
                {COLS.map((c) => (
                  <th key={c} className="border p-2 whitespace-nowrap" data-tour={`schedule-table-col-${c}`}>
                    {c.replace("_", " ").toUpperCase()}
                  </th>
                ))}
                {!isGuest && <th className="border p-2" data-tour="schedule-table-actions">Action</th>}
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr key={item.kode} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">
                    {(currentPage - 1) * rowsPerPage + i + 1}
                  </td>

                  {COLS.map((col) => (
                    <td className="border p-2" key={col}>
                      {editingKode === item.kode ? (
                        col === "kode" ? (
                          // Kode tidak bisa diedit (primary key)
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-500">
                            {item.kode}
                          </span>
                        ) : (
                          <input
                            type={TIME_COLS.has(col) ? "time" : "text"}
                            className="border px-2 py-1 w-full rounded"
                            value={editForm[col] ?? ""}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, [col]: e.target.value }))
                            }
                          />
                        )
                      ) : (
                        // Tampilan normal — jam potong ke HH:MM
                        TIME_COLS.has(col)
                          ? toTimeInput(item[col])
                          : (item[col] ?? "-")
                      )}
                    </td>
                  ))}

                  {!isGuest && (
                    <td className="border p-2">
                      <div className="flex gap-1 justify-center">
                        {editingKode === item.kode ? (
                          <>
                            <button
                              onClick={() => handleUpdate(item.kode)}
                              disabled={loading}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs disabled:opacity-60"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => { setEditingKode(null); setEditForm({}); }}
                              className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.kode)}
                          className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td
                    className="border p-4 text-center text-gray-400"
                    colSpan={COLS.length + (isGuest ? 1 : 2)}
                  >
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div data-tour="schedule-pagination">
          {renderPagination()}
        </div>
      </div>

      {/* MODAL TAMBAH */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 max-h-[90vh] overflow-y-auto" data-tour="schedule-modal-shell">
            <h3 className="text-lg font-bold mb-4" data-tour="schedule-modal-title">
              Tambah Informasi Jadwal
            </h3>

            {COLS.map((col) => (
              <div key={col} className="mb-2" data-tour={`schedule-modal-field-${col}`}>
                <label className="block text-xs text-gray-500 mb-1">
                  {col.replace("_", " ").toUpperCase()}
                </label>
                <input
                  type={TIME_COLS.has(col) ? "time" : "text"}
                  placeholder={col.replace("_", " ")}
                  className="border p-2 w-full rounded text-sm"
                  value={newForm[col] ?? ""}
                  onChange={(e) =>
                    setNewForm((prev) => ({ ...prev, [col]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded text-sm"
                data-tour="schedule-modal-cancel"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60 text-sm"
                data-tour="schedule-modal-save"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
