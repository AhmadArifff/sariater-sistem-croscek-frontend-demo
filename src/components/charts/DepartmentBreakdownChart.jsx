import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export function DepartmentBreakdownChart({ filterType, startDate, endDate, selectedMonth }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartmentData = async () => {
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
        
        const response = await api.get(`/analytics/by-department?${params.toString()}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data departemen');
        console.error('Department chart error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartmentData();
  }, [filterType, startDate, endDate, selectedMonth]);

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
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="department" 
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
        />
        <Bar 
          dataKey="present" 
          name="Hadir" 
          fill="#10b981"
          isAnimationActive={true}
        />
        <Bar 
          dataKey="absent" 
          name="Tidak Hadir" 
          fill="#ef4444"
          isAnimationActive={true}
        />
        <Bar 
          dataKey="late" 
          name="Terlambat" 
          fill="#f59e0b"
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
