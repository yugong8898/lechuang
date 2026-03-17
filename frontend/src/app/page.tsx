'use client';
import dynamic from 'next/dynamic';
import FilterBar from '@/components/FilterBar';
import ImportButton from '@/components/ImportButton';
import { useROIData } from '@/hooks/useROIData';

const ROITrendChart = dynamic(() => import('@/components/Chart/ROITrendChart'), { ssr: false });

export default function HomePage() {
  const {
    filters, filterState, displayMode, yScale,
    chartData, loading, error,
    setDisplayMode, setYScale,
    updateFilter, refresh,
  } = useROIData();

  const appLabel = filterState.app || 'All Apps';

  return (
    <main className="min-h-screen bg-[#0f1117] text-slate-200 p-6">
      {/* 顶部栏 */}
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {filterState.app ? `${filterState.app} - 多时间维度ROI趋势` : '多时间维度ROI趋势'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-400">
              {displayMode === 'moving_avg' ? '(7日移动平均)' : '(原始数据)'}
            </span>
            <span className="text-xs text-slate-500 bg-[#1a1d27] border border-[#2a2d3a] rounded px-2 py-0.5">
              数据范围: 最近90天
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ImportButton onSuccess={refresh} />
        </div>
      </header>

      {/* 筛选器 */}
      <section className="mb-6">
        <FilterBar
          filters={filters}
          state={filterState}
          displayMode={displayMode}
          yScale={yScale}
          onChange={updateFilter}
          onDisplayMode={setDisplayMode}
          onYScale={setYScale}
        />
      </section>

      {/* 图表区域 */}
      <section className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6">
        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-400 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[480px]">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span className="text-sm">加载数据中...</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[480px] text-slate-500 text-sm">
            暂无数据，请先导入 CSV 文件或调整筛选条件
          </div>
        ) : (
          <ROITrendChart data={chartData} yScale={yScale} />
        )}
      </section>

      {/* 底部信息 */}
      <footer className="mt-6 text-xs text-slate-600 text-center">
        广告 ROI 数据分析系统 · 数据截止 2025-07-12
      </footer>
    </main>
  );
}
