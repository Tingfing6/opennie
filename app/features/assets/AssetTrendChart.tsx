import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { AssetTrend } from "~/types/assets";

interface AssetTrendChartProps {
  data: AssetTrend[];
}

export function AssetTrendChart({ data }: AssetTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-gray-600">暂无趋势数据</div>
        </div>
      </div>
    );
  }

  // 准备数据
  const chartData = data.map((item) => ({
    date: item.date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    }),
    总资产: item.totalAssets,
    总负债: item.totalDebts,
    净资产: item.netAssets,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}万`;
    }
    return value.toLocaleString("zh-CN");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: ¥{entry.value.toLocaleString("zh-CN")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 计算趋势指标
  const calculateTrend = () => {
    if (data.length < 2) return null;

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    const netAssetsChange = latest.netAssets - previous.netAssets;
    const netAssetsChangePercent = (netAssetsChange / previous.netAssets) * 100;

    return {
      change: netAssetsChange,
      changePercent: netAssetsChangePercent,
      isPositive: netAssetsChange >= 0,
    };
  };

  const trend = calculateTrend();

  return (
    <div className="w-full">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "15px",
                fontSize: "12px",
                color: "#6b7280",
              }}
            />

            {/* 净资产 - 使用面积图突出显示 */}
            <Area
              type="monotone"
              dataKey="净资产"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#netAssetsGradient)"
            />

            {/* 总资产和总负债 - 使用线图 */}
            <Line
              type="monotone"
              dataKey="总资产"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="总负债"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />

            {/* 渐变定义 */}
            <defs>
              <linearGradient
                id="netAssetsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 趋势指标 */}
      {trend && (
        <div className="mt-4 flex justify-center">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              trend.isPositive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <svg
              className={`w-4 h-4 mr-1 ${trend.isPositive ? "rotate-0" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            净资产 {trend.isPositive ? "增长" : "下降"} ¥
            {Math.abs(trend.change).toLocaleString("zh-CN")}(
            {trend.changePercent > 0 ? "+" : ""}
            {trend.changePercent.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}
