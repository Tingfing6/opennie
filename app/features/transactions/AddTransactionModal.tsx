import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  categoryApi,
  billApi,
  assetApi,
  accountApi,
  type CategoryRead,
  type BillCreate,
  type BillUpdate,
  type AssetRead,
  type BillWithDetails,
} from "~/lib/api";
import { useAccounts } from "~/contexts/AccountContext";
import { AssetAccountSelector } from "./AssetAccountSelector";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (bill: BillCreate) => void; // 可选，如果提供则不会直接调用API
  onTransactionCreated?: () => void; // 交易创建后的回调
  isMobile?: boolean;
  editTransaction?: BillWithDetails | null; // 编辑模式：传入要编辑的交易
  onTransactionUpdated?: () => void; // 交易更新后的回调
}

// 将 ModalContent 移到组件外部作为独立组件
interface ModalContentProps {
  activeTab: "expense" | "income";
  amount: string;
  selectedCategory: CategoryRead | null;
  selectedSubcategory: CategoryRead | null;
  selectedAccount: any;
  selectedAsset: AssetRead | null;
  note: string;
  date: string;
  showCategories: boolean;
  showAccounts: boolean;
  isEditMode: boolean;
  showAssets: boolean;
  categories: CategoryRead[];
  accounts: any[];
  assets: AssetRead[];
  isLoadingCategories: boolean;
  isLoadingAccounts: boolean;
  isLoadingAssets: boolean;
  isSubmitting: boolean;
  filteredCategories: CategoryRead[];
  onClose: () => void;
  handleTabChange: (tab: "expense" | "income") => void;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategorySelect: (category: CategoryRead) => void;
  handleSubcategorySelect: (subcategory: CategoryRead) => void;
  handleAccountSelect: (account: any) => void;
  handleAssetSelect: (asset: AssetRead) => void;
  handleSubmit: () => void;
  setShowCategories: (show: boolean) => void;
  setShowAccounts: (show: boolean) => void;
  setShowAssets: (show: boolean) => void;
}

function ModalContent({
  activeTab,
  amount,
  selectedCategory,
  selectedSubcategory,
  selectedAccount,
  selectedAsset,
  note,
  date,
  showCategories,
  showAccounts,
  showAssets,
  isEditMode,
  categories,
  accounts,
  assets,
  isLoadingCategories,
  isLoadingAccounts,
  isLoadingAssets,
  isSubmitting,
  filteredCategories,
  onClose,
  handleTabChange,
  handleAmountChange,
  handleNoteChange,
  handleDateChange,
  handleCategorySelect,
  handleSubcategorySelect,
  handleAccountSelect,
  handleAssetSelect,
  handleSubmit,
  setShowCategories,
  setShowAccounts,
  setShowAssets,
}: ModalContentProps) {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditMode ? "Edit Record" : "Add Record"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => handleTabChange("expense")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === "expense"
                ? "bg-red-50 text-red-700 border-b-2 border-red-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Expense
          </button>
          <button
            onClick={() => handleTabChange("income")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === "income"
                ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ¥
            </span>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {selectedCategory ? (
                <>
                  <span className="text-lg">
                    {selectedCategory.icon || "📁"}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedCategory.name}
                    </div>
                    {selectedSubcategory && (
                      <div className="text-sm text-gray-500 flex items-center space-x-1">
                        <span>{selectedSubcategory.icon || "📁"}</span>
                        <span>{selectedSubcategory.name}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Please select category</span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showCategories ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showCategories && (
            <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
              {isLoadingCategories ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading categories...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No categories</p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full p-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${selectedCategory?.id === category.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-900"
                        }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </button>
                    {selectedCategory?.id === category.id &&
                      category.children &&
                      category.children.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          {category.children.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() =>
                                handleSubcategorySelect(subcategory)
                              }
                              className={`w-full p-3 pl-12 text-left flex items-center space-x-3 hover:bg-gray-100 transition-colors ${selectedSubcategory?.id === subcategory.id
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-700"
                                }`}
                            >
                              <span className="text-base">
                                {subcategory.icon}
                              </span>
                              <span>{subcategory.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <AssetAccountSelector
            assets={assets}
            selectedAssetId={selectedAsset?.id}
            onSelect={(assetId) => {
              if (assetId) {
                const asset = assets.find((a) => a.id === assetId);
                if (asset) {
                  handleAssetSelect(asset);
                }
              } else {
                // 不允许没有选择资产，因为asset_id是必需的
                // 保持当前选中的资产不变
                setShowAssets(false);
              }
            }}
            disabled={isLoadingAssets}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={note}
            onChange={handleNoteChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add note information..."
            rows={3}
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            !amount ||
            !selectedCategory ||
            !selectedAccount ||
            isSubmitting ||
            isLoadingCategories ||
            isLoadingAccounts ||
            isLoadingAssets
          }
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${!amount ||
              !selectedCategory ||
              !selectedAccount ||
              !selectedAsset ||
              isSubmitting ||
              isLoadingCategories ||
              isLoadingAccounts ||
              isLoadingAssets
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : activeTab === "expense"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSave,
  onTransactionCreated,
  isMobile = false,
  editTransaction = null,
  onTransactionUpdated,
}: AddTransactionModalProps) {
  const { selectedAccount: contextSelectedAccount } = useAccounts();
  const isEditMode = !!editTransaction;
  const [activeTab, setActiveTab] = useState<"expense" | "income">(
    editTransaction?.type === "income" ? "income" : "expense",
  );
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryRead | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<CategoryRead | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetRead | null>(null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCategories, setShowCategories] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [assets, setAssets] = useState<AssetRead[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用ref来避免不必要的重新渲染
  const dataLoadedRef = useRef(false);

  // 编辑模式：初始化表单数据
  useEffect(() => {
    if (editTransaction && isOpen) {
      setAmount(editTransaction.amount.toString());
      setNote(editTransaction.description || "");
      setDate(editTransaction.date);
      setActiveTab(editTransaction.type === "income" ? "income" : "expense");

      // 设置选中的分类（需要等分类数据加载完成）
      if (categories.length > 0) {
        const category = categories.find(
          (c) => c.id === editTransaction.category_id,
        );
        setSelectedCategory(category || null);
        // Note: BillWithDetails doesn't have subcategory_id, so we skip subcategory selection
      }

      // 设置选中的账本（需要等账本数据加载完成）
      if (accounts.length > 0) {
        const account = accounts.find(
          (a) => a.id === editTransaction.account_id,
        );
        setSelectedAccount(account || null);
      }

      // 设置选中的资产（需要等资产数据加载完成）
      if (assets.length > 0) {
        const asset = assets.find((a) => a.id === editTransaction.asset_id);
        setSelectedAsset(asset || null);
      }
    }
  }, [editTransaction, isOpen, categories, accounts, assets]);

  // 加载分类数据
  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoryApi.getCategories({ size: 100 });
      // 只获取根分类（没有parent_id的分类）
      const rootCategories = response.filter((cat) => !cat.parent_id);
      setCategories(rootCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // 加载账本数据
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      const response = await accountApi.getAccounts({ size: 20 });
      setAccounts(response.data.items);
      // 优先使用当前选中的账本，如果没有则选择第一个账本
      if (response.data.items.length > 0 && !selectedAccount) {
        const targetAccount = contextSelectedAccount || response.data.items[0];
        setSelectedAccount(targetAccount);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [selectedAccount, contextSelectedAccount]);

  // 加载资产数据
  const loadAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      const response = await assetApi.getAssets();
      setAssets(response);
      // 默认选择第一个资产（创建账单时必需）
      if (response.length > 0 && !selectedAsset) {
        setSelectedAsset(response[0]);
      }
    } catch (error) {
      console.error("Failed to load assets:", error);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [selectedAsset]);

  // 只在模态框打开且数据未加载时加载数据
  useEffect(() => {
    if (isOpen && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadCategories();
      loadAccounts();
      loadAssets();
    }
  }, [isOpen, loadCategories, loadAccounts, loadAssets]);

  // 过滤分类，使用 useMemo 避免重复计算
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === activeTab);
  }, [categories, activeTab]);

  const handleTabChange = useCallback((tab: "expense" | "income") => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  }, []);

  const handleCategorySelect = useCallback((category: CategoryRead) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    if (!category.children || category.children.length === 0) {
      setShowCategories(false);
    }
  }, []);

  const handleSubcategorySelect = useCallback((subcategory: CategoryRead) => {
    setSelectedSubcategory(subcategory);
    setShowCategories(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!amount || !selectedCategory || !selectedAccount || !selectedAsset)
      return;

    try {
      setIsSubmitting(true);

      if (isEditMode && editTransaction) {
        // 编辑模式 - 更新交易
        const updateData: BillUpdate = {
          account_id: selectedAccount.id,
          asset_id: selectedAsset.id,
          category_id: selectedCategory.id,
          amount: parseFloat(amount),
          currency: "CNY",
          type: activeTab,
          description: note || undefined,
          date: date,
        };

        await billApi.updateBill(editTransaction.id, updateData);

        // 触发更新成功回调
        if (onTransactionUpdated) {
          onTransactionUpdated();
        }
      } else {
        // 创建模式
        const bill: BillCreate = {
          account_id: selectedAccount.id,
          asset_id: selectedAsset.id,
          category_id: selectedCategory.id,
          amount: parseFloat(amount),
          currency: "CNY",
          type: activeTab,
          description: note || undefined,
          date: date,
        };

        // 如果提供了 onSave 回调，则使用回调
        if (onSave) {
          onSave(bill);
        } else {
          // 否则直接调用API
          await billApi.createBill(bill);
        }

        // 触发创建成功回调
        if (onTransactionCreated) {
          onTransactionCreated();
        }
      }

      handleReset();
      onClose();
    } catch (error) {
      console.error(isEditMode ? "Failed to update bill:" : "Failed to create bill:", error);
      // TODO: 显示错误提示
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amount,
    selectedCategory,
    selectedAccount,
    selectedAsset,
    activeTab,
    note,
    date,
    onSave,
    onTransactionCreated,
    onTransactionUpdated,
    onClose,
    isEditMode,
    editTransaction,
    selectedSubcategory,
  ]);

  const handleReset = useCallback(() => {
    setAmount("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowCategories(false);
    setShowAccounts(false);
    setShowAssets(false);
  }, []);

  const handleAccountSelect = useCallback((account: any) => {
    setSelectedAccount(account);
    setShowAccounts(false);
  }, []);

  const handleAssetSelect = useCallback((asset: AssetRead) => {
    setSelectedAsset(asset);
    setShowAssets(false);
  }, []);

  // 当模态框关闭时重置数据
  useEffect(() => {
    if (!isOpen) {
      handleReset();
      dataLoadedRef.current = false;
    }
  }, [isOpen, handleReset]);

  // 稳定的输入处理函数 - 使用 useCallback 确保函数引用稳定
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [],
  );

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNote(e.target.value);
    },
    [],
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDate(e.target.value);
    },
    [],
  );

  if (!isOpen) return null;

  // 为 ModalContent 准备的 props
  const modalContentProps = {
    activeTab,
    amount,
    selectedCategory,
    selectedSubcategory,
    selectedAccount,
    selectedAsset,
    note,
    date,
    showCategories,
    showAccounts,
    showAssets,
    isEditMode,
    categories,
    accounts,
    assets,
    isLoadingCategories,
    isLoadingAccounts,
    isLoadingAssets,
    isSubmitting,
    filteredCategories,
    onClose,
    handleTabChange,
    handleAmountChange,
    handleNoteChange,
    handleDateChange,
    handleCategorySelect,
    handleSubcategorySelect,
    handleAccountSelect,
    handleAssetSelect,
    handleSubmit,
    setShowCategories,
    setShowAccounts,
    setShowAssets,
  };

  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "visible" : "invisible"
          }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={onClose}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col max-h-[85vh] ${isOpen ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <ModalContent {...modalContentProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <ModalContent {...modalContentProps} />
      </div>
    </div>
  );
}
