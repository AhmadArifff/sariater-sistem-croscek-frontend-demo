import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  ROSTER_MONTH_NAMES,
  buildRosterPreviewRows,
  buildRosterSheetData,
  generateRosterRows,
  getRosterShiftCodes,
  normalizeEmployeeForRoster,
  normalizeRosterCount
} from "../utils/rosterDummyData";

export default function RosterDummyGeneratorModal({
  isOpen,
  onClose,
  employees = [],
  shiftCodes = [],
  title,
  description,
  filePrefix = "Dummy_Jadwal_Karyawan"
}) {
  const currentDate = new Date();
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(25);
  const [selectedNiks, setSelectedNiks] = useState(new Set());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [rosterRows, setRosterRows] = useState([]);

  const normalizedEmployees = useMemo(() => (
    employees
      .map(normalizeEmployeeForRoster)
      .filter((employee) => employee.nik && employee.nama)
  ), [employees]);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return normalizedEmployees;

    return normalizedEmployees.filter((employee) => (
      employee.nama.toLowerCase().includes(keyword) ||
      employee.nik.toLowerCase().includes(keyword) ||
      employee.id_absen.toLowerCase().includes(keyword) ||
      employee.dept.toLowerCase().includes(keyword) ||
      employee.jabatan.toLowerCase().includes(keyword)
    ));
  }, [normalizedEmployees, search]);

  const selectedEmployees = useMemo(() => {
    const selected = normalizedEmployees.filter((employee) => selectedNiks.has(employee.nik));
    if (selected.length > 0) return selected;
    return normalizedEmployees.slice(0, normalizeRosterCount(count, normalizedEmployees.length));
  }, [normalizedEmployees, selectedNiks, count]);

  const { allCodes, workCodes } = useMemo(() => getRosterShiftCodes(shiftCodes), [shiftCodes]);
  const daysInMonth = new Date(selectedYear, Number(selectedMonth) + 1, 0).getDate();
  const previewRows = buildRosterPreviewRows(rosterRows, daysInMonth, 30);
  const previewColumns = [
    "NO",
    "ID ABSEN",
    "NAMA",
    ...Array.from({ length: daysInMonth }, (_, index) => String(index + 1))
  ];

  useEffect(() => {
    if (isOpen) {
      const safeCount = normalizeRosterCount(count, normalizedEmployees.length);
      setCount(safeCount || 1);
      setSelectedNiks(new Set());
      setRosterRows([]);
      setSearch("");
    }
  }, [isOpen, normalizedEmployees.length]);

  if (!isOpen) return null;

  const generateRows = () => {
    const rows = generateRosterRows({
      employees: selectedEmployees,
      shiftCodes: allCodes,
      month: Number(selectedMonth),
      year: Number(selectedYear)
    });
    setRosterRows(rows);
  };

  const exportExcel = () => {
    const rows = rosterRows.length > 0
      ? rosterRows
      : generateRosterRows({
          employees: selectedEmployees,
          shiftCodes: allCodes,
          month: Number(selectedMonth),
          year: Number(selectedYear)
        });

    if (rosterRows.length === 0) {
      setRosterRows(rows);
    }

    const { sheetData, monthText, totalColumns } = buildRosterSheetData({
      rosterRows: rows,
      month: Number(selectedMonth),
      year: Number(selectedYear)
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 2 }, e: { r: 3, c: 2 } }
    ];
    ws["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      ...Array(totalColumns - 3).fill({ wch: 5 })
    ];

    XLSX.utils.book_append_sheet(wb, ws, monthText);
    XLSX.writeFile(wb, `${filePrefix}_${monthText.replace(/\s+/g, "_")}.xlsx`);
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
    const safeCount = normalizeRosterCount(count, filteredEmployees.length);
    setCount(safeCount || 1);
    setSelectedNiks(new Set(filteredEmployees.slice(0, safeCount).map((employee) => employee.nik)));
    setRosterRows([]);
  };

  const selectAllFiltered = () => {
    setSelectedNiks(new Set(filteredEmployees.map((employee) => employee.nik)));
    setCount(filteredEmployees.length || 1);
    setRosterRows([]);
  };

  const clearSelection = () => {
    setSelectedNiks(new Set());
    setRosterRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col">
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

        <div className="p-5 border-b grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 overflow-hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(event) => {
                    setSelectedMonth(Number(event.target.value));
                    setRosterRows([]);
                  }}
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  {ROSTER_MONTH_NAMES.map((monthName, index) => (
                    <option key={monthName} value={index}>{monthName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={selectedYear}
                  onChange={(event) => {
                    setSelectedYear(Number(event.target.value));
                    setRosterRows([]);
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
                onChange={(event) => setCount(event.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimal mengikuti data tersedia: {filteredEmployees.length} orang.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectByCount}
                disabled={filteredEmployees.length === 0}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-60"
              >
                Pilih Jumlah
              </button>
              <button
                type="button"
                onClick={selectAllFiltered}
                disabled={filteredEmployees.length === 0}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-60"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-2 rounded-lg border text-sm"
              >
                Reset
              </button>
            </div>

            <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-700 space-y-1">
              <p>Total database: <strong>{normalizedEmployees.length}</strong></p>
              <p>Terpilih: <strong>{selectedEmployees.length}</strong></p>
              <p>Kode shift kerja: <strong>{workCodes.length}</strong></p>
              <p>Hari jadwal: <strong>{daysInMonth}</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={generateRows}
                disabled={selectedEmployees.length === 0 || workCodes.length === 0}
                className="flex items-center justify-center gap-2 bg-[#1BA39C] hover:bg-[#158f89] disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow text-sm"
              >
                <RefreshCw size={16} /> Generate
              </button>
              <button
                type="button"
                onClick={exportExcel}
                disabled={selectedEmployees.length === 0 || workCodes.length === 0}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow text-sm"
              >
                <Download size={16} /> Export Excel
              </button>
            </div>
          </div>

          <div className="min-h-0">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NIK, jabatan, atau dept..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setRosterRows([]);
                }}
                className="border rounded-lg pl-9 pr-3 py-2 w-full text-sm"
              />
            </div>
            <div className="border rounded-xl overflow-auto max-h-[360px]">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 w-12 text-center">Pilih</th>
                    <th className="p-2 text-left">ID ABSEN</th>
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
                        <input
                          type="checkbox"
                          checked={selectedNiks.has(employee.nik)}
                          onChange={() => {
                            toggleEmployee(employee.nik);
                            setRosterRows([]);
                          }}
                        />
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
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-5 overflow-auto">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="font-bold text-gray-900">Preview Jadwal</h4>
            <p className="text-xs text-gray-500">
              Menampilkan maksimal 30 orang pertama dari {rosterRows.length} orang.
            </p>
          </div>
          <div className="border rounded-xl overflow-auto max-h-[300px]">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {previewRows.length > 0
                    ? previewColumns.map((key) => (
                        <th key={key} className="border p-2 text-left whitespace-nowrap">{key}</th>
                      ))
                    : (
                        <th className="border p-3 text-left text-gray-500">
                          Klik Generate untuk melihat preview jadwal.
                        </th>
                      )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={`${row["ID ABSEN"]}-${row.NO}`}>
                    {previewColumns.map((key) => (
                      <td key={key} className="border p-2 whitespace-nowrap">{row[key]}</td>
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
