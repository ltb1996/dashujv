/**
 * 数据库初始化脚本
 * 将JSON数据导入MongoDB
 */

const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('../config/database');
const Price = require('../models/Price');

async function initDatabase() {
  console.log('='.repeat(60));
  console.log('数据库初始化脚本');
  console.log('='.repeat(60) + '\n');

  try {
    // 连接数据库
    await connectDB();

    // 读取JSON数据
    const dataPath = path.join(__dirname, '../../data/agri_price_mock_data.json');
    console.log(`读取数据文件: ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      throw new Error('数据文件不存在！请先运行 generate_mock_data.py 生成数据');
    }

    const rawData = fs.readFileSync(dataPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    
    console.log(`数据文件信息:`);
    console.log(`  总记录数: ${jsonData.total}`);
    console.log(`  日期范围: ${jsonData.date_range.start} 至 ${jsonData.date_range.end}`);
    console.log(`  生成时间: ${jsonData.generate_time}\n`);

    // 清空现有数据
    console.log('清空现有数据...');
    await Price.deleteMany({});
    console.log('✓ 已清空\n');

    // 插入新数据
    console.log('开始导入数据...');
    const batchSize = 100;
    const totalBatches = Math.ceil(jsonData.data.length / batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, jsonData.data.length);
      const batch = jsonData.data.slice(start, end);
      
      await Price.insertMany(batch);
      
      const progress = ((i + 1) / totalBatches * 100).toFixed(1);
      console.log(`  进度: ${progress}% (${end}/${jsonData.data.length})`);
    }

    console.log('\n✓ 数据导入成功！\n');

    // 验证数据
    console.log('验证导入数据...');
    const count = await Price.countDocuments();
    const latest = await Price.findOne().sort({ date: -1 });
    const oldest = await Price.findOne().sort({ date: 1 });
    
    console.log(`  数据库记录数: ${count}`);
    console.log(`  最新日期: ${latest.date}`);
    console.log(`  最早日期: ${oldest.date}`);
    console.log(`  最新指数: ${latest.index_value}\n`);

    // 创建索引
    console.log('创建索引...');
    await Price.createIndexes();
    console.log('✓ 索引创建完成\n');

    console.log('='.repeat(60));
    console.log('数据库初始化完成！');
    console.log('='.repeat(60) + '\n');
    console.log('现在可以运行以下命令启动服务器：');
    console.log('  npm start\n');

  } catch (error) {
    console.error('\n✗ 初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// 运行初始化
initDatabase();

