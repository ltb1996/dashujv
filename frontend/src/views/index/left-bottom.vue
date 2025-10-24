<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getProductStatistics } from "@/api/agriPrice.api";
import { ElMessage } from "element-plus";
import type { ProductStatistics } from "@/types/agriPrice";

const productList = ref<any[]>([]);
const loading = ref(false);
let timer: any = null;

// 产品名称映射
const productNameMap: Record<string, string> = {
  vegetable: '蔬菜',
  pork: '猪肉',
  beef: '牛肉',
  mutton: '羊肉',
  egg: '鸡蛋',
  chicken: '白条鸡',
  fish: '活鲤鱼',
  apple: '富士苹果',
  banana: '香蕉'
};

const getData = async () => {
  try {
    loading.value = true;
    const res = await getProductStatistics(30);
    
    if (res.success && res.data) {
      const stats: ProductStatistics = res.data;
      
      // 转换为数组格式
      productList.value = Object.keys(stats).map((key) => ({
        key,
        name: stats[key].name || productNameMap[key] || key,
        current: parseFloat(stats[key].current),
        average: parseFloat(stats[key].average),
        max: parseFloat(stats[key].max),
        min: parseFloat(stats[key].min),
        unit: stats[key].unit
      }));
      
      console.log("左下--产品价格统计", res);
    }
  } catch (err: any) {
    console.error("获取产品统计失败:", err);
    ElMessage.error(err || "获取产品价格统计失败");
  } finally {
    loading.value = false;
  }
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
  <div class="product-stats-container" v-loading="loading">
    <div class="product-table">
      <div class="table-header">
        <div class="col col-name">产品</div>
        <div class="col col-price">当前价</div>
        <div class="col col-average">均价</div>
        <div class="col col-range">最高/最低</div>
      </div>
      
      <div class="table-body">
        <div 
          v-for="(item, index) in productList" 
          :key="item.key"
          class="table-row"
          :class="{ 'row-even': index % 2 === 0 }"
        >
          <div class="col col-name">
            <span class="product-icon">🌾</span>
            <span class="product-name">{{ item.name }}</span>
          </div>
          <div class="col col-price">
            <span class="price-value">{{ item.current.toFixed(2) }}</span>
            <span class="price-unit">{{ item.unit }}</span>
          </div>
          <div class="col col-average">
            <span class="avg-value">{{ item.average }}</span>
          </div>
          <div class="col col-range">
            <div class="range-values">
              <span class="max-value">{{ item.max }}</span>
              <span class="divider">/</span>
              <span class="min-value">{{ item.min }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!loading && productList.length === 0" class="empty-state">
      暂无数据
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-stats-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.product-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: linear-gradient(90deg, rgba(0, 120, 255, 0.2) 0%, rgba(0, 212, 255, 0.1) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: bold;
  color: #7abaff;

  .col {
    text-align: center;
  }

  .col-name {
    flex: 2;
    text-align: left;
    padding-left: 8px;
  }

  .col-price {
    flex: 1.5;
  }

  .col-average {
    flex: 1;
  }

  .col-range {
    flex: 1.5;
  }
}

.table-body {
  flex: 1;
  overflow-y: auto;
  
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

.table-row {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 6px;
  background: rgba(0, 40, 80, 0.2);
  border: 1px solid rgba(0, 120, 255, 0.15);
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 12px;

  &:hover {
    background: rgba(0, 60, 120, 0.3);
    border-color: rgba(0, 212, 255, 0.3);
    transform: translateX(2px);
  }

  &.row-even {
    background: rgba(0, 40, 80, 0.15);
  }

  .col {
    text-align: center;
  }

  .col-name {
    flex: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    padding-left: 8px;

    .product-icon {
      font-size: 16px;
    }

    .product-name {
      font-size: 13px;
      color: #b8d9ff;
      font-weight: 500;
    }
  }

  .col-price {
    flex: 1.5;
    display: flex;
    flex-direction: column;
    align-items: center;

    .price-value {
      font-size: 15px;
      font-weight: bold;
      color: #00fdfa;
    }

    .price-unit {
      font-size: 10px;
      color: #7abaff;
      opacity: 0.7;
      margin-top: 2px;
    }
  }

  .col-average {
    flex: 1;
    color: #7abaff;
    font-size: 12px;
  }

  .col-range {
    flex: 1.5;

    .range-values {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 11px;

      .max-value {
        color: #f5023d;
        font-weight: 500;
      }

      .divider {
        color: #7abaff;
        opacity: 0.5;
      }

      .min-value {
        color: #07f7a8;
        font-weight: 500;
      }
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7abaff;
  opacity: 0.6;
}
</style>
