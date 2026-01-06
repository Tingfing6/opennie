import { formatCurrency } from "~/lib/reportStats";

interface SummaryStatsProps {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
  periodLabel: string;
}

export function SummaryStats({
  totalIncome,
  totalExpense,
  netIncome,
  transactionCount,
  periodLabel,
}: SummaryStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        📊 {periodLabel} Statistics Overview
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">↗️</span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">Total Income</p>
              <p className="text-lg font-semibold text-green-900">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">↘️</span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800">Total Expense</p>
              <p className="text-lg font-semibold text-red-900">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div
          className={`rounded-lg p-4 border ${netIncome >= 0
              ? "bg-blue-50 border-blue-200"
              : "bg-orange-50 border-orange-200"
            }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${netIncome >= 0 ? "bg-blue-500" : "bg-orange-500"
                  }`}
              >
                <span className="text-white text-sm">
                  {netIncome >= 0 ? "💰" : "⚠️"}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${netIncome >= 0 ? "text-blue-800" : "text-orange-800"
                  }`}
              >
                Net Income
              </p>
              <p
                className={`text-lg font-semibold ${netIncome >= 0 ? "text-blue-900" : "text-orange-900"
                  }`}
              >
                {formatCurrency(netIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-800">Transactions</p>
              <p className="text-lg font-semibold text-purple-900">
                {transactionCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Summary Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Income/Expense Ratio: </span>
            <span className="text-gray-900">
              {totalExpense > 0 ? (totalIncome / totalExpense).toFixed(2) : "∞"}
            </span>
          </div>
          <div>
            <span className="font-medium">Savings Rate: </span>
            <span
              className={`font-medium ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalIncome > 0
                ? ((netIncome / totalIncome) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div>
            <span className="font-medium">Avg. per Transaction: </span>
            <span className="text-gray-900">
              {formatCurrency(
                transactionCount > 0
                  ? (totalIncome + totalExpense) / transactionCount
                  : 0,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
