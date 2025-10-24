<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { getPricesRanking } from "@/api/agriPrice.api";
import { ElMessage } from "element-plus";
import type { PriceData } from "@/types/agriPrice";

const activeTab = ref<'increase' | 'decrease'>('increase');
const rankingList = ref<PriceData[]>([]);
const loading = ref(false);
let timer: any = null;

const getData = async () => {
  try {
    loading.value = true;
    const res = await getPricesRanking(activeTab.value, 10, 30);
    
    if (res.success && res.data) {
      rankingList.value = res.data;
      console.log("左中--价格涨跌排行", res);
    }
  } catch (err: any) {
    console.error("获取排行榜失败:", err);
    ElMessage.error(err || "获取价格排行榜失败");
  } finally {
    loading.value = false;
  }
};

const switchTab = (type: 'increase' | 'decrease') => {
  activeTab.value = type;
  getData();
};

onMounted(() => {
  getData();
  
  // 每60秒刷新一次
  timer = setInterval(() => {
    getData();
  }, 60000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="ranking-container">
    <!-- 切换标签 -->
    <div class="tab-switch">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'increase' }"
        @click="switchTab('increase')"
      >
        <span class="tab-icon">📈</span>
        <span>涨幅榜</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'decrease' }"
        @click="switchTab('decrease')"
      >
        <span class="tab-icon">📉</span>
        <span>跌幅榜</span>
      </div>
    </div>

    <!-- 排行榜列表 -->
    <div class="ranking-list" v-loading="loading">
      <div 
        v-for="(item, index) in rankingList" 
        :key="item._id"
        class="ranking-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="rank-number" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>
        <div class="rank-content">
          <div class="rank-date">{{ item.date }}</div>
          <div class="rank-title">{{ item.title.substring(0, 35) }}...</div>
        </div>
        <div class="rank-change" :class="item.change >= 0 ? 'up' : 'down'">
          <span class="change-value">
            {{ item.change > 0 ? '+' : '' }}{{ item.change.toFixed(2) }}
          </span>
          <span class="change-unit">点</span>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && rankingList.length === 0" class="empty-state">
        暂无数据
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ranking-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  padding: 0 10px;

  .tab-item {
    flex: 1;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(0, 120, 255, 0.1);
    border: 1px solid rgba(0, 120, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
    color: #7abaff;

    .tab-icon {
      font-size: 16px;
    }

    &:hover {
      background: rgba(0, 120, 255, 0.2);
      border-color: rgba(0, 120, 255, 0.5);
    }

    &.active {
      background: linear-gradient(135deg, #0078ff 0%, #00d4ff 100%);
      border-color: #00d4ff;
      color: #fff;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.4);
    }
  }
}

.ranking-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  margin-bottom: 8px;
  background: rgba(0, 40, 80, 0.3);
  border: 1px solid rgba(0, 120, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 60, 120, 0.4);
    border-color: rgba(0, 212, 255, 0.4);
    transform: translateX(2px);
  }

  &.top-three {
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 40, 80, 0.3) 50%);
    border-color: rgba(255, 215, 0, 0.3);
  }
}

.rank-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 120, 255, 0.3);
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  color: #7abaff;
  flex-shrink: 0;

  &.rank-1 {
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    color: #fff;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }

  &.rank-2 {
    background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%);
    color: #fff;
    box-shadow: 0 0 8px rgba(192, 192, 192, 0.6);
  }

  &.rank-3 {
    background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
    color: #fff;
    box-shadow: 0 0 8px rgba(205, 127, 50, 0.6);
  }
}

.rank-content {
  flex: 1;
  min-width: 0;

  .rank-date {
    font-size: 11px;
    color: #7abaff;
    margin-bottom: 2px;
  }

  .rank-title {
    font-size: 12px;
    color: #b8d9ff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.rank-change {
  flex-shrink: 0;
  text-align: right;

  .change-value {
    font-size: 16px;
    font-weight: bold;
    display: block;
  }

  .change-unit {
    font-size: 11px;
    opacity: 0.7;
  }

  &.up {
    color: #07f7a8;
  }

  &.down {
    color: #f5023d;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #7abaff;
  opacity: 0.6;
}
</style>
