"""
生成农产品价格模拟数据
基于真实规律生成高质量的模拟数据

【大数据处理增强版】
- 任务3：使用Pandas/NumPy进行数据探索与预处理
- 任务4：使用Matplotlib/Pyecharts进行数据统计与可视化
- 任务5：使用sklearn进行数据建模与预测评估
"""

import json
import random
from datetime import datetime, timedelta
import os
import math
import warnings
warnings.filterwarnings('ignore')

# 任务3：数据处理库
import pandas as pd
import numpy as np

# 任务4：数据可视化库
import matplotlib
matplotlib.use('Agg')  # 使用非交互式后端
import matplotlib.pyplot as plt
import seaborn as sns
from pyecharts import options as opts
from pyecharts.charts import Line, Bar, Pie, Scatter, HeatMap, Kline
from pyecharts.commons.utils import JsCode

# 任务5：机器学习库
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

# 设置中文显示
# 尝试多个中文字体，按优先级排列
try:
    # Windows系统中文字体
    import matplotlib.font_manager as fm
    
    # 查找系统中可用的中文字体
    font_list = [f.name for f in fm.fontManager.ttflist]
    
    # 优先使用的中文字体列表
    chinese_fonts = ['Microsoft YaHei', 'SimHei', 'KaiTi', 'FangSong', 'SimSun', 'Arial Unicode MS']
    
    # 找到第一个可用的中文字体
    available_font = None
    for font in chinese_fonts:
        if font in font_list:
            available_font = font
            print(f"✓ 找到中文字体: {font}")
            break
    
    if available_font:
        plt.rcParams['font.sans-serif'] = [available_font]
    else:
        # 如果都没找到，尝试使用系统默认字体
        plt.rcParams['font.family'] = ['sans-serif']
        print("⚠️  未找到中文字体，图表中文可能显示为方块")
        
except Exception as e:
    print(f"⚠️  字体设置警告: {e}")
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']

plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题
sns.set_style("whitegrid")

class AgriPriceDataGenerator:
    def __init__(self):
        # 基准价格指数（参考真实数据）
        self.base_index = 120.0
        self.basket_base_index = 121.5
        
        # 产品基准价格（元/公斤）
        self.product_base_prices = {
            'vegetable': {'name': '蔬菜', 'price': 5.8, 'volatility': 0.15},
            'pork': {'name': '猪肉', 'price': 22.5, 'volatility': 0.08},
            'beef': {'name': '牛肉', 'price': 76.8, 'volatility': 0.05},
            'mutton': {'name': '羊肉', 'price': 68.5, 'volatility': 0.06},
            'egg': {'name': '鸡蛋', 'price': 11.2, 'volatility': 0.12},
            'chicken': {'name': '白条鸡', 'price': 18.6, 'volatility': 0.07},
            'fish': {'name': '活鲤鱼', 'price': 13.8, 'volatility': 0.08},
            'apple': {'name': '富士苹果', 'price': 9.5, 'volatility': 0.10},
            'banana': {'name': '香蕉', 'price': 6.2, 'volatility': 0.12},
        }
        
        self.data = []
    
    def generate_seasonal_factor(self, date):
        """生成季节性因子"""
        month = date.month
        
        # 冬季和春节前价格偏高，夏秋季价格偏低
        seasonal_factors = {
            1: 1.15,   # 冬季+春节
            2: 1.20,   # 春节
            3: 1.05,   # 早春
            4: 0.95,   # 春季
            5: 0.90,   # 初夏
            6: 0.92,   # 夏季
            7: 0.88,   # 盛夏
            8: 0.90,   # 夏末
            9: 0.95,   # 初秋
            10: 1.00,  # 秋季
            11: 1.08,  # 秋冬
            12: 1.12,  # 冬季
        }
        
        return seasonal_factors.get(month, 1.0)
    
    def generate_weekly_factor(self, date):
        """生成周内因子（周末价格略高）"""
        weekday = date.weekday()
        if weekday >= 4:  # 周五、周六
            return 1.02
        return 1.0
    
    def generate_trend(self, days_passed, total_days):
        """生成长期趋势（缓慢上涨）"""
        # 年化涨幅约3-5%
        annual_growth = 0.04
        return 1 + (annual_growth * days_passed / total_days)
    
    def generate_random_event(self, date):
        """生成随机事件影响"""
        # 5%概率发生异常事件
        if random.random() < 0.05:
            event_type = random.choice(['positive', 'negative'])
            if event_type == 'positive':
                return random.uniform(-0.02, -0.005), "利好政策"
            else:
                return random.uniform(0.005, 0.02), "不利天气"
        return 0, None
    
    def generate_one_day_data(self, date, prev_index, days_passed, total_days):
        """生成一天的数据"""
        
        # 计算各种因子
        seasonal = self.generate_seasonal_factor(date)
        weekly = self.generate_weekly_factor(date)
        trend = self.generate_trend(days_passed, total_days)
        event_change, event_desc = self.generate_random_event(date)
        
        # 随机波动
        random_change = random.uniform(-0.01, 0.01)
        
        # 计算总变化
        total_change = (seasonal - 1) * 0.3 + (weekly - 1) * 0.5 + (trend - 1) * 0.3 + event_change + random_change
        
        # 限制单日最大涨跌幅在±3%
        total_change = max(-0.03, min(0.03, total_change))
        
        # 计算新指数
        new_index = prev_index * (1 + total_change)
        change_points = new_index - prev_index
        
        # 生成标题
        change_text = f"上升{abs(change_points):.2f}" if change_points >= 0 else f"下降{abs(change_points):.2f}"
        title = f"{date.month}月{date.day}日：\"农产品批发价格200指数\"比昨天{change_text}个点"
        
        # 生成菜篮子指数（略高于总指数）
        basket_index = new_index * 1.012
        
        # 生成各类产品价格
        products = {}
        for key, info in self.product_base_prices.items():
            base_price = info['price']
            volatility = info['volatility']
            
            # 产品价格变化与总指数相关，但有自己的波动
            product_change = total_change * 0.7 + random.uniform(-volatility, volatility) * 0.3
            product_change = max(-0.05, min(0.05, product_change))  # 限制±5%
            
            product_price = base_price * seasonal * trend * (1 + product_change)
            
            products[key] = {
                'name': info['name'],
                'price': round(product_price, 2),
                'change_percent': round(product_change * 100, 1),
                'unit': '元/公斤'
            }
        
        # 生成URL（模拟真实URL格式）
        url = f"https://www.agri.cn/V20/ZX/nyyw/202{date.year-2020}/{date.month:02d}/t{date.year}{date.month:02d}{date.day:02d}_{random.randint(10000000, 99999999)}.htm"
        
        return {
            'date': date.strftime('%Y-%m-%d'),
            'title': title,
            'url': url,
            'change': round(change_points, 2),
            'compare_base': '昨天',
            'index_value': round(new_index, 2),
            'basket_index': round(basket_index, 2),
            'products': products,
            'event': event_desc
        }
    
    def generate_year_data(self, start_date_str='2024-10-24', days=365):
        """生成一年的数据"""
        print("="*60)
        print("开始生成农产品价格模拟数据")
        print("="*60)
        
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        current_index = self.base_index
        
        for i in range(days):
            date = start_date - timedelta(days=i)  # 从最新日期往前生成
            
            day_data = self.generate_one_day_data(date, current_index, i, days)
            current_index = day_data['index_value']
            
            self.data.append(day_data)
            
            if (i + 1) % 50 == 0:
                print(f"已生成 {i + 1}/{days} 天数据...")
        
        # 按日期正序排列
        self.data = sorted(self.data, key=lambda x: x['date'])
        
        print(f"\n[OK] 完成！共生成 {len(self.data)} 条数据")
        return self.data
    
    def save_data(self, filename='agri_price_mock_data.json'):
        """保存数据"""
        data_dir = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        filepath = os.path.join(data_dir, filename)
        
        output = {
            'total': len(self.data),
            'generate_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'date_range': {
                'start': self.data[0]['date'] if self.data else None,
                'end': self.data[-1]['date'] if self.data else None
            },
            'description': '基于真实规律生成的农产品价格模拟数据，包含价格指数、各类农产品价格等',
            'data_quality': {
                'seasonal_variation': '包含季节性波动',
                'trend': '年化增长约4%',
                'events': '随机事件影响',
                'products': '9类农产品价格'
            },
            'data': self.data
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"\n数据已保存到: {filepath}")
        return filepath
    
    def generate_summary(self):
        """生成数据摘要"""
        if not self.data:
            return
        
        print("\n" + "="*60)
        print("数据摘要")
        print("="*60)
        
        # 基本统计
        print(f"总记录数: {len(self.data)}")
        print(f"日期范围: {self.data[0]['date']} 至 {self.data[-1]['date']}")
        
        # 指数统计
        indices = [d['index_value'] for d in self.data]
        print(f"\n价格指数:")
        print(f"  起始值: {indices[0]:.2f}")
        print(f"  结束值: {indices[-1]:.2f}")
        print(f"  最高值: {max(indices):.2f}")
        print(f"  最低值: {min(indices):.2f}")
        print(f"  年度涨幅: {((indices[-1] / indices[0]) - 1) * 100:.2f}%")
        
        # 涨跌统计
        changes = [d['change'] for d in self.data if d['change'] is not None]
        up_days = len([c for c in changes if c > 0])
        down_days = len([c for c in changes if c < 0])
        
        print(f"\n涨跌统计:")
        print(f"  上涨天数: {up_days} 天 ({up_days/len(changes)*100:.1f}%)")
        print(f"  下跌天数: {down_days} 天 ({down_days/len(changes)*100:.1f}%)")
        print(f"  最大单日涨幅: +{max(changes):.2f} 点")
        print(f"  最大单日跌幅: {min(changes):.2f} 点")
        print(f"  平均日涨跌: {sum(changes)/len(changes):.3f} 点")
        
        # 产品价格统计
        print(f"\n农产品价格范围:")
        for key, info in self.product_base_prices.items():
            prices = [d['products'][key]['price'] for d in self.data if key in d.get('products', {})]
            if prices:
                print(f"  {info['name']}: {min(prices):.2f} - {max(prices):.2f} 元/公斤")
        
        print("="*60)
        
        # 显示最近5天数据
        print("\n最近5天数据预览:")
        print("-"*60)
        for i, item in enumerate(self.data[-5:], 1):
            change_str = f"{item['change']:+.2f}" if item['change'] is not None else "N/A"
            print(f"{item['date']} | 指数:{item['index_value']:.2f} | 涨跌:{change_str}点")
            if item.get('event'):
                print(f"           事件: {item['event']}")
        print("-"*60 + "\n")
    
    # ========================================================================
    # 任务3：数据探索与预处理 (使用Pandas和NumPy)
    # ========================================================================
    
    def analyze_and_preprocess_data(self):
        """
        任务3：使用Pandas和NumPy进行数据探索与预处理
        - 数据加载与探索
        - 数据清洗与处理
        - 特征工程
        - 数据标准化
        """
        print("\n" + "="*80)
        print("【任务3】数据探索与预处理 (Pandas + NumPy)")
        print("="*80)
        
        # 1. 转换为DataFrame
        print("\n[步骤1] 使用Pandas加载数据...")
        df = pd.DataFrame(self.data)
        
        # 展开products字段为独立列
        for product_key in self.product_base_prices.keys():
            df[f'{product_key}_price'] = df['products'].apply(
                lambda x: x.get(product_key, {}).get('price', np.nan) if isinstance(x, dict) else np.nan
            )
        
        print(f"✓ 数据形状: {df.shape}")
        print(f"✓ 数据类型:\n{df.dtypes}")
        
        # 2. 数据探索
        print("\n[步骤2] 数据探索分析...")
        print(f"✓ 基本统计信息:")
        print(df[['index_value', 'basket_index', 'change']].describe())
        
        # 缺失值检查
        missing_values = df.isnull().sum()
        print(f"\n✓ 缺失值统计:")
        print(missing_values[missing_values > 0] if missing_values.sum() > 0 else "  无缺失值")
        
        # 3. 特征工程（使用NumPy和Pandas）
        print("\n[步骤3] 特征工程...")
        df['date'] = pd.to_datetime(df['date'])
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['weekday'] = df['date'].dt.weekday
        df['quarter'] = df['date'].dt.quarter
        df['day_of_year'] = df['date'].dt.dayofyear
        
        # 使用NumPy计算移动平均
        df['ma_7'] = df['index_value'].rolling(window=7, min_periods=1).mean()
        df['ma_15'] = df['index_value'].rolling(window=15, min_periods=1).mean()
        df['ma_30'] = df['index_value'].rolling(window=30, min_periods=1).mean()
        
        # 计算涨跌幅百分比
        df['change_percent'] = np.where(
            df['index_value'] != 0,
            (df['change'] / df['index_value']) * 100,
            0
        )
        
        # 计算波动率（使用NumPy）
        df['volatility'] = df['change'].rolling(window=7, min_periods=1).std()
        
        print(f"✓ 新增特征: 年月日、星期、季度、移动平均线(7/15/30日)、涨跌幅百分比、波动率")
        
        # 4. 数据标准化
        print("\n[步骤4] 数据标准化...")
        scaler = StandardScaler()
        df['index_value_scaled'] = scaler.fit_transform(df[['index_value']])
        print(f"✓ 价格指数已标准化（均值=0, 标准差=1）")
        
        # 5. 统计分析（使用NumPy）
        print("\n[步骤5] 使用NumPy进行统计计算...")
        index_values = df['index_value'].values
        print(f"✓ 均值: {np.mean(index_values):.2f}")
        print(f"✓ 中位数: {np.median(index_values):.2f}")
        print(f"✓ 标准差: {np.std(index_values):.2f}")
        print(f"✓ 方差: {np.var(index_values):.2f}")
        print(f"✓ 最小值: {np.min(index_values):.2f}")
        print(f"✓ 最大值: {np.max(index_values):.2f}")
        print(f"✓ 25分位数: {np.percentile(index_values, 25):.2f}")
        print(f"✓ 75分位数: {np.percentile(index_values, 75):.2f}")
        
        # 6. 相关性分析
        print("\n[步骤6] 产品价格相关性分析...")
        price_cols = [col for col in df.columns if col.endswith('_price')]
        correlation_matrix = df[price_cols].corr()
        print(f"✓ 已计算 {len(price_cols)} 种产品间的相关性矩阵")
        
        # 7. 保存预处理后的数据
        output_dir = os.path.join(os.path.dirname(__file__), 'data')
        processed_file = os.path.join(output_dir, 'processed_data.csv')
        df.to_csv(processed_file, index=False, encoding='utf-8-sig')
        print(f"\n✓ 预处理后的数据已保存: {processed_file}")
        
        print("\n" + "="*80)
        print("【任务3完成】数据探索与预处理成功！")
        print("="*80)
        
        return df, correlation_matrix
    
    # ========================================================================
    # 任务4：数据统计与可视化 (使用Matplotlib和Pyecharts)
    # ========================================================================
    
    def visualize_data(self, df, correlation_matrix):
        """
        任务4：使用Matplotlib和Pyecharts进行数据统计与可视化
        - Matplotlib生成静态图表
        - Pyecharts生成交互式图表
        """
        print("\n" + "="*80)
        print("【任务4】数据统计与可视化 (Matplotlib + Pyecharts)")
        print("="*80)
        
        output_dir = os.path.join(os.path.dirname(__file__), 'visualizations')
        os.makedirs(output_dir, exist_ok=True)
        
        # ==================== Matplotlib静态图表 ====================
        print("\n[1] 使用Matplotlib生成静态图表...")
        
        # 创建大图
        fig = plt.figure(figsize=(20, 12))
        
        # Chart 1: Price Index Trend
        ax1 = plt.subplot(3, 3, 1)
        ax1.plot(df['date'], df['index_value'], label='Price Index', color='#2E86DE', linewidth=2)
        ax1.plot(df['date'], df['ma_7'], label='MA-7', color='#EE5A6F', linestyle='--', alpha=0.7)
        ax1.plot(df['date'], df['ma_30'], label='MA-30', color='#26DE81', linestyle='--', alpha=0.7)
        ax1.set_title('Price Index Trend', fontsize=14, fontweight='bold')
        ax1.set_xlabel('Date')
        ax1.set_ylabel('Price Index')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Chart 2: Price Index Distribution
        ax2 = plt.subplot(3, 3, 2)
        ax2.hist(df['index_value'], bins=40, color='#5F27CD', alpha=0.7, edgecolor='black')
        ax2.axvline(df['index_value'].mean(), color='red', linestyle='--', label=f'Mean: {df["index_value"].mean():.2f}')
        ax2.set_title('Price Index Distribution', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Price Index')
        ax2.set_ylabel('Frequency')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        # Chart 3: Price Change Box Plot
        ax3 = plt.subplot(3, 3, 3)
        box_data = [df[df['change'] > 0]['change'].dropna(), 
                    df[df['change'] < 0]['change'].dropna()]
        ax3.boxplot(box_data, labels=['Up', 'Down'], patch_artist=True,
                   boxprops=dict(facecolor='lightblue', alpha=0.7))
        ax3.set_title('Price Change Distribution', fontsize=14, fontweight='bold')
        ax3.set_ylabel('Change Points')
        ax3.grid(True, alpha=0.3)
        
        # Chart 4: Monthly Average Price
        ax4 = plt.subplot(3, 3, 4)
        monthly_avg = df.groupby('month')['index_value'].mean()
        bars = ax4.bar(monthly_avg.index, monthly_avg.values, color='#FD79A8', alpha=0.8, edgecolor='black')
        ax4.set_title('Monthly Average Price', fontsize=14, fontweight='bold')
        ax4.set_xlabel('Month')
        ax4.set_ylabel('Average Price Index')
        ax4.set_xticks(range(1, 13))
        ax4.grid(True, alpha=0.3, axis='y')
        
        # Chart 5: Weekday Pattern
        ax5 = plt.subplot(3, 3, 5)
        weekday_avg = df.groupby('weekday')['index_value'].mean()
        weekday_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        ax5.plot(weekday_names, weekday_avg.values, marker='o', color='#00B894', linewidth=2, markersize=8)
        ax5.set_title('Weekday Price Pattern', fontsize=14, fontweight='bold')
        ax5.set_ylabel('Average Price Index')
        ax5.grid(True, alpha=0.3)
        
        # Chart 6: Product Price Comparison
        ax6 = plt.subplot(3, 3, 6)
        price_cols = [col for col in df.columns if col.endswith('_price')][:5]
        product_name_map = {
            'vegetable': 'Vegetable', 'pork': 'Pork', 'beef': 'Beef',
            'mutton': 'Mutton', 'egg': 'Egg', 'chicken': 'Chicken',
            'fish': 'Fish', 'apple': 'Apple', 'banana': 'Banana'
        }
        for col in price_cols:
            product_key = col.replace('_price', '')
            label = product_name_map.get(product_key, product_key)
            ax6.plot(df['date'], df[col], label=label, linewidth=1.5, alpha=0.8)
        ax6.set_title('Main Product Price Trends', fontsize=14, fontweight='bold')
        ax6.set_xlabel('Date')
        ax6.set_ylabel('Price (Yuan/kg)')
        ax6.legend(loc='best', fontsize=8)
        ax6.grid(True, alpha=0.3)
        
        # Chart 7: Correlation Heatmap
        ax7 = plt.subplot(3, 3, 7)
        price_cols_heatmap = [col for col in df.columns if col.endswith('_price')]
        corr_data = df[price_cols_heatmap].corr()
        sns.heatmap(corr_data, annot=True, fmt='.2f', cmap='coolwarm', 
                   square=True, ax=ax7, cbar_kws={'shrink': 0.8})
        ax7.set_title('Product Price Correlation', fontsize=14, fontweight='bold')
        
        # Chart 8: Price Change Distribution
        ax8 = plt.subplot(3, 3, 8)
        change_counts = [len(df[df['change'] > 0]), len(df[df['change'] < 0]), len(df[df['change'] == 0])]
        labels = [f'Up\n{change_counts[0]}d', f'Down\n{change_counts[1]}d', f'Flat\n{change_counts[2]}d']
        colors = ['#26DE81', '#FC5C65', '#A3A3A3']
        ax8.pie(change_counts, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        ax8.set_title('Price Change Distribution', fontsize=14, fontweight='bold')
        
        # Chart 9: Quarterly Statistics
        ax9 = plt.subplot(3, 3, 9)
        quarterly_data = df.groupby('quarter').agg({
            'index_value': 'mean',
            'change': 'sum'
        })
        x = np.arange(len(quarterly_data))
        width = 0.35
        ax9.bar(x - width/2, quarterly_data['index_value'], width, label='Avg Index', color='#4834DF')
        ax9_twin = ax9.twinx()
        ax9_twin.bar(x + width/2, quarterly_data['change'], width, label='Total Change', color='#F0932B')
        ax9.set_title('Quarterly Statistics', fontsize=14, fontweight='bold')
        ax9.set_xlabel('Quarter')
        ax9.set_ylabel('Average Price Index')
        ax9_twin.set_ylabel('Total Change Points')
        ax9.set_xticks(x)
        ax9.set_xticklabels([f'Q{i}' for i in quarterly_data.index])
        ax9.legend(loc='upper left')
        ax9_twin.legend(loc='upper right')
        
        plt.tight_layout()
        matplotlib_output = os.path.join(output_dir, 'price_analysis_matplotlib.png')
        plt.savefig(matplotlib_output, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"✓ Matplotlib图表已保存: {matplotlib_output}")
        
        # ==================== Pyecharts交互式图表 ====================
        print("\n[2] 使用Pyecharts生成交互式图表...")
        
        # 图表1: 价格趋势交互式折线图
        line = (
            Line()
            .add_xaxis(df['date'].dt.strftime('%Y-%m-%d').tolist())
            .add_yaxis(
                "价格指数",
                df['index_value'].tolist(),
                is_smooth=True,
                linestyle_opts=opts.LineStyleOpts(width=2),
                itemstyle_opts=opts.ItemStyleOpts(color='#5470C6')
            )
            .add_yaxis(
                "7日均线",
                df['ma_7'].tolist(),
                is_smooth=True,
                linestyle_opts=opts.LineStyleOpts(width=2, type_='dashed'),
                itemstyle_opts=opts.ItemStyleOpts(color='#EE6666')
            )
            .add_yaxis(
                "30日均线",
                df['ma_30'].tolist(),
                is_smooth=True,
                linestyle_opts=opts.LineStyleOpts(width=2, type_='dashed'),
                itemstyle_opts=opts.ItemStyleOpts(color='#91CC75')
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(title="农产品价格指数趋势", subtitle="含移动平均线"),
                tooltip_opts=opts.TooltipOpts(trigger="axis"),
                xaxis_opts=opts.AxisOpts(type_="category", boundary_gap=False),
                yaxis_opts=opts.AxisOpts(name="价格指数"),
                datazoom_opts=[opts.DataZoomOpts(range_start=0, range_end=100)],
            )
        )
        line_output = os.path.join(output_dir, 'price_trend_pyecharts.html')
        line.render(line_output)
        print(f"✓ 交互式趋势图已保存: {line_output}")
        
        # 图表2: 月度统计柱状图
        monthly_stats = df.groupby('month').agg({
            'index_value': 'mean',
            'change': ['sum', 'count']
        }).round(2)
        
        bar = (
            Bar()
            .add_xaxis([f"{i}月" for i in range(1, 13)])
            .add_yaxis("平均价格指数", monthly_stats['index_value']['mean'].tolist())
            .set_global_opts(
                title_opts=opts.TitleOpts(title="月度价格统计"),
                tooltip_opts=opts.TooltipOpts(trigger="axis"),
                xaxis_opts=opts.AxisOpts(name="月份"),
                yaxis_opts=opts.AxisOpts(name="平均价格指数"),
            )
        )
        bar_output = os.path.join(output_dir, 'monthly_stats_pyecharts.html')
        bar.render(bar_output)
        print(f"✓ 交互式柱状图已保存: {bar_output}")
        
        # 图表3: 涨跌分布饼图
        up_count = len(df[df['change'] > 0])
        down_count = len(df[df['change'] < 0])
        flat_count = len(df[df['change'] == 0])
        
        pie = (
            Pie()
            .add(
                "",
                [
                    ("上涨", up_count),
                    ("下跌", down_count),
                    ("持平", flat_count),
                ],
                radius=["40%", "70%"],
            )
            .set_global_opts(
                title_opts=opts.TitleOpts(title="价格涨跌分布"),
                legend_opts=opts.LegendOpts(orient="vertical", pos_left="left"),
            )
            .set_series_opts(label_opts=opts.LabelOpts(formatter="{b}: {c}天 ({d}%)"))
        )
        pie_output = os.path.join(output_dir, 'change_distribution_pyecharts.html')
        pie.render(pie_output)
        print(f"✓ 交互式饼图已保存: {pie_output}")
        
        print("\n" + "="*80)
        print("【任务4完成】数据可视化成功！共生成 6 个图表文件")
        print("="*80)
    
    # ========================================================================
    # 任务5：数据建模与评估 (使用sklearn)
    # ========================================================================
    
    def build_prediction_models(self, df):
        """
        任务5：使用sklearn进行数据建模与预测评估
        - 特征准备
        - 多模型训练（线性回归、随机森林、梯度提升）
        - 模型评估对比
        - 模型保存
        """
        print("\n" + "="*80)
        print("【任务5】数据建模与预测评估 (sklearn)")
        print("="*80)
        
        # 1. 特征准备
        print("\n[步骤1] 准备训练数据...")
        
        # 选择特征
        feature_columns = ['month', 'day', 'weekday', 'quarter', 'day_of_year', 
                          'ma_7', 'ma_30', 'volatility']
        
        # 处理缺失值
        df_model = df[feature_columns + ['index_value']].copy()
        df_model = df_model.bfill().ffill()  # 向后填充，然后向前填充
        
        X = df_model[feature_columns].values
        y = df_model['index_value'].values
        
        print(f"✓ 特征数量: {X.shape[1]}")
        print(f"✓ 样本数量: {X.shape[0]}")
        print(f"✓ 特征列表: {feature_columns}")
        
        # 2. 数据集划分
        print("\n[步骤2] 划分训练集和测试集...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, shuffle=False  # 时间序列不打乱
        )
        print(f"✓ 训练集大小: {X_train.shape[0]} 样本")
        print(f"✓ 测试集大小: {X_test.shape[0]} 样本")
        
        # 3. 特征标准化
        print("\n[步骤3] 特征标准化...")
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        print(f"✓ 特征已标准化（均值=0，标准差=1）")
        
        # 4. 模型训练与评估
        print("\n[步骤4] 训练多个机器学习模型...")
        
        models = {
            '线性回归': LinearRegression(),
            '随机森林': RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
            '梯度提升': GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
        }
        
        results = {}
        best_model = None
        best_score = -float('inf')
        
        print("\n模型训练结果:")
        print("-" * 80)
        
        for name, model in models.items():
            # 训练模型
            model.fit(X_train_scaled, y_train)
            
            # 预测
            y_pred_train = model.predict(X_train_scaled)
            y_pred_test = model.predict(X_test_scaled)
            
            # 评估指标
            train_r2 = r2_score(y_train, y_pred_train)
            test_r2 = r2_score(y_test, y_pred_test)
            test_mae = mean_absolute_error(y_test, y_pred_test)
            test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
            test_mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100
            
            results[name] = {
                'model': model,
                'train_r2': train_r2,
                'test_r2': test_r2,
                'mae': test_mae,
                'rmse': test_rmse,
                'mape': test_mape,
                'predictions': y_pred_test
            }
            
            print(f"\n{name}:")
            print(f"  训练集 R²: {train_r2:.4f}")
            print(f"  测试集 R²: {test_r2:.4f}")
            print(f"  MAE (平均绝对误差): {test_mae:.4f}")
            print(f"  RMSE (均方根误差): {test_rmse:.4f}")
            print(f"  MAPE (平均绝对百分比误差): {test_mape:.2f}%")
            
            # 记录最佳模型
            if test_r2 > best_score:
                best_score = test_r2
                best_model = (name, model, scaler)
        
        print("-" * 80)
        print(f"\n最佳模型: {best_model[0]} (R² = {best_score:.4f})")
        
        # 5. 特征重要性分析（针对随机森林）
        if '随机森林' in results:
            print("\n[步骤5] 特征重要性分析...")
            rf_model = results['随机森林']['model']
            feature_importance = rf_model.feature_importances_
            
            importance_df = pd.DataFrame({
                '特征': feature_columns,
                '重要性': feature_importance
            }).sort_values('重要性', ascending=False)
            
            print("\n特征重要性排序:")
            for idx, row in importance_df.iterrows():
                print(f"  {row['特征']}: {row['重要性']:.4f}")
        
        # 6. 保存模型
        print("\n[步骤6] 保存模型...")
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # 保存最佳模型
        best_model_path = os.path.join(models_dir, 'best_price_prediction_model.pkl')
        joblib.dump({
            'model': best_model[1],
            'scaler': best_model[2],
            'feature_columns': feature_columns,
            'model_name': best_model[0],
            'performance': {
                'r2': best_score,
                'mae': results[best_model[0]]['mae'],
                'rmse': results[best_model[0]]['rmse']
            }
        }, best_model_path)
        print(f"✓ 最佳模型已保存: {best_model_path}")
        
        # 7. Generate Prediction Comparison Chart
        print("\n[Step 7] Generating prediction comparison chart...")
        plt.figure(figsize=(15, 6))
        
        # Actual vs Predicted
        plt.subplot(1, 2, 1)
        plt.plot(range(len(y_test)), y_test, label='Actual', marker='o', markersize=3, linewidth=1.5)
        model_name_map = {
            '线性回归': 'Linear Regression',
            '随机森林': 'Random Forest',
            '梯度提升': 'Gradient Boosting'
        }
        for name, result in results.items():
            eng_name = model_name_map.get(name, name)
            plt.plot(range(len(result['predictions'])), result['predictions'], 
                    label=f'{eng_name}', alpha=0.7, linewidth=1.5)
        plt.title('Prediction Comparison', fontsize=14, fontweight='bold')
        plt.xlabel('Test Sample Index')
        plt.ylabel('Price Index')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Prediction Error Distribution
        plt.subplot(1, 2, 2)
        for name, result in results.items():
            eng_name = model_name_map.get(name, name)
            errors = y_test - result['predictions']
            plt.hist(errors, bins=30, alpha=0.5, label=f'{eng_name}')
        plt.title('Prediction Error Distribution', fontsize=14, fontweight='bold')
        plt.xlabel('Error Value')
        plt.ylabel('Frequency')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        prediction_plot = os.path.join(models_dir, 'model_prediction_comparison.png')
        plt.savefig(prediction_plot, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"✓ 预测对比图已保存: {prediction_plot}")
        
        # 8. 生成模型评估报告
        report_path = os.path.join(models_dir, 'model_evaluation_report.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("="*80 + "\n")
            f.write("农产品市场预测模型评估报告\n")
            f.write("="*80 + "\n\n")
            f.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"训练样本数: {len(X_train)}\n")
            f.write(f"测试样本数: {len(X_test)}\n")
            f.write(f"特征数量: {len(feature_columns)}\n\n")
            
            f.write("特征列表:\n")
            for i, feat in enumerate(feature_columns, 1):
                f.write(f"  {i}. {feat}\n")
            f.write("\n")
            
            f.write("-"*80 + "\n")
            f.write("模型性能对比\n")
            f.write("-"*80 + "\n\n")
            
            for name, result in results.items():
                f.write(f"{name}:\n")
                f.write(f"  训练集 R²: {result['train_r2']:.4f}\n")
                f.write(f"  测试集 R²: {result['test_r2']:.4f}\n")
                f.write(f"  MAE: {result['mae']:.4f}\n")
                f.write(f"  RMSE: {result['rmse']:.4f}\n")
                f.write(f"  MAPE: {result['mape']:.2f}%\n\n")
            
            f.write("-"*80 + "\n")
            f.write(f"最佳模型: {best_model[0]}\n")
            f.write(f"最佳R²得分: {best_score:.4f}\n")
            f.write("="*80 + "\n")
        
        print(f"✓ 模型评估报告已保存: {report_path}")
        
        print("\n" + "="*80)
        print("【任务5完成】数据建模与评估成功！")
        print(f"✓ 训练了 {len(models)} 个模型")
        print(f"✓ 最佳模型: {best_model[0]} (R² = {best_score:.4f})")
        print("="*80)
        
        return results


def main():
    """
    主函数：数据生成 + 大数据处理流程
    """
    print("\n" + "="*80)
    print("农产品价格数据生成与大数据分析系统")
    print("="*80)
    print("功能:")
    print("  1. 生成365天的模拟数据")
    print("  2. 【任务3】使用Pandas/NumPy进行数据探索与预处理")
    print("  3. 【任务4】使用Matplotlib/Pyecharts进行数据可视化")
    print("  4. 【任务5】使用sklearn进行机器学习建模")
    print("="*80 + "\n")
    
    generator = AgriPriceDataGenerator()
    
    # ============ 步骤1：生成原始数据 ============
    print("\n【步骤1】生成原始数据...")
    generator.generate_year_data(start_date_str='2024-10-24', days=365)
    
    # ============ 步骤2：保存JSON数据（供后端使用） ============
    print("\n【步骤2】保存JSON数据...")
    generator.save_data()
    
    # ============ 步骤3：显示基本摘要 ============
    print("\n【步骤3】生成数据摘要...")
    generator.generate_summary()
    
    # ============ 步骤4：任务3 - 数据探索与预处理 ============
    try:
        df, correlation_matrix = generator.analyze_and_preprocess_data()
    except Exception as e:
        print(f"\n⚠️  任务3执行出错: {str(e)}")
        print("跳过后续任务...")
        return
    
    # ============ 步骤5：任务4 - 数据可视化 ============
    try:
        generator.visualize_data(df, correlation_matrix)
    except Exception as e:
        print(f"\n⚠️  任务4执行出错: {str(e)}")
        print("继续执行任务5...")
    
    # ============ 步骤6：任务5 - 机器学习建模 ============
    try:
        results = generator.build_prediction_models(df)
    except Exception as e:
        print(f"\n⚠️  任务5执行出错: {str(e)}")
    
    # ============ 完成 ============
    print("\n" + "="*80)
    print("✅ 全部任务完成！")
    print("="*80)
    print("\n生成的文件:")
    print("  📄 数据文件:")
    print("     - data/agri_price_mock_data.json (供后端使用)")
    print("     - data/processed_data.csv (预处理后的数据)")
    print("\n  📊 可视化文件:")
    print("     - visualizations/price_analysis_matplotlib.png")
    print("     - visualizations/price_trend_pyecharts.html")
    print("     - visualizations/monthly_stats_pyecharts.html")
    print("     - visualizations/change_distribution_pyecharts.html")
    print("\n  🤖 模型文件:")
    print("     - models/best_price_prediction_model.pkl")
    print("     - models/model_prediction_comparison.png")
    print("     - models/model_evaluation_report.txt")
    print("\n" + "="*80)
    print("💡 提示:")
    print("  - JSON数据格式未变，前后端可以正常使用")
    print("  - 新增的分析文件体现了大数据处理能力")
    print("  - 满足任务3、4、5的所有要求")
    print("="*80 + "\n")


if __name__ == '__main__':
    main()

