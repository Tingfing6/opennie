import { useState, useEffect, useCallback } from "react";
import type {
  Asset,
  AssetFormData,
  AssetType,
  AccountType,
} from "~/types/assets";
import { Currency } from "~/types/assets";

interface AssetFormErrors {
  name?: string;
  type?: string;
  balance?: string;
  currency?: string;
  description?: string;
  isIncluded?: string;
  accountType?: string;
}

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  editingAsset?: Asset | null;
}

export function AssetFormModal({
  isOpen,
  onClose,
  onSave,
  editingAsset,
}: AssetFormModalProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    type: "cash" as AssetType,
    balance: "",
    currency: "CNY" as Currency,
    isIncluded: true,
    description: "",
  });

  const [errors, setErrors] = useState<AssetFormErrors>({});

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      type: "cash" as AssetType,
      balance: "",
      currency: "CNY" as Currency,
      isIncluded: true,
      description: "",
    });
    setErrors({});
  };

  // 编辑时填充表单
  useEffect(() => {
    if (editingAsset) {
      setFormData({
        name: editingAsset.name,
        type: editingAsset.type,
        accountType: editingAsset.accountType,
        balance: editingAsset.balance.toString(),
        currency: editingAsset.currency,
        isIncluded: editingAsset.isIncluded,
        description: editingAsset.description || "",
      });
    } else {
      resetForm();
    }
  }, [editingAsset, isOpen]);

  // 资产类型选项
  const assetTypeOptions = [
    { value: "cash", label: "Cash", icon: "💰" },
    { value: "bank_card", label: "Bank Card", icon: "🏦" },
    { value: "credit_card", label: "Credit Card", icon: "💳" },
    { value: "alipay", label: "Alipay", icon: "💙" },
    { value: "wechat", label: "WeChat", icon: "💚" },
    { value: "investment", label: "Investment Account", icon: "📈" },
    { value: "real_estate", label: "Real Estate", icon: "🏠" },
    { value: "vehicle", label: "Vehicle", icon: "🚗" },
    { value: "stock", label: "Stock", icon: "📊" },
    { value: "fund", label: "Fund", icon: "📋" },
    { value: "bond", label: "Bond", icon: "📜" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  // 账户类型选项（当资产类型为账户类型时显示）
  const accountTypeOptions = [
    { value: "savings", label: "Savings Account" },
    { value: "checking", label: "Checking Account" },
    { value: "credit", label: "Credit Account" },
    { value: "investment", label: "Investment Account" },
    { value: "cash", label: "Cash" },
  ];

  // 币种选项
  const currencyOptions = [
    { value: "CNY", label: "CNY (¥)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "JPY", label: "JPY (¥)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "HKD", label: "HKD (HK$)" },
    { value: "KRW", label: "KRW (₩)" },
  ];

  // 判断是否需要显示账户类型
  const needsAccountType = ["bank_card", "credit_card", "investment"].includes(
    formData.type,
  );

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: AssetFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter asset name";
    }

    if (!formData.balance.trim()) {
      newErrors.balance = "Please enter balance";
    } else {
      const balance = parseFloat(formData.balance);
      if (isNaN(balance)) {
        newErrors.balance = "Please enter a valid number";
      } else if (balance < 0) {
        newErrors.balance = "Balance cannot be negative";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const asset: Asset = {
      id: editingAsset?.id || `asset_${Date.now()}`,
      name: formData.name.trim(),
      type: formData.type,
      accountType: needsAccountType ? formData.accountType : undefined,
      balance: parseFloat(formData.balance),
      currency: formData.currency,
      isIncluded: formData.isIncluded,
      description: formData.description?.trim() || undefined,
      createdAt: editingAsset?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(asset);
  };

  // 处理输入变化 - 使用useCallback稳定引用
  const handleInputChange = useCallback(
    (field: keyof AssetFormData, value: string | boolean) => {
      setFormData((prev: AssetFormData) => ({ ...prev, [field]: value }));

      // 清除对应字段的错误
      setErrors((prev: AssetFormErrors) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  // 稳定的输入处理函数
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("name", e.target.value);
    },
    [handleInputChange],
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleInputChange("type", e.target.value as AssetType);
    },
    [handleInputChange],
  );

  const handleAccountTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleInputChange("accountType", e.target.value as AccountType);
    },
    [handleInputChange],
  );

  const handleBalanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("balance", e.target.value);
    },
    [handleInputChange],
  );

  const handleCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleInputChange("currency", e.target.value as Currency);
    },
    [handleInputChange],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleInputChange("description", e.target.value);
    },
    [handleInputChange],
  );

  const handleIsIncludedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange("isIncluded", e.target.checked);
    },
    [handleInputChange],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingAsset ? "Edit Asset" : "Add Asset"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 表单内容 */}
          <div className="p-6 space-y-4">
            {/* 资产名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="e.g. CMB Savings Card"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* 资产类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                {assetTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 账户类型（条件显示） */}
            {needsAccountType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  value={formData.accountType || ""}
                  onChange={handleAccountTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="">Select Account Type</option>
                  {accountTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 余额和币种 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance/Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balance}
                  onChange={handleBalanceChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.balance ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="0.00"
                />
                {errors.balance && (
                  <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={handleCurrencyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 是否计入总资产 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isIncluded"
                checked={formData.isIncluded}
                onChange={handleIsIncludedChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isIncluded"
                className="ml-2 text-sm text-gray-700"
              >
                Include in Total Assets (uncheck to hide this asset)
              </label>
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                placeholder="Add some description..."
              />
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingAsset ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
