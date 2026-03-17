'use client';
import React from 'react';
import { Filters, FilterState, DisplayMode, YAxisScale } from '@/types';

interface Props {
  filters: Filters;
  state: FilterState;
  displayMode: DisplayMode;
  yScale: YAxisScale;
  onChange: (s: Partial<FilterState>) => void;
  onDisplayMode: (m: DisplayMode) => void;
  onYScale: (s: YAxisScale) => void;
}

const selectCls =
  'bg-[#1a1d27] border border-[#2a2d3a] text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px]';

const RadioGroup = ({
  label, name, options, value, onChange,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-4">
    <span className="text-xs text-slate-400 whitespace-nowrap">{label}</span>
    {options.map(opt => (
      <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-300">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="accent-blue-500"
        />
        {opt.label}
      </label>
    ))}
  </div>
);

export default function FilterBar({
  filters, state, displayMode, yScale, onChange, onDisplayMode, onYScale,
}: Props) {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 space-y-3">
      {/* 第一行：下拉筛选 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">用户安装渠道</label>
          <select
            className={selectCls}
            value={state.channel}
            onChange={e => onChange({ channel: e.target.value })}
          >
            <option value="">全部</option>
            {filters.channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">出价类型</label>
          <select
            className={selectCls}
            value={state.bid_type}
            onChange={e => onChange({ bid_type: e.target.value })}
          >
            <option value="">全部</option>
            {filters.bidTypes.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">国家地区</label>
          <select
            className={selectCls}
            value={state.country}
            onChange={e => onChange({ country: e.target.value })}
          >
            <option value="">全部</option>
            {filters.countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">APP</label>
          <select
            className={selectCls}
            value={state.app}
            onChange={e => onChange({ app: e.target.value })}
          >
            <option value="">全部</option>
            {filters.apps.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      {/* 第二行：单选控制 */}
      <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-[#2a2d3a]">
        <RadioGroup
          label="数据显示模式："
          name="displayMode"
          value={displayMode}
          options={[
            { label: '显示移动平均值', value: 'moving_avg' },
            { label: '显示原始数据', value: 'raw' },
          ]}
          onChange={v => onDisplayMode(v as DisplayMode)}
        />
        <RadioGroup
          label="Y轴刻度："
          name="yScale"
          value={yScale}
          options={[
            { label: '线性刻度', value: 'linear' },
            { label: '对数刻度', value: 'log' },
          ]}
          onChange={v => onYScale(v as YAxisScale)}
        />
      </div>
    </div>
  );
}
