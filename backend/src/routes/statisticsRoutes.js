/**
 * 统计相关路由
 */

const express = require('express');
const statisticsController = require('../controllers/statisticsController');

const router = express.Router();

// 概览统计
router.get('/overview', statisticsController.getOverview);

// 产品价格统计
router.get('/products', statisticsController.getProductStatistics);

// 月度统计
router.get('/monthly', statisticsController.getMonthlyStatistics);

// 涨跌统计
router.get('/change-stats', statisticsController.getChangeStatistics);

module.exports = router;

