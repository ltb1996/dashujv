<template>
  <div class="conclusion-page">
    <div class="conclusion-container">
      <!-- 顶部标题区 -->
      <div class="page-header">
        <div class="header-decoration left"></div>
        <h1 class="page-title">项目成果展示</h1>
        <div class="header-decoration right"></div>
      </div>

      <!-- 核心成果指标 -->
      <div class="section achievement-section">
        <div class="section-title">
          <span class="title-text">核心成果指标</span>
        </div>
        <div class="achievement-grid">
          <div class="achievement-card" v-for="item in achievements" :key="item.label">
            <div class="card-icon" :style="{ background: item.color }">
              <i :class="item.icon"></i>
            </div>
            <div class="card-content">
              <div class="card-value">
                <CountUp :endVal="item.value" :duration="2" :decimals="item.decimals || 0" />
                <span class="unit">{{ item.unit }}</span>
              </div>
              <div class="card-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术创新点 -->
      <div class="section innovation-section">
        <div class="section-title">
          <span class="title-text">技术创新点</span>
        </div>
        <div class="innovation-grid">
          <div class="innovation-card" v-for="(item, index) in innovations" :key="index">
            <div class="innovation-number">{{ index + 1 }}</div>
            <div class="innovation-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型性能 & 应用价值 -->
      <div class="section dual-section">
        <div class="dual-left">
          <div class="section-title">
            <span class="title-text">模型性能</span>
          </div>
          <div class="model-performance">
            <div class="model-item best-model">
              <div class="model-badge">最佳模型</div>
              <h3>线性回归</h3>
              <div class="performance-metrics">
                <div class="metric">
                  <span class="metric-label">R² 得分</span>
                  <span class="metric-value highlight">91.79%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">预测误差</span>
                  <span class="metric-value">4.53%</span>
                </div>
              </div>
            </div>
            <div class="model-list">
              <div class="model-item" v-for="model in models" :key="model.name">
                <div class="model-name">{{ model.name }}</div>
                <div class="model-stats">
                  <span>R²: {{ model.r2 }}%</span>
                  <span>MAPE: {{ model.mape }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dual-right">
          <div class="section-title">
            <span class="title-text">应用价值</span>
          </div>
          <div class="application-value">
            <div class="value-item" v-for="(value, index) in applicationValues" :key="index">
              <div class="value-icon">
                <i :class="value.icon"></i>
              </div>
              <div class="value-content">
                <h4>{{ value.title }}</h4>
                <p>{{ value.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统特色 -->
      <div class="section features-section">
        <div class="section-title">
          <span class="title-text">系统特色</span>
        </div>
        <div class="features-list">
          <div class="feature-tag" v-for="feature in features" :key="feature">
            <i class="tag-icon">✓</i>
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>

      <!-- 返回按钮 -->
      <div class="back-button" @click="goBack">
        <i class="back-icon">←</i>
        <span>返回大屏</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import CountUp from '@/components/count-up';

const router = useRouter();

// 核心成果指标
const achievements = reactive([
  {
    label: '预测准确率',
    value: 91.79,
    unit: '%',
    decimals: 2,
    icon: '📊',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    label: '数据处理量',
    value: 365,
    unit: '天',
    decimals: 0,
    icon: '📈',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    label: '产品类别',
    value: 9,
    unit: '类',
    decimals: 0,
    icon: '🎯',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    label: '预测误差',
    value: 4.53,
    unit: '%',
    decimals: 2,
    icon: '✨',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    label: '可视化图表',
    value: 12,
    unit: '个',
    decimals: 0,
    icon: '📉',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    label: '机器学习模型',
    value: 3,
    unit: '个',
    decimals: 0,
    icon: '🤖',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
]);

// 技术创新点
const innovations = reactive([
  {
    title: '前后端分离架构',
    description: 'Vue3 + Node.js，模块化设计，易于扩展和维护'
  },
  {
    title: '大数据处理技术栈',
    description: 'Pandas/NumPy数据处理，365天×9类产品数据分析'
  },
  {
    title: '机器学习预测模型',
    description: '集成线性回归、随机森林、梯度提升三种算法'
  },
  {
    title: '交互式数据大屏',
    description: 'ECharts可视化，8个功能模块，实时数据展示'
  }
]);

// 模型性能数据
const models = reactive([
  { name: '随机森林', r2: 80.46, mape: 6.72 },
  { name: '梯度提升', r2: 0, mape: 16.24 }
]);

// 应用价值
const applicationValues = reactive([
  {
    title: '政府决策支持',
    description: '价格监测预警、市场调控政策制定',
    icon: '🏛️'
  },
  {
    title: '农业生产者',
    description: '种植决策指导、最佳销售时机预测',
    icon: '👨‍🌾'
  },
  {
    title: '流通企业',
    description: '采购计划制定、库存管理优化',
    icon: '🏢'
  },
  {
    title: '消费者服务',
    description: '价格趋势查询、消费建议提供',
    icon: '👥'
  },
  {
    title: '学术研究',
    description: '价格规律研究、预测模型验证',
    icon: '🎓'
  }
]);

// 系统特色
const features = reactive([
  '365天连续数据分析',
  '9类农产品全覆盖',
  '实时价格监测',
  '智能预测算法',
  '多维度数据可视化',
  '响应式大屏设计',
  '完整API接口',
  'MongoDB数据存储'
]);

const goBack = () => {
  router.push('/index');
};
</script>

<style scoped lang="scss">
.conclusion-page {
  width: 100%;
  // min-height: calc(100vh - 64px);
  // padding: 20px 20px 60px 20px; 
  overflow-y: auto;
  background: linear-gradient(to bottom, #0a1628 0%, #1a2742 100%);
  background-image: url("@/assets/img/pageBg.png");
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 50px;
}

.conclusion-container {
  max-width: 1600px;
  margin: 0 auto;
  padding-bottom: 20px; /* 确保容器底部有足够空间 */
}

// 页面标题
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;

  .page-title {
    font-size: 42px;
    font-weight: 900;
    letter-spacing: 8px;
    background: linear-gradient(92deg, #0072ff 0%, #00eaff 48.85%, #01aaff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 40px;
  }

  .header-decoration {
    width: 200px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #00eaff, transparent);
    
    &.left {
      background: linear-gradient(90deg, transparent, #00eaff);
    }
    
    &.right {
      background: linear-gradient(90deg, #00eaff, transparent);
    }
  }
}

// 通用 Section 样式
.section {
  margin-bottom: 30px;
  
  .section-title {
    margin-bottom: 20px;
    padding-left: 15px;
    border-left: 4px solid #00eaff;
    
    .title-text {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(92deg, #00eaff 0%, #01aaff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}

// 核心成果指标
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: rgba(15, 30, 60, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.3);
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 234, 255, 0.8);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 234, 255, 0.2);
  }
  
  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }
  
  .card-content {
    flex: 1;
    
    .card-value {
      font-size: 32px;
      font-weight: bold;
      color: #00eaff;
      margin-bottom: 5px;
      
      .unit {
        font-size: 18px;
        color: #67d8fb;
        margin-left: 5px;
      }
    }
    
    .card-label {
      font-size: 16px;
      color: #8aa3c0;
    }
  }
}

// 技术创新点
.innovation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.innovation-card {
  background: rgba(15, 30, 60, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.3);
  border-radius: 12px;
  padding: 25px;
  display: flex;
  gap: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 234, 255, 0.8);
    transform: translateX(5px);
  }
  
  .innovation-number {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    flex-shrink: 0;
  }
  
  .innovation-content {
    flex: 1;
    
    h3 {
      font-size: 20px;
      color: #00eaff;
      margin-bottom: 10px;
    }
    
    p {
      font-size: 15px;
      color: #8aa3c0;
      line-height: 1.6;
    }
  }
}

// 双栏布局
.dual-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.dual-left, .dual-right {
  background: rgba(15, 30, 60, 0.4);
  border: 1px solid rgba(0, 234, 255, 0.3);
  border-radius: 12px;
  padding: 25px;
}

// 模型性能
.model-performance {
  .best-model {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    border: 2px solid #667eea;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
    
    .model-badge {
      position: absolute;
      top: -12px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    
    h3 {
      font-size: 24px;
      color: #00eaff;
      margin-bottom: 15px;
    }
    
    .performance-metrics {
      display: flex;
      gap: 30px;
      
      .metric {
        flex: 1;
        
        .metric-label {
          display: block;
          font-size: 14px;
          color: #8aa3c0;
          margin-bottom: 5px;
        }
        
        .metric-value {
          display: block;
          font-size: 28px;
          font-weight: bold;
          color: #43e97b;
          
          &.highlight {
            color: #ffd700;
            font-size: 32px;
          }
        }
      }
    }
  }
  
  .model-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .model-item {
      background: rgba(15, 30, 60, 0.6);
      border: 1px solid rgba(0, 234, 255, 0.2);
      border-radius: 8px;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .model-name {
        font-size: 16px;
        color: #67d8fb;
        font-weight: bold;
      }
      
      .model-stats {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #8aa3c0;
      }
    }
  }
}

// 应用价值
.application-value {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.value-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: rgba(15, 30, 60, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(0, 234, 255, 0.8);
    transform: translateX(5px);
  }
  
  .value-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 234, 255, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .value-content {
    flex: 1;
    
    h4 {
      font-size: 18px;
      color: #00eaff;
      margin-bottom: 5px;
    }
    
    p {
      font-size: 14px;
      color: #8aa3c0;
      line-height: 1.5;
    }
  }
}

// 系统特色
.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.feature-tag {
  background: rgba(0, 234, 255, 0.1);
  border: 1px solid rgba(0, 234, 255, 0.3);
  border-radius: 20px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #67d8fb;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 234, 255, 0.2);
    border-color: rgba(0, 234, 255, 0.6);
    transform: scale(1.05);
  }
  
  .tag-icon {
    color: #43e97b;
    font-weight: bold;
  }
}

// 返回按钮
.back-button {
  margin-top: 40px;
  margin-bottom: 20px; /* 增加底部margin，确保按钮完全可见 */
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  color: #fff;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
  
  .back-icon {
    font-size: 20px;
    font-style: normal;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .innovation-grid,
  .dual-section {
    grid-template-columns: 1fr;
  }
  
  .achievement-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .achievement-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    
    .page-title {
      font-size: 32px;
      margin: 20px 0;
    }
    
    .header-decoration {
      width: 100px;
    }
  }
}
</style>

