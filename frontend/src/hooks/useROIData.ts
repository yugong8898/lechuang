'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchFilters, fetchRoiData } from '@/lib/api';
import { buildChartData } from '@/lib/chartUtils';
import type { Filters, FilterState, RoiRecord, ChartDataPoint, DisplayMode, YAxisScale } from '@/types';

const DEFAULT_FILTERS: Filters = { apps: [], countries: [], bidTypes: [], channels: [] };
const DEFAULT_STATE: FilterState = { app: '', country: '', bid_type: '', channel: '' };

export function useROIData() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_STATE);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('moving_avg');
  const [yScale, setYScale] = useState<YAxisScale>('linear');
  const [records, setRecords] = useState<RoiRecord[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化：加载筛选项
  useEffect(() => {
    fetchFilters()
      .then(setFilters)
      .catch(() => setError('无法连接后端服务，请确认后端已启动'));
  }, []);

  // 筛选条件变化时重新拉数据
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchRoiData(filterState)
      .then(data => {
        setRecords(data);
        setChartData(buildChartData(data, displayMode));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [filterState]);

  // 显示模式切换时重新计算图表数据（不重新请求）
  useEffect(() => {
    setChartData(buildChartData(records, displayMode));
  }, [displayMode, records]);

  const updateFilter = useCallback((partial: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...partial }));
  }, []);

  const refresh = useCallback(() => {
    setFilterState(prev => ({ ...prev }));
  }, []);

  return {
    filters, filterState, displayMode, yScale,
    chartData, loading, error,
    setDisplayMode, setYScale,
    updateFilter, refresh,
  };
}
