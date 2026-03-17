// 数据截止日期
export const CUTOFF_DATE = new Date(process.env.DATA_CUTOFF_DATE || '2025-07-12');

// 各 ROI 维度对应的天数
export const ROI_PERIODS = [
  { key: 'day1',  days: 1  },
  { key: 'day3',  days: 3  },
  { key: 'day7',  days: 7  },
  { key: 'day14', days: 14 },
  { key: 'day30', days: 30 },
  { key: 'day60', days: 60 },
  { key: 'day90', days: 90 },
];

/**
 * 判断某条记录的某个 ROI 周期是否因日期不足而为 0%
 * @param recordDate  记录日期
 * @param periodDays  ROI 统计周期（天）
 */
export function isInsufficient(recordDate: Date, periodDays: number): boolean {
  const diffMs = CUTOFF_DATE.getTime() - recordDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < periodDays;
}

/**
 * 解析 ROI 字符串为数字（去掉 % 号）
 * 例如 "6.79%" => 6.79，"0%" => 0，"" => null
 */
export function parseRoi(raw: string | undefined): number | null {
  if (!raw || raw.trim() === '') return null;
  const cleaned = raw.replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * 计算 7 日移动平均
 */
export function movingAverage(data: (number | null)[], window = 7): (number | null)[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1).filter((v): v is number => v !== null);
    if (slice.length === 0) return null;
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}
