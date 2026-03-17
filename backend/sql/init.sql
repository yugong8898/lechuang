-- 广告 ROI 数据分析系统 - 数据库初始化脚本

CREATE DATABASE IF NOT EXISTS roi_dashboard;

\c roi_dashboard;

-- 主数据表
CREATE TABLE IF NOT EXISTS ad_roi_records (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  app             VARCHAR(20) NOT NULL,
  bid_type        VARCHAR(20) NOT NULL,
  country         VARCHAR(50) NOT NULL,
  channel         VARCHAR(50) NOT NULL DEFAULT 'Apple',
  installs        INT NOT NULL DEFAULT 0,

  -- ROI 数值字段（单位：百分比，如 6.79 表示 6.79%）
  roi_day0        DECIMAL(10, 4) DEFAULT NULL,
  roi_day1        DECIMAL(10, 4) DEFAULT NULL,
  roi_day3        DECIMAL(10, 4) DEFAULT NULL,
  roi_day7        DECIMAL(10, 4) DEFAULT NULL,
  roi_day14       DECIMAL(10, 4) DEFAULT NULL,
  roi_day30       DECIMAL(10, 4) DEFAULT NULL,
  roi_day60       DECIMAL(10, 4) DEFAULT NULL,
  roi_day90       DECIMAL(10, 4) DEFAULT NULL,

  -- 日期不足标识（true = 日期不足导致的 0%，false = 真实数据）
  insufficient_day1   BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day3   BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day7   BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day14  BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day30  BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day60  BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day90  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, app, bid_type, country, channel)
);

-- 索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_roi_date ON ad_roi_records(date);
CREATE INDEX IF NOT EXISTS idx_roi_app ON ad_roi_records(app);
CREATE INDEX IF NOT EXISTS idx_roi_country ON ad_roi_records(country);
CREATE INDEX IF NOT EXISTS idx_roi_app_country_date ON ad_roi_records(app, country, date);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ad_roi_records_updated_at
  BEFORE UPDATE ON ad_roi_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
