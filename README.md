# 广告 ROI 数据分析系统

> 基于真实移动应用广告投放数据的全栈数据可视化系统

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + React 18 + TypeScript + Tailwind CSS + Recharts |
| 后端 | Node.js 18 + Express.js + TypeScript |
| 数据库 | PostgreSQL 13+ |

## 项目结构

```
lechuang/
├── frontend/          # Next.js 前端
│   └── src/
│       ├── app/       # 页面
│       ├── components/ # UI 组件
│       ├── hooks/     # 自定义 hooks
│       ├── lib/       # API 客户端、工具函数
│       └── types/     # TypeScript 类型
├── backend/           # Express 后端
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── utils/
│   │   └── scripts/
│   └── sql/           # 数据库初始化脚本
└── app_roi_data.csv   # 原始数据文件
```

## 快速启动

### 1. 环境要求

- Node.js 18+
- PostgreSQL 13+
- npm 10+

### 2. 数据库初始化

```bash
psql -U postgres -f backend/sql/init.sql
```

### 3. 后端启动

```bash
cd backend
cp .env.example .env
# 编辑 .env 填写数据库连接信息
npm install
npm run dev
```

后端运行在 http://localhost:3001

### 4. 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:3000

### 5. 导入数据

打开浏览器访问 http://localhost:3000，点击右上角「导入 CSV」按钮，选择 `app_roi_data.csv` 文件。

## API 接口

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/filters` | 获取筛选项枚举 |
| GET | `/api/roi` | 查询 ROI 数据（支持筛选） |
| POST | `/api/import` | 上传并导入 CSV |
| GET | `/health` | 健康检查 |

### GET /api/roi 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| app | 应用名称 | App-1 |
| country | 国家地区 | 美国 |
| bid_type | 出价类型 | CPI |
| channel | 安装渠道 | Apple |
| start | 开始日期 | 2025-04-13 |
| end | 结束日期 | 2025-07-12 |

## 文档

- [系统设计文档](./DESIGN.md)
- [使用说明](./USER_GUIDE.md)
- [部署文档](./DEPLOYMENT.md)
