import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export function MonthlyTrendChart({ selectedMonth, filterType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let month, year;
        if (filterType === 'month' && selectedMonth) {
          [year, month] = selectedMonth.split('-');
        } else {
          const now = new Date();
          year = now.getFullYear();
          month = now.getMonth() + 1;
        }

        const response = await api.get('/analytics/monthly', {
          params: { year, month }
        });
        setData(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data bulanan');
        console.error('Monthly chart error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedMonth, filterType]);

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
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value) => value}
          labelStyle={{ color: '#1f2937' }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="present" 
          stroke="#10b981" 
          name="Hadir"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
        <Line 
          type="monotone" 
          dataKey="absent" 
          stroke="#ef4444" 
          name="Tidak Hadir"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
        <Line 
          type="monotone" 
          dataKey="late" 
          stroke="#f59e0b" 
          name="Terlambat"
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
