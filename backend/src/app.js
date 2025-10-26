/**
 * 主应用程序
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const { connectDB } = require('./config/database');
const config = require('./config');
const routes = require('./routes');

const app = express();

// 中间件
app.use(cors(config.cors));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API路由
app.use(config.api.prefix, routes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '农产品市场预测与大数据分析系统API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: `${config.api.prefix}/health`,
      prices: `${config.api.prefix}/prices`,
      analysis: `${config.api.prefix}/analysis`,
      statistics: `${config.api.prefix}/statistics`
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.path
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(config.server.env === 'development' && { stack: err.stack })
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 启动服务器
    app.listen(config.server.port, () => {
      console.log('\n' + '='.repeat(60));
      console.log('  农产品市场预测与大数据分析系统 - 后端服务');
      console.log('='.repeat(60));
      console.log(`  环境: ${config.server.env}`);
      console.log(`  端口: ${config.server.port}`);
      console.log(`  接口: http://localhost:${config.server.port}${config.api.prefix}`);
      console.log('='.repeat(60) + '\n');
      console.log('可用接口：');
      console.log(`  GET  ${config.api.prefix}/health              - 健康检查`);
      console.log(`  GET  ${config.api.prefix}/prices/latest       - 最新价格`);
      console.log(`  GET  ${config.api.prefix}/prices/list         - 价格列表`);
      console.log(`  GET  ${config.api.prefix}/prices/ranking      - 价格排行`);
      console.log(`  GET  ${config.api.prefix}/analysis/prediction - 价格预测`);
      console.log(`  GET  ${config.api.prefix}/statistics/overview - 统计概览`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n收到 SIGINT 信号，正在关闭...');
  process.exit(0);
});

// 启动
startServer();

module.exports = app;

