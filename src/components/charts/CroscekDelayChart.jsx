import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
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

// Custom Tooltip untuk delay chart
function DelayTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-3 text-xs min-w-[220px]">
      <p className="font-bold text-gray-600 mb-2 pb-1.5 border-b border-gray-50">{label}</p>
      {payload.map((p, i) => (
        <div key={p.name || i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-gray-500 truncate">{p.name}</span>
          </div>
          <span className="font-bold text-gray-800">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function CroscekDelayChart({ year = new Date().getFullYear(), month = new Date().getMonth() + 1 }) {
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const departmentTabs = [{ key: ALL_DEPARTMENT_KEY, label: 'All Department' }, ...departments.map((d) => ({ key: d, label: d }))];

  useEffect(() => {
    const fetchDelayData = async () => {
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
        
        if (deptList.length > 0) setActiveTab(0);

        // Fetch daily delay data
        const delayResponse = await api.get('/analytics/croscek-delays', {
          params: { 
            year: parseInt(year), 
            month: parseInt(month)
          }
        });
        
        setData(delayResponse.data || []);
      } catch (err) {
        console.error('Delay data fetch error:', err);
        setError(err.response?.data?.message || 'Gagal memuat data keterlambatan');
      } finally {
        setLoading(false);
      }
    };

    fetchDelayData();
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

      const response = await api.get('/analytics/croscek-delays', {
        params
      });
      setData(response.data || []);
    } catch (err) {
      console.error('Department delay data fetch error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data keterlambatan departemen');
    } finally {
      setLoading(false);
    }
  };

  const handleTabScroll = (direction) => {
    const container = document.getElementById('delay-dept-tabs-container');
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
          <p className="text-sm text-gray-600 font-medium">Memuat data keterlambatan...</p>
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
  const totalMasukGreen = data.reduce((sum, item) => sum + (item.delay_masuk_green || 0), 0);
  const totalMasukOrange = data.reduce((sum, item) => sum + (item.delay_masuk_orange || 0), 0);
  const totalPulangGreen = data.reduce((sum, item) => sum + (item.delay_pulang_green || 0), 0);
  const totalPulangAnomaly = data.reduce((sum, item) => sum + (item.delay_pulang_anomaly || 0), 0);

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
            id="delay-dept-tabs-container"
            className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
          >
            {departmentTabs.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => handleDepartmentChange(tab.key, idx)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all flex-shrink-0 ${
                  activeTab === idx
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium">Masuk Tepat Waktu</p>
          <p className="text-lg md:text-xl font-bold text-green-700">{totalMasukGreen}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs text-orange-600 font-medium">Masuk Terlambat</p>
          <p className="text-lg md:text-xl font-bold text-orange-700">{totalMasukOrange}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-600 font-medium">Pulang Tepat Waktu</p>
          <p className="text-lg md:text-xl font-bold text-blue-700">{totalPulangGreen}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-600 font-medium">Pulang Terlalu Cepat</p>
          <p className="text-lg md:text-xl font-bold text-red-700">{totalPulangAnomaly}</p>
        </div>
      </div>

      {/* Check-In Delay Trend */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-800">Tren Keterlambatan Check-In</h3>
          <p className="text-xs text-gray-500">Hijau = Tepat waktu | Orange = Terlambat/Validasi</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<DelayTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="delay_masuk_green" 
              stroke="#10b981" 
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Check-In Tepat Waktu"
            />
            <Line 
              type="monotone" 
              dataKey="delay_masuk_orange" 
              stroke="#f97316" 
              strokeWidth={2.5}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
              name="Check-In Terlambat"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Check-Out Delay Trend */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-800">Tren Check-Out (Pulang)</h3>
          <p className="text-xs text-gray-500">Hijau = Pulang Tepat Waktu | Merah = Pulang Terlalu Cepat</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<DelayTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="delay_pulang_green" 
              stroke="#0ea5e9" 
              strokeWidth={2.5}
              dot={{ fill: '#0ea5e9', r: 4 }}
              activeDot={{ r: 6 }}
              name="Pulang Tepat Waktu"
            />
            <Line 
              type="monotone" 
              dataKey="delay_pulang_anomaly" 
              stroke="#ef4444" 
              strokeWidth={2.5}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
              name="Pulang Terlalu Cepat"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-3">
        <p className="text-xs text-indigo-700 font-medium mb-2">
          <strong>Penjelasan:</strong>
        </p>
        <ul className="text-xs text-indigo-700 space-y-1 ml-3">
          <li><strong>Check-In:</strong> Hijau = Masuk tepat waktu | Orange = Masuk terlambat/validasi</li>
          <li><strong>Check-Out:</strong> Hijau = Pulang tepat waktu | Merah = Pulang terlalu cepat (anomali)</li>
          <li>Data dikelompokkan per departemen dan dapat disaring menggunakan tab di atas.</li>
        </ul>
      </div>
    </div>
  );
}
