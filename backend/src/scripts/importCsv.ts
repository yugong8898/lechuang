/**
 * 命令行 CSV 导入脚本
 * 用法: ts-node src/scripts/importCsv.ts [csv文件路径]
 * 示例: ts-node src/scripts/importCsv.ts ../../app_roi_data.csv
 */
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { pool } from '../models/db';
import { parseRoi, isInsufficient } from '../utils/roiHelpers';

interface CsvRow {
  '日期': string;
  'app': string;
  '出价类型': string;
  '国家地区': string;
  '应用安装.总次数': string;
  '当日ROI': string;
  '1日ROI': string;
  '3日ROI': string;
  '7日ROI': string;
  '14日ROI': string;
  '30日ROI': string;
  '60日ROI': string;
  '90日ROI': string;
}

function parseDate(raw: string): string {
  return raw.replace(/\(.*?\)/, '').trim();
}

async function main() {
  const csvPath = process.argv[2] || path.resolve(__dirname, '../../../app_roi_data.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ 文件不存在: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📂 读取文件: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows: CsvRow[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📊 共解析 ${rows.length} 条记录，开始导入...`);

  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;

  try {
    await client.query('BEGIN');

    for (const row of rows) {
      const dateStr = parseDate(row['日期']);
      const recordDate = new Date(dateStr);

      const values = [
        dateStr,
        row['app']?.trim(),
        row['出价类型']?.trim(),
        row['国家地区']?.trim(),
        'Apple',
        parseInt(row['应用安装.总次数'] || '0'),
        parseRoi(row['当日ROI']),
        parseRoi(row['1日ROI']),
        parseRoi(row['3日ROI']),
        parseRoi(row['7日ROI']),
        parseRoi(row['14日ROI']),
        parseRoi(row['30日ROI']),
        parseRoi(row['60日ROI']),
        parseRoi(row['90日ROI']),
        isInsufficient(recordDate, 1),
        isInsufficient(recordDate, 3),
        isInsufficient(recordDate, 7),
        isInsufficient(recordDate, 14),
        isInsufficient(recordDate, 30),
        isInsufficient(recordDate, 60),
        isInsufficient(recordDate, 90),
      ];

      const result = await client.query(`
        INSERT INTO ad_roi_records (
          date, app, bid_type, country, channel, installs,
          roi_day0, roi_day1, roi_day3, roi_day7, roi_day14, roi_day30, roi_day60, roi_day90,
          insufficient_day1, insufficient_day3, insufficient_day7,
          insufficient_day14, insufficient_day30, insufficient_day60, insufficient_day90
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        ON CONFLICT (date, app, bid_type, country, channel) DO UPDATE SET
          installs = EXCLUDED.installs,
          roi_day0 = EXCLUDED.roi_day0, roi_day1 = EXCLUDED.roi_day1,
          roi_day3 = EXCLUDED.roi_day3, roi_day7 = EXCLUDED.roi_day7,
          roi_day14 = EXCLUDED.roi_day14, roi_day30 = EXCLUDED.roi_day30,
          roi_day60 = EXCLUDED.roi_day60, roi_day90 = EXCLUDED.roi_day90,
          insufficient_day1 = EXCLUDED.insufficient_day1,
          insufficient_day3 = EXCLUDED.insufficient_day3,
          insufficient_day7 = EXCLUDED.insufficient_day7,
          insufficient_day14 = EXCLUDED.insufficient_day14,
          insufficient_day30 = EXCLUDED.insufficient_day30,
          insufficient_day60 = EXCLUDED.insufficient_day60,
          insufficient_day90 = EXCLUDED.insufficient_day90,
          updated_at = NOW()
      `, values);

      if ((result as any).command === 'INSERT') inserted++;
      else updated++;
    }

    await client.query('COMMIT');
    console.log(`✅ 导入完成：新增 ${inserted} 条，更新 ${updated} 条，共 ${rows.length} 条`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ 导入失败，已回滚:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
