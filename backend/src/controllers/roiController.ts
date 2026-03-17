import { Request, Response } from 'express';
import { query } from '../models/db';

export async function getFilters(_req: Request, res: Response): Promise<void> {
  try {
    const [apps, countries, bidTypes, channels] = await Promise.all([
      query<{ app: string }>('SELECT DISTINCT app FROM ad_roi_records ORDER BY app'),
      query<{ country: string }>('SELECT DISTINCT country FROM ad_roi_records ORDER BY country'),
      query<{ bid_type: string }>('SELECT DISTINCT bid_type FROM ad_roi_records ORDER BY bid_type'),
      query<{ channel: string }>('SELECT DISTINCT channel FROM ad_roi_records ORDER BY channel'),
    ]);
    res.json({
      apps: apps.map((r) => r.app),
      countries: countries.map((r) => r.country),
      bidTypes: bidTypes.map((r) => r.bid_type),
      channels: channels.map((r) => r.channel),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
}

export async function getRoiData(req: Request, res: Response): Promise<void> {
  try {
    const { app, country, bid_type, channel, start, end } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (app) { conditions.push(`app = $${idx++}`); params.push(app); }
    if (country) { conditions.push(`country = $${idx++}`); params.push(country); }
    if (bid_type) { conditions.push(`bid_type = $${idx++}`); params.push(bid_type); }
    if (channel) { conditions.push(`channel = $${idx++}`); params.push(channel); }
    if (start) { conditions.push(`date >= $${idx++}`); params.push(start); }
    if (end) { conditions.push(`date <= $${idx++}`); params.push(end); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        id, date, app, bid_type, country, channel, installs,
        roi_day0, roi_day1, roi_day3, roi_day7, roi_day14, roi_day30, roi_day60, roi_day90,
        insufficient_day1, insufficient_day3, insufficient_day7,
        insufficient_day14, insufficient_day30, insufficient_day60, insufficient_day90
      FROM ad_roi_records
      ${where}
      ORDER BY date ASC
    `;

    const rows = await query(sql, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ROI data' });
  }
}
