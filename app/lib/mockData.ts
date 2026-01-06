// Mock data for the reports page
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  categoryId: string;
  account: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parentId?: string;
}

export interface DailyStats {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  transactionCount: number;
}

// Mock categories
export const mockCategories: Category[] = [
  { id: 'food', name: '餐饮', type: 'expense', icon: '🍽️', color: '#FF6B6B' },
  { id: 'transport', name: '交通', type: 'expense', icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping', name: '购物', type: 'expense', icon: '🛍️', color: '#45B7D1' },
  { id: 'entertainment', name: '娱乐', type: 'expense', icon: '🎮', color: '#96CEB4' },
  { id: 'housing', name: '住房', type: 'expense', icon: '🏠', color: '#FFEAA7' },
  { id: 'healthcare', name: '医疗', type: 'expense', icon: '🏥', color: '#DDA0DD' },
  { id: 'education', name: '教育', type: 'expense', icon: '📚', color: '#98D8C8' },
  { id: 'utilities', name: '水电费', type: 'expense', icon: '💡', color: '#F7DC6F' },
  { id: 'salary', name: '工资', type: 'income', icon: '💰', color: '#58D68D' },
  { id: 'bonus', name: '奖金', type: 'income', icon: '🎁', color: '#85C1E9' },
  { id: 'investment', name: '投资收益', type: 'income', icon: '📈', color: '#F8C471' },
];

// Generate mock transactions for the last 90 days
export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 90; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    // Generate 1-5 transactions per day
    const dailyTransactionCount = Math.floor(Math.random() * 5) + 1;

    for (let j = 0; j < dailyTransactionCount; j++) {
      const isIncome = Math.random() < 0.2; // 20% chance of income
      const categories = mockCategories.filter(c => c.type === (isIncome ? 'income' : 'expense'));
      const category = categories[Math.floor(Math.random() * categories.length)];

      let amount: number;
      if (isIncome) {
        // Income: 1000-20000
        amount = Math.floor(Math.random() * 19000) + 1000;
      } else {
        // Expense: 10-2000
        amount = Math.floor(Math.random() * 1990) + 10;
      }

      transactions.push({
        id: `tx_${date.getTime()}_${j}`,
        amount,
        currency: 'CNY',
        type: isIncome ? 'income' : 'expense',
        category: category.name,
        categoryId: category.id,
        account: '支付宝',
        description: `${category.name}消费`,
        date: dateStr,
        createdAt: date.toISOString(),
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate daily statistics
export const generateDailyStats = (transactions: Transaction[], startDate: string, endDate: string): DailyStats[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const stats: DailyStats[] = [];

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(t => t.date === dateStr);

    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    stats.push({
      date: dateStr,
      income,
      expense,
      net: income - expense,
    });
  }

  return stats;
};

// Generate category statistics
export const generateCategoryStats = (transactions: Transaction[], type: 'income' | 'expense'): CategoryStats[] => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const categoryMap = new Map<string, { amount: number; count: number }>();

  filteredTransactions.forEach(t => {
    const existing = categoryMap.get(t.categoryId) || { amount: 0, count: 0 };
    categoryMap.set(t.categoryId, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  });

  const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

  const stats: CategoryStats[] = [];
  categoryMap.forEach((data, categoryId) => {
    const category = mockCategories.find(c => c.id === categoryId);
    if (category) {
      stats.push({
        categoryId,
        categoryName: category.name,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        color: category.color,
        icon: category.icon,
        transactionCount: data.count,
      });
    }
  });

  return stats.sort((a, b) => b.amount - a.amount);
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to get date range presets
export const getDateRangePresets = () => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const thisQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  return {
    thisMonth: {
      label: '本月',
      startDate: thisMonth.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    },
    lastMonth: {
      label: '上月',
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: lastMonthEnd.toISOString().split('T')[0],
    },
    thisQuarter: {
      label: '本季度',
      startDate: thisQuarter.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    },
    thisYear: {
      label: '本年度',
      startDate: thisYear.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    },
  };
};
