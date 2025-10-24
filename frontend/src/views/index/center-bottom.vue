<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getPricePrediction } from "../../api/agriPrice.api";
import { graphic } from "echarts/core";
import { ElMessage } from "element-plus";
import type { PredictionData } from "../../types/agriPrice";

const option = ref({});
const loading = ref(false);
let timer: any = null;

const getData = async () => {
  try {
    loading.value = true;
    // 获取30天的价格预测，使用移动平均法
    const res = await getPricePrediction(30, 'ma');
    
    if (res.success && res.data) {
      const predictionData: PredictionData = res.data;
      setOption(predictionData);
      console.log("中下--价格趋势预测", res);
    }
  } catch (err: any) {
    console.error("获取价格预测失败:", err);
    ElMessage.error(err || "获取价格预测数据失败");
  } finally {
    loading.value = false;
  }
};

const setOption = (predictionData: PredictionData) => {
  // 处理历史数据
  const historicalDates = predictionData.historical.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const historicalValues = predictionData.historical.map(item => item.actual_value);
  
  // 处理预测数据
  const predictionDates = predictionData.predictions.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const predictionValues = predictionData.predictions.map(item => parseFloat(item.predicted_value));
  const confidenceValues = predictionData.predictions.map(item => item.confidence);
  
  // 合并所有日期
  const allDates = [...historicalDates, ...predictionDates];
  
  // 创建完整的历史数据数组（预测部分为null）
  const fullHistoricalData = [
    ...historicalValues,
    ...new Array(predictionValues.length).fill(null)
  ];
  
  // 创建完整的预测数据数组（历史部分为null，但保留最后一个历史点作为连接）
  const fullPredictionData = [
    ...new Array(historicalValues.length - 1).fill(null),
    historicalValues[historicalValues.length - 1], // 连接点
    ...predictionValues
  ];

  option.value = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,.8)",
      borderColor: "rgba(147, 235, 248, .8)",
      textStyle: {
        color: "#FFF",
      },
      formatter: function (params: any) {
        let result = params[0].name + "<br>";
        params.forEach(function (item: any) {
          if (item.value !== null && item.value !== undefined) {
            result += item.marker + " " + item.seriesName + ": " + item.value.toFixed(2);
            // 如果是预测数据，显示置信度
            if (item.seriesName === "预测价格" && item.dataIndex >= historicalValues.length) {
              const confIndex = item.dataIndex - historicalValues.length;
              if (confidenceValues[confIndex]) {
                result += ` (置信度: ${(confidenceValues[confIndex] * 100).toFixed(1)}%)`;
              }
            }
            result += "<br>";
          }
        });
        return result;
      },
    },
    legend: {
      data: ["历史价格", "预测价格"],
      textStyle: {
        color: "#B4B4B4",
      },
      top: "0",
      right: "20px",
    },
    grid: {
      left: "50px",
      right: "50px",
      bottom: "30px",
      top: "40px",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: allDates,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: "#B4B4B4",
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#B4B4B4",
        interval: Math.floor(allDates.length / 10), // 控制标签显示密度
      },
    },
    yAxis: {
      type: "value",
      name: "价格指数",
      nameTextStyle: {
        color: "#B4B4B4",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(180, 180, 180, 0.2)",
          type: "dashed",
        },
      },
      axisLine: {
        lineStyle: {
          color: "#B4B4B4",
        },
      },
      axisLabel: {
        formatter: "{value}",
        color: "#B4B4B4",
      },
    },
    series: [
      {
        name: "历史价格",
        type: "line",
        data: fullHistoricalData,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#3EACE5" },
            { offset: 1, color: "#956FD4" },
          ]),
        },
        itemStyle: {
          color: "#3EACE5",
          borderColor: "#fff",
          borderWidth: 2,
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(62, 172, 229, 0.3)" },
            { offset: 1, color: "rgba(62, 172, 229, 0.05)" },
          ]),
        },
      },
      {
        name: "预测价格",
        type: "line",
        data: fullPredictionData,
        smooth: true,
        symbol: "diamond",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          type: "dashed",
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: "#F02FC2" },
            { offset: 1, color: "#FF9F7F" },
          ]),
        },
        itemStyle: {
          color: "#F02FC2",
          borderColor: "#fff",
          borderWidth: 2,
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(240, 47, 194, 0.2)" },
            { offset: 1, color: "rgba(240, 47, 194, 0.05)" },
          ]),
        },
      },
    ],
  };
};

onMounted(() => {
  getData();
  
  // 每5分钟刷新一次预测数据
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
