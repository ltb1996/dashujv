/**
 * 数据库配置
 */

const mongoose = require('mongoose');

// 数据库连接配置
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agri_price_db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  }
};

/**
 * 连接MongoDB数据库
 */
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✓ MongoDB 连接成功');
    console.log(`  数据库: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('✗ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

/**
 * 断开数据库连接
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB 已断开连接');
  } catch (error) {
    console.error('✗ 断开连接失败:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  config
};

