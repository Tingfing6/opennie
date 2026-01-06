import type { Asset, Debt } from "~/types/assets";

interface FinancialMetricsProps {
  assets: Asset[];
  debts: Debt[];
}

export function FinancialMetrics({ assets, debts }: FinancialMetricsProps) {
  // 计算各种财务指标
  const totalAssets = assets
    .filter(asset => asset.isIncluded)
    .reduce((sum, asset) => sum + asset.balance, 0);

  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const netWorth = totalAssets - totalDebts;
  const debtToAssetRatio = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;

  // 按资产类型分组
  const assetsByType = assets.reduce((acc, asset) => {
    if (!asset.isIncluded) return acc;
    if (!acc[asset.type]) {
      acc[asset.type] = { count: 0, value: 0 };
    }
    acc[asset.type].count += 1;
    acc[asset.type].value += asset.balance;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  // 计算流动性比例 (现金 + 银行存款 + 支付宝 + 微信)
  const liquidAssets = assets
    .filter(asset => asset.isIncluded && ['cash', 'bank_card', 'alipay', 'wechat'].includes(asset.type))
    .reduce((sum, asset) => sum + asset.balance, 0);
  const liquidityRatio = totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;

  // 计算投资比例
  const investmentAssets = assets
    .filter(asset => asset.isIncluded && ['investment', 'stock', 'fund', 'bond'].includes(asset.type))
    .reduce((sum, asset) => sum + asset.balance, 0);
  const investmentRatio = totalAssets > 0 ? (investmentAssets / totalAssets) * 100 : 0;

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  // 获取健康状态颜色
  const getHealthColor = (ratio: number, thresholds: [number, number]) => {
    if (ratio <= thresholds[0]) return "text-green-600 bg-green-50";
    if (ratio <= thresholds[1]) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const metrics = [
    {
      title: "Net Worth",
      value: formatCurrency(netWorth),
      change: "+8.5%",
      changeType: "positive" as const,
      icon: "💎",
      description: "Total assets minus total liabilities",
    },
    {
      title: "Debt Ratio",
      value: `${debtToAssetRatio.toFixed(1)}%`,
      status: debtToAssetRatio <= 30 ? "Healthy" : debtToAssetRatio <= 60 ? "Moderate" : "High",
      statusColor: getHealthColor(debtToAssetRatio, [30, 60]),
      icon: "📊",
      description: "Ratio of liabilities to total assets",
    },
    {
      title: "Liquidity Ratio",
      value: `${liquidityRatio.toFixed(1)}%`,
      status: liquidityRatio >= 20 ? "Adequate" : liquidityRatio >= 10 ? "Moderate" : "Low",
      statusColor: getHealthColor(100 - liquidityRatio, [70, 85]),
      icon: "💧",
      description: "Ratio of cash and cash-like assets",
    },
    {
      title: "Investment Ratio",
      value: `${investmentRatio.toFixed(1)}%`,
      status: investmentRatio >= 30 ? "Aggressive" : investmentRatio >= 15 ? "Stable" : "Conservative",
      statusColor: investmentRatio >= 15 ? "text-blue-600 bg-blue-50" : "text-gray-600 bg-gray-50",
      icon: "📈",
      description: "Proportion of investment assets",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Financial Indicators Analysis</h3>
        <div className="text-sm text-gray-500">
          Based on {assets.filter(a => a.isIncluded).length} assets • {debts.length} liabilities
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{metric.icon}</div>
              {metric.change && (
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${metric.changeType === "positive"
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"
                    }`}
                >
                  {metric.change}
                </div>
              )}
            </div>

            <div className="mb-1">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {metric.value}
              </div>
            </div>

            {metric.status && (
              <div className="mb-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${metric.statusColor}`}
                >
                  {metric.status}
                </span>
              </div>
            )}

            <div className="text-xs text-gray-500">
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {/* Asset Distribution Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Asset Distribution Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(assetsByType).map(([type, data]) => {
            const typeNames: Record<string, string> = {
              cash: "Cash",
              bank_card: "Bank Card",
              alipay: "Alipay",
              wechat: "WeChat",
              investment: "Investment",
              stock: "Stock",
              fund: "Fund",
              real_estate: "Real Estate",
              vehicle: "Vehicle",
              other: "Other",
            };

            const percentage = totalAssets > 0 ? (data.value / totalAssets) * 100 : 0;

            return (
              <div key={type} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-1">
                  {typeNames[type] || type}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {data.count} items
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Smart Suggestions</h4>
        <div className="space-y-2">
          {debtToAssetRatio > 50 && (
            <div className="flex items-start p-3 bg-red-50 rounded-lg">
              <svg className="w-4 h-4 text-red-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-red-800">
                Debt ratio is high. It is recommended to prioritize paying off high-interest debts and control new liabilities.
              </div>
            </div>
          )}

          {liquidityRatio < 15 && (
            <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
              <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-800">
                Liquidity is low. It is recommended to maintain at least 15% in cash and cash-like assets for emergencies.
              </div>
            </div>
          )}

          {investmentRatio < 20 && debtToAssetRatio < 40 && (
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="text-sm text-blue-800">
                Investment ratio is low. Under the premise of controlling risk, you can appropriately increase investment allocation to obtain better long-term returns.
              </div>
            </div>
          )}

          {debtToAssetRatio <= 30 && liquidityRatio >= 20 && investmentRatio >= 25 && (
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-800">
                Financial condition is good! Asset allocation is reasonable, continue to maintain the current financial management strategy.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
