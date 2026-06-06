import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export function StatusDistributionChart({ filterType, startDate, endDate, selectedMonth }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        
        if (filterType === 'month' && selectedMonth) {
          params.month = selectedMonth;
          params.filterType = 'month';
        } else if (filterType === 'range' && startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
          params.filterType = 'range';
        } else {
          params.filterType = 'today';
        }

        const response = await api.get('/analytics/summary', { params });
        
        // Transform summary data to pie chart format
        const pieData = [
          { name: 'Check In', value: response.data.check_ins, percentage: 0 },
          { name: 'Check Out', value: response.data.check_outs, percentage: 0 },
          { name: 'Karyawan', value: response.data.unique_employees, percentage: 0 }
        ];

        const total = response.data.check_ins + response.data.check_outs;

        if (total > 0) {
          pieData.forEach(item => {
            item.percentage = ((item.value / total) * 100).toFixed(1);
          });
        }

        setData(pieData);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data status');
        console.error('Status chart error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
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

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percentage }) => `${name} ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => value}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
