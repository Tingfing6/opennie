import { useState, useEffect } from "react";
import { useAssets } from "~/contexts/AssetContext";
import { useNavigate } from "react-router";

export function AssetOverview() {
  const { assetStats, loading, refreshAssets } = useAssets();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAssets();
  }, []); // Only load once when component mounts

  // Listen for transaction creation events to auto-refresh asset data
  useEffect(() => {
    const handleTransactionCreated = () => {
      console.log("Transaction created, refreshing asset overview...");
      refreshAssets();
    };

    window.addEventListener("transactionCreated", handleTransactionCreated);
    return () => {
      window.removeEventListener(
        "transactionCreated",
        handleTransactionCreated,
      );
    };
  }, [refreshAssets]);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Asset Overview</h2>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!assetStats) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Overview</h2>
        <div className="text-center text-gray-500 py-4">No asset data available</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (ratio: number) => {
    return `${(ratio * 100).toFixed(1)}%`;
  };

  const handleViewDetails = () => {
    navigate("/financial-assets");
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Asset Overview</h2>
        <button
          onClick={handleViewDetails}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Assets */}
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Assets</div>
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(assetStats.overview.totalAssets)}
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Liabilities</div>
          <div className="text-lg font-bold text-red-600">
            {formatCurrency(assetStats.overview.totalDebts)}
          </div>
        </div>

        {/* Net Assets */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Net Assets</div>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(assetStats.overview.netAssets)}
          </div>
        </div>

        {/* Debt Ratio */}
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Debt Ratio</div>
          <div
            className={`text-lg font-bold ${assetStats.overview.debtRatio > 0.5
              ? "text-red-600"
              : assetStats.overview.debtRatio > 0.3
                ? "text-yellow-600"
                : "text-green-600"
              }`}
          >
            {formatPercentage(assetStats.overview.debtRatio)}
          </div>
        </div>
      </div>

      {/* Asset Distribution (Top 3) */}
      {assetStats.distribution.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">
            Main Asset Distribution
          </div>
          <div className="space-y-2">
            {assetStats.distribution.slice(0, 3).map((asset) => (
              <div
                key={asset.type}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{asset.name}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {asset.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
