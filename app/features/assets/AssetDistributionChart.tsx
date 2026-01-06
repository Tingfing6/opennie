import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AssetDistribution } from "~/types/assets";

interface AssetDistributionChartProps {
  data: AssetDistribution[];
}

export function AssetDistributionChart({ data }: AssetDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-gray-600">No data available</div>
        </div>
      </div>
    );
  }

  // 准备数据
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    color: item.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Amount:{" "}
            <span className="font-medium text-gray-900">
              ¥{data.value.toLocaleString("en-US")}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Ratio:{" "}
            <span className="font-medium text-gray-900">
              {data.payload?.percentage?.toFixed(1) || "0.0"}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{entry.name}</span>
            </div>
            <span className="text-gray-600 font-medium">
              {entry.percentage?.toFixed(1) || "0.0"}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // 不显示小于5%的标签

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
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

      {/* 自定义图例 */}
      <CustomLegend payload={chartData} />

      {/* 资产汇总信息 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Asset Types</div>
          <div className="text-lg font-semibold text-gray-900">
            {data.length}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Max Ratio</div>
          <div className="text-lg font-semibold text-gray-900">
            {data.length > 0
              ? Math.max(...data.map((d) => d.percentage)).toFixed(1)
              : 0}
            %
          </div>
        </div>
      </div>
    </div>
  );
}
