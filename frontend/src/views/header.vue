<script setup lang="ts">
import { reactive, onUnmounted } from "vue";
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import type {DateDataType} from "./index.d"
import {useSettingStore} from "../stores/index"

const router = useRouter();
const route = useRoute();

const dateData = reactive<DateDataType>({
  dateDay: "",
  dateYear: "",
  dateWeek: "",
  timing: null
});

const { setSettingShow} =useSettingStore()
const weekday= ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

const timeFn = () => {
  dateData.timing = setInterval(() => {
    dateData.dateDay = dayjs().format("YYYY-MM-DD hh : mm : ss");
    dateData.dateWeek = weekday[dayjs().day()];
  }, 1000);
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (dateData.timing) {
    clearInterval(dateData.timing);
  }
});

// 导航到成果展示页面
const goToConclusion = () => {
  router.push('/conclusion');
};

// 返回数据大屏
const goToIndex = () => {
  router.push('/index');
};

timeFn()
</script>

<template>
  <div class="d-flex jc-center title_wrap">
    <div class="zuojuxing"></div>
    <div class="youjuxing"></div>
    <div class="guang"></div>
    <div class="d-flex jc-center">
      <div class="title">
        <span class="title-text">农产品市场预测与大数据分析系统</span>
      </div>
    </div>
    <div class="timers">
      {{ dateData.dateYear }} {{ dateData.dateWeek }} {{ dateData.dateDay }}

      <!-- 页面切换按钮 -->
      <div class="nav-buttons">
        <button 
          v-if="route.path === '/index'" 
          class="nav-btn conclusion-btn" 
          @click="goToConclusion"
          title="查看项目成果"
        >
          <span>📊</span>
          <span>成果展示</span>
        </button>
        <button 
          v-if="route.path === '/conclusion'" 
          class="nav-btn index-btn" 
          @click="goToIndex"
          title="返回数据大屏"
        >
          <span>📈</span>
          <span>数据大屏</span>
        </button>
      </div>

      <div class="setting_icon"   @click="setSettingShow(true)">
          <img src="@/assets/img/headers/setting.png" alt="设置">
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.title_wrap {
  height: 60px;
  background-image: url("../assets/img/top.png");
  background-size: cover;
  background-position: center center;
  position: relative;
  margin-bottom: 4px;

  .guang {
    position: absolute;
    bottom: -26px;
    background-image: url("../assets/img/guang.png");
    background-position: 80px center;
    width: 100%;
    height: 56px;
  }

  .zuojuxing,
  .youjuxing {
    position: absolute;
    top: -2px;
    width: 140px;
    height: 6px;
    background-image: url("../assets/img/headers/juxing1.png");
  }

  .zuojuxing {
    left: 11%;
  }

  .youjuxing {
    right: 11%;
    transform: rotate(180deg);
  }

  .timers {
    position: absolute;
    right: 0;
    top: 30px;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 15px;

    .nav-buttons {
      display: flex;
      gap: 10px;

      .nav-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: linear-gradient(135deg, rgba(0, 114, 255, 0.3) 0%, rgba(0, 234, 255, 0.3) 100%);
        border: 1px solid rgba(0, 234, 255, 0.5);
        border-radius: 20px;
        color: #00eaff;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;

        &:hover {
          background: linear-gradient(135deg, rgba(0, 114, 255, 0.5) 0%, rgba(0, 234, 255, 0.5) 100%);
          border-color: #00eaff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 234, 255, 0.3);
        }

        &:active {
          transform: translateY(0);
        }

        span:first-child {
          font-size: 16px;
        }
      }

      .conclusion-btn {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
        border-color: rgba(102, 126, 234, 0.5);
        color: #a78bfa;

        &:hover {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
          border-color: #a78bfa;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }
    }

    .setting_icon {
      width: 20px;
      height: 20px;
      cursor: pointer;
      img{
        width: 100%;
        height: 100%;
      }
    }
  }
}
.title {
  position: relative;
  // width: 500px;
  text-align: center;
  background-size: cover;
  color: transparent;
  height: 60px;
  line-height: 46px;

  .title-text {
    font-size: 38px;
    font-weight: 900;
    letter-spacing: 6px;
    width: 100%;
    background: linear-gradient(
      92deg,
      #0072ff 0%,
      #00eaff 48.8525390625%,
      #01aaff 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
</style>
