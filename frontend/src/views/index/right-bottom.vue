<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getChangeStatistics } from "../../api/agriPrice.api";
import { ElMessage } from "element-plus";
import type { ChangeStatistics } from "../../types/agriPrice";

const option = ref({});
const loading = ref(false);
let timer: any = null;

const getData = async () => {
  try {
    loading.value = true;
    // 获取90天的涨跌统计
    const res = await getChangeStatistics(90);
    
    if (res.success && res.data) {
      const changeData: ChangeStatistics = res.data;
      setOption(changeData);
      console.log("右下--价格波动分布", res);
    }
  } catch (err: any) {
    console.error("获取涨跌统计失败:", err);
    ElMessage.error(err || "获取价格波动分布数据失败");
  } finally {
    loading.value = false;
  }
};

const setOption = (changeData: ChangeStatistics) => {
  const distribution = changeData.distribution;
  
  // 饼图数据
  const pieData = [
    { 
      value: distribution.bigUp, 
      name: '大涨(>2%)',
      itemStyle: { color: '#f5023d' }
    },
    { 
      value: distribution.smallUp, 
      name: '小涨(0-2%)',
      itemStyle: { color: '#fc9010' }
    },
    { 
      value: distribution.flat, 
      name: '持平',
      itemStyle: { color: '#7EB7FD' }
    },
    { 
      value: distribution.smallDown, 
      name: '小跌(0-2%)',
      itemStyle: { color: '#91cc75' }
    },
    { 
      value: distribution.bigDown, 
      name: '大跌(>2%)',
      itemStyle: { color: '#07f7a8' }
    },
  ];
  
  option.value = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,.8)',
      borderColor: 'rgba(147, 235, 248, .8)',
      textStyle: {
        color: '#FFF',
      },
      formatter: function(params: any) {
        const percent = params.percent.toFixed(1);
        return `${params.marker} ${params.name}<br/>天数: <strong>${params.value}</strong><br/>占比: <strong>${percent}%</strong>`;
      }
    },
    legend: {
      orient: 'vertical',
      right: '10px',
      top: 'center',
      textStyle: {
        color: '#B4B4B4',
        fontSize: 14,
      },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 12,
      formatter: function(name: string) {
        const item = pieData.find(d => d.name === name);
        return `${name} ${item?.value || 0}天`;
      }
    },
    series: [
      {
        name: '价格波动分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#0a1e3d',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
            formatter: function(params: any) {
              return `${params.name}\n${params.value}天\n${params.percent.toFixed(1)}%`;
            }
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  };
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
  <div class="right-bottom-container">
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
.right-bottom-container {
  box-sizing: border-box;
  padding: 0 10px;
  height: 100%;
  position: relative;
  
  .chart {
    width: 100%;
    height: 252px;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 252px;
    color: #7abaff;
    opacity: 0.6;
    font-size: 14px;
  }
}
</style>
