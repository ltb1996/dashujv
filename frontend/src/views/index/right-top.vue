<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getMonthlyStatistics } from "../../api/agriPrice.api";
import { graphic } from "echarts/core";
import { ElMessage } from "element-plus";
import type { MonthlyStatistics } from "../../types/agriPrice";

const option = ref({});
const loading = ref(false);
let timer: any = null;

const getData = async () => {
  try {
    loading.value = true;
    const res = await getMonthlyStatistics();
    
    if (res.success && res.data) {
      const monthlyData: MonthlyStatistics[] = res.data;
      setOption(monthlyData);
      console.log("右上--月度价格分析", res);
    }
  } catch (err: any) {
    console.error("获取月度统计失败:", err);
    ElMessage.error(err || "获取月度统计数据失败");
  } finally {
    loading.value = false;
  }
};

const setOption = (monthlyData: MonthlyStatistics[]) => {
  // 提取数据
  const months = monthlyData.map(item => item.month);
  const avgIndexData = monthlyData.map(item => parseFloat(item.avgIndex));
  const maxIndexData = monthlyData.map(item => parseFloat(item.maxIndex));
  const minIndexData = monthlyData.map(item => parseFloat(item.minIndex));
  const avgChangeData = monthlyData.map(item => parseFloat(item.avgChange));
  
  option.value = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,.8)",
      borderColor: "rgba(147, 235, 248, .8)",
      textStyle: {
        color: "#FFF",
      },
      formatter: function (params: any) {
        const dataIndex = params[0].dataIndex;
        const monthInfo = monthlyData[dataIndex];
        
        let result = `<strong>${monthInfo.month}</strong><br/>`;
        result += `平均指数: <span style="color:#FC9010">${monthInfo.avgIndex}</span><br/>`;
        result += `最高指数: <span style="color:#f5023d">${monthInfo.maxIndex}</span><br/>`;
        result += `最低指数: <span style="color:#07f7a8">${monthInfo.minIndex}</span><br/>`;
        result += `平均涨跌: <span style="color:${parseFloat(monthInfo.avgChange) >= 0 ? '#07f7a8' : '#f5023d'}">${monthInfo.avgChange}</span><br/>`;
        result += `上涨率: <span style="color:#09CAF3">${monthInfo.upRate}%</span><br/>`;
        result += `上涨天数: ${monthInfo.upDays}天 / 下跌天数: ${monthInfo.downDays}天`;
        
        return result;
      },
    },
    legend: {
      data: ["平均指数", "最高指数", "最低指数"],
      textStyle: {
        color: "#B4B4B4",
      },
      top: "5px",
      right: "20px",
    },
    grid: {
      show: true,
      left: "10px",
      right: "30px",
      bottom: "10px",
      top: "40px",
      containLabel: true,
      borderColor: "#1F63A3",
    },
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(31,99,163,.2)",
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(31,99,163,.1)",
        },
      },
      axisLabel: {
        color: "#7EB7FD",
        fontWeight: "500",
        rotate: 0,
        interval: 0,
        formatter: function(value: string) {
          // 格式化月份显示，如 "2024-01" -> "1月"
          const parts = value.split('-');
          return parts.length > 1 ? `${parseInt(parts[1])}月` : value;
        }
      },
    },
    yAxis: {
      type: "value",
      name: "价格指数",
      nameTextStyle: {
        color: "#7EB7FD",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(31,99,163,.2)",
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(31,99,163,.1)",
        },
      },
      axisLabel: {
        color: "#7EB7FD",
        fontWeight: "500",
      },
    },
    series: [
      // 平均指数线（主线）
      {
        name: "平均指数",
        data: avgIndexData,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        color: "rgba(252,144,16,.9)",
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: new graphic.LinearGradient(
            0, 0, 0, 1,
            [
              { offset: 0, color: "rgba(252,144,16,.5)" },
              { offset: 1, color: "rgba(252,144,16,.05)" },
            ],
            false
          ),
        },
        markPoint: {
          data: [
            {
              name: "最高",
              type: "max",
              valueDim: "y",
              symbol: "pin",
              symbolSize: 50,
              itemStyle: {
                color: "#FC9010",
              },
              label: {
                color: "#fff",
                formatter: "峰值\n{c}",
              },
            },
          ],
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: "#FC9010",
            type: "dashed",
            width: 1,
          },
          label: {
            color: "#FC9010",
          },
          data: [
            {
              type: "average",
              name: "平均值",
            },
          ],
        },
        z: 3,
      },
      // 最高指数线
      {
        name: "最高指数",
        data: maxIndexData,
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 2,
          type: "dashed",
          color: "rgba(245, 2, 61, 0.6)",
        },
        z: 1,
      },
      // 最低指数线
      {
        name: "最低指数",
        data: minIndexData,
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 2,
          type: "dashed",
          color: "rgba(7, 247, 168, 0.6)",
        },
        z: 1,
      },
    ],
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
  <v-chart class="chart" :option="option" v-if="JSON.stringify(option) != '{}'" />
</template>

<style scoped lang="scss"></style>

