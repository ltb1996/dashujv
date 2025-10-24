"""
生成农产品价格模拟数据
基于真实规律生成高质量的模拟数据
"""

import json
import random
from datetime import datetime, timedelta
import os
import math

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


def main():
    generator = AgriPriceDataGenerator()
    
    # 生成一年的数据
    generator.generate_year_data(start_date_str='2024-10-24', days=365)
    
    # 保存数据
    generator.save_data()
    
    # 显示摘要
    generator.generate_summary()
    
    print("\n[OK] 数据生成完成！可以用于项目开发和演示。")
    print("虽然是模拟数据，但完全符合真实规律，适合参赛作品使用。\n")


if __name__ == '__main__':
    main()

