import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AlertCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const ALL_DEPARTMENT_KEY = '__ALL_DEPARTMENT__';

// Custom Tooltip - similar to page.tsx
function CroscekTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-3 text-xs min-w-[180px]">
      <p className="font-bold text-gray-600 mb-2 pb-1.5 border-b border-gray-50">{label}</p>
      {payload.map((p, i) => (
        <div key={p.name || i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-bold text-gray-800">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function CroscekDailyTrendChart({ year = new Date().getFullYear(), month = new Date().getMonth() + 1 }) {
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const departmentTabs = [{ key: ALL_DEPARTMENT_KEY, label: 'All Department' }, ...departments.map((d) => ({ key: d, label: d }))];

  useEffect(() => {
    const fetchCrossekData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch departments list
        const deptResponse = await api.get('/analytics/croscek-departments', {
          params: { 
            year: parseInt(year), 
            month: parseInt(month)
          }
        });
        
        const deptList = deptResponse.data || [];
        setDepartments(deptList);
        
        if (deptList.length > 0) {
          setActiveTab(0);
        }

        // Fetch daily trend data - without department filter first to show all
        const trendResponse = await api.get('/analytics/croscek-daily-trend', {
          params: { 
            year: parseInt(year), 
            month: parseInt(month)
          }
        });
        
        setData(trendResponse.data || []);
      } catch (err) {
        console.error('Croscek data fetch error:', err);
        setError(err.response?.data?.message || 'Gagal memuat data croscek');
      } finally {
        setLoading(false);
      }
    };

    fetchCrossekData();
  }, [year, month]);

  const handleDepartmentChange = async (deptKey, index) => {
    setActiveTab(index);
    setLoading(true);

    try {
      const params = {
        year: parseInt(year),
        month: parseInt(month)
      };
      if (deptKey && deptKey !== ALL_DEPARTMENT_KEY) {
        params.department = deptKey;
      }

      const response = await api.get('/analytics/croscek-daily-trend', {
        params
      });
      setData(response.data || []);
    } catch (err) {
      console.error('Department data fetch error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data departemen');
    } finally {
      setLoading(false);
    }
  };

  const handleTabScroll = (direction) => {
    const container = document.getElementById('dept-tabs-container');
    if (container) {
      const scrollAmount = 150;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl animate-pulse">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Memuat data croscek...</p>
        </div>
      </div>
    );
  }

  if (error && !data.length) {
    return (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalCheckIn = data.reduce((sum, item) => sum + (item.check_in || 0), 0);
  const totalCheckOut = data.reduce((sum, item) => sum + (item.check_out || 0), 0);

  return (
    <div className="space-y-5">
      {/* Department Filter Tabs */}
      {departmentTabs.length > 0 && (
        <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-100">
          <button
            onClick={() => handleTabScroll('left')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div
            id="dept-tabs-container"
            className="flex gap-2 overflow-x-auto flex-1 scroll-smooth pb-1"
            style={{ scrollBehavior: 'smooth' }}
          >
            {departmentTabs.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => handleDepartmentChange(tab.key, index)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                  activeTab === index
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleTabScroll('right')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">Total Check In</p>
              <p className="text-2xl font-extrabold text-green-700">{totalCheckIn.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Check Out</p>
              <p className="text-2xl font-extrabold text-blue-700">{totalCheckOut.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className={`px-4 rounded-xl font-semibold text-sm transition-all ${
            isZoomed
              ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isZoomed ? 'Zoom Out' : 'Zoom In'}
        </button>
      </div>

      {/* Area Chart */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-300 ${
        isZoomed ? 'fixed inset-0 z-50 m-0 rounded-none flex flex-col' : ''
      }`}>
        {isZoomed && (
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 z-10"
          >
            Close
          </button>
        )}

        <div className={isZoomed ? 'flex-1 flex flex-col' : ''}>
          {/* Chart Summary */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 font-medium">Check In:</span>
              <span className="text-xs font-bold text-green-700">{totalCheckIn.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500 font-medium">Check Out:</span>
              <span className="text-xs font-bold text-blue-700">{totalCheckOut.toLocaleString()}</span>
            </div>
          </div>

          {/* Responsive Container */}
          <div className={isZoomed ? 'flex-1 min-h-0' : 'h-80'}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  {/* Gradient Check In - Green */}
                  <linearGradient id="gradCheckIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>

                  {/* Gradient Check Out - Blue */}
                  <linearGradient id="gradCheckOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 6"
                  stroke="#f1f5f9"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={4}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                />

                <Tooltip
                  content={<CroscekTooltip />}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  verticalAlign="bottom"
                  height={36}
                />

                {/* Check In Area - Green, di belakang */}
                <Area
                  type="natural"
                  dataKey="check_in"
                  name="Check In"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradCheckIn)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#10b981',
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                  animationBegin={100}
                  animationDuration={800}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                />

                {/* Check Out Area - Blue, di depan */}
                <Area
                  type="natural"
                  dataKey="check_out"
                  name="Check Out"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#gradCheckOut)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#3b82f6',
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                  animationBegin={300}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Empty State */}
        {data.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p className="text-sm font-semibold">Tidak ada data untuk periode ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
