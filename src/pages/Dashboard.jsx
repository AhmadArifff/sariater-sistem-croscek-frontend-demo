import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Loader, Calendar, Filter } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Alert } from '../components/ui/FormInput';
import { KPICard } from '../components/KPICard';
import { CroscekDailyTrendChart } from '../components/charts/CroscekDailyTrendChart';
import { CroscekDelayChart } from '../components/charts/CroscekDelayChart';
import { TopLatecomersList } from '../components/TopLatecomersList';
import { DataQualityIndicator } from '../components/DataQualityIndicator';
import api from '../utils/api';

const DASHBOARD_FILTER_STORAGE_KEY = 'dashboard.analytics.filter';

const getTodayLocal = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
};

const getCurrentMonthLocal = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}`;
};

const getStoredDashboardFilter = () => {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(DASHBOARD_FILTER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
};

const storedDashboardFilter = getStoredDashboardFilter();

export default function Dashboard() {
  const [filterType, setFilterType] = useState(() => (
    ['today', 'range', 'month'].includes(storedDashboardFilter.filterType)
      ? storedDashboardFilter.filterType
      : 'today'
  ));
  const [startDate, setStartDate] = useState(() => storedDashboardFilter.startDate || getTodayLocal());
  const [endDate, setEndDate] = useState(() => storedDashboardFilter.endDate || getTodayLocal());
  const [selectedMonth, setSelectedMonth] = useState(() => storedDashboardFilter.selectedMonth || getCurrentMonthLocal());

  const [summaryData, setSummaryData] = useState({
    unique_employees: 0,
    check_ins: 0,
    check_outs: 0,
    total_records: 0,
    work_summary: {
      present: 0, late: 0, absent: 0,
      present_rate: 0, late_rate: 0, absent_rate: 0,
      total_work_records: 0
    },
    trends: { employees: null, check_ins: null, check_outs: null }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Reset tanggal saat filter today dipilih
  useEffect(() => {
    if (filterType === 'today') {
      const today = getTodayLocal();
      setStartDate(today);
      setEndDate(today);
    }
  }, [filterType]);

  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_FILTER_STORAGE_KEY, JSON.stringify({
        filterType,
        startDate,
        endDate,
        selectedMonth
      }));
    } catch {
      // Abaikan jika browser menolak localStorage.
    }
  }, [filterType, startDate, endDate, selectedMonth]);

  // SATU-SATUNYA fetch — hapus useEffect lama
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('filterType', filterType);

        if (filterType === 'range' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        } else if (filterType === 'month' && selectedMonth) {
          params.append('month', selectedMonth);
        }

        const res = await api.get(`/analytics/summary?${params.toString()}`);
        setSummaryData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data analytics');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [filterType, startDate, endDate, selectedMonth]);

  const getDateRange = () => {
    const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID');
    if (filterType === 'today') return `Hari ini - ${fmt(startDate)}`;
    if (filterType === 'range') return `${fmt(startDate)} - ${fmt(endDate)}`;
    return `Bulan ${new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
  };

  // Trend hanya relevan untuk "today"
  const showTrend = filterType === 'today';
  const ws = summaryData.work_summary ?? {};

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-2">Ringkasan kehadiran dan tren karyawan</p>
      </div>

      {/* Filter */}
      <Card className="mb-6 shadow-lg border border-blue-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Filter</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Hari Ini</option>
                <option value="range">Range Tanggal</option>
                <option value="month">Bulan</option>
              </select>
            </div>

            {filterType === 'range' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                  <input type="date" value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                  <input type="date" value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </>
            )}

            {filterType === 'month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Bulan</label>
                <input type="month" value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}
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

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />
      )}

      {/* KPI Row 1 — Scan metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <KPICard
          value={summaryData.unique_employees}
          label="Total Karyawan"
          icon={Users}
          color="blue"
          trend={showTrend ? summaryData.trends?.employees : null}
        />
        <KPICard
          value={summaryData.check_ins}
          label="Check In (Actual)"
          icon={CheckCircle}
          color="green"
          trend={showTrend ? summaryData.trends?.check_ins : null}
        />
        <KPICard
          value={summaryData.check_outs}
          label="Check Out (Actual)"
          icon={XCircle}
          color="purple"
          trend={showTrend ? summaryData.trends?.check_outs : null}
        />
        <KPICard
          value={summaryData.total_records}
          label="Total Records"
          icon={Clock}
          color="orange"
          trend={null}
        />
      </div>

      {/* KPI Row 2 — Work summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <KPICard
          value={ws.present ?? 0}
          label={`Hadir`}
          icon={CheckCircle}
          color="green"
          trend={null}
        />
        <KPICard
          value={ws.late ?? 0}
          label={`Terlambat`}
          icon={Clock}
          color="orange"
          trend={null}
        />
        <KPICard
          value={ws.absent ?? 0}
          label={`Tidak Hadir`}
          icon={XCircle}
          color="red"
          trend={null}
        />
      </div>

      {/* Charts & Lists */}
      <div className="space-y-8">
        <Card className="shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="bg-gradient-to-r from-red-500 to-pink-600 h-1 rounded-full mb-3" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
              Analisis Frekuensi Keterlambatan Karyawan
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Daftar karyawan berdasarkan jumlah keterlambatan ({getDateRange()})
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

        <Card className="shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-1 rounded-full mb-3" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Analisis Croscek - Tren Harian per Departemen
            </h2>
          </CardHeader>
          <CardBody>
            <CroscekDailyTrendChart
              year={parseInt(selectedMonth.split('-')[0])}
              month={parseInt(selectedMonth.split('-')[1])}
            />
          </CardBody>
        </Card>

        <Card className="shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-1 rounded-full mb-3" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
              Analisis Keterlambatan - Tren Harian per Departemen
            </h2>
          </CardHeader>
          <CardBody>
            <CroscekDelayChart
              year={parseInt(selectedMonth.split('-')[0])}
              month={parseInt(selectedMonth.split('-')[1])}
            />
          </CardBody>
        </Card>
      </div>

      <div className="text-center text-xs md:text-sm text-gray-500 mt-8">
        <p>Data terakhir diperbarui: {new Date().toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
