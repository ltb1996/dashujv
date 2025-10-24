[13 tools called]

## 📋 **可删除的多余文件清单**

基于你当前的开发进度（已接入真实API，完成了8个组件的改造），以下文件/文件夹是多余的，**建议删除**：

---

### 🗑️ **1. Mock数据相关（已被真实API替代）**

```
✗ frontend/src/mock/               # 整个Mock文件夹
  - index.d.ts
  - index.ts
  - mock-index.ts
```

**原因**：你已经接入了真实的后端API（agriPrice.api.ts），不再需要Mock数据。

**额外操作**：删除后需要在 `frontend/src/main.ts` 中注释掉以下两行：
```typescript
// import { mockXHR } from "@/mock/index";
// mockXHR()
```

---

### 🗑️ **2. 旧的API模块（原项目遗留）**

```
✗ frontend/src/api/modules/index.ts
```

**原因**：这个文件包含的都是旧项目的Mock API接口（leftTop、leftCenter、centerMap、installationPlan等），你的新项目已经用 `agriPrice.api.ts` 替代。

**额外操作**：删除后需要在 `frontend/src/api/index.ts` 中删除导出：
```typescript
// export * from "./modules/index"  // 删除这行
```

---

### 🗑️ **3. 未使用的组件**

```
✗ frontend/src/components/datav/capsule-chart/    # 胶囊图组件
  - capsule-chart.vue
  - index.d.ts
  - index.ts

✗ frontend/src/components/seamless-scroll/        # 无缝滚动组件
  - seamless-scroll.vue
  - index.ts

✗ frontend/src/components/empty-com/              # 空组件
  - empty-com.vue
  - index.ts
```

**原因**：
- **capsule-chart**：右中组件原本使用，现在已改用ECharts多线图
- **seamless-scroll**：右下组件原本使用，现在已改用ECharts饼图
- **empty-com**：项目中完全未使用

---

### 🗑️ **4. 未使用的图片资源**

```
✗ frontend/src/assets/img/big-data/              # 整个文件夹
  - center-details-data1.png
  - center-details-data2.png
  - center-details-data3.png
  - center-details-data4.png
  - center-details-data5.png
  - center-details-data6.png
```

**原因**：这6张图片在整个项目中没有任何引用，属于原模板项目遗留。

---

## 📊 **删除总结**

```
可删除文件统计：
├── Mock数据：3个文件
├── 旧API模块：1个文件
├── 未使用组件：7个文件
└── 未使用图片：6个文件
──────────────────────
总计：17个文件可删除
```

---

## ⚠️ **删除建议**

### ✅ **强烈建议删除**（100%确定不需要）：
1. `src/assets/img/big-data/` 文件夹
2. `src/components/datav/capsule-chart/` 文件夹
3. `src/components/seamless-scroll/` 文件夹
4. `src/components/empty-com/` 文件夹

### ⚠️ **建议删除**（需要同时修改引用）：
1. `src/mock/` 文件夹（需修改 main.ts）
2. `src/api/modules/index.ts`（需修改 api/index.ts）

### 📝 **保留建议**（暂时可保留）：
- `src/views/index.d.ts` - 可能有类型定义，建议检查后再决定
- `src/components/datav/border-box-13/` - 地图组件还在使用

---

## 🎯 **删除后的好处**

1. **减少项目体积** - 删除约 17+ 个无用文件
2. **提高构建速度** - 减少编译和打包时间
3. **代码更清晰** - 避免混淆新旧代码
4. **维护更容易** - 减少不必要的依赖关系

---

**请根据这个清单手动删除文件，我已经按照你的要求，没有执行任何删除操作！** ✅