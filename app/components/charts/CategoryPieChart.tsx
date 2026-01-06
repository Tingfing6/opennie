import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CategoryStats } from "~/lib/reportStats";

interface CategoryPieChartProps {
  data: CategoryStats[];
  type: "income" | "expense";
}

export function CategoryPieChart({ data, type }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">
            No {type === "expense" ? "expense" : "income"} data
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.amount,
    color: item.color,
    icon: item.icon,
    percentage: item.percentage,
    transactionCount: item.transactionCount,
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{data.payload.icon}</span>
            <span className="font-medium text-gray-900">
              {data.payload.name}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Amount:{" "}
            <span className="font-medium text-gray-900">
              {formatCurrency(data.value)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage:{" "}
            <span className="font-medium text-gray-900">
              {data.payload.percentage.toFixed(1)}%
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Transactions:{" "}
            <span className="font-medium text-gray-900">
              {data.payload.transactionCount}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 max-w-[80px] truncate">
              {entry.icon} {entry.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center Summary */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-xs text-gray-500">
            {type === "expense" ? "Total Expense" : "Total Income"}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
          </div>
          <div className="text-xs text-gray-500">{data.length} categories</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2">
        <CustomLegend payload={chartData} />
      </div>
    </div>
  );
}
