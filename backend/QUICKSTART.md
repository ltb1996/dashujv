# 快速启动指南

## 第一步：安装依赖

在 `backend` 目录下运行：

```bash
npm install
```

需要安装的包：
- express - Web框架
- mongoose - MongoDB ODM
- cors - 跨域支持
- morgan - 日志中间件
- compression - 压缩中间件
- dotenv - 环境变量管理

## 第二步：配置环境变量

在 `backend` 目录创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/agri_price_db
API_PREFIX=/api
```

## 第三步：启动MongoDB

### Windows:
```bash
net start MongoDB
```

### macOS/Linux:
```bash
sudo systemctl start mongod
```

### 使用Docker（推荐）:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

## 第四步：初始化数据库

运行数据导入脚本：

```bash
npm run init-db
```

这会：
1. 连接MongoDB
2. 清空现有数据
3. 导入 `data/agri_price_mock_data.json` 中的365天数据
4. 创建索引

预期输出：
```
============================================================
数据库初始化脚本
============================================================

读取数据文件: D:\...\backend\data\agri_price_mock_data.json
数据文件信息:
  总记录数: 365
  日期范围: 2023-10-26 至 2024-10-24
  生成时间: 2025-10-24 17:49:44

清空现有数据...
✓ 已清空

开始导入数据...
  进度: 100.0% (365/365)

✓ 数据导入成功！

验证导入数据...
  数据库记录数: 365
  最新日期: 2024-10-24
  最早日期: 2023-10-26
  最新指数: 120.72

创建索引...
✓ 索引创建完成

============================================================
数据库初始化完成！
============================================================
```

## 第五步：启动服务器

```bash
npm start
```

预期输出：
```
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
```

## 测试接口

### 1. 健康检查
```bash
curl http://localhost:3000/api/health
```

### 2. 获取最新价格
```bash
curl http://localhost:3000/api/prices/latest
```

### 3. 获取统计概览
```bash
curl http://localhost:3000/api/statistics/overview
```

### 4. 获取价格预测
```bash
curl http://localhost:3000/api/analysis/prediction?days=7
```

### 5. 在浏览器测试

直接访问：
- http://localhost:3000
- http://localhost:3000/api/health
- http://localhost:3000/api/statistics/overview

## 常见问题

### 1. MongoDB连接失败

**错误：** `MongoDB 连接失败: connect ECONNREFUSED 127.0.0.1:27017`

**解决方案：**
- 确保MongoDB服务已启动
- 检查 `.env` 中的 `MONGODB_URI` 是否正确
- 尝试使用 `mongodb://127.0.0.1:27017/agri_price_db`

### 2. 端口被占用

**错误：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案：**
- 修改 `.env` 中的 `PORT` 为其他端口（如 3001）
- 或关闭占用3000端口的程序

### 3. 数据文件不存在

**错误：** `数据文件不存在！请先运行 generate_mock_data.py`

**解决方案：**
- 确保已运行 Python脚本生成数据
- 检查 `backend/data/agri_price_mock_data.json` 是否存在

### 4. npm install 失败

**解决方案：**
- 使用国内镜像：`npm install --registry=https://registry.npmmirror.com`
- 清除缓存：`npm cache clean --force`
- 删除 `node_modules` 重新安装

## 开发模式

使用 nodemon 自动重启（需要先安装依赖）：

```bash
npm run dev
```

修改代码后服务器会自动重启。

## 下一步

后端服务启动成功后，可以：

1. **测试API接口** - 使用Postman或curl测试各个接口
2. **开发前端** - 在前端项目中调用这些API
3. **查看文档** - 阅读 `README.md` 了解完整API文档

## 完整文件清单

确保以下文件都已创建：

```
backend/
├── src/
│   ├── app.js                      ✓
│   ├── config/
│   │   ├── database.js             ✓
│   │   └── index.js                ✓
│   ├── models/
│   │   └── Price.js                ✓
│   ├── routes/
│   │   ├── index.js                ✓
│   │   ├── priceRoutes.js          ✓
│   │   ├── analysisRoutes.js       ✓
│   │   └── statisticsRoutes.js     ✓
│   ├── controllers/
│   │   ├── priceController.js      ✓
│   │   ├── analysisController.js   ✓
│   │   └── statisticsController.js ✓
│   ├── services/
│   │   ├── predictionService.js    ✓
│   │   └── analysisService.js      ✓
│   └── scripts/
│       └── initDatabase.js         ✓
├── data/
│   └── agri_price_mock_data.json   ✓
├── package.json                     ✓
├── .env                             (需手动创建)
├── .gitignore                       ✓
├── README.md                        ✓
└── QUICKSTART.md                    ✓
```

