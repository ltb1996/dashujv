/**
 * API配置
 */

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// API端点
export const API_ENDPOINTS = {
  // 价格相关
  PRICES_LATEST: '/prices/latest',
  PRICES_LIST: '/prices/list',
  PRICES_DATE: '/prices/date',
  PRICES_RANGE: '/prices/range',
  PRICES_RANKING: '/prices/ranking',
  PRICES_PRODUCT_TREND: '/prices/product',
  
  // 分析相关
  ANALYSIS_PREDICTION: '/analysis/prediction',
  ANALYSIS_MA: '/analysis/moving-average',
  ANALYSIS_TREND: '/analysis/trend',
  ANALYSIS_CORRELATION: '/analysis/correlation',
  ANALYSIS_SEASONALITY: '/analysis/seasonality',
  
  // 统计相关
  STATISTICS_OVERVIEW: '/statistics/overview',
  STATISTICS_PRODUCTS: '/statistics/products',
  STATISTICS_MONTHLY: '/statistics/monthly',
  STATISTICS_CHANGE: '/statistics/change-stats'
}

// 请求超时时间
export const REQUEST_TIMEOUT = 10000

// 是否使用Mock数据
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

