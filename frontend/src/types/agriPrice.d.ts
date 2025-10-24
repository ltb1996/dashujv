/**
 * 农产品价格相关类型定义
 */

// 产品价格信息
export interface ProductPrice {
  name: string
  price: number
  change_percent: number
  unit: string
}

// 价格数据
export interface PriceData {
  _id: string
  date: string
  title: string
  url: string
  change: number
  compare_base: string
  index_value: number
  basket_index: number
  products: {
    vegetable?: ProductPrice
    pork?: ProductPrice
    beef?: ProductPrice
    mutton?: ProductPrice
    egg?: ProductPrice
    chicken?: ProductPrice
    fish?: ProductPrice
    apple?: ProductPrice
    banana?: ProductPrice
  }
  event?: string
  createdAt?: string
  updatedAt?: string
}

// API响应基础结构
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  count?: number
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 统计概览数据
export interface StatisticsOverview {
  totalRecords: number
  dateRange: {
    start: string
    end: string
  }
  indexStats: {
    current: number
    average: string
    max: string
    min: string
  }
  changeStats: {
    upDays: number
    downDays: number
    flatDays: number
    upRate: string
    avgChange: string
    maxChange: string
    minChange: string
  }
}

// 产品统计数据
export interface ProductStatistics {
  [key: string]: {
    name: string
    current: number
    average: string
    max: string
    min: string
    unit: string
  }
}

// 预测数据
export interface PredictionData {
  predictions: Array<{
    date: string
    predicted_value: string
    confidence: number
    method: string
  }>
  historical: Array<{
    date: string
    actual_value: number
  }>
  metadata: {
    method: string
    [key: string]: any
  }
}

// 移动平均数据
export interface MovingAverageData {
  data: Array<{
    date: string
    actual: number
    ma7?: string
    ma15?: string
    ma30?: string
  }>
  periods: number[]
  count: number
}

// 趋势分析数据
export interface TrendAnalysis {
  trend: string
  slope: string
  intercept: string
  rSquared: string
  totalChange: string
  percentChange: string
  startValue: string
  endValue: string
  period: {
    start: string
    end: string
    days: number
  }
}

// 月度统计数据
export interface MonthlyStatistics {
  month: string
  avgIndex: string
  avgChange: string
  maxIndex: string
  minIndex: string
  upDays: number
  downDays: number
  upRate: string
}

// 涨跌统计数据
export interface ChangeStatistics {
  distribution: {
    bigUp: number
    smallUp: number
    flat: number
    smallDown: number
    bigDown: number
  }
  total: number
  average: string
  max: string
  min: string
}

