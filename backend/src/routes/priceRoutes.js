/**
 * 价格相关路由
 */

const express = require('express');
const priceController = require('../controllers/priceController');

const router = express.Router();

// 获取最新价格数据
router.get('/latest', priceController.getLatest);

// 获取价格列表（分页）
router.get('/list', priceController.getList);

// 获取指定日期的价格
router.get('/date/:date', priceController.getByDate);

// 获取日期范围内的价格
router.get('/range', priceController.getByDateRange);

// 获取价格排行榜（涨幅最大/最小）
router.get('/ranking', priceController.getRanking);

// 获取特定产品的价格趋势
router.get('/product/:productName/trend', priceController.getProductTrend);

module.exports = router;

