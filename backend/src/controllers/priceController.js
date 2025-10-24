/**
 * 价格控制器
 */

const Price = require('../models/Price');
const config = require('../config');

/**
 * 获取最新价格数据
 */
exports.getLatest = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1;
    const prices = await Price.getLatest(limit);
    
    res.json({
      success: true,
      data: prices,
      count: prices.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取最新价格失败',
      error: error.message
    });
  }
};

/**
 * 获取价格列表（分页）
 */
exports.getList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || config.pagination.defaultPage;
    const limit = Math.min(
      parseInt(req.query.limit) || config.pagination.defaultLimit,
      config.pagination.maxLimit
    );
    const skip = (page - 1) * limit;

    const [prices, total] = await Promise.all([
      Price.find().sort({ date: -1 }).skip(skip).limit(limit),
      Price.countDocuments()
    ]);

    res.json({
      success: true,
      data: prices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取价格列表失败',
      error: error.message
    });
  }
};

/**
 * 获取指定日期的价格
 */
exports.getByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const price = await Price.findOne({ date });

    if (!price) {
      return res.status(404).json({
        success: false,
        message: '未找到该日期的数据'
      });
    }

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取价格数据失败',
      error: error.message
    });
  }
};

/**
 * 获取日期范围内的价格
 */
exports.getByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '请提供开始日期和结束日期'
      });
    }

    const prices = await Price.getByDateRange(startDate, endDate);

    res.json({
      success: true,
      data: prices,
      count: prices.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取价格范围数据失败',
      error: error.message
    });
  }
};

/**
 * 获取价格排行榜（涨幅最大/最小）
 */
exports.getRanking = async (req, res) => {
  try {
    const type = req.query.type || 'increase'; // increase/decrease
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 30; // 最近多少天

    // 获取最近N天的数据
    const latestDate = await Price.findOne().sort({ date: -1 }).select('date');
    if (!latestDate) {
      return res.json({ success: true, data: [] });
    }

    const startDate = new Date(latestDate.date);
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const sortOrder = type === 'increase' ? -1 : 1;
    const prices = await Price.find({
      date: { $gte: startDateStr }
    }).sort({ change: sortOrder }).limit(limit);

    res.json({
      success: true,
      data: prices,
      count: prices.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取排行榜失败',
      error: error.message
    });
  }
};

/**
 * 获取特定产品的价格趋势
 */
exports.getProductTrend = async (req, res) => {
  try {
    const { productName } = req.params;
    const days = parseInt(req.query.days) || 30;

    // 获取最近N天的数据
    const prices = await Price.find()
      .sort({ date: -1 })
      .limit(days)
      .select(`date products.${productName}`);

    const trend = prices.reverse().map(p => ({
      date: p.date,
      price: p.products[productName]?.price,
      change_percent: p.products[productName]?.change_percent
    }));

    res.json({
      success: true,
      data: trend,
      product: productName,
      count: trend.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品趋势失败',
      error: error.message
    });
  }
};

