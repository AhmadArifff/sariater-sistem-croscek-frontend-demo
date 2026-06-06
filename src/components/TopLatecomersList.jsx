import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';

export function TopLatecomersList({ filterType = 'today', startDate, endDate, month, limit = 10, department = null }) {
  const [allLatecomers, setAllLatecomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchName, setSearchName] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all latecomers without limit
  useEffect(() => {
    const fetchTopLatecomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append('limit', 10000); // Get all data
        params.append('filterType', filterType || 'today');
        
        if (filterType === 'range' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        } else if (filterType === 'month' && month) {
          params.append('month', month);
        }
        
        const response = await api.get(`/analytics/top-latecomers?${params.toString()}`);
        console.log('Top latecomers response:', response.data);
        
        const latecomers = response.data.latecomers || [];
        setAllLatecomers(latecomers);
        
        // Extract unique departments and sort
        const uniqueDepts = [...new Set(latecomers.map(l => l.department))].sort();
        setDepartments(uniqueDepts);
        setCurrentPage(1);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data top latecomers');
        console.error('Top latecomers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopLatecomers();
  }, [filterType, startDate, endDate, month]);

  // Filter data berdasarkan department dan nama
  const filteredData = allLatecomers.filter(latecomer => {
    const departmentMatch = selectedDepartment === 'all' || latecomer.department === selectedDepartment;
    const nameMatch = searchName === '' || latecomer.name.toLowerCase().includes(searchName.toLowerCase());
    return departmentMatch && nameMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedData = filteredData.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, searchName, pageSize]);

  const openEmployeeDetail = (latecomer) => {
    const employeeId = latecomer?.id;
    if (employeeId == null || employeeId === '') return;
    window.open(`/employee/${employeeId}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!allLatecomers || allLatecomers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Tidak ada data karyawan yang terlambat dalam periode ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="space-y-4">
        {/* Department Filter Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter Departemen</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDepartment('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedDepartment === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDepartment === dept
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Page Size Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Nama Karyawan</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan nama karyawan..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Page Size Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Baris Per Halaman</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={10}>10 baris</option>
              <option value={20}>20 baris</option>
              <option value={50}>50 baris</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          Menampilkan <span className="font-semibold">{filteredData.length > 0 ? startIdx + 1 : 0}</span> hingga{' '}
          <span className="font-semibold">{Math.min(endIdx, filteredData.length)}</span> dari{' '}
          <span className="font-semibold">{filteredData.length}</span> hasil
        </div>
        <div className="text-right">
          <span className="font-semibold">Total Terlambat: </span>
          <span className="font-bold text-orange-600 text-base">{allLatecomers.reduce((sum, latecomer) => sum + latecomer.late_count, 0)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Karyawan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Departemen</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Jumlah Terlambat</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Hari Kerja</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((latecomer, index) => {
              const actualRank = startIdx + index + 1;
              return (
                <tr 
                  key={index}
                  onClick={() => openEmployeeDetail(latecomer)}
                  className={`border-b border-gray-100 hover:bg-indigo-50 transition cursor-pointer ${
                    actualRank <= 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      actualRank === 1 ? 'bg-yellow-400 text-white shadow-md' : 
                      actualRank === 2 ? 'bg-gray-400 text-white shadow-md' : 
                      actualRank === 3 ? 'bg-orange-600 text-white shadow-md' : 
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {actualRank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {latecomer.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {latecomer.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      {latecomer.late_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-gray-700">
                    {latecomer.total_records}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all" 
                          style={{ width: `${latecomer.late_percentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-red-600 w-12 text-right">
                        {latecomer.late_percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                  return false;
                })
                .map((page, idx, arr) => {
                  const prevPage = idx > 0 ? arr[idx - 1] : null;
                  if (prevPage && page - prevPage > 1) {
                    return <span key={`ellipsis-${page}`} className="px-2 text-gray-400">...</span>;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
