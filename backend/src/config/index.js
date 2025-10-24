/**
 * 全局配置
 */

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // API配置
  api: {
    prefix: process.env.API_PREFIX || '/api',
    version: 'v1',
  },

  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  // 预测算法配置
  prediction: {
    // 移动平均天数
    maDays: [7, 15, 30],
    // 预测未来天数
    forecastDays: 30,
  }
};

