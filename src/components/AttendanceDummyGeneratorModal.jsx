import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  ATTENDANCE_DUMMY_HEADERS,
  buildAttendanceSheetData,
  generateAttendanceRows,
  normalizeAttendanceCount
} from "../utils/attendanceDummyData";
import { normalizeEmployeeForRoster } from "../utils/rosterDummyData";

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = formatLocalDate(new Date());

const addDays = (dateValue, days) => {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

export default function AttendanceDummyGeneratorModal({
  isOpen,
  onClose,
  employees = [],
  schedules = [],
  shiftScheduleMap = {},
  title,
  description,
  filePrefix = "Dummy_Kehadiran_Karyawan",
  machineName = "Karyawan 2",
  tourPrefix = "attendance-generator"
}) {
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(25);
  const [selectedNiks, setSelectedNiks] = useState(new Set());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 1));
  const [lateCount, setLateCount] = useState(0);
  const [earlyCount, setEarlyCount] = useState(0);
  const [forgotCheckinCount, setForgotCheckinCount] = useState(0);
  const [forgotCheckoutCount, setForgotCheckoutCount] = useState(0);
  const [shiftChangeCount, setShiftChangeCount] = useState(0);
  const [attendanceRows, setAttendanceRows] = useState([]);

  const normalizedEmployees = useMemo(() => (
    employees
      .map((employee) => ({
        ...normalizeEmployeeForRoster(employee),
        id_absen: String(
          employee?.id_absen ||
          employee?.ID_ABSEN ||
          employee?.["ID ABSEN"] ||
          employee?.pin ||
          employee?.PIN ||
          ""
        ).trim()
      }))
      .filter((employee) => employee.nik && employee.nama)
  ), [employees]);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return normalizedEmployees;

    return normalizedEmployees.filter((employee) => (
      employee.nama.toLowerCase().includes(keyword) ||
      employee.nik.toLowerCase().includes(keyword) ||
      employee.dept.toLowerCase().includes(keyword) ||
      employee.jabatan.toLowerCase().includes(keyword) ||
      String(employee.id_absen || "").toLowerCase().includes(keyword)
    ));
  }, [normalizedEmployees, search]);

  const selectedEmployees = useMemo(() => {
    const selected = normalizedEmployees.filter((employee) => selectedNiks.has(employee.nik));
    if (selected.length > 0) return selected;
    return normalizedEmployees.slice(0, normalizeAttendanceCount(count, normalizedEmployees.length));
  }, [normalizedEmployees, selectedNiks, count]);

  const selectedCount = selectedEmployees.length;
  const specialTotal = (
    Number(lateCount) +
    Number(earlyCount) +
    Number(forgotCheckinCount) +
    Number(forgotCheckoutCount) +
    Number(shiftChangeCount)
  );
  const normalCount = Math.max(0, selectedCount - specialTotal);
  const previewRows = attendanceRows.slice(0, 100);

  useEffect(() => {
    if (isOpen) {
      const safeCount = normalizeAttendanceCount(count, normalizedEmployees.length);
      setCount(safeCount || 1);
      setSelectedNiks(new Set());
      setAttendanceRows([]);
      setSearch("");
    }
  }, [isOpen, normalizedEmployees.length]);

  if (!isOpen) return null;

  const normalizeCategoryCounts = () => {
    let remaining = selectedEmployees.length;
    const late = normalizeAttendanceCount(lateCount, remaining);
    remaining -= late;
    const early = normalizeAttendanceCount(earlyCount, remaining);
    remaining -= early;
    const forgotIn = normalizeAttendanceCount(forgotCheckinCount, remaining);
    remaining -= forgotIn;
    const forgotOut = normalizeAttendanceCount(forgotCheckoutCount, remaining);
    remaining -= forgotOut;
    const shiftChange = normalizeAttendanceCount(shiftChangeCount, remaining);

    setLateCount(late);
    setEarlyCount(early);
    setForgotCheckinCount(forgotIn);
    setForgotCheckoutCount(forgotOut);
    setShiftChangeCount(shiftChange);

    return { late, early, forgotIn, forgotOut, shiftChange };
  };

  const generateRows = () => {
    const categoryCounts = normalizeCategoryCounts();
    const rows = generateAttendanceRows({
      employees: selectedEmployees,
      schedules,
      shiftScheduleMap,
      startDate,
      endDate,
      lateCount: categoryCounts.late,
      earlyCount: categoryCounts.early,
      forgotCheckinCount: categoryCounts.forgotIn,
      forgotCheckoutCount: categoryCounts.forgotOut,
      shiftChangeCount: categoryCounts.shiftChange,
      machineName
    });
    setAttendanceRows(rows);
  };

  const exportExcel = () => {
    const categoryCounts = normalizeCategoryCounts();
    const rows = generateAttendanceRows({
      employees: selectedEmployees,
      schedules,
      shiftScheduleMap,
      startDate,
      endDate,
      lateCount: categoryCounts.late,
      earlyCount: categoryCounts.early,
      forgotCheckinCount: categoryCounts.forgotIn,
      forgotCheckoutCount: categoryCounts.forgotOut,
      shiftChangeCount: categoryCounts.shiftChange,
      machineName
    });
    setAttendanceRows(rows);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(buildAttendanceSheetData(rows));
    ws["!cols"] = [
      { wch: 22 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 28 },
      { wch: 22 },
      { wch: 22 },
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 18 },
      { wch: 16 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filePrefix}_${startDate}_sd_${endDate}.xlsx`);
  };

  const toggleEmployee = (nik) => {
    setSelectedNiks((prev) => {
      const next = new Set(prev);
      if (next.has(nik)) {
        next.delete(nik);
      } else {
        next.add(nik);
      }
      return next;
    });
  };

  const selectByCount = () => {
    const safeCount = normalizeAttendanceCount(count, filteredEmployees.length);
    setCount(safeCount || 1);
    setSelectedNiks(new Set(filteredEmployees.slice(0, safeCount).map((employee) => employee.nik)));
    setAttendanceRows([]);
  };

  const selectAllFiltered = () => {
    setSelectedNiks(new Set(filteredEmployees.map((employee) => employee.nik)));
    setCount(filteredEmployees.length || 1);
    setAttendanceRows([]);
  };

  const clearSelection = () => {
    setSelectedNiks(new Set());
    setAttendanceRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col"
        data-tour={`${tourPrefix}-shell`}
      >
        <div className="p-5 border-b flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 border-b grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 overflow-hidden min-h-0">
          <div className="space-y-3 min-h-0 lg:max-h-[360px] lg:overflow-y-auto lg:pr-1">
            <div className="grid grid-cols-2 gap-3" data-tour={`${tourPrefix}-dates`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal awal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setAttendanceRows([]);
                  }}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setAttendanceRows([]);
                  }}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah orang</label>
              <input
                type="number"
                min="1"
                max={filteredEmployees.length || 1}
                value={count}
                onChange={(event) => {
                  setCount(event.target.value);
                  setAttendanceRows([]);
                }}
                className="border rounded-lg px-3 py-2 w-full"
                data-tour={`${tourPrefix}-count`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimal mengikuti data tersedia: {filteredEmployees.length} orang.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3" data-tour={`${tourPrefix}-categories`}>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Telat masuk</label>
                <input type="number" min="0" value={lateCount} onChange={(event) => {
                  setLateCount(event.target.value);
                  setAttendanceRows([]);
                }} className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pulang cepat</label>
                <input type="number" min="0" value={earlyCount} onChange={(event) => {
                  setEarlyCount(event.target.value);
                  setAttendanceRows([]);
                }} className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lupa check-in</label>
                <input type="number" min="0" value={forgotCheckinCount} onChange={(event) => {
                  setForgotCheckinCount(event.target.value);
                  setAttendanceRows([]);
                }} className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lupa check-out</label>
                <input type="number" min="0" value={forgotCheckoutCount} onChange={(event) => {
                  setForgotCheckoutCount(event.target.value);
                  setAttendanceRows([]);
                }} className="border rounded-lg px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pindah shift</label>
                <input type="number" min="0" value={shiftChangeCount} onChange={(event) => {
                  setShiftChangeCount(event.target.value);
                  setAttendanceRows([]);
                }} className="border rounded-lg px-3 py-2 w-full" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2" data-tour={`${tourPrefix}-actions`}>
              <button type="button" onClick={generateRows} disabled={selectedEmployees.length === 0 || !startDate || !endDate} className="flex items-center justify-center gap-2 bg-[#1BA39C] hover:bg-[#158f89] disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow text-sm">
                <RefreshCw size={16} /> Generate
              </button>
              <button type="button" onClick={exportExcel} disabled={selectedEmployees.length === 0 || !startDate || !endDate} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow text-sm">
                <Download size={16} /> Export Excel
              </button>
            </div>

            <div className="flex flex-wrap gap-2" data-tour={`${tourPrefix}-selection-actions`}>
              <button type="button" onClick={selectByCount} disabled={filteredEmployees.length === 0} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-60">
                Pilih Jumlah
              </button>
              <button type="button" onClick={selectAllFiltered} disabled={filteredEmployees.length === 0} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-60">
                Select All
              </button>
              <button type="button" onClick={clearSelection} className="px-3 py-2 rounded-lg border text-sm">
                Reset
              </button>
            </div>

            <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700 space-y-1" data-tour={`${tourPrefix}-summary`}>
              <p>Total database: <strong>{normalizedEmployees.length}</strong></p>
              <p>Terpilih: <strong>{selectedEmployees.length}</strong></p>
              <p>Normal otomatis: <strong>{normalCount}</strong></p>
              {specialTotal > selectedCount && (
                <p className="text-red-600 text-xs">Jumlah kategori akan disesuaikan agar tidak melebihi orang terpilih.</p>
              )}
            </div>
          </div>

          <div className="min-h-0">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NIK, PIN, jabatan, atau dept..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setAttendanceRows([]);
                }}
                className="border rounded-lg pl-9 pr-3 py-2 w-full text-sm"
                data-tour={`${tourPrefix}-employee-search`}
              />
            </div>
            <div className="border rounded-xl overflow-auto max-h-[360px]" data-tour={`${tourPrefix}-employee-table`}>
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 w-12 text-center">Pilih</th>
                    <th className="p-2 text-left">PIN</th>
                    <th className="p-2 text-left">NIK</th>
                    <th className="p-2 text-left">Nama</th>
                    <th className="p-2 text-left">Jabatan</th>
                    <th className="p-2 text-left">Dept</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.nik} className="border-t hover:bg-gray-50">
                      <td className="p-2 text-center">
                        <input type="checkbox" checked={selectedNiks.has(employee.nik)} onChange={() => {
                          toggleEmployee(employee.nik);
                          setAttendanceRows([]);
                        }} />
                      </td>
                      <td className="p-2 whitespace-nowrap">{employee.id_absen || employee.nik}</td>
                      <td className="p-2 whitespace-nowrap">{employee.nik}</td>
                      <td className="p-2 whitespace-nowrap">{employee.nama}</td>
                      <td className="p-2 whitespace-nowrap">{employee.jabatan}</td>
                      <td className="p-2 whitespace-nowrap">{employee.dept}</td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">Data tidak ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-5 overflow-auto" data-tour={`${tourPrefix}-preview`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="font-bold text-gray-900">Preview Kehadiran</h4>
            <p className="text-xs text-gray-500">
              Menampilkan maksimal 100 scan pertama dari {attendanceRows.length} scan.
            </p>
          </div>
          <div className="border rounded-xl overflow-auto max-h-[300px]">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {attendanceRows.length > 0
                    ? ATTENDANCE_DUMMY_HEADERS.map((header) => (
                        <th key={header} className="border p-2 text-left whitespace-nowrap">{header}</th>
                      ))
                    : (
                        <th className="border p-3 text-left text-gray-500">
                          Klik Generate untuk melihat preview kehadiran.
                        </th>
                      )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${row.PIN}-${row["Tanggal scan"]}-${index}`}>
                    {ATTENDANCE_DUMMY_HEADERS.map((header) => (
                      <td key={header} className="border p-2 whitespace-nowrap">{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
