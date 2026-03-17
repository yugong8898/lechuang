import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
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
  // 格式: "2025-04-13(日)" => "2025-04-13"
  return raw.replace(/\(.*?\)/, '').trim();
}

export async function importCsv(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const content = req.file.buffer.toString('utf-8');
    const rows: CsvRow[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const client = await pool.connect();
    let inserted = 0;
    let skipped = 0;

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

        const sql = `
          INSERT INTO ad_roi_records (
            date, app, bid_type, country, channel, installs,
            roi_day0, roi_day1, roi_day3, roi_day7, roi_day14, roi_day30, roi_day60, roi_day90,
            insufficient_day1, insufficient_day3, insufficient_day7,
            insufficient_day14, insufficient_day30, insufficient_day60, insufficient_day90
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
          ON CONFLICT (date, app, bid_type, country, channel) DO UPDATE SET
            installs = EXCLUDED.installs,
            roi_day0 = EXCLUDED.roi_day0,
            roi_day1 = EXCLUDED.roi_day1,
            roi_day3 = EXCLUDED.roi_day3,
            roi_day7 = EXCLUDED.roi_day7,
            roi_day14 = EXCLUDED.roi_day14,
            roi_day30 = EXCLUDED.roi_day30,
            roi_day60 = EXCLUDED.roi_day60,
            roi_day90 = EXCLUDED.roi_day90,
            insufficient_day1 = EXCLUDED.insufficient_day1,
            insufficient_day3 = EXCLUDED.insufficient_day3,
            insufficient_day7 = EXCLUDED.insufficient_day7,
            insufficient_day14 = EXCLUDED.insufficient_day14,
            insufficient_day30 = EXCLUDED.insufficient_day30,
            insufficient_day60 = EXCLUDED.insufficient_day60,
            insufficient_day90 = EXCLUDED.insufficient_day90,
            updated_at = NOW()
        `;

        const result = await client.query(sql, values);
        if (result.rowCount && result.rowCount > 0) inserted++;
        else skipped++;
      }

      await client.query('COMMIT');
      res.json({ success: true, inserted, skipped, total: rows.length });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import failed', detail: String(err) });
  }
}
