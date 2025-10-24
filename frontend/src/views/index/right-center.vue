<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getProductTrend } from "../../api/agriPrice.api";
import { ElMessage } from "element-plus";

const option = ref({});
const loading = ref(false);
let timer: any = null;

// TOP6 产品配置
const topProducts = [
  { key: 'vegetable', name: '蔬菜', color: '#5470c6' },
  { key: 'pork', name: '猪肉', color: '#91cc75' },
  { key: 'beef', name: '牛肉', color: '#fac858' },
  { key: 'egg', name: '鸡蛋', color: '#ee6666' },
  { key: 'apple', name: '苹果', color: '#73c0de' },
  { key: 'fish', name: '活鲤鱼', color: '#3ba272' },
];

const getData = async () => {
  try {
    loading.value = true;
    
    // 并发获取所有产品的30天趋势数据
    const promises = topProducts.map(product => 
      getProductTrend(product.key, 30)
        .then(res => {
          console.log(`${product.name}趋势数据:`, res);
          return { product, data: res };
        })
        .catch(err => {
          console.error(`获取${product.name}趋势失败:`, err);
          return { product, data: null };
        })
    );
    
    const results = await Promise.all(promises);
    
    // 过滤出成功的数据且数据不为空
    const validResults = results.filter(r => {
      return r.data && 
             r.data.success && 
             r.data.data && 
             Array.isArray(r.data.data) && 
             r.data.data.length > 0;
    });
    
    console.log("有效数据数量:", validResults.length, validResults);
    
    if (validResults.length > 0) {
      setOption(validResults);
      console.log("右中--产品价格趋势TOP6 设置完成");
    } else {
      console.warn("没有有效的产品趋势数据");
      ElMessage.warning("暂无产品趋势数据");
    }
  } catch (err: any) {
    console.error("获取产品趋势失败:", err);
    ElMessage.error(err?.message || "获取产品趋势数据失败");
  } finally {
    loading.value = false;
  }
};

const setOption = (results: any[]) => {
  if (!results || results.length === 0) {
    console.error("setOption: 没有数据");
    return;
  }
  
  try {
    // 使用第一个产品的日期作为X轴
    const firstProductData = results[0].data.data;
    if (!firstProductData || firstProductData.length === 0) {
      console.error("setOption: 第一个产品数据为空");
      return;
    }
    
    const dates = firstProductData.map((item: any) => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // 构建系列数据
    const series = results.map(({ product, data }) => {
      const trendData = data.data;
      // 后端返回的数据结构：{ date, price, change_percent }
      const prices = trendData.map((item: any) => {
        return item.price !== null && item.price !== undefined ? item.price : null;
      });
      
      return {
        name: product.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        data: prices,
        lineStyle: {
          width: 2,
          color: product.color,
        },
        itemStyle: {
          color: product.color,
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 3,
          },
        },
      };
    });
  
  option.value = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,.8)',
      borderColor: 'rgba(147, 235, 248, .8)',
      textStyle: {
        color: '#FFF',
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: function (params: any) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((item: any) => {
          if (item.value !== null && item.value !== undefined) {
            result += `${item.marker} ${item.seriesName}: <span style="color:${item.color};font-weight:bold">${item.value.toFixed(2)}</span> 元<br/>`;
          }
        });
        return result;
      },
    },
    legend: {
      data: topProducts.map(p => p.name),
      textStyle: {
        color: '#B4B4B4',
        fontSize: 12,
      },
      top: '0',
      type: 'scroll',
      pageTextStyle: {
        color: '#B4B4B4',
      },
    },
    grid: {
      left: '10px',
      right: '20px',
      bottom: '10px',
      top: '35px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: 'rgba(180, 180, 180, 0.3)',
        },
      },
      axisLabel: {
        color: '#7EB7FD',
        fontSize: 10,
        interval: Math.floor(dates.length / 8),
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(180, 180, 180, 0.1)',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '价格(元)',
      nameTextStyle: {
        color: '#7EB7FD',
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(180, 180, 180, 0.3)',
        },
      },
      axisLabel: {
        color: '#7EB7FD',
        fontSize: 10,
        formatter: '{value}',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(180, 180, 180, 0.1)',
          type: 'dashed',
        },
      },
    },
    series: series,
  };
  } catch (error) {
    console.error("setOption 发生错误:", error);
    ElMessage.error("图表渲染失败");
  }
};

onMounted(() => {
  getData();
  
  // 每5分钟刷新一次
  timer = setInterval(() => {
    getData();
  }, 300000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="right-center-container">
    <v-chart 
      class="chart" 
      :option="option" 
      v-if="JSON.stringify(option) != '{}'" 
      v-loading="loading"
    />
    <div v-if="!loading && JSON.stringify(option) === '{}'" class="empty-state">
      暂无数据
    </div>
  </div>
</template>

<style scoped lang="scss">
.right-center-container {
  box-sizing: border-box;
  padding: 0 10px;
  height: 100%;
  position: relative;
  
  .chart {
    width: 100%;
    height: 260px;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 260px;
    color: #7abaff;
    opacity: 0.6;
    font-size: 14px;
  }
}
</style>
