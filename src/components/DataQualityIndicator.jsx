import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, Loader, BarChart3 } from 'lucide-react';
import api from '../utils/api';

export function DataQualityIndicator({ filterType = 'today', startDate, endDate, month }) {
  const [dataQuality, setDataQuality] = useState({
    data_completeness: {
      high: { count: 0, percentage: 0, label: 'Lengkap' },
      medium: { count: 0, percentage: 0, label: 'Sebagian' },
      low: { count: 0, percentage: 0, label: 'Prediksi' },
      missing: { count: 0, percentage: 0, label: 'Hilang' }
    },
    data_usage: {
      actual_data_pct: 0,
      predicted_data_pct: 0,
      records_using_prediction: 0
    },
    summary: {
      data_analyst_ready: 0,
      requires_verification: 0,
      unusable: 0
    },
    total_records: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataQuality = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('filterType', filterType || 'today');
        
        if (filterType === 'range' && startDate && endDate) {
          params.append('startDate', startDate);
          params.append('endDate', endDate);
        } else if (filterType === 'month' && month) {
          params.append('month', month);
        }
        
        const response = await api.get(`/analytics/data-quality?${params.toString()}`);
        setDataQuality(response.data);
      } catch (err) {
        console.error('Data quality fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDataQuality();
  }, [filterType, startDate, endDate, month]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Loader className="w-4 h-4 text-gray-500 animate-spin" />
        <span className="text-sm text-gray-600">Memeriksa kelengkapan data...</span>
      </div>
    );
  }

  const { data_completeness, data_usage, summary, total_records } = dataQuality;
  const actualDataPct = data_usage?.actual_data_pct || 0;
  const missingCount = data_completeness?.missing?.count || 0;
  
  // Determine status based on actual data availability
  let statusIcon = CheckCircle;
  let statusText = 'Lengkap';
  let statusDetail = 'Data actual tersedia';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let textColor = 'text-green-700';
  let infoColor = 'text-green-600';

  if (missingCount > 0 && (missingCount / total_records) > 0.2) {
    statusIcon = AlertTriangle;
    statusText = 'Perhatian';
    statusDetail = 'Ada data yang hilang';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    textColor = 'text-red-700';
    infoColor = 'text-red-600';
  } else if (actualDataPct < 70) {
    statusIcon = Info;
    statusText = 'Verifikasi Perlu';
    statusDetail = 'Banyak data prediksi';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    textColor = 'text-yellow-700';
    infoColor = 'text-yellow-600';
  }

  const StatusIcon = statusIcon;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <StatusIcon className={`${textColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`font-semibold ${textColor}`}>Kelengkapan Data: {statusText}</h3>
              <p className={`text-xs ${infoColor} mt-0.5`}>{statusDetail}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{actualDataPct}%</div>
              <div className="text-xs text-gray-600">Data Actual</div>
            </div>
          </div>

          {/* Data Completeness Breakdown */}
          <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Distribusi Data ({total_records} records)
            </div>
            <div className="space-y-2">
              {/* High Quality */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-green-700">
                    🟢 {data_completeness?.high?.label} (Actual + Actual)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {data_completeness?.high?.count} ({data_completeness?.high?.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${Math.max(data_completeness?.high?.percentage || 0, 2)}%` }}
                  />
                </div>
              </div>

              {/* Medium Quality */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-yellow-700">
                    🟡 {data_completeness?.medium?.label} (Actual + Prediksi)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {data_completeness?.medium?.count} ({data_completeness?.medium?.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${Math.max(data_completeness?.medium?.percentage || 0, 2)}%` }}
                  />
                </div>
              </div>

              {/* Low Quality */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-orange-700">
                    🟠 {data_completeness?.low?.label} (Hanya Prediksi)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {data_completeness?.low?.count} ({data_completeness?.low?.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${Math.max(data_completeness?.low?.percentage || 0, 2)}%` }}
                  />
                </div>
              </div>

              {/* Missing */}
              {missingCount > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-red-700">
                      ⚫ {data_completeness?.missing?.label} (Tanpa Data)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {data_completeness?.missing?.count} ({data_completeness?.missing?.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${Math.max(data_completeness?.missing?.percentage || 0, 2)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary for Data Analyst */}
          <div className="text-xs space-y-1 text-gray-700">
            <div className="flex justify-between px-2 py-1 bg-white bg-opacity-40 rounded">
              <span>✅ Siap Analisis (Data Lengkap):</span>
              <span className="font-semibold">{summary?.data_analyst_ready} records</span>
            </div>
            <div className="flex justify-between px-2 py-1 bg-white bg-opacity-40 rounded">
              <span>⚠️ Perlu Verifikasi (Ada Prediksi):</span>
              <span className="font-semibold">{summary?.requires_verification} records</span>
            </div>
            {summary?.unusable > 0 && (
              <div className="flex justify-between px-2 py-1 bg-white bg-opacity-40 rounded">
                <span>❌ Tidak Dapat Digunakan (Tanpa Data):</span>
                <span className="font-semibold">{summary?.unusable} records</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
