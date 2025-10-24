/**
 * 统计控制器
 */

const Price = require('../models/Price');

/**
 * 概览统计
 */
exports.getOverview = async (req, res) => {
  try {
    // 获取基本统计信息
    const stats = await Price.getStatistics();
    
    // 获取最新数据
    const latest = await Price.getLatest(1);
    
    // 获取日期范围
    const [oldest, newest] = await Promise.all([
      Price.findOne().sort({ date: 1 }).select('date'),
      Price.findOne().sort({ date: -1 }).select('date')
    ]);

    // 计算涨跌天数
    const upDays = await Price.countDocuments({ change: { $gt: 0 } });
    const downDays = await Price.countDocuments({ change: { $lt: 0 } });
    const flatDays = await Price.countDocuments({ change: 0 });

    res.json({
      success: true,
      data: {
        totalRecords: stats.totalRecords || 0,
        dateRange: {
          start: oldest?.date,
          end: newest?.date
        },
        indexStats: {
          current: latest[0]?.index_value,
          average: stats.avgIndex?.toFixed(2),
          max: stats.maxIndex?.toFixed(2),
          min: stats.minIndex?.toFixed(2)
        },
        changeStats: {
          upDays,
          downDays,
          flatDays,
          upRate: (upDays / (upDays + downDays + flatDays) * 100).toFixed(1),
          avgChange: stats.avgChange?.toFixed(2),
          maxChange: stats.maxChange?.toFixed(2),
          minChange: stats.minChange?.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取概览统计失败',
      error: error.message
    });
  }
};

/**
 * 产品价格统计
 */
exports.getProductStatistics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const prices = await Price.find()
      .sort({ date: -1 })
      .limit(days)
      .select('products');

    const productNames = [
      'vegetable', 'pork', 'beef', 'mutton',
      'egg', 'chicken', 'fish', 'apple', 'banana'
    ];

    const statistics = {};

    productNames.forEach(productKey => {
      const productPrices = prices
        .map(p => p.products[productKey]?.price)
        .filter(price => price != null);

      if (productPrices.length > 0) {
        const sum = productPrices.reduce((a, b) => a + b, 0);
        statistics[productKey] = {
          name: prices[0].products[productKey]?.name,
          current: productPrices[0],
          average: (sum / productPrices.length).toFixed(2),
          max: Math.max(...productPrices).toFixed(2),
          min: Math.min(...productPrices).toFixed(2),
          unit: prices[0].products[productKey]?.unit
        };
      }
    });

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品统计失败',
      error: error.message
    });
  }
};

/**
 * 月度统计
 */
exports.getMonthlyStatistics = async (req, res) => {
  try {
    const prices = await Price.find().select('date index_value change');

    // 按月份分组统计
    const monthlyData = {};

    prices.forEach(price => {
      const month = price.date.substring(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          count: 0,
          totalIndex: 0,
          totalChange: 0,
          maxIndex: price.index_value,
          minIndex: price.index_value,
          upDays: 0,
          downDays: 0
        };
      }

      const data = monthlyData[month];
      data.count++;
      data.totalIndex += price.index_value;
      data.totalChange += price.change || 0;
      data.maxIndex = Math.max(data.maxIndex, price.index_value);
      data.minIndex = Math.min(data.minIndex, price.index_value);
      
      if (price.change > 0) data.upDays++;
      if (price.change < 0) data.downDays++;
    });

    // 计算平均值
    const result = Object.values(monthlyData).map(data => ({
      month: data.month,
      avgIndex: (data.totalIndex / data.count).toFixed(2),
      avgChange: (data.totalChange / data.count).toFixed(2),
      maxIndex: data.maxIndex.toFixed(2),
      minIndex: data.minIndex.toFixed(2),
      upDays: data.upDays,
      downDays: data.downDays,
      upRate: (data.upDays / data.count * 100).toFixed(1)
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取月度统计失败',
      error: error.message
    });
  }
};

/**
 * 涨跌统计
 */
exports.getChangeStatistics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;

    const prices = await Price.find()
      .sort({ date: -1 })
      .limit(days)
      .select('date change');

    const changes = prices.map(p => p.change).filter(c => c != null);

    // 涨跌区间分布
    const distribution = {
      bigUp: 0,      // >2个点
      smallUp: 0,    // 0-2个点
      flat: 0,       // 0
      smallDown: 0,  // 0到-2个点
      bigDown: 0     // <-2个点
    };

    changes.forEach(change => {
      if (change > 2) distribution.bigUp++;
      else if (change > 0) distribution.smallUp++;
      else if (change === 0) distribution.flat++;
      else if (change > -2) distribution.smallDown++;
      else distribution.bigDown++;
    });

    res.json({
      success: true,
      data: {
        distribution,
        total: changes.length,
        average: (changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(2),
        max: Math.max(...changes).toFixed(2),
        min: Math.min(...changes).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取涨跌统计失败',
      error: error.message
    });
  }
};

