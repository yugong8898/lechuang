import { RoiRecord, ChartDataPoint } from '@/types';

/**
 * 计算 N 日移动平均
 */
function movingAvg(arr: (number | null)[], window = 7): (number | null)[] {
  return arr.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1).filter((v): v is number => v !== null);
    if (slice.length === 0) return null;
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

const ROI_DB_KEYS: (keyof RoiRecord)[] = [
  'roi_day0', 'roi_day1', 'roi_day3', 'roi_day7',
  'roi_day14', 'roi_day30', 'roi_day60', 'roi_day90',
];

const INSUFF_DB_KEYS: (keyof RoiRecord | null)[] = [
  null, // day0 无日期不足概念
  'insufficient_day1',
  'insufficient_day3',
  'insufficient_day7',
  'insufficient_day14',
  'insufficient_day30',
  'insufficient_day60',
  'insufficient_day90',
];

/**
 * 将后端 RoiRecord[] 转换为图表数据点
 */
export function buildChartData(
  records: RoiRecord[],
  mode: 'moving_avg' | 'raw'
): ChartDataPoint[] {
  if (records.length === 0) return [];

  // 提取各维度原始数据列
  const rawArrays = ROI_DB_KEYS.map(k => records.map(r => r[k] as number | null));

  // 按模式处理（day0 不做移动平均，保持原始）
  const processed = rawArrays.map((arr, i) =>
    mode === 'moving_avg' && i > 0 ? movingAvg(arr) : arr
  );

  return records.map((r, i) => ({
    date: r.date.slice(0, 10),
    day0:  processed[0][i],
    day1:  processed[1][i],
    day3:  processed[2][i],
    day7:  processed[3][i],
    day14: processed[4][i],
    day30: processed[5][i],
    day60: processed[6][i],
    day90: processed[7][i],
    pred_day1:  r.insufficient_day1,
    pred_day3:  r.insufficient_day3,
    pred_day7:  r.insufficient_day7,
    pred_day14: r.insufficient_day14,
    pred_day30: r.insufficient_day30,
    pred_day60: r.insufficient_day60,
    pred_day90: r.insufficient_day90,
  }));
}
