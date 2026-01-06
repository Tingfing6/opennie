import { useState, useEffect } from "react";
import { AssetOverviewCard } from "~/features/assets/AssetOverviewCard";
import { AssetDistributionChart } from "~/features/assets/AssetDistributionChart";
import { AssetTrendChart } from "~/features/assets/AssetTrendChart";
import { AssetAllocationChart } from "~/features/assets/AssetAllocationChart";
import { DebtStructureChart } from "~/features/assets/DebtStructureChart";
import { SankeyFlowChart } from "~/features/assets/SankeyFlowChart";
import { FinancialMetrics } from "~/features/assets/FinancialMetrics";
import { AssetList } from "~/features/assets/AssetList";
import { DebtManagement } from "~/features/assets/DebtManagement";
import { useAssets } from "~/contexts/AssetContext";
import type {
  AssetStats,
  Asset,
  Debt,
  LendRecord,
  DebtType,
} from "~/types/assets";
import { Currency, AccountType } from "~/types/assets";
import type { AssetType } from "~/types/assets";

// Mock data - realistic and rich examples
const mockAssetStats: AssetStats = {
  overview: {
    totalAssets: 850000,
    totalDebts: 320000,
    netAssets: 530000,
    debtRatio: 0.376,
    currency: Currency.CNY,
  },
  distribution: [
    {
      type: "bank_account" as AssetType,
      name: "Bank Deposits",
      value: 280000,
      percentage: 32.9,
      color: "#3B82F6",
    },
    {
      type: "investment" as AssetType,
      name: "Investment & Wealth",
      value: 200000,
      percentage: 23.5,
      color: "#8B5CF6",
    },
    {
      type: "real_estate" as AssetType,
      name: "Real Estate Value",
      value: 180000,
      percentage: 21.2,
      color: "#EF4444",
    },
    {
      type: "fund" as AssetType,
      name: "Fund Investment",
      value: 85000,
      percentage: 10.0,
      color: "#10B981",
    },
    {
      type: "stock",
      name: "Stock Assets",
      value: 65000,
      percentage: 7.6,
      color: "#F59E0B",
    },
    {
      type: "alipay",
      name: "Alipay",
      value: 25000,
      percentage: 2.9,
      color: "#1677FF",
    },
    {
      type: "wechat",
      name: "WeChat Wallet",
      value: 12000,
      percentage: 1.4,
      color: "#52C41A",
    },
    {
      type: "cash",
      name: "Cash",
      value: 3000,
      percentage: 0.4,
      color: "#6B7280",
    },
  ],
  trends: [
    {
      date: new Date("2024-07-01"),
      totalAssets: 750000,
      totalDebts: 360000,
      netAssets: 390000,
    },
    {
      date: new Date("2024-08-01"),
      totalAssets: 770000,
      totalDebts: 355000,
      netAssets: 415000,
    },
    {
      date: new Date("2024-09-01"),
      totalAssets: 785000,
      totalDebts: 345000,
      netAssets: 440000,
    },
    {
      date: new Date("2024-10-01"),
      totalAssets: 810000,
      totalDebts: 335000,
      netAssets: 475000,
    },
    {
      date: new Date("2024-11-01"),
      totalAssets: 830000,
      totalDebts: 325000,
      netAssets: 505000,
    },
    {
      date: new Date("2024-12-01"),
      totalAssets: 850000,
      totalDebts: 320000,
      netAssets: 530000,
    },
  ],
  sankeyData: {
    nodes: [
      { name: "Total Assets" },
      { name: "Bank Deposits" },
      { name: "Investment & Wealth" },
      { name: "Real Estate Value" },
      { name: "Fund Investment" },
      { name: "Stock Assets" },
      { name: "Alipay" },
      { name: "WeChat Wallet" },
      { name: "Cash" },
    ],
    links: [
      { source: "Total Assets", target: "Bank Deposits", value: 280000 },
      { source: "Total Assets", target: "Investment & Wealth", value: 200000 },
      { source: "Total Assets", target: "Real Estate Value", value: 180000 },
      { source: "Total Assets", target: "Fund Investment", value: 85000 },
      { source: "Total Assets", target: "Stock Assets", value: 65000 },
      { source: "Total Assets", target: "Alipay", value: 25000 },
      { source: "Total Assets", target: "WeChat Wallet", value: 12000 },
      { source: "Total Assets", target: "Cash", value: 3000 },
    ],
  },
};

// Mock asset list data
const mockAssets: Asset[] = [
  {
    id: "asset_1",
    name: "CMB Savings Card",
    type: "bank_account" as AssetType,
    accountType: AccountType.SAVINGS,
    balance: 150000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "Primary savings account",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_2",
    name: "CCB Investment Product",
    type: "investment" as AssetType,
    accountType: "investment" as any,
    balance: 200000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "Low-risk investment, 4.2% annual yield",
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_3",
    name: "Nanshan District Apartment",
    type: "real_estate" as AssetType,
    balance: 1800000,
    currency: Currency.CNY,
    isIncluded: false,
    description: "2BR/1BA, market valuation",
    createdAt: new Date("2022-05-10"),
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: "asset_4",
    name: "CSI 300 Index Fund",
    type: "fund" as AssetType,
    balance: 85000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "Long-term investment, 3-year plan",
    createdAt: new Date("2021-08-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_5",
    name: "Tencent Holdings",
    type: "stock" as AssetType,
    balance: 45000,
    currency: Currency.HKD,
    isIncluded: true,
    description: "HK Stocks, 500 shares",
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_6",
    name: "BYD Stock",
    type: "stock" as AssetType,
    balance: 20000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "A-shares, 100 shares",
    createdAt: new Date("2023-09-10"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_7",
    name: "Alipay Yu'ebao",
    type: "alipay" as AssetType,
    balance: 25000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "Daily change management",
    createdAt: new Date("2020-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_8",
    name: "WeChat Lingqiantong",
    type: "wechat" as AssetType,
    balance: 12000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "WeChat payment change",
    createdAt: new Date("2020-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "asset_9",
    name: "Cash",
    type: "cash" as AssetType,
    balance: 3000,
    currency: Currency.CNY,
    isIncluded: true,
    description: "Backup cash at home",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
  },
];

// Mock debt data
const mockDebts: Debt[] = [
  {
    id: "debt_1",
    name: "Mortgage",
    type: "mortgage" as DebtType,
    amount: 280000,
    currency: Currency.CNY,
    interestRate: 4.5,
    dueDate: new Date("2044-05-10"),
    creditor: "Bank of China",
    description: "30-year mortgage, 20 years left",
    createdAt: new Date("2022-05-10"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "debt_2",
    name: "CMB Credit Card",
    type: "credit_card" as DebtType,
    amount: 25000,
    currency: Currency.CNY,
    interestRate: 18.0,
    creditor: "CMB Bank",
    description: "Credit card overdraft",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "debt_3",
    name: "Car Loan",
    type: "loan" as DebtType,
    amount: 15000,
    currency: Currency.CNY,
    interestRate: 6.8,
    dueDate: new Date("2026-03-01"),
    creditor: "Ping An Bank",
    description: "Car installment loan, 2 years left",
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2024-12-01"),
  },
];

// Mock lending records
const mockLendRecords: LendRecord[] = [
  {
    id: "lend_1",
    name: "Lent to Zhang San",
    amount: 50000,
    currency: Currency.CNY,
    borrower: "Zhang San",
    interestRate: 0,
    dueDate: new Date("2025-06-01"),
    status: "active" as any,
    description: "Friend's startup capital",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "lend_2",
    name: "Lent to Li Si",
    amount: 20000,
    currency: Currency.CNY,
    borrower: "Li Si",
    interestRate: 3.0,
    dueDate: new Date("2024-10-01"),
    actualReturnDate: new Date("2024-09-25"),
    status: "returned" as any,
    description: "Short-term turnover",
    createdAt: new Date("2024-07-01"),
    updatedAt: new Date("2024-09-25"),
  },
];

export function FinancialAssetsPageContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "debts">(
    "overview",
  );

  // Use AssetContext to get real API data
  const {
    assets: realAssets,
    assetStats: realAssetStats,
    loading,
    error,
    refreshAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  } = useAssets();

  // Convert API data to component safe format
  const convertedAssets: Asset[] = realAssets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    type: asset.type as AssetType,
    balance: asset.balance,
    currency: asset.currency as Currency,
    isIncluded: asset.include_in_total,
    description: asset.notes || "",
    createdAt: new Date(asset.created_at),
    updatedAt: new Date(asset.created_at),
    accountType: "savings" as any,
  }));

  // Prioritize real API data, use mock data only as fallback
  const assets = convertedAssets.length > 0 ? convertedAssets : mockAssets;
  const assetStats = realAssetStats || mockAssetStats;

  // Temporary mock debt data (Debt API TBD)
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [lendRecords, setLendRecords] = useState<LendRecord[]>(mockLendRecords);

  // Handle stats updates (mainly for debt management)
  const handleStatsChange = (stats: AssetStats) => {
    // In a real implementation, this would update the API
    // For now, we'll just update our local mock data structure
    console.log("Updating asset stats:", stats);
  };

  // Add debug info
  console.log("FinancialAssetsPageContent - assetStats:", assetStats);
  console.log(
    "FinancialAssetsPageContent - assetStats.distribution:",
    assetStats.distribution,
  );
  console.log("FinancialAssetsPageContent - realAssets:", realAssets);
  console.log("FinancialAssetsPageContent - loading:", loading);
  console.log("FinancialAssetsPageContent - error:", error);

  // Page title and navigation
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "📊" },
    { id: "assets" as const, label: "Assets", icon: "💰" },
    { id: "debts" as const, label: "Debts", icon: "📉" },
  ];

  return (
    <>
      {/* Page Header - Web */}
      <div className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Asset Management</h1>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="px-4 py-3">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading asset data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Load Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={refreshAssets}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Page */}
        {!loading && !error && activeTab === "overview" && (
          <div className="space-y-6">
            {/* Asset Overview Cards */}
            <AssetOverviewCard overview={assetStats.overview} />

            {/* Financial Metrics Analysis */}
            <FinancialMetrics assets={assets} debts={debts} />

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Distribution Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Asset Distribution
                </h3>
                <AssetDistributionChart data={assetStats.distribution} />
              </div>

              {/* Asset Trend Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Asset Trend
                </h3>
                <AssetTrendChart data={assetStats.trends} />
              </div>
            </div>

            {/* Extended Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Asset Allocation Analysis
                </h3>
                <AssetAllocationChart data={assetStats.distribution} />
              </div>

              {/* Debt Structure Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Debt Structure Analysis
                </h3>
                <DebtStructureChart debts={debts} />
              </div>
            </div>
          </div>
        )}

        {/* Asset Management Page */}
        {!loading && !error && activeTab === "assets" && (
          <div className="space-y-6">
            <AssetList />
          </div>
        )}

        {/* Debt Management Page */}
        {!loading && !error && activeTab === "debts" && (
          <div className="space-y-6">
            <DebtManagement
              debts={debts}
              lendRecords={lendRecords}
              onDebtsChange={setDebts}
              onLendRecordsChange={setLendRecords}
              onStatsChange={handleStatsChange}
            />
          </div>
        )}
      </div>
    </>
  );
}
