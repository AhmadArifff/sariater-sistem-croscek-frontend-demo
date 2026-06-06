import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, User, Briefcase, Building2, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { KPICard } from '../components/KPICard';
import api from '../utils/api';

export default function EmployeeDetail() {
  const { id_karyawan } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append('month', selectedMonth);
        
        const response = await api.get(`/analytics/employee/${id_karyawan}?${params.toString()}`);
        setEmployeeData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data karyawan');
        console.error('Employee detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id_karyawan) {
      fetchEmployeeDetail();
    }
  }, [id_karyawan, selectedMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data karyawan...</p>
        </div>
      </div>
    );
  }

  if (error || !employeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-6 h-6" />
              <p>{error || 'Data karyawan tidak ditemukan'}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const employee = employeeData.employee;
  const summary = employeeData.summary;
  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const dailyRecords = [...(employeeData.daily_records || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  // Kategorisasi libur dari daily records
  const leaveCategories = {
    libur_mingguan: 0,      // X (Libur)
    cuti_istimewa: 0,       // CT (Cuti Istimewa)
    cuti_tahunan: 0,        // CTT (Cuti Tahunan)
    cuti_bersama: 0,        // CTB (Cuti Bersama)
    extraoff: 0,            // EO (Extraoff)
    libur_doble_shift: 0    // OF1 (Libur setelah masuk doble shift)
  };

  dailyRecords.forEach(record => {
    if (record.kode_shift === 'X') {
      leaveCategories.libur_mingguan++;
    } else if (record.kode_shift === 'CT') {
      leaveCategories.cuti_istimewa++;
    } else if (record.kode_shift === 'CTT') {
      leaveCategories.cuti_tahunan++;
    } else if (record.kode_shift === 'CTB') {
      leaveCategories.cuti_bersama++;
    } else if (record.kode_shift === 'EO') {
      leaveCategories.extraoff++;
    } else if (record.kode_shift === 'OF1') {
      leaveCategories.libur_doble_shift++;
    }
  });

  const totalLeaves = Object.values(leaveCategories).reduce((a, b) => a + b, 0);

  const formatTimeDisplay = (value) => {
    if (!value) return '-';
    const str = String(value).trim();
    const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return '-';
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}.${mm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali ke Dashboard
      </button>

      {/* Header with Employee Info */}
      <Card className="mb-8 shadow-lg border border-indigo-100">
        <CardBody className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {employee.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span><strong>Posisi:</strong> {employee.position}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span><strong>Departemen:</strong> {employee.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span><strong>NIK:</strong> {employee.nik}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span><strong>Kategori:</strong> {employee.category}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Month Filter */}
      <Card className="mb-6 shadow-lg border border-blue-100">
        <CardBody>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Pilih Bulan:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">({monthName})</span>
          </div>
        </CardBody>
      </Card>

      {/* KPI Cards - Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <KPICard
          value={`${summary.attendance_rate}%`}
          label="Tingkat Kehadiran"
          icon={Calendar}
          color="green"
        />
        <KPICard
          value={summary.present_days}
          label="Hari Hadir"
          icon={User}
          color="blue"
        />
        <KPICard
          value={summary.late_days}
          label="Hari Terlambat"
          icon={AlertCircle}
          color="orange"
        />
        <KPICard
          value={summary.absent_days}
          label="Hari Tidak Hadir"   // lebih spesifik: bukan libur, bukan EO
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Kategori Libur Card */}
      {totalLeaves > 0 && (
        <Card className="mb-8 shadow-lg border border-blue-100">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800">Kategori Libur/Cuti ({totalLeaves} hari)</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveCategories.libur_mingguan > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Libur Mingguan (X)</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{leaveCategories.libur_mingguan}</p>
                  <p className="text-xs text-gray-500 mt-1">Hari tanpa scan</p>
                </div>
              )}
              {leaveCategories.cuti_istimewa > 0 && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Cuti Istimewa (CT)</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{leaveCategories.cuti_istimewa}</p>
                  <p className="text-xs text-gray-500 mt-1">Hari tanpa scan</p>
                </div>
              )}
              {leaveCategories.cuti_tahunan > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Cuti Tahunan (CTT)</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{leaveCategories.cuti_tahunan}</p>
                  <p className="text-xs text-gray-500 mt-1">Hari tanpa scan</p>
                </div>
              )}
              {leaveCategories.cuti_bersama > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Cuti Bersama (CTB)</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{leaveCategories.cuti_bersama}</p>
                  <p className="text-xs text-gray-500 mt-1">Hari tanpa scan</p>
                </div>
              )}
              {leaveCategories.extraoff > 0 && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Extraoff (EO)</p>
                  <p className="text-2xl font-bold text-pink-600 mt-1">{leaveCategories.extraoff}</p>
                  <p className="text-xs text-gray-500 mt-1">Hari tanpa scan</p>
                </div>
              )}
              {leaveCategories.libur_doble_shift > 0 && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Libur Doble Shift (OF1)</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{leaveCategories.libur_doble_shift}</p>
                  <p className="text-xs text-gray-500 mt-1">Libur setelah doble shift</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Daily Records Table */}
      <Card className="shadow-lg border border-indigo-100">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800">Riwayat Kehadiran Harian</h2>
          <p className="text-sm text-gray-600 mt-1">Total: {summary.total_days} hari kerja</p>
        </CardHeader>
        <CardBody>
          {dailyRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kode Shift</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Prediksi Shift</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jadwal Masuk</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jadwal Pulang</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jam Masuk</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Jam Pulang</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sumber Waktu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRecords.map((record, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {new Date(record.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'late'    ? 'bg-orange-100 text-orange-700' :
                          record.status === 'pending' ? 'bg-slate-100 text-slate-700' :
                          record.status === 'offday'  ? 'bg-blue-100 text-blue-700' :   // ← TAMBAH INI
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status === 'present' ? 'Hadir' :
                          record.status === 'late'    ? 'Terlambat' :
                          record.status === 'pending' ? 'Belum Waktunya' :
                          record.status === 'offday'  ? record.status_detail :          // ← TAMPILKAN LABEL DETAIL
                          'Tidak Hadir'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {record.kode_shift || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {record.prediksi_shift || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatTimeDisplay(record.scheduled_in)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatTimeDisplay(record.scheduled_out)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatTimeDisplay(record.check_in_time)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatTimeDisplay(record.check_out_time)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.source_check_time === 'prediksi'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {record.source_check_time === 'prediksi' ? 'Prediksi' : 'Aktual'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="text-xs">{record.status_detail}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada data kehadiran untuk periode ini</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Monthly Trend Chart */}
      {employeeData.monthly_trend && employeeData.monthly_trend.length > 0 && (
        <Card className="mt-8 shadow-lg border border-purple-100">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800">Tren Kehadiran 3 Bulan Terakhir</h2>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Bulan</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Hadir</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Terlambat</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Absen</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeData.monthly_trend.map((month, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {new Date(month.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          {month.present}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                          {month.late}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                          {month.absent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
