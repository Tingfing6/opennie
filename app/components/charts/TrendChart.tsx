import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { transactionApi } from "~/lib/api";

interface SelectedMonth {
  year: number;
  month: number;
}

interface DailyStats {
  date: string;
  income: number;
  expense: number;
  net: number;
}

interface TrendChartProps {
  data?: DailyStats[];
  selectedMonth?: SelectedMonth;
}

export function TrendChart({ data, selectedMonth }: TrendChartProps) {
  const [dailyStats, setDailyStats] = useState<
    Array<{
      date: string;
      income: number;
      expense: number;
      net: number;
      transaction_count: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedMonth) {
      const loadDailyStats = async () => {
        try {
          setIsLoading(true);

          const currentYear = selectedMonth.year;
          const currentMonth = selectedMonth.month - 1;
          const startDate = new Date(currentYear, currentMonth, 1);
          const endDate = new Date(currentYear, currentMonth + 1, 0);

          const stats = await transactionApi.getDailyStats({
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
          });

          // Show only last 7 days of data
          const last7Days = stats.slice(-7);
          setDailyStats(last7Days);
        } catch (error) {
          console.error("Failed to load daily stats:", error);
          setDailyStats([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadDailyStats();
    } else {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  // Format dates for display
  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatWeekday = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const trendData = selectedMonth
    ? dailyStats.map((item) => ({
      name: formatWeekday(item.date),
      displayDate: formatDateForDisplay(item.date),
      fullDate: new Date(item.date).toLocaleDateString("en-US"),
      Income: item.income,
      Expense: item.expense,
      NetIncome: item.net,
    }))
    : (data || []).map((item) => ({
      name: formatDateForDisplay(item.date),
      displayDate: formatDateForDisplay(item.date),
      fullDate: new Date(item.date).toLocaleDateString("en-US"),
      Income: item.income,
      Expense: item.expense,
      NetIncome: item.net,
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{`${label} (${data.fullDate})`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Income & Expense Trend</h2>
      </div>

      {/* Recharts Trend Chart */}
      {isLoading ? (
        <div className="h-48 md:h-64 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : trendData.length === 0 ? (
        <div className="h-48 md:h-64 w-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p>No data</p>
          </div>
        </div>
      ) : (
        <div className="h-48 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  value >= 1000 ? `${value / 1000}k` : value.toString()
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              />
              <Bar
                dataKey="Income"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
                barSize={35}
              />
              <Bar
                dataKey="Expense"
                fill="#ef4444"
                radius={[2, 2, 0, 0]}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
