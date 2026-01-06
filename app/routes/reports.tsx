import { useState, useMemo, useEffect } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/reports";
import { checkAuthStatus, type User } from "~/contexts/AuthContext";
import { PageLayout } from "../components/ui/PageLayout";
import { TimeRangeSelector } from "../components/ui/TimeRangeSelector";
import { SummaryStats } from "../components/ui/SummaryStats";
import { TrendChart } from "../components/charts/TrendChart";
import { CategoryPieChart } from "../components/charts/CategoryPieChart";
import { CategoryDetailsList } from "../components/ui/CategoryDetailsList";
import {
  getRealDailyStats,
  getRealCategoryStats,
  getRealReportSummary,
  getDateRangePresets,
  type DailyStats,
  type CategoryStats,
  type ReportSummary,
} from "../lib/reportStats";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Reports - Opennie" },
    { name: "description", content: "View your income and expense reports and analysis" },
  ];
};

// Client-side auth check
export async function clientLoader(): Promise<{ user: User | null }> {
  console.log("[reports clientLoader] Checking auth status");

  const user = await checkAuthStatus();

  if (!user) {
    console.log("[reports clientLoader] Not authenticated, redirecting to login");
    throw redirect("/login");
  }

  console.log("[reports clientLoader] Auth successful, returning user data");
  return { user };
}

// Run clientLoader on hydration
clientLoader.hydrate = true as const;

// Loading component during hydration
export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">📊</span>
        </div>
        <p className="mt-4 text-gray-600">Loading reports...</p>
      </div>
    </div>
  );
}

export default function Reports() {
  const [selectedRange, setSelectedRange] = useState("thisMonth");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // State for real data
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryStats[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryStats[]>(
    [],
  );
  const [summary, setSummary] = useState<ReportSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    transactionCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const datePresets = useMemo(() => getDateRangePresets(), []);

  // Get current date range
  const currentRange = useMemo(() => {
    if (selectedRange === "custom") {
      return {
        label: "Custom",
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }
    return datePresets[selectedRange as keyof typeof datePresets];
  }, [selectedRange, customStartDate, customEndDate, datePresets]);

  // Load real data when date range changes
  useEffect(() => {
    async function loadReportData() {
      if (!currentRange?.startDate || !currentRange?.endDate) return;

      setIsLoading(true);
      try {
        const [dailyStatsData, incomeData, expenseData, summaryData] =
          await Promise.all([
            getRealDailyStats(currentRange.startDate, currentRange.endDate),
            getRealCategoryStats(
              currentRange.startDate,
              currentRange.endDate,
              "income",
            ),
            getRealCategoryStats(
              currentRange.startDate,
              currentRange.endDate,
              "expense",
            ),
            getRealReportSummary(currentRange.startDate, currentRange.endDate),
          ]);

        setDailyStats(dailyStatsData);
        setIncomeCategories(incomeData);
        setExpenseCategories(expenseData);
        setSummary(summaryData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadReportData();
  }, [currentRange]);

  return (
    <PageLayout title="Reports">
      <div className="space-y-6">
        {/* Time Range Selector */}
        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
          datePresets={datePresets}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading report data...</span>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Summary Statistics */}
            <SummaryStats
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
              netIncome={summary.netIncome}
              transactionCount={summary.transactionCount}
              periodLabel={currentRange?.label || "Custom"}
            />

            {/* Daily Trend Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Daily Income & Expense Trend
              </h3>
              <TrendChart data={dailyStats} />
            </div>

            {/* Category Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Categories */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Expense by Category
                </h3>
                <div className="space-y-4">
                  <CategoryPieChart data={expenseCategories} type="expense" />
                  <CategoryDetailsList
                    categories={expenseCategories}
                    type="expense"
                  />
                </div>
              </div>

              {/* Income Categories */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Income by Category
                </h3>
                <div className="space-y-4">
                  <CategoryPieChart data={incomeCategories} type="income" />
                  <CategoryDetailsList
                    categories={incomeCategories}
                    type="income"
                  />
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                💡 Financial Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Average Daily Expense:</span>
                  <span className="text-gray-900">
                    ¥
                    {(
                      summary.totalExpense / Math.max(dailyStats.length, 1)
                    ).toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Savings Rate:</span>
                  <span
                    className={`font-medium ${summary.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {summary.totalIncome > 0
                      ? (
                        (summary.netIncome / summary.totalIncome) *
                        100
                      ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                {expenseCategories.length > 0 && (
                  <div>
                    <span className="font-medium">Top Expense Category:</span>
                    <span className="text-gray-900">
                      {expenseCategories[0]?.categoryName} (¥
                      {expenseCategories[0]?.amount.toFixed(0)})
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Recording Frequency:</span>
                  <span className="text-gray-900">
                    {(
                      summary.transactionCount / Math.max(dailyStats.length, 1)
                    ).toFixed(1)}{" "}
                    entries/day
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
