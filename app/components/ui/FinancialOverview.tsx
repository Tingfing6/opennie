import { useState, useEffect } from "react";
import { accountApi } from "~/lib/api";
import { useAccounts } from "~/contexts/AccountContext";

interface SelectedMonth {
  year: number;
  month: number;
}

interface FinancialOverviewProps {
  selectedMonth: SelectedMonth;
}

export function FinancialOverview({ selectedMonth }: FinancialOverviewProps) {
  const { selectedAccountId, getAccountSummary } = useAccounts();
  const [data, setData] = useState<{
    income: number;
    expense: number;
    balance: number;
    lastPeriodIncome: number;
    lastPeriodExpense: number;
    lastPeriodBalance: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFinancialData = async () => {
    if (!selectedAccountId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Add small delay to avoid flickering during fast switching
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Calculate start and end dates for current month
      const currentYear = selectedMonth.year;
      const currentMonth = selectedMonth.month - 1; // JavaScript months are 0-11
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);

      // Calculate date range for last month
      const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 0);

      // Get summary data for current and last month
      const [currentStats, lastStats] = await Promise.all([
        getAccountSummary(selectedAccountId, {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        }),
        getAccountSummary(selectedAccountId, {
          start_date: lastMonthStart.toISOString().split("T")[0],
          end_date: lastMonthEnd.toISOString().split("T")[0],
        }),
      ]);

      setData({
        income: currentStats.total_income,
        expense: currentStats.total_expense,
        balance: currentStats.net_amount,
        lastPeriodIncome: lastStats.total_income,
        lastPeriodExpense: lastStats.total_expense,
        lastPeriodBalance: lastStats.net_amount,
      });
    } catch (error) {
      console.error("Failed to load financial overview:", error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [selectedMonth, selectedAccountId, getAccountSummary]);

  // Listen for transaction creation events to auto-refresh data
  useEffect(() => {
    const handleTransactionCreated = () => {
      console.log("Transaction created, refreshing financial overview...");
      loadFinancialData();
    };

    window.addEventListener("transactionCreated", handleTransactionCreated);
    return () => {
      window.removeEventListener(
        "transactionCreated",
        handleTransactionCreated,
      );
    };
  }, [selectedMonth, selectedAccountId, getAccountSummary]);

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          {["Income", "Expense", "Balance"].map((label, i) => (
            <div key={i} className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                {label}
              </div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedAccountId) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="text-center text-gray-500 py-4">Please select an account first</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h2>
        <div className="text-center text-gray-500 py-4">No data available</div>
      </div>
    );
  }

  const incomeChange =
    ((data.income - data.lastPeriodIncome) / data.lastPeriodIncome) * 100;
  const expenseChange =
    ((data.expense - data.lastPeriodExpense) / data.lastPeriodExpense) * 100;
  const balanceChange =
    ((data.balance - data.lastPeriodBalance) / data.lastPeriodBalance) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage > 0 ? "+" : "";
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPeriodText = () => {
    return "Monthly Overview";
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {getPeriodText()}
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        {/* Income */}
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Income</div>
          <div className="text-base sm:text-2xl font-bold text-income-500 mb-1 leading-tight">
            {formatCurrency(data.income)}
          </div>
          <div
            className={`text-xs flex items-center justify-center ${incomeChange >= 0 ? "text-income-500" : "text-expense-500"
              }`}
          >
            <svg
              className={`w-3 h-3 mr-1 ${incomeChange >= 0 ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            {formatPercentage(Math.abs(incomeChange))}
          </div>
        </div>

        {/* Expense */}
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Expense</div>
          <div className="text-base sm:text-2xl font-bold text-expense-500 mb-1 leading-tight">
            {formatCurrency(data.expense)}
          </div>
          <div
            className={`text-xs flex items-center justify-center ${expenseChange <= 0 ? "text-income-500" : "text-expense-500"
              }`}
          >
            <svg
              className={`w-3 h-3 mr-1 ${expenseChange <= 0 ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            {formatPercentage(Math.abs(expenseChange))}
          </div>
        </div>

        {/* Balance */}
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Balance</div>
          <div
            className={`text-base sm:text-2xl font-bold mb-1 leading-tight ${data.balance >= 0 ? "text-primary-600" : "text-expense-500"
              }`}
          >
            {formatCurrency(data.balance)}
          </div>
          <div
            className={`text-xs flex items-center justify-center ${balanceChange >= 0 ? "text-income-500" : "text-expense-500"
              }`}
          >
            <svg
              className={`w-3 h-3 mr-1 ${balanceChange >= 0 ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            {formatPercentage(Math.abs(balanceChange))}
          </div>
        </div>
      </div>
    </div>
  );
}
