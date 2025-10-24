/**
 * 分析服务
 */

/**
 * 计算移动平均线
 */
function calculateMovingAverage(data, periods = [7, 15, 30]) {
  const result = data.map((item, index) => {
    const point = {
      date: item.date,
      actual: item.index_value
    };

    periods.forEach(period => {
      if (index >= period - 1) {
        const slice = data.slice(index - period + 1, index + 1);
        const sum = slice.reduce((acc, d) => acc + d.index_value, 0);
        point[`ma${period}`] = (sum / period).toFixed(2);
      }
    });

    return point;
  });

  return {
    data: result,
    periods,
    count: result.length
  };
}

/**
 * 趋势分析
 */
function analyzeTrend(data) {
  const values = data.map(d => d.index_value);
  const n = values.length;
  
  if (n < 2) {
    return { trend: 'insufficient_data' };
  }

  // 计算线性回归
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // 计算R²（拟合优度）
  const meanY = sumY / n;
  let ssTotal = 0, ssResidual = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssTotal += Math.pow(values[i] - meanY, 2);
    ssResidual += Math.pow(values[i] - predicted, 2);
  }
  
  const rSquared = 1 - (ssResidual / ssTotal);
  
  // 计算涨跌幅
  const firstValue = values[0];
  const lastValue = values[n - 1];
  const totalChange = lastValue - firstValue;
  const percentChange = (totalChange / firstValue) * 100;
  
  // 判断趋势
  let trendType = 'stable';
  if (Math.abs(slope) < 0.01) {
    trendType = 'stable';
  } else if (slope > 0.05) {
    trendType = 'strong_increase';
  } else if (slope > 0) {
    trendType = 'slight_increase';
  } else if (slope < -0.05) {
    trendType = 'strong_decrease';
  } else {
    trendType = 'slight_decrease';
  }

  return {
    trend: trendType,
    slope: slope.toFixed(4),
    intercept: intercept.toFixed(2),
    rSquared: rSquared.toFixed(4),
    totalChange: totalChange.toFixed(2),
    percentChange: percentChange.toFixed(2),
    startValue: firstValue.toFixed(2),
    endValue: lastValue.toFixed(2),
    period: {
      start: data[0].date,
      end: data[n - 1].date,
      days: n
    }
  };
}

/**
 * 计算相关性（产品间价格相关性）
 */
function calculateCorrelation(data) {
  const products = ['vegetable', 'pork', 'beef', 'mutton', 'egg', 'chicken'];
  const correlations = {};

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const product1 = products[i];
      const product2 = products[j];
      
      const prices1 = [];
      const prices2 = [];
      
      data.forEach(d => {
        const p1 = d.products[product1]?.price;
        const p2 = d.products[product2]?.price;
        if (p1 != null && p2 != null) {
          prices1.push(p1);
          prices2.push(p2);
        }
      });
      
      if (prices1.length > 1) {
        const corr = pearsonCorrelation(prices1, prices2);
        const key = `${product1}_${product2}`;
        correlations[key] = {
          product1,
          product2,
          correlation: corr.toFixed(3),
          strength: getCorrelationStrength(corr),
          samples: prices1.length
        };
      }
    }
  }

  return {
    correlations,
    count: Object.keys(correlations).length
  };
}

/**
 * 皮尔逊相关系数
 */
function pearsonCorrelation(x, y) {
  const n = x.length;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * 判断相关性强度
 */
function getCorrelationStrength(corr) {
  const abs = Math.abs(corr);
  if (abs >= 0.8) return 'very_strong';
  if (abs >= 0.6) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'very_weak';
}

/**
 * 季节性分析
 */
function analyzeSeasonality(data) {
  const monthlyAvg = {};
  
  data.forEach(item => {
    const month = item.date.substring(5, 7); // MM
    
    if (!monthlyAvg[month]) {
      monthlyAvg[month] = { sum: 0, count: 0 };
    }
    
    monthlyAvg[month].sum += item.index_value;
    monthlyAvg[month].count++;
  });
  
  const seasonality = Object.keys(monthlyAvg).sort().map(month => ({
    month: parseInt(month),
    monthName: getMonthName(parseInt(month)),
    avgIndex: (monthlyAvg[month].sum / monthlyAvg[month].count).toFixed(2),
    samples: monthlyAvg[month].count
  }));
  
  // 找出最高和最低月份
  const avgValues = seasonality.map(s => parseFloat(s.avgIndex));
  const maxAvg = Math.max(...avgValues);
  const minAvg = Math.min(...avgValues);
  
  const highestMonth = seasonality.find(s => parseFloat(s.avgIndex) === maxAvg);
  const lowestMonth = seasonality.find(s => parseFloat(s.avgIndex) === minAvg);
  
  return {
    monthlyData: seasonality,
    summary: {
      highestMonth: highestMonth.monthName,
      highestValue: maxAvg.toFixed(2),
      lowestMonth: lowestMonth.monthName,
      lowestValue: minAvg.toFixed(2),
      volatility: ((maxAvg - minAvg) / minAvg * 100).toFixed(2)
    }
  };
}

/**
 * 获取月份名称
 */
function getMonthName(month) {
  const names = ['1月', '2月', '3月', '4月', '5月', '6月', 
                 '7月', '8月', '9月', '10月', '11月', '12月'];
  return names[month - 1];
}

module.exports = {
  calculateMovingAverage,
  analyzeTrend,
  calculateCorrelation,
  analyzeSeasonality
};

