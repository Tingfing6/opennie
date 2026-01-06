import React, { createContext, useContext, useState, useEffect } from "react";
import {
  assetApi,
  type AssetRead,
  type AssetCreate,
  type AssetUpdate,
} from "~/lib/api";
import type { AssetType as UiAssetType, AssetStats } from "~/types/assets";

interface AssetContextType {
  assets: AssetRead[];
  assetStats: AssetStats | null;
  loading: boolean;
  error: string | null;
  refreshAssets: () => Promise<void>;
  createAsset: (data: AssetCreate) => Promise<void>;
  updateAsset: (id: string, data: AssetUpdate) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  getAssetOverview: () => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function useAssets() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetProvider");
  }
  return context;
}

interface AssetProviderProps {
  children: React.ReactNode;
}

export function AssetProvider({ children }: AssetProviderProps) {
  const [assets, setAssets] = useState<AssetRead[]>([]);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 开发模式下使用的模拟数据（提升到函数作用域以便所有函数共享）
  const mockAssetStatsData: AssetStats = {
    overview: {
      totalAssets: 850000,
      totalDebts: 150000,
      netAssets: 700000,
      debtRatio: 0.176,
      currency: "CNY" as any,
    },
    distribution: [
      {
        type: "fund" as any,
        name: "基金投资",
        value: 85000,
        percentage: 10.0,
        color: "#10B981",
      },
      {
        type: "stock" as any,
        name: "股票资产",
        value: 65000,
        percentage: 7.6,
        color: "#F59E0B",
      },
      {
        type: "alipay" as any,
        name: "支付宝",
        value: 25000,
        percentage: 2.9,
        color: "#1677FF",
      },
      {
        type: "wechat" as any,
        name: "微信钱包",
        value: 12000,
        percentage: 1.4,
        color: "#52C41A",
      },
      {
        type: "bank_account" as UiAssetType,
        name: "银行存款",
        value: 662870,
        percentage: 78.1,
        color: "#3B82F6",
      },
      {
        type: "cash" as any,
        name: "现金",
        value: 3000,
        percentage: 0.4,
        color: "#6B7280",
      },
      {
        type: "other" as any,
        name: "其他资产",
        value: 26000,
        percentage: 3.1,
        color: "#8B5CF6",
      },
    ],
    trends: [
      {
        date: new Date("2024-07-01"),
        totalAssets: 820000,
        totalDebts: 200000,
        netAssets: 620000,
      },
      {
        date: new Date("2024-08-01"),
        totalAssets: 830000,
        totalDebts: 180000,
        netAssets: 650000,
      },
      {
        date: new Date("2024-09-01"),
        totalAssets: 840000,
        totalDebts: 160000,
        netAssets: 680000,
      },
      {
        date: new Date("2024-10-01"),
        totalAssets: 850000,
        totalDebts: 150000,
        netAssets: 700000,
      },
    ],
    sankeyData: {
      nodes: [
        { name: "工资收入" },
        { name: "投资收益" },
        { name: "银行存款" },
        { name: "投资资产" },
        { name: "支付宝" },
        { name: "微信钱包" },
        { name: "现金" },
        { name: "基金费用" },
        { name: "股票费用" },
        { name: "生活支出" },
        { name: "转账支出" },
      ],
      links: [
        { source: "工资收入", target: "银行存款", value: 25000 },
        { source: "投资收益", target: "投资资产", value: 3200 },
        { source: "银行存款", target: "基金费用", value: 3400 },
        { source: "银行存款", target: "股票费用", value: 530 },
        { source: "银行存款", target: "生活支出", value: 12000 },
        { source: "银行存款", target: "支付宝", value: 500 },
        { source: "银行存款", target: "微信钱包", value: 300 },
        { source: "银行存款", target: "现金", value: 200 },
      ],
    },
  };

  const refreshAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      // 使用本地API
      const [assetList, overview] = await Promise.all([
        assetApi.getAssets(),
        assetApi.getAssetOverview(),
      ]);

      setAssets(assetList);

      // 转换API返回的数据格式为组件需要的格式
      const convertedStats: AssetStats = {
        overview: {
          totalAssets: overview.total_assets,
          totalDebts: overview.liabilities,
          netAssets: overview.net_worth,
          debtRatio: overview.liability_ratio,
          currency: "CNY" as any,
        },
        distribution: overview.asset_breakdown.map((item) => ({
          type: item.type as unknown as UiAssetType,
          name: getAssetTypeName(item.type),
          value: item.total_balance,
          percentage: item.percentage,
          color: getAssetTypeColor(item.type),
        })),
        trends: mockAssetStatsData.trends, // 使用模拟趋势数据
        sankeyData: {
          nodes: [
            { name: "总资产" },
            ...assetList.map((asset) => ({ name: asset.name })),
          ],
          links: assetList.map((asset) => ({
            source: "总资产",
            target: asset.name,
            value: asset.balance,
          })),
        },
      };

      setAssetStats(convertedStats);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  };

  const getAssetOverview = async () => {
    try {
      // 使用本地API
      const overview = await assetApi.getAssetOverview();

      const convertedStats: AssetStats = {
        overview: {
          totalAssets: overview.total_assets,
          totalDebts: overview.liabilities,
          netAssets: overview.net_worth,
          debtRatio: overview.liability_ratio,
          currency: "CNY" as any,
        },
        distribution: overview.asset_breakdown.map((item) => ({
          type: item.type as unknown as UiAssetType,
          name: getAssetTypeName(item.type),
          value: item.total_balance,
          percentage: item.percentage,
          color: getAssetTypeColor(item.type),
        })),
        trends: assetStats?.trends || mockAssetStatsData.trends,
        sankeyData: assetStats?.sankeyData || {
          nodes: [],
          links: [],
        },
      };

      setAssetStats(convertedStats);
    } catch (err) {
      console.error("Failed to fetch asset overview:", err);
      setError(err instanceof Error ? err.message : "获取资产总览失败");
    }
  };

  const createAsset = async (data: AssetCreate) => {
    try {
      const newAsset = await assetApi.createAsset(data);
      setAssets((prev) => [...prev, newAsset]);
      await getAssetOverview(); // 更新统计数据
    } catch (err) {
      console.error("Failed to create asset:", err);
      setError(err instanceof Error ? err.message : "创建资产失败");
      throw err;
    }
  };

  const updateAsset = async (id: string, data: AssetUpdate) => {
    try {
      const updatedAsset = await assetApi.updateAsset(id, data);
      setAssets((prev) =>
        prev.map((asset) => (asset.id === id ? updatedAsset : asset)),
      );
      await getAssetOverview(); // 更新统计数据
    } catch (err) {
      console.error("Failed to update asset:", err);
      setError(err instanceof Error ? err.message : "更新资产失败");
      throw err;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await assetApi.deleteAsset(id);
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      await getAssetOverview(); // 更新统计数据
    } catch (err) {
      console.error("Failed to delete asset:", err);
      setError(err instanceof Error ? err.message : "删除资产失败");
      throw err;
    }
  };

  // 辅助函数：获取资产类型的中文名称
  const getAssetTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      bank_account: "银行账户",
      cash: "现金",
      credit_card: "信用卡",
      investment: "投资",
      other: "其他",
    };
    return typeMap[type] || type;
  };

  // 辅助函数：获取资产类型的颜色
  const getAssetTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      bank_account: "#3B82F6",
      cash: "#6B7280",
      credit_card: "#EF4444",
      investment: "#10B981",
      other: "#8B5CF6",
    };
    return colorMap[type] || "#6B7280";
  };

  // 初始化加载数据
  useEffect(() => {
    refreshAssets();
  }, []);

  const value: AssetContextType = {
    assets,
    assetStats,
    loading,
    error,
    refreshAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetOverview,
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
}
