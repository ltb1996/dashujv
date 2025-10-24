/**
 * 农产品价格API服务
 */

import { GET } from './api'
import { API_ENDPOINTS } from '@/config/api.config'

/**
 * 获取最新价格数据
 */
export const getLatestPrices = (limit: number = 1) => {
  return GET(API_ENDPOINTS.PRICES_LATEST, { limit })
}

/**
 * 获取价格列表（分页）
 */
export const getPricesList = (page: number = 1, limit: number = 20) => {
  return GET(API_ENDPOINTS.PRICES_LIST, { page, limit })
}

/**
 * 获取指定日期的价格
 */
export const getPriceByDate = (date: string) => {
  return GET(`${API_ENDPOINTS.PRICES_DATE}/${date}`, {})
}

/**
 * 获取日期范围内的价格
 */
export const getPricesByDateRange = (startDate: string, endDate: string) => {
  return GET(API_ENDPOINTS.PRICES_RANGE, { startDate, endDate })
}

/**
 * 获取价格排行榜
 */
export const getPricesRanking = (type: 'increase' | 'decrease' = 'increase', limit: number = 20, days: number = 30) => {
  return GET(API_ENDPOINTS.PRICES_RANKING, { type, limit, days })
}

/**
 * 获取产品价格趋势
 */
export const getProductTrend = (productName: string, days: number = 30) => {
  return GET(`${API_ENDPOINTS.PRICES_PRODUCT_TREND}/${productName}/trend`, { days })
}

/**
 * 获取价格预测
 */
export const getPricePrediction = (days: number = 30, method: 'ma' | 'linear' = 'ma') => {
  return GET(API_ENDPOINTS.ANALYSIS_PREDICTION, { days, method })
}

/**
 * 获取移动平均线
 */
export const getMovingAverage = (days: number = 90, periods: string = '7,15,30') => {
  return GET(API_ENDPOINTS.ANALYSIS_MA, { days, periods })
}

/**
 * 获取趋势分析
 */
export const getTrendAnalysis = (days: number = 365) => {
  return GET(API_ENDPOINTS.ANALYSIS_TREND, { days })
}

/**
 * 获取相关性分析
 */
export const getCorrelationAnalysis = (days: number = 90) => {
  return GET(API_ENDPOINTS.ANALYSIS_CORRELATION, { days })
}

/**
 * 获取季节性分析
 */
export const getSeasonalityAnalysis = () => {
  return GET(API_ENDPOINTS.ANALYSIS_SEASONALITY, {})
}

/**
 * 获取概览统计
 */
export const getStatisticsOverview = () => {
  return GET(API_ENDPOINTS.STATISTICS_OVERVIEW, {})
}

/**
 * 获取产品价格统计
 */
export const getProductStatistics = (days: number = 30) => {
  return GET(API_ENDPOINTS.STATISTICS_PRODUCTS, { days })
}

/**
 * 获取月度统计
 */
export const getMonthlyStatistics = () => {
  return GET(API_ENDPOINTS.STATISTICS_MONTHLY, {})
}

/**
 * 获取涨跌统计
 */
export const getChangeStatistics = (days: number = 90) => {
  return GET(API_ENDPOINTS.STATISTICS_CHANGE, { days })
}

