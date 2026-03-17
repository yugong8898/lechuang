'use client';
import React, { useState, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { ChartDataPoint, YAxisScale } from '@/types';

export const LINE_CONFIG = [
  { key: 'day0',  label: '当日',  color: '#94a3b8', predKey: null },
  { key: 'day1',  label: '1日',   color: '#38bdf8', predKey: 'pred_day1' },
  { key: 'day3',  label: '3日',   color: '#34d399', predKey: 'pred_day3' },
  { key: 'day7',  label: '7日',   color: '#a78bfa', predKey: 'pred_day7' },
  { key: 'day14', label: '14日',  color: '#fb923c', predKey: 'pred_day14' },
  { key: 'day30', label: '30日',  color: '#f472b6', predKey: 'pred_day30' },
  { key: 'day60', label: '60日',  color: '#facc15', predKey: 'pred_day60' },
  { key: 'day90', label: '90日',  color: '#4ade80', predKey: 'pred_day90' },
] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  // 去重：每个 label 只显示一次
  const seen = new Set<string>();
  const unique = payload.filter((e: any) => {
    const base = e.name.replace(' (预测)', '');
    if (seen.has(base)) return false;
    seen.add(base);
    return true;
  });
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-lg p-3 text-xs shadow-xl min-w-[180px]">
      <p className="text-slate-300 font-mono mb-2">{label}</p>
      {unique.map((entry: any) => (
        <div key={entry.dataKey} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="text-slate-200 font-mono">
            {entry.value != null ? `${Number(entry.value).toFixed(2)}%` : '—'}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * 将数据拆分：实线部分保留真实值，虚线部分保留预测值，另一部分置 null
 */
function splitData(
  data: ChartDataPoint[],
  valueKey: keyof ChartDataPoint,
  predKey: keyof ChartDataPoint | null
) {
  return data.map(d => {
    const isPred = predKey ? Boolean(d[predKey]) : false;
    const val = d[valueKey] as number | null;
    return {
      ...d,
      [`${String(valueKey)}_solid`]: isPred ? null : val,
      [`${String(valueKey)}_dash`]: isPred ? val : null,
    };
  });
}

interface Props {
  data: ChartDataPoint[];
  yScale: YAxisScale;
}

export default function ROITrendChart({ data, yScale }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggleLine = useCallback((key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const formatDate = (d: string) => d.slice(5);
  const formatYAxis = (v: number) => `${v}%`;

  // 预处理：每条线都拆出 solid/dash 两列
  const chartData = data.map(d => {
    const row: any = { date: d.date };
    LINE_CONFIG.forEach(({ key, predKey }) => {
      const isPred = predKey ? Boolean((d as any)[predKey]) : false;
      const val = (d as any)[key];
      const useVal = yScale === 'log' ? (typeof val === 'number' && val > 0 ? val : null) : val;
      row[`${key}_solid`] = isPred ? null : useVal;
      row[`${key}_dash`]  = isPred ? useVal : null;
    });
    return row;
  });

  const legendPayload = LINE_CONFIG.map(({ key, label, color }) => ({
    value: label,
    type: 'line' as const,
    id: key,
    color,
    dataKey: key,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={480}>
        <LineChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis
            dataKey="date"
            tickFormatter={d => d.slice(5)}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#2a2d3a' }}
            tickLine={false}
            interval={Math.max(1, Math.floor(data.length / 12))}
          />
          <YAxis
            scale={yScale}
            tickFormatter={formatYAxis}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#2a2d3a' }}
            tickLine={false}
            domain={['auto', 'auto']}
            allowDataOverflow
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            payload={legendPayload}
            onClick={e => toggleLine(e.dataKey as string)}
            formatter={(value, entry: any) => (
              <span
                className="cursor-pointer text-xs select-none"
                style={{ color: hidden.has(entry.dataKey) ? '#3a3d4a' : entry.color }}
              >
                {value}
              </span>
            )}
          />
          {/* 100% 回本线 */}
          <ReferenceLine
            y={100}
            stroke="#ef4444"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: '100%回本线', fill: '#ef4444', fontSize: 11, position: 'insideRight' }}
          />
          {/* 每条线渲染两遍：实线 + 虚线 */}
          {LINE_CONFIG.map(({ key, label, color }) => {
            const show = !hidden.has(key);
            return [
              <Line
                key={`${key}_solid`}
                type="monotone"
                dataKey={`${key}_solid`}
                name={label}
                stroke={color}
                strokeWidth={show ? 1.5 : 0}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
                legendType="none"
              />,
              <Line
                key={`${key}_dash`}
                type="monotone"
                dataKey={`${key}_dash`}
                name={`${label} (预测)`}
                stroke={color}
                strokeWidth={show ? 1.5 : 0}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
                legendType="none"
              />,
            ];
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
