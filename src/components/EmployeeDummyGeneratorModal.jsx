import { useEffect, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  EMPLOYEE_DUMMY_HEADERS,
  EMPLOYEE_DUMMY_MAX_ROWS,
  generateEmployeeDummyRows,
  normalizeEmployeeDummyCount
} from "../utils/employeeDummyData";

export default function EmployeeDummyGeneratorModal({
  isOpen,
  onClose,
  title,
  description,
  typeKey = "karyawan",
  fileName = "Dummy_Data_Karyawan.xlsx"
}) {
  const [count, setCount] = useState(25);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setRows(generateEmployeeDummyRows(count, typeKey));
    }
  }, [isOpen, typeKey]);

  if (!isOpen) return null;

  const generateRows = () => {
    const safeCount = normalizeEmployeeDummyCount(count);
    setCount(safeCount);
    setRows(generateEmployeeDummyRows(safeCount, typeKey));
  };

  const exportExcel = () => {
    const safeCount = normalizeEmployeeDummyCount(count);
    const exportRows = rows.length === safeCount ? rows : generateEmployeeDummyRows(safeCount, typeKey);
    if (rows.length !== safeCount) {
      setCount(safeCount);
      setRows(exportRows);
    }
    const sheetData = [
      EMPLOYEE_DUMMY_HEADERS,
      ...exportRows.map((row) => EMPLOYEE_DUMMY_HEADERS.map((header) => row[header]))
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 34 }, { wch: 14 }, { wch: 24 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
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

        <div className="p-5 border-b flex flex-col md:flex-row md:items-end gap-3">
          <div className="w-full md:w-56">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah data
            </label>
            <input
              type="number"
              min="1"
              max={EMPLOYEE_DUMMY_MAX_ROWS}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Maksimal {EMPLOYEE_DUMMY_MAX_ROWS} baris per export.</p>
          </div>

          <button
            type="button"
            onClick={generateRows}
            className="flex items-center justify-center gap-2 bg-[#1BA39C] hover:bg-[#158f89] text-white px-4 py-2 rounded-lg shadow text-sm"
          >
            <RefreshCw size={16} /> Generate
          </button>

          <button
            type="button"
            onClick={exportExcel}
            disabled={rows.length === 0}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow text-sm"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>

        <div className="p-5 overflow-auto">
          <table className="min-w-full border text-xs md:text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border p-2 text-center w-14">NO</th>
                {EMPLOYEE_DUMMY_HEADERS.map((header) => (
                  <th key={header} className="border p-2 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.NIK}-${index}`}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  {EMPLOYEE_DUMMY_HEADERS.map((header) => (
                    <td key={header} className="border p-2 whitespace-nowrap">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
