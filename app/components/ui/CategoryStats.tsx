import { useState, useEffect } from "react";
import { billApi } from "~/lib/api";
import { useAccounts } from "~/contexts/AccountContext";

interface SelectedMonth {
  year: number;
  month: number;
}

interface CategoryStatsProps {
  selectedMonth: SelectedMonth;
}

interface CategoryStat {
  category_id: string;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export function CategoryStats({ selectedMonth }: CategoryStatsProps) {
  const { selectedAccountId } = useAccounts();
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const loadCategoryStats = async () => {
      if (!selectedAccountId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Add small delay to avoid flickering during fast switching
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Calculate start and end dates for current month
        const currentYear = selectedMonth.year;
        const currentMonth = selectedMonth.month - 1; // JavaScript months are 0-11
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);

        // Get bills for current month
        const response = await billApi.getBills({
          account_id: selectedAccountId,
          type: "expense",
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          size: 100, // Get more data for statistics
        });

        // Statistics by category
        const categoryMap = new Map<string, CategoryStat>();
        let total = 0;

        response.items.forEach((bill) => {
          total += bill.amount;
          const categoryId = bill.category_id;

          if (categoryMap.has(categoryId)) {
            const existing = categoryMap.get(categoryId)!;
            existing.total_amount += bill.amount;
            existing.transaction_count += 1;
          } else {
            categoryMap.set(categoryId, {
              category_id: categoryId,
              category_name: bill.category.name,
              category_icon: bill.category.icon,
              category_color: bill.category.color,
              total_amount: bill.amount,
              transaction_count: 1,
              percentage: 0,
            });
          }
        });

        // Calculate percentage and sort
        const categoryStats = Array.from(categoryMap.values())
          .map((stat) => ({
            ...stat,
            percentage: total > 0 ? (stat.total_amount / total) * 100 : 0,
          }))
          .sort((a, b) => b.total_amount - a.total_amount);

        setStats(categoryStats);
        setTotalExpense(total);
      } catch (error) {
        console.error("Failed to load category statistics:", error);
        setStats([]);
        setTotalExpense(0);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, [selectedMonth, selectedAccountId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Category Statistics</h2>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedAccountId) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h2>
        <div className="text-center text-gray-500 py-4">Please select an account first</div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h2>
        <div className="text-center text-gray-500 py-4">No expenses this month</div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Category Statistics</h2>
        <div className="text-sm text-gray-500">
          Total Expense: {formatCurrency(totalExpense)}
        </div>
      </div>

      <div className="space-y-3">
        {stats.slice(0, 5).map((stat) => (
          <div
            key={stat.category_id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: stat.category_color || "#6B7280" }}
              >
                {stat.category_icon || "📋"}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {stat.category_name}
                </div>
                <div className="text-sm text-gray-500">
                  {stat.transaction_count} transactions
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">
                {formatCurrency(stat.total_amount)}
              </div>
              <div className="text-sm text-gray-500">
                {stat.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center text-sm text-gray-500">
            {stats.length - 5} more categories not shown
          </div>
        </div>
      )}
    </div>
  );
}
