# DEPLOYMENT.md — 部署文档

## 一、环境依赖

| 依赖 | 版本 |
|------|------|
| Node.js | 18.0+ |
| npm | 10.0+ |
| PostgreSQL | 13.0+ |

## 二、本地开发部署

### 1. 克隆项目

```bash
git clone <repo-url>
cd lechuang
```

### 2. 初始化数据库

```bash
# 创建数据库并建表
psql -U postgres -c "CREATE DATABASE roi_dashboard;"
psql -U postgres -d roi_dashboard -f backend/sql/init.sql
```

### 3. 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env`：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roi_dashboard
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=development
DATA_CUTOFF_DATE=2025-07-12
```

### 4. 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd ../frontend && npm install
```

### 5. 启动服务

**终端 1 — 后端：**
```bash
cd backend
npm run dev
# 运行在 http://localhost:3001
```

**终端 2 — 前端：**
```bash
cd frontend
npm run dev
# 运行在 http://localhost:3000
```

### 6. 导入数据

```bash
cd backend
npm run import
# 默认读取 ../app_roi_data.csv
```

---

## 三、生产环境部署

### 后端构建

```bash
cd backend
npm run build
NODE_ENV=production node dist/index.js
```

### 前端构建

```bash
cd frontend
npm run build
npm run start
```

### 环境变量（生产）

```env
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=roi_dashboard
DB_USER=roi_user
DB_PASSWORD=strong_password
PORT=3001
```

---

## 四、数据库维护

### 重置数据
```bash
psql -U postgres -d roi_dashboard -c "TRUNCATE ad_roi_records RESTART IDENTITY;"
```

### 查看记录数
```bash
psql -U postgres -d roi_dashboard -c "SELECT app, country, COUNT(*) FROM ad_roi_records GROUP BY app, country ORDER BY app;"
```

---

## 五、常见问题

| 问题 | 解决方案 |
|------|----------|
| 后端启动报数据库连接错误 | 检查 `.env` 中数据库配置，确认 PostgreSQL 已启动 |
| 前端页面空白/无数据 | 确认后端在 3001 端口运行，检查浏览器 Network 请求 |
| CSV 导入 403 错误 | 检查 npm registry，改为 `https://registry.npmmirror.com/` |
| 图表不显示 | 先导入 CSV 数据，默认页面无数据时显示提示文字 |
