/**
 * 主路由文件
 */

const express = require('express');
const priceRoutes = require('./priceRoutes');
const analysisRoutes = require('./analysisRoutes');
const statisticsRoutes = require('./statisticsRoutes');

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
router.use('/prices', priceRoutes);
router.use('/analysis', analysisRoutes);
router.use('/statistics', statisticsRoutes);

module.exports = router;

