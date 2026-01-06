import { type AssetOverview } from "~/types/assets";

interface AssetOverviewCardProps {
  overview: AssetOverview;
}

export function AssetOverviewCard({ overview }: AssetOverviewCardProps) {
  const formatCurrency = (amount: number, currency: string = "¥") => {
    return `${currency}${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (ratio: number) => {
    return `${(ratio * 100).toFixed(1)}%`;
  };

  const getDebtRatioColor = (ratio: number) => {
    if (ratio <= 0.3) return "text-green-600 bg-green-50";
    if (ratio <= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getNetAssetsChangeColor = () => {
    // 这里可以根据上期对比数据来判断，暂时使用正值
    return overview.netAssets > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Asset Overview</h2>
        <div className="text-sm opacity-90">
          Updated At: {new Date().toLocaleDateString("en-US")}
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Net Worth */}
        <div className="text-center">
          <div className="text-sm opacity-90 mb-1">Net Worth</div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(overview.netAssets)}
          </div>
          <div
            className={`text-sm flex items-center justify-center ${getNetAssetsChangeColor()}`}
          >
            <svg
              className="w-4 h-4 mr-1"
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
            +8.5% vs Last Month
          </div>
        </div>

        {/* Total Assets */}
        <div className="text-center">
          <div className="text-sm opacity-90 mb-1">Total Assets</div>
          <div className="text-2xl font-semibold mb-1">
            {formatCurrency(overview.totalAssets)}
          </div>
          <div className="text-sm opacity-75">Asset Allocation is Reasonable</div>
        </div>

        {/* Total Liabilities */}
        <div className="text-center">
          <div className="text-sm opacity-90 mb-1">Total Liabilities</div>
          <div className="text-2xl font-semibold mb-1">
            {formatCurrency(overview.totalDebts)}
          </div>
        </div>
      </div>
    </div>
  );
}
