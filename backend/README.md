# 农产品价格预测与分析系统 - 后端API

基于Node.js + Express + MongoDB的RESTful API服务

## 功能特性

- ✅ 农产品价格数据管理
- ✅ 价格趋势分析
- ✅ 移动平均线计算
- ✅ 价格预测（移动平均、线性回归）
- ✅ 统计分析（概览、产品、月度）
- ✅ 相关性分析
- ✅ 季节性分析

## 技术栈

- **Node.js** 18+
- **Express** 4.x - Web框架
- **MongoDB** 6.x - 数据库
- **Mongoose** 8.x - ODM

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/agri_price_db
API_PREFIX=/api
```

### 3. 启动MongoDB

确保MongoDB服务已启动：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. 初始化数据库

```bash
npm run init-db
```

这会将 `data/agri_price_mock_data.json` 中的数据导入MongoDB。

### 5. 启动服务器

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

服务器将在 `http://localhost:3000` 启动

## API接口文档

### 基础接口

#### 健康检查
```
GET /api/health
```

### 价格相关接口

#### 1. 获取最新价格
```
GET /api/prices/latest?limit=10
```

**参数：**
- `limit` - 返回记录数（默认1）

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-10-24",
      "index_value": 120.72,
      "change": 0.72,
      "products": { ... }
    }
  ]
}
```

#### 2. 获取价格列表（分页）
```
GET /api/prices/list?page=1&limit=20
```

#### 3. 获取指定日期价格
```
GET /api/prices/date/2024-10-24
```

#### 4. 获取日期范围价格
```
GET /api/prices/range?startDate=2024-01-01&endDate=2024-10-24
```

#### 5. 获取价格排行榜
```
GET /api/prices/ranking?type=increase&limit=20&days=30
```

**参数：**
- `type` - increase(涨幅)/decrease(跌幅)
- `limit` - 返回记录数
- `days` - 统计天数

#### 6. 获取产品价格趋势
```
GET /api/prices/product/vegetable/trend?days=30
```

### 分析相关接口

#### 1. 价格预测
```
GET /api/analysis/prediction?days=30&method=ma
```

**参数：**
- `days` - 预测天数（默认30）
- `method` - 预测方法：ma(移动平均)/linear(线性回归)

**响应：**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "date": "2024-10-25",
        "predicted_value": "121.50",
        "confidence": 0.89
      }
    ],
    "historical": [ ... ],
    "metadata": { ... }
  }
}
```

#### 2. 移动平均线
```
GET /api/analysis/moving-average?days=90&periods=7,15,30
```

#### 3. 趋势分析
```
GET /api/analysis/trend?days=365
```

#### 4. 相关性分析
```
GET /api/analysis/correlation?days=90
```

#### 5. 季节性分析
```
GET /api/analysis/seasonality
```

### 统计相关接口

#### 1. 概览统计
```
GET /api/statistics/overview
```

**响应：**
```json
{
  "success": true,
  "data": {
    "totalRecords": 365,
    "indexStats": {
      "current": 120.72,
      "average": "118.50",
      "max": "125.80",
      "min": "110.20"
    },
    "changeStats": {
      "upDays": 183,
      "downDays": 180,
      "upRate": "50.4"
    }
  }
}
```

#### 2. 产品价格统计
```
GET /api/statistics/products?days=30
```

#### 3. 月度统计
```
GET /api/statistics/monthly
```

#### 4. 涨跌统计
```
GET /api/statistics/change-stats?days=90
```

## 项目结构

```
backend/
├── src/
│   ├── app.js              # 主应用程序
│   ├── config/             # 配置文件
│   │   ├── database.js     # 数据库配置
│   │   └── index.js        # 全局配置
│   ├── models/             # 数据模型
│   │   └── Price.js        # 价格模型
│   ├── routes/             # 路由
│   │   ├── index.js
│   │   ├── priceRoutes.js
│   │   ├── analysisRoutes.js
│   │   └── statisticsRoutes.js
│   ├── controllers/        # 控制器
│   │   ├── priceController.js
│   │   ├── analysisController.js
│   │   └── statisticsController.js
│   ├── services/           # 服务层（算法）
│   │   ├── predictionService.js
│   │   └── analysisService.js
│   └── scripts/            # 脚本
│       └── initDatabase.js # 数据库初始化
├── data/                   # 数据文件
│   └── agri_price_mock_data.json
├── package.json
├── .env
└── README.md
```

## 开发说明

### 添加新接口

1. 在 `routes/` 中定义路由
2. 在 `controllers/` 中实现控制器逻辑
3. 如需复杂算法，在 `services/` 中实现

### 数据模型

价格数据模型结构：

```javascript
{
  date: String,           // 日期 YYYY-MM-DD
  title: String,          // 标题
  index_value: Number,    // 价格指数
  basket_index: Number,   // 菜篮子指数
  change: Number,         // 涨跌点数
  products: {             // 产品价格
    vegetable: { name, price, change_percent, unit },
    pork: { ... },
    // ... 更多产品
  }
}
```

## 常见问题

### MongoDB连接失败

确保MongoDB服务已启动，连接字符串正确。

### 数据导入失败

确保 `data/agri_price_mock_data.json` 文件存在。

### 端口被占用

修改 `.env` 文件中的 `PORT` 配置。

## License

MIT








####

✓ MongoDB 连接成功
  数据库: agri_price_db

============================================================
  农产品价格预测与分析系统 - 后端服务
============================================================
  环境: development
  端口: 3000
  接口: http://localhost:3000/api
============================================================

可用接口：
  GET  /api/health              - 健康检查
  GET  /api/prices/latest       - 最新价格
  GET  /api/prices/list         - 价格列表
  GET  /api/prices/ranking      - 价格排行
  GET  /api/analysis/prediction - 价格预测
  GET  /api/statistics/overview - 统计概览
============================================================










####

dashujv/
├── .gitignore                    ✅ 已更新（主项目）
├── backend/
│   ├── .gitignore               ✅ 已更新（后端专用）
│   ├── .env                      ⚠️ 需手动创建（不提交）
│   ├── src/                      ✓ 提交
│   ├── data/                     ✓ 提交
│   ├── generate_mock_data.py     ✓ 提交
│   ├── requirements.txt          ✓ 提交
│   ├── package.json              ✓ 提交
│   └── node_modules/             ✗ 不提交（已忽略）
└── IofTV-Screen-Vue3/
    ├── .gitignore               ✅ 已更新（前端专用）
    ├── src/                      ✓ 提交
    ├── public/                   ✓ 提交
    ├── package.json              ✓ 提交
    ├── vite.config.ts            ✓ 提交
    └── node_modules/             ✗ 不提交（已忽略）





backend/
├── data/
│   ├── agri_price_mock_data.json    ← 供后端使用（格式不变）
│   └── processed_data.csv            ← 新增：预处理数据
│
├── visualizations/                   ← 新增目录
│   ├── price_analysis_matplotlib.png
│   ├── price_trend_pyecharts.html
│   ├── monthly_stats_pyecharts.html
│   └── change_distribution_pyecharts.html
│
└── models/                           ← 新增目录
    ├── best_price_prediction_model.pkl
    ├── model_prediction_comparison.png
    └── model_evaluation_report.txt