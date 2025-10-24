/**
 * 价格预测服务
 */

/**
 * 移动平均预测
 */
function movingAveragePredict(data, days, period = 7) {
  const predictions = [];
  const values = data.map(d => d.index_value);
  
  // 计算最近period天的平均值作为预测基准
  const recentValues = values.slice(-period);
  const avgValue = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  
  // 计算趋势（线性回归斜率）
  const trend = calculateTrend(values.slice(-30));
  
  // 生成预测
  const lastDate = new Date(data[data.length - 1].date);
  
  for (let i = 1; i <= days; i++) {
    const predictDate = new Date(lastDate);
    predictDate.setDate(predictDate.getDate() + i);
    
    // 预测值 = 平均值 + 趋势 * 天数
    const predictValue = avgValue + (trend * i);
    
    predictions.push({
      date: predictDate.toISOString().split('T')[0],
      predicted_value: Math.max(0, predictValue.toFixed(2)),
      confidence: Math.max(0.5, 0.9 - (i * 0.01)), // 置信度随时间递减
      method: 'moving_average'
    });
  }
  
  return {
    predictions,
    historical: data.slice(-30).map(d => ({
      date: d.date,
      actual_value: d.index_value
    })),
    metadata: {
      method: 'moving_average',
      period,
      trend: trend.toFixed(4),
      base_value: avgValue.toFixed(2)
    }
  };
}

/**
 * 线性回归预测
 */
function linearRegressionPredict(data, days) {
  const values = data.map(d => d.index_value);
  const n = values.length;
  
  // 计算线性回归参数
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 生成预测
  const predictions = [];
  const lastDate = new Date(data[data.length - 1].date);
  
  for (let i = 1; i <= days; i++) {
    const predictDate = new Date(lastDate);
    predictDate.setDate(predictDate.getDate() + i);
    
    const predictValue = slope * (n + i - 1) + intercept;
    
    predictions.push({
      date: predictDate.toISOString().split('T')[0],
      predicted_value: Math.max(0, predictValue.toFixed(2)),
      confidence: Math.max(0.5, 0.85 - (i * 0.01)),
      method: 'linear_regression'
    });
  }
  
  return {
    predictions,
    historical: data.slice(-30).map(d => ({
      date: d.date,
      actual_value: d.index_value
    })),
    metadata: {
      method: 'linear_regression',
      slope: slope.toFixed(4),
      intercept: intercept.toFixed(2),
      trend: slope > 0 ? 'increasing' : 'decreasing'
    }
  };
}

/**
 * 计算趋势（简单线性回归斜率）
 */
function calculateTrend(values) {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

/**
 * 主预测函数
 */
async function predict(historicalData, days = 30, method = 'ma') {
  if (method === 'linear') {
    return linearRegressionPredict(historicalData, days);
  } else {
    return movingAveragePredict(historicalData, days);
  }
}

module.exports = {
  predict,
  movingAveragePredict,
  linearRegressionPredict,
  calculateTrend
};

