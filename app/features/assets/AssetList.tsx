import { useState } from "react";
import { useAssets } from "~/contexts/AssetContext";
import { AssetFormModal } from "./AssetFormModal";
import type { Asset, AssetStats, AssetType } from "~/types/assets";
import { Currency } from "~/types/assets";

export function AssetList() {
  // 使用AssetContext获取数据和操作函数
  const {
    assets,
    assetStats,
    loading,
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    refreshAssets,
  } = useAssets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [filterType, setFilterType] = useState<"all" | AssetType>("all");

  // 资产类型图标映射
  const getAssetIcon = (type: AssetType) => {
    const iconMap: Record<AssetType, string> = {
      cash: "💰",
      bank_account: "🏦",
      credit_card: "💳",
      alipay: "💙",
      wechat: "💚",
      investment: "📈",
      real_estate: "🏠",
      fund: "📋",
      stock: "📊",
      other: "📝",
    };
    return iconMap[type] || "📝";
  };

  // 资产类型名称映射
  const getAssetTypeName = (type: AssetType) => {
    const nameMap: Record<AssetType, string> = {
      cash: "Cash",
      bank_account: "Bank Account",
      credit_card: "Credit Card",
      alipay: "Alipay",
      wechat: "WeChat",
      investment: "Investment Account",
      real_estate: "Real Estate",
      fund: "Fund",
      stock: "Stock",
      other: "Other",
    };
    return nameMap[type] || "其他";
  };

  // 格式化金额
  const formatCurrency = (
    amount: number,
    currency: Currency = Currency.CNY,
  ) => {
    const symbol = currency === Currency.CNY ? "¥" : "$";
    return `${symbol}${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  // 过滤资产
  const filteredAssets = assets.filter(
    (asset) => filterType === "all" || asset.type === filterType,
  );

  // 处理添加资产
  const handleAddAsset = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  // 处理编辑资产
  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  // 处理删除资产
  const handleDeleteAsset = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteAsset(assetId);
        // Context will automatically update assets and stats
      } catch (error) {
        console.error("Failed to delete asset:", error);
        alert("Failed to delete asset, please try again");
      }
    }
  };

  // 处理资产保存
  const handleAssetSave = async (assetData: Asset) => {
    try {
      if (editingAsset) {
        // 编辑现有资产
        await updateAsset(editingAsset.id, {
          name: assetData.name,
          type: assetData.type as any,
          balance: assetData.balance,
          currency: assetData.currency,
          include_in_total: assetData.isIncluded,
          notes: assetData.description,
        });
      } else {
        // 添加新资产
        await createAsset({
          name: assetData.name,
          type: assetData.type as any,
          balance: assetData.balance,
          currency: assetData.currency,
          include_in_total: assetData.isIncluded,
          notes: assetData.description,
        });
      }

      setIsModalOpen(false);
      setEditingAsset(null);
      // Context will automatically update assets and stats
    } catch (error) {
      console.error("Failed to save asset:", error);
      alert("Failed to save asset, please try again");
    }
  };

  // 资产类型选项
  const assetTypeOptions: Array<{
    value: "all" | AssetType;
    label: string;
    count: number;
  }> = [
      { value: "all" as const, label: "All", count: assets.length },
      {
        value: "cash" as AssetType,
        label: "Cash",
        count: assets.filter((a) => a.type === "cash").length,
      },
      {
        value: "bank_card" as AssetType,
        label: "Bank Card",
        count: assets.filter((a) => a.type === "bank_account").length,
      },
      {
        value: "investment" as AssetType,
        label: "Investment",
        count: assets.filter((a) => a.type === "investment").length,
      },
      {
        value: "other" as AssetType,
        label: "Other",
        count: assets.filter(
          (a) =>
            ![
              "cash",
              "bank_account",
              "investment",
              "credit_card",
              "real_estate",
              "fund",
              "stock",
              "alipay",
              "wechat",
            ].includes(a.type),
        ).length,
      },
    ];

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Asset Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your various asset accounts and investments
          </p>
        </div>

        <button
          onClick={handleAddAsset}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Asset
        </button>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-2">
        {assetTypeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterType(option.value)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === option.value
                ? "bg-blue-100 text-blue-800 ring-2 ring-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {option.label}
            <span className="ml-1.5 bg-white bg-opacity-60 px-1.5 py-0.5 rounded-full text-xs">
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* 资产列表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
            <p className="text-gray-600 mb-6">
              Add your first asset account to start managing your finances
            </p>
            <button
              onClick={handleAddAsset}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Asset
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getAssetIcon(asset.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {asset.name}
                        </h3>
                        {!asset.include_in_total && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getAssetTypeName(asset.type)}</span>
                        {asset.notes && (
                          <>
                            <span>•</span>
                            <span>{asset.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(asset.balance, asset.currency as any)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(asset.created_at).toLocaleDateString("zh-CN")}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditAsset(asset as any)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 资产表单模态框 */}
      <AssetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAssetSave}
        editingAsset={editingAsset}
      />
    </div>
  );
}
