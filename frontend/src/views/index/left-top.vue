<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { getStatisticsOverview, getLatestPrices } from "@/api/agriPrice.api";
import CountUp from "@/components/count-up";
import { ElMessage } from "element-plus";
import type { StatisticsOverview, PriceData } from "@/types/agriPrice";

const duration = ref(2);
const state = reactive({
  currentIndex: 0,        // 当前价格指数
  todayChange: 0,         // 今日涨跌点数
  totalRecords: 0,        // 总记录数
  upDays: 0,              // 上涨天数
  changePercent: 0,       // 涨跌百分比
  loading: false,
});

let timer: any = null;

const getData = async () => {
  try {
    state.loading = true;
    
    // 获取最新价格数据
    const latestRes = await getLatestPrices(1);
    if (latestRes.success && latestRes.data && latestRes.data.length > 0) {
      const latest: PriceData = latestRes.data[0];
      state.currentIndex = Number(latest.index_value.toFixed(2));
      state.todayChange = Number(latest.change.toFixed(2));
      
      // 计算涨跌百分比
      if (state.currentIndex > 0 && state.todayChange !== 0) {
        state.changePercent = Number(((state.todayChange / state.currentIndex) * 100).toFixed(2));
      }
    }
    
    // 获取统计概览
    const statsRes = await getStatisticsOverview();
    if (statsRes.success && statsRes.data) {
      const stats: StatisticsOverview = statsRes.data;
      state.totalRecords = stats.totalRecords || 0;
      state.upDays = stats.changeStats?.upDays || 0;
    }
    
    console.log("左上--价格指数概览", { latestRes, statsRes });
  } catch (err: any) {
    console.error("获取数据失败:", err);
    ElMessage.error(err || "获取价格指数数据失败");
  } finally {
    state.loading = false;
  }
};

// 初始加载
onMounted(() => {
  getData();
  
  // 每30秒刷新一次数据
  timer = setInterval(() => {
    getData();
  }, 30000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <ul class="user_Overview flex">
    <li class="user_Overview-item" style="color: #00fdfa">
      <div class="user_Overview_nums allnum">
        <CountUp :endVal="state.currentIndex" :duration="duration" :decimals="2" />
      </div>
      <p>当前指数</p>
    </li>
    <li class="user_Overview-item" :style="{ color: state.todayChange >= 0 ? '#07f7a8' : '#f5023d' }">
      <div class="user_Overview_nums change-num" :class="state.todayChange >= 0 ? 'online' : 'laramnum'">
        <div class="change-value">
          <span v-if="state.todayChange > 0" class="change-sign">+</span>
          <span v-else-if="state.todayChange < 0" class="change-sign">-</span>
          <CountUp :endVal="Math.abs(state.todayChange)" :duration="duration" :decimals="2" />
        </div>
      </div>
      <p>今日涨跌</p>
    </li>
    <li class="user_Overview-item" style="color: #e3b337">
      <div class="user_Overview_nums offline">
        <CountUp :endVal="state.totalRecords" :duration="duration" />
      </div>
      <p>数据天数</p>
    </li>
    <li class="user_Overview-item" style="color: #07f7a8">
      <div class="user_Overview_nums online">
        <CountUp :endVal="state.upDays" :duration="duration" />
      </div>
      <p>上涨天数</p>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.left-top {
  width: 100%;
  height: 100%;
}

.user_Overview {
  li {
    flex: 1;

    p {
      text-align: center;
      height: 16px;
      font-size: 16px;
    }

    .user_Overview_nums {
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
      font-size: 22px;
      margin: 50px auto 30px;
      background-size: cover;
      background-position: center center;
      position: relative;

      &::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }

      &.bgdonghua::before {
        animation: rotating 14s linear infinite;
      }
    }

    .allnum {
      &::before {
        background-image: url("@/assets/img/left_top_lan.png");
      }
    }

    .online {
      &::before {
        background-image: url("@/assets/img/left_top_lv.png");
      }
    }

    .offline {
      &::before {
        background-image: url("@/assets/img/left_top_huang.png");
      }
    }

    .laramnum {
      &::before {
        background-image: url("@/assets/img/left_top_hong.png");
      }
    }

    // 今日涨跌样式
    .change-num {
      .change-value {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .change-sign {
          font-size: 18px;
          font-weight: bold;
          margin-right: 2px;
        }
      }
    }
  }
}
</style>
