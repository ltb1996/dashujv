/**
 * 价格数据模型
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,           // 产品名称
  price: Number,          // 价格
  change_percent: Number, // 涨跌幅百分比
  unit: String            // 单位
}, { _id: false });

const priceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  url: String,
  change: Number,           // 涨跌幅（点）
  compare_base: String,     // 比较基准（昨天/上周）
  index_value: {           // 农产品批发价格200指数
    type: Number,
    required: true
  },
  basket_index: Number,    // 菜篮子指数
  products: {              // 各类产品价格
    vegetable: productSchema,
    pork: productSchema,
    beef: productSchema,
    mutton: productSchema,
    egg: productSchema,
    chicken: productSchema,
    fish: productSchema,
    apple: productSchema,
    banana: productSchema
  },
  event: String            // 特殊事件
}, {
  timestamps: true,        // 自动添加 createdAt 和 updatedAt
  collection: 'prices'
});

// 创建日期索引（用于快速查询）
priceSchema.index({ date: -1 });

// 创建指数值索引
priceSchema.index({ index_value: 1 });

// 静态方法：获取最新数据
priceSchema.statics.getLatest = function(limit = 1) {
  return this.find().sort({ date: -1 }).limit(limit);
};

// 静态方法：按日期范围查询
priceSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

// 静态方法：获取统计信息
priceSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        avgIndex: { $avg: '$index_value' },
        maxIndex: { $max: '$index_value' },
        minIndex: { $min: '$index_value' },
        avgChange: { $avg: '$change' },
        maxChange: { $max: '$change' },
        minChange: { $min: '$change' }
      }
    }
  ]);
  
  return stats[0] || {};
};

const Price = mongoose.model('Price', priceSchema);

module.exports = Price;

