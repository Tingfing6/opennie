# Opennie 样式指南

## 设计理念

Opennie 采用 Notion 风格的设计理念，强调简洁、专业、功能性的界面设计。配色方案以中性灰色调为主，搭配有限的强调色，确保界面清晰易读且视觉舒适。

## 配色方案

### 中性色 (Gray)

| 颜色 | 色值 | 用途 |
|------|------|------|
| Gray 50 | `#f8f9fa` | 背景色、悬停状态 |
| Gray 100 | `#f1f3f4` | 次要背景、卡片背景 |
| Gray 200 | `#e8eaed` | 边框、分隔线 |
| Gray 300 | `#dadce0` | 禁用状态、次要边框 |
| Gray 400 | `#bdc1c6` | 占位符文本 |
| Gray 500 | `#9aa0a6` | 次要文本 |
| Gray 600 | `#80868b` | 正文文本 |
| Gray 700 | `#5f6368` | 标题文本 |
| Gray 800 | `#3c4043` | 重要文本 |
| Gray 900 | `#202124` | 主要标题 |

### 主色调 (Primary)

| 颜色 | 色值 | 用途 |
|------|------|------|
| Primary 50 | `#e8f0fe` | 激活状态背景 |
| Primary 100 | `#d2e3fc` | 悬停状态背景 |
| Primary 200 | `#aecbfa` | 次要按钮背景 |
| Primary 300 | `#8ab4f8` | 禁用状态 |
| Primary 400 | `#669df6` | 次要强调 |
| Primary 500 | `#4285f4` | **主要按钮、链接** |
| Primary 600 | `#1a73e8` | 按钮悬停 |
| Primary 700 | `#1967d2` | 按钮激活 |
| Primary 800 | `#185abc` | 深色强调 |
| Primary 900 | `#174ea6` | 最深强调 |

### 功能色

#### 收入 (Income)
| 颜色 | 色值 | 用途 |
|------|------|------|
| Income 50 | `#e6f4ea` | 收入背景 |
| Income 100 | `#ceead6` | 收入悬停 |
| Income 500 | `#34a853` | **收入文本、图标** |
| Income 600 | `#2e8f4a` | 收入强调 |

#### 支出 (Expense)
| 颜色 | 色值 | 用途 |
|------|------|------|
| Expense 50 | `#fce8e6` | 错误背景 |
| Expense 100 | `#f9d0cc` | 错误悬停 |
| Expense 500 | `#dc2626` | **支出文本、错误状态** |
| Expense 600 | `#c21f1f` | 支出强调 |

#### 警告 (Warning)
| 颜色 | 色值 | 用途 |
|------|------|------|
| Warning 50 | `#fef7e0` | 警告背景 |
| Warning 100 | `#fef0c7` | 警告悬停 |
| Warning 500 | `#f59e0b` | **警告文本、图标** |
| Warning 600 | `#d97706` | 警告强调 |

## 字体系统

### 字体族
- **主要字体**: Inter
- **备用字体**: ui-sans-serif, system-ui, sans-serif
- **emoji字体**: Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji

### 字体大小
- 正文: `text-sm` (14px) / `text-base` (16px)
- 标题: `text-lg` (18px) / `text-xl` (20px) / `text-2xl` (24px) / `text-3xl` (30px)

## 组件样式

### 卡片 (Card)
```css
.card {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm;
}
```

### 按钮 (Buttons)
```css
/* 主要按钮 */
.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200;
}

/* 次要按钮 */
.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200;
}

/* 危险按钮 */
.btn-danger {
  @apply bg-expense-500 text-white hover:bg-expense-600 focus:ring-2 focus:ring-expense-500 focus:ring-offset-2 transition-colors duration-200;
}
```

### 导航 (Navigation)
```css
/* 激活状态 */
.nav-active {
  @apply bg-primary-50 text-primary-600 border-r-2 border-primary-500;
}

/* 悬停状态 */
.nav-hover {
  @apply hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200;
}
```

### 表单元素
```css
/* 基础输入框 */
.input-base {
  @apply block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors duration-200;
}

/* 错误状态 */
.input-error {
  @apply border-expense-500 focus:border-expense-500 focus:ring-expense-500;
}
```

## 财务数据展示

### 文本颜色类
```css
.income-text { @apply text-income-500; }
.expense-text { @apply text-expense-500; }
.balance-positive { @apply text-primary-600; }
.balance-negative { @apply text-expense-500; }
.warning-text { @apply text-warning-500; }
```

## 阴影系统

| 阴影等级 | 样式 |
|----------|------|
| sm | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` |
| DEFAULT | `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)` |
| md | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` |
| lg | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` |

## 圆角系统

| 圆角等级 | 大小 |
|----------|------|
| 默认 | `0.375rem` (6px) |
| lg | `0.5rem` (8px) |
| xl | `0.75rem` (12px) |
| 2xl | `1rem` (16px) |

## 动画和过渡

### 过渡时间
- 默认: `200ms`
- 慢速: `300ms`
- 快速: `150ms`

### 缓动函数
- 默认: `ease-in-out`
- 强调: `ease-out`

## 响应式设计

### 断点
- sm: `640px`
- md: `768px`
- lg: `1024px`
- xl: `1280px`
- 2xl: `1536px`

### 响应式文本
```css
.text-responsive { @apply text-sm sm:text-base; }
.text-responsive-lg { @apply text-base sm:text-lg; }
.text-responsive-xl { @apply text-lg sm:text-xl; }
```

## 无障碍性

### 焦点环
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}
```

### 颜色对比度
所有颜色组合都满足 WCAG 2.1 AA 标准的最小对比度要求。

## 使用示例

### 财务概览组件
```tsx
<div className="card p-6">
  <h2 className="text-lg font-semibold text-gray-900">本月概览</h2>
  <div className="grid grid-cols-3 gap-6">
    <div className="text-center">
      <div className="text-sm text-gray-500">收入</div>
      <div className="text-2xl font-bold income-text">¥5,000</div>
    </div>
    <div className="text-center">
      <div className="text-sm text-gray-500">支出</div>
      <div className="text-2xl font-bold expense-text">¥3,200</div>
    </div>
    <div className="text-center">
      <div className="text-sm text-gray-500">结余</div>
      <div className="text-2xl font-bold balance-positive">¥1,800</div>
    </div>
  </div>
</div>
```

### 导航菜单
```tsx
<button className="nav-active flex items-center space-x-3 px-4 py-3 rounded-lg">
  <HomeIcon className="w-6 h-6" />
  <span className="font-medium">首页</span>
</button>
```

## 最佳实践

1. **一致性**: 在整个应用中使用统一的颜色和样式
2. **语义化**: 使用有意义的颜色（收入绿色、支出红色）
3. **可访问性**: 确保足够的颜色对比度
4. **响应式**: 为不同屏幕尺寸优化设计
5. **性能**: 避免过度使用阴影和动画

---

*最后更新: 2024年*