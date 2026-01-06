// Real report statistics using local API data
import { localTransactionApi } from "./local-api";
import type { TransactionType } from "./api";

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

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
}

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

// Get real daily statistics from local API
export async function getRealDailyStats(startDate: string, endDate: string): Promise<DailyStats[]> {
  try {
    const stats = await localTransactionApi.getDailyStats({
      start_date: startDate,
      end_date: endDate,
    });

    return stats.map(stat => ({
      date: stat.date,
      income: stat.income,
      expense: stat.expense,
      net: stat.net,
    }));
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    return [];
  }
}

// Get real category statistics from local API
export async function getRealCategoryStats(
  startDate: string,
  endDate: string,
  type: TransactionType
): Promise<CategoryStats[]> {
  try {
    const stats = await localTransactionApi.getTransactionStats({
      start_date: startDate,
      end_date: endDate,
      type: type,
    });

    if (!stats.category_stats) return [];

    return stats.category_stats.map(stat => ({
      categoryId: stat.category_id,
      categoryName: stat.category_name,
      amount: stat.total_amount,
      percentage: stat.percentage,
      color: stat.category_color || '#64748b',
      icon: stat.category_icon || '📄',
      transactionCount: stat.transaction_count,
    }));
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return [];
  }
}

// Get real report summary from local API
export async function getRealReportSummary(startDate: string, endDate: string): Promise<ReportSummary> {
  try {
    const stats = await localTransactionApi.getTransactionStats({
      start_date: startDate,
      end_date: endDate,
    });

    return {
      totalIncome: stats.total_income,
      totalExpense: stats.total_expense,
      netIncome: stats.net_amount,
      transactionCount: stats.transaction_count,
    };
  } catch (error) {
    console.error('Error fetching report summary:', error);
    return {
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0,
      transactionCount: 0,
    };
  }
}

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
