import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { AssetDistribution } from "~/types/assets";

interface AssetAllocationChartProps {
  data: AssetDistribution[];
}

export function AssetAllocationChart({ data }: AssetAllocationChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-gray-600">暂无配置数据</div>
        </div>
      </div>
    );
  }

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
            金额:{" "}
            <span className="font-medium text-gray-900">
              ¥{data.value.toLocaleString("zh-CN")}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            占比:{" "}
            <span className="font-medium text-gray-900">
              {data.payload.percentage.toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    percent,
  }: any) => {
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${name}`}
        <tspan x={x} dy="1.2em" fontSize={10} fill="#6b7280">
          {`${(percent * 100).toFixed(1)}%`}
        </tspan>
      </text>
    );
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const maxItem =
    data.length > 0
      ? data.reduce(
          (max, item) => (item.value > max.value ? item : max),
          data[0],
        )
      : null;

  return (
    <div className="w-full">
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">总资产</div>
          <div className="text-lg font-semibold text-gray-900">
            ¥{totalValue.toLocaleString("zh-CN")}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">最大配置</div>
          <div className="text-lg font-semibold text-gray-900">
            {maxItem?.name || "-"}
          </div>
          <div className="text-xs text-gray-500">
            {maxItem?.percentage.toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">资产种类</div>
          <div className="text-lg font-semibold text-gray-900">
            {data.length}
          </div>
        </div>
      </div>
    </div>
  );
}
