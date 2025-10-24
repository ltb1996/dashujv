/**
 * 分析相关路由
 */

const express = require('express');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// 价格预测
router.get('/prediction', analysisController.getPrediction);

// 移动平均线
router.get('/moving-average', analysisController.getMovingAverage);

// 趋势分析
router.get('/trend', analysisController.getTrendAnalysis);

// 相关性分析（产品间价格相关性）
router.get('/correlation', analysisController.getCorrelation);

// 季节性分析
router.get('/seasonality', analysisController.getSeasonality);

module.exports = router;

