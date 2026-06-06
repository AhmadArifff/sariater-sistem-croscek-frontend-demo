import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Loader, Calendar, Filter, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Alert } from '../components/ui/FormInput';
import { KPICard } from '../components/KPICard';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { CroscekDailyTrendChart } from '../components/charts/CroscekDailyTrendChart';
import { CroscekDelayChart } from '../components/charts/CroscekDelayChart';
import { DepartmentBreakdownChart } from '../components/charts/DepartmentBreakdownChart';
import { TopLatecomersList } from '../components/TopLatecomersList';
import { DataQualityIndicator } from '../components/DataQualityIndicator';
import api from '../utils/api';

export default function Dashboard() {
  // Filter states
  const [filterType, setFilterType] = useState('today'); // 'today', 'range', 'month'
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('all');

  const [analyticsData, setAnalyticsData] = useState({
    unique_employees: 0,
    check_ins: 0,
    check_outs: 0,
    total_records: 0,
    trends: { check_ins: 0, check_outs: 0, employees: 0 }
  });
  const [attendanceRateData, setAttendanceRateData] = useState({
    attendance: { present: 0, present_rate: 0, late: 0, late_rate: 0, absent: 0, absent_rate: 0 },
    unique_employees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reset state ketika filterType berubah
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (filterType === 'today') {
      setStartDate(today);
      setEndDate(today);
      setSelectedMonth(currentMonth);
    }
    // Note: don't reset startDate/endDate/selectedMonth when switching to 'range' or 'month'
    // to preserve user's previously selected dates
  }, [filterType]);

  useEffect(() => {
    const fetchAnalyticsSummary = async () => {
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
        
        console.log('[Dashboard] Fetching with params:', params.toString());
        
        const [summaryRes, rateRes] = await Promise.all([
          api.get(`/analytics/summary?${params.toString()}`),
          api.get(`/analytics/attendance-rate?${params.toString()}`)
        ]);
        
        console.log('[Dashboard] Summary response:', summaryRes.data);
        console.log('[Dashboard] Rate response:', rateRes.data);
        
        setAnalyticsData(summaryRes.data);
        setAttendanceRateData(rateRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data analytics');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsSummary();
  }, [filterType, startDate, endDate, selectedMonth]);

  const getDateRange = () => {
    if (filterType === 'today') {
      return `Hari ini - ${new Date().toLocaleDateString('id-ID')}`;
    } else if (filterType === 'range') {
      return `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
    } else {
      const monthName = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return `Bulan ${monthName}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">Ringkasan kehadiran dan tren karyawan</p>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 shadow-lg border border-blue-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="today">Hari Ini</option>
                <option value="range">Range Tanggal</option>
                <option value="month">Bulan</option>
              </select>
            </div>

            {/* Date Range Filters */}
            {filterType === 'range' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Month Filter */}
            {filterType === 'month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Bulan</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Status Filter */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="check_in">Check In</option>
                <option value="check_out">Check Out</option>
              </select>
            </div> */}
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><strong>Periode:</strong> {getDateRange()}</span>
            </p>
            <DataQualityIndicator 
              filterType={filterType}
              startDate={filterType === 'range' ? startDate : undefined}
              endDate={filterType === 'range' ? endDate : undefined}
              month={filterType === 'month' ? selectedMonth : undefined}
            />
          </div>
        </CardBody>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      {/* KPI Cards Section - Row 1 (4 main KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <KPICard
          value={analyticsData.unique_employees}
          label="Total Karyawan"
          icon={Users}
          color="blue"
          trend={analyticsData.trends?.employees}
        />
        <KPICard
          value={analyticsData.check_ins}
          label="Check In"
          icon={CheckCircle}
          color="green"
          trend={analyticsData.trends?.check_ins}
        />
        <KPICard
          value={analyticsData.check_outs}
          label="Check Out"
          icon={XCircle}
          color="purple"
          trend={analyticsData.trends?.check_outs}
        />
        <KPICard
          value={analyticsData.total_records}
          label="Total Scan"
          icon={Clock}
          color="orange"
          trend={analyticsData.total_records}
        />
      </div>

      {/* KPI Cards Section - Row 2 (Attendance Rate Breakdown) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <KPICard
          value={`${attendanceRateData.attendance?.present_rate || 0}%`}
          label="Kehadiran"
          icon={CheckCircle}
          color="green"
          trend={0}
        />
        <KPICard
          value={`${attendanceRateData.attendance?.late_rate || 0}%`}
          label="Terlambat"
          icon={Clock}
          color="orange"
          trend={0}
        />
        <KPICard
          value={`${attendanceRateData.attendance?.absent_rate || 0}%`}
          label="Absen/Sakit/Izin"
          icon={XCircle}
          color="red"
          trend={0}
        />
      </div>

      {/* Charts Section - Single Column */}
      <div className="space-y-8">
        
        {/* Top Latecomers Section */}
        <Card className="shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="bg-gradient-to-r from-red-500 to-pink-600 h-1 rounded-full mb-3" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
              Analisis Frekuensi Keterlambatan Karyawan
            </h2>
            <p className="text-sm text-gray-600 mt-1">Daftar lengkap karyawan berdasarkan jumlah keterlambatan dengan filter departemen dan pencarian nama ({getDateRange()})</p>
            <p className="text-xs text-gray-500 mt-1">
              Kelompok telat: status HADIR, selisih masuk &gt; 4 menit, bukan scan kosong/belum waktunya, bukan anomali &gt; 120 menit, dan kompensasi pulang belum terpenuhi. Klik pada baris untuk melihat detail karyawan.
            </p>
          </CardHeader>
          <CardBody>
            <TopLatecomersList 
              filterType={filterType}
              startDate={filterType === 'range' ? startDate : undefined}
              endDate={filterType === 'range' ? endDate : undefined}
              month={filterType === 'month' ? selectedMonth : undefined}
            />
          </CardBody>
        </Card>
        
        {/* Croscek Analysis Section */}
        <Card className="shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-1 rounded-full mb-3" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Analisis Croscek - Tren Harian per Departemen
            </h2>
            <p className="text-sm text-gray-600 mt-1">Line chart check-in/check-out harian dengan filter departemen interaktif</p>
          </CardHeader>
          <CardBody>
            <CroscekDailyTrendChart 
              year={parseInt(selectedMonth.split('-')[0])} 
              month={parseInt(selectedMonth.split('-')[1])}
            />
          </CardBody>
        </Card>

        {/* Croscek Delay Analysis Section */}
        <Card className="shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-1 rounded-full mb-3" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
              Analisis Keterlambatan - Tren Harian per Departemen
            </h2>
            <p className="text-sm text-gray-600 mt-1">Indikator hijau (tepat waktu) dan merah (terlalu cepat) dengan filter departemen interaktif</p>
          </CardHeader>
          <CardBody>
            <CroscekDelayChart 
              year={parseInt(selectedMonth.split('-')[0])} 
              month={parseInt(selectedMonth.split('-')[1])}
            />
          </CardBody>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs md:text-sm text-gray-500 animate-fade-in">
        <p>Data terakhir diperbarui: {new Date().toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
