/**
 * 分析控制器
 */

const Price = require('../models/Price');
const predictionService = require('../services/predictionService');
const analysisService = require('../services/analysisService');

/**
 * 价格预测
 */
exports.getPrediction = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const method = req.query.method || 'ma'; // ma: 移动平均, linear: 线性回归
    
    // 获取历史数据
    const historicalData = await Price.find()
      .sort({ date: -1 })
      .limit(60)
      .select('date index_value');
    
    if (historicalData.length < 10) {
      return res.status(400).json({
        success: false,
        message: '历史数据不足，无法预测'
      });
    }

    // 执行预测
    const prediction = await predictionService.predict(
      historicalData.reverse(),
      days,
      method
    );

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '价格预测失败',
      error: error.message
    });
  }
};

/**
 * 移动平均线
 */
exports.getMovingAverage = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const periods = req.query.periods ? 
      req.query.periods.split(',').map(Number) : 
      [7, 15, 30];

    const prices = await Price.find()
      .sort({ date: -1 })
      .limit(days)
      .select('date index_value');

    const maData = analysisService.calculateMovingAverage(
      prices.reverse(),
      periods
    );

    res.json({
      success: true,
      data: maData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '计算移动平均线失败',
      error: error.message
    });
  }
};

/**
 * 趋势分析
 */
exports.getTrendAnalysis = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 365;

    const prices = await Price.find()
      .sort({ date: -1 })
      .limit(days)
      .select('date index_value change');

    const trendData = analysisService.analyzeTrend(prices.reverse());

    res.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '趋势分析失败',
      error: error.message
    });
  }
};

/**
 * 相关性分析（产品间价格相关性）
 */
exports.getCorrelation = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;

    const prices = await Price.find()
      .sort({ date: -1 })
      .limit(days)
      .select('date products');

    const correlation = analysisService.calculateCorrelation(prices);

    res.json({
      success: true,
      data: correlation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '相关性分析失败',
      error: error.message
    });
  }
};

/**
 * 季节性分析
 */
exports.getSeasonality = async (req, res) => {
  try {
    const prices = await Price.find()
      .sort({ date: 1 })
      .select('date index_value');

    const seasonality = analysisService.analyzeSeasonality(prices);

    res.json({
      success: true,
      data: seasonality
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '季节性分析失败',
      error: error.message
    });
  }
};

