import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Debt } from "~/types/assets";

interface DebtStructureChartProps {
  debts: Debt[];
}

export function DebtStructureChart({ debts }: DebtStructureChartProps) {
  if (debts.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-gray-600">暂无负债</div>
        </div>
      </div>
    );
  }

  const debtTypeMap: Record<string, { name: string; color: string }> = {
    loan: { name: "贷款", color: "#EF4444" },
    credit_card: { name: "信用卡", color: "#F59E0B" },
    mortgage: { name: "房贷", color: "#DC2626" },
    personal: { name: "个人借款", color: "#F97316" },
    other: { name: "其他", color: "#6B7280" },
  };

  const debtByType = debts.reduce(
    (acc, debt) => {
      const type = debt.type;
      if (!acc[type]) {
        acc[type] = {
          name: debtTypeMap[type]?.name || "其他",
          value: 0,
          color: debtTypeMap[type]?.color || "#6B7280",
          count: 0,
        };
      }
      acc[type].value += debt.amount;
      acc[type].count += 1;
      return acc;
    },
    {} as Record<string, any>,
  );

  const chartData = Object.values(debtByType);
  const totalDebt = chartData.reduce(
    (sum: number, item: any) => sum + item.value,
    0,
  );

  if (totalDebt === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-gray-600">暂无负债</div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage =
        totalDebt > 0 ? ((data.value / totalDebt) * 100).toFixed(1) : "0";
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            金额:{" "}
            <span className="font-medium text-red-700">
              ¥{data.value.toLocaleString("zh-CN")}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            占比:{" "}
            <span className="font-medium text-gray-900">{percentage}%</span>
          </p>
          <p className="text-sm text-gray-600">
            笔数:{" "}
            <span className="font-medium text-gray-900">
              {data.payload.count}笔
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
    percent,
    name,
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

  const avgInterestRate =
    debts.length > 0
      ? debts.reduce((sum, debt) => sum + (debt.interestRate || 0), 0) /
        debts.length
      : 0;

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
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-sm text-red-600 mb-1">总负债</div>
          <div className="text-lg font-semibold text-red-700">
            ¥{totalDebt.toLocaleString("zh-CN")}
          </div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-sm text-orange-600 mb-1">平均利率</div>
          <div className="text-lg font-semibold text-orange-700">
            {avgInterestRate.toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm text-yellow-600 mb-1">负债笔数</div>
          <div className="text-lg font-semibold text-yellow-700">
            {debts.length}
          </div>
        </div>
      </div>
    </div>
  );
}
