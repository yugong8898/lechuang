export interface RoiRecord {
  id: number;
  date: string;
  app: string;
  bid_type: string;
  country: string;
  channel: string;
  installs: number;
  roi_day0: number | null;
  roi_day1: number | null;
  roi_day3: number | null;
  roi_day7: number | null;
  roi_day14: number | null;
  roi_day30: number | null;
  roi_day60: number | null;
  roi_day90: number | null;
  insufficient_day1: boolean;
  insufficient_day3: boolean;
  insufficient_day7: boolean;
  insufficient_day14: boolean;
  insufficient_day30: boolean;
  insufficient_day60: boolean;
  insufficient_day90: boolean;
}

export interface Filters {
  apps: string[];
  countries: string[];
  bidTypes: string[];
  channels: string[];
}

export interface FilterState {
  app: string;
  country: string;
  bid_type: string;
  channel: string;
}

export type DisplayMode = 'moving_avg' | 'raw';
export type YAxisScale = 'linear' | 'log';

export interface ChartDataPoint {
  date: string;
  day0: number | null;
  day1: number | null;
  day3: number | null;
  day7: number | null;
  day14: number | null;
  day30: number | null;
  day60: number | null;
  day90: number | null;
  // 是否预测（日期不足）
  pred_day1: boolean;
  pred_day3: boolean;
  pred_day7: boolean;
  pred_day14: boolean;
  pred_day30: boolean;
  pred_day60: boolean;
  pred_day90: boolean;
}
