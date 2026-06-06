import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../../utils/api';

export function DailyDetailTable({ filterType, startDate, endDate, selectedMonth, statusFilter: propsStatusFilter }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(propsStatusFilter || 'all');
  const [sortBy, setSortBy] = useState('nama');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const applyFiltersAndSort = (dataToFilter, search, status, sort, dir) => {
    let result = [...dataToFilter];

    if (search) {
      result = result.filter(item =>
        item.nama?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      result = result.filter(item => item.status === status);
    }

    result.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];

      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  useEffect(() => {
    const fetchDailyDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append('filterType', filterType || 'today');
        
        if (filterType === 'range' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        } else if (filterType === 'month' && selectedMonth) {
          params.append('month', selectedMonth);
        }
        
        const response = await api.get(`/analytics/daily-detail?${params.toString()}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data detail');
        console.error('Detail table error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyDetail();
  }, [filterType, startDate, endDate, selectedMonth]);

  useEffect(() => {
    const filtered = applyFiltersAndSort(data, searchTerm, statusFilter, sortBy, sortDir);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm, statusFilter, sortBy, sortDir]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'check_in':
        return 'bg-green-100 text-green-700';
      case 'check_out':
        return 'bg-blue-100 text-blue-700';
      case 'present':
        return 'bg-green-100 text-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700';
      case 'late':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'check_in':
        return 'Check In';
      case 'check_out':
        return 'Check Out';
      case 'present':
        return 'Hadir';
      case 'absent':
        return 'Tidak Hadir';
      case 'late':
        return 'Terlambat';
      default:
        return status;
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <ChevronUp className="w-4 h-4 text-gray-300" />;
    return sortDir === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="h-72 md:h-80 flex items-center justify-center bg-gray-50 rounded animate-pulse">
        <div className="text-center">
          <div className="animate-spin mb-2">
            <AlertCircle className="w-6 h-6 text-blue-500 mx-auto" />
          </div>
          <p className="text-sm text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-72 md:h-80 flex items-center justify-center bg-gray-50 rounded">
        <div className="text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <input
          type="text"
          placeholder="Cari nama karyawan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">Semua Status</option>
          <option value="check_in">Check In</option>
          <option value="check_out">Check Out</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 md:px-4 py-2 md:py-3 text-left">
                <button
                  onClick={() => handleSort('nama')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 text-xs md:text-sm"
                >
                  Nama <SortIcon column="nama" />
                </button>
              </th>
              <th className="hidden sm:table-cell px-3 md:px-4 py-2 md:py-3 text-left">
                <button
                  onClick={() => handleSort('department')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 text-xs md:text-sm"
                >
                  Departemen <SortIcon column="department" />
                </button>
              </th>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 text-xs md:text-sm">
                Status
              </th>
              <th className="hidden md:table-cell px-3 md:px-4 py-2 md:py-3 text-left">
                <button
                  onClick={() => handleSort('time')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 text-xs md:text-sm"
                >
                  Waktu <SortIcon column="time" />
                </button>
              </th>
              <th className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-700 text-xs md:text-sm">
                Catatan
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors animate-fade-in"
                >
                  <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900">
                    {item.nama}
                  </td>
                  <td className="hidden sm:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm">
                    {item.department}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm">
                    {item.time}
                  </td>
                  <td className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-600 truncate max-w-xs text-xs md:text-sm">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-3 md:px-4 py-8 text-center text-xs md:text-sm text-gray-500">
                  Tidak ada data kehadiran untuk hari ini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 text-center sm:text-left">
            Menampilkan {paginatedData.length} dari {filteredData.length} data
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 md:px-3 py-1 border border-gray-300 rounded text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <span className="px-2 md:px-3 py-1 text-xs md:text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 md:px-3 py-1 border border-gray-300 rounded text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
