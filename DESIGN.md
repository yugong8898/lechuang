# DESIGN.md — 系统设计文档

## 一、整体架构

```
Browser (CSR)  Next.js 14 + React 18 + Recharts
http://localhost:3000
    │ /api/* proxy rewrite
    ▼
Express.js + TypeScript  http://localhost:3001
Routes → Controllers → pg Pool
    │ SQL
    ▼
PostgreSQL 13+  roi_dashboard
```

## 二、数据库表结构

```sql
CREATE TABLE ad_roi_records (
  id               SERIAL PRIMARY KEY,
  date             DATE         NOT NULL,
  app              VARCHAR(20)  NOT NULL,
  bid_type         VARCHAR(20)  NOT NULL,
  country          VARCHAR(50)  NOT NULL,
  channel          VARCHAR(50)  NOT NULL DEFAULT 'Apple',
  installs         INT          NOT NULL DEFAULT 0,
  roi_day0         DECIMAL(10,4),
  roi_day1         DECIMAL(10,4),
  roi_day3         DECIMAL(10,4),
  roi_day7         DECIMAL(10,4),
  roi_day14        DECIMAL(10,4),
  roi_day30        DECIMAL(10,4),
  roi_day60        DECIMAL(10,4),
  roi_day90        DECIMAL(10,4),
  insufficient_day1   BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day3   BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day7   BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day14  BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day30  BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day60  BOOLEAN NOT NULL DEFAULT FALSE,
  insufficient_day90  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, app, bid_type, country, channel)
);
```

### 0% 数据区分策略

| roi_dayN | insufficient_dayN | 含义 |
|----------|-------------------|------|
| 0 | false | 真实 0% |
| 0 | true  | 日期不足（距截止 < N 天）|

CUTOFF_DATE = 2025-07-12

## 三、API 规范

| Method | Path | 说明 |
|--------|------|------|
| GET | /api/filters | 获取筛选枚举 |
| GET | /api/roi | 查询数据，支持 app/country/bid_type/channel/start/end |
| POST | /api/import | multipart/form-data 上传 CSV |
| GET | /health | 健康检查 |

## 四、前端组件结构

```
src/
├── app/layout.tsx          # 根布局
├── app/page.tsx            # 主页面
├── components/
│   ├── FilterBar/index.tsx # 筛选控制区
│   ├── Chart/ROITrendChart.tsx  # 核心图表
│   └── ImportButton.tsx    # CSV 上传
├── hooks/useROIData.ts     # 数据获取与状态
├── lib/api.ts              # axios 封装
├── lib/chartUtils.ts       # 数据转换与移动平均
└── types/index.ts          # TypeScript 类型
```

## 五、数据流

```
CSV → POST /api/import
  → parse() + isInsufficient()
  → INSERT ad_roi_records

GET /api/roi?app=App-1
  → SQL query
  → RoiRecord[]

useROIData → buildChartData() → movingAvg()
  → ChartDataPoint[]

ROITrendChart
  → solid lines (real)
  → dashed lines (insufficient)
  → ReferenceLine y=100
```
