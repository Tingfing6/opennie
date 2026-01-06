import { useState, useEffect } from "react";
import { AccountSelector } from "./AccountSelector";
import { AssetAccountSelector } from "./AssetAccountSelector";
import { useAssets } from "~/contexts/AssetContext";
import type {
  Transaction,
  TransactionFormData,
  Account,
  Category,
  TransferFormValidation,
  BalanceCheckResult,
} from "~/types/transactions";
import { TransactionType } from "~/types/transactions";

interface AddTransactionModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  isMobile?: boolean;
}

export function AddTransactionModalV2({
  isOpen,
  onClose,
  onSave,
  isMobile = false,
}: AddTransactionModalV2Props) {
  const { assets } = useAssets();

  const [activeTab, setActiveTab] = useState<TransactionType>(
    TransactionType.EXPENSE,
  );
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.EXPENSE,
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Asset account ID state
  const [selectedAssetAccountId, setSelectedAssetAccountId] = useState<
    string | undefined
  >(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Category | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showFromAccount, setShowFromAccount] = useState(false);
  const [showToAccount, setShowToAccount] = useState(false);
  const [transferValidation, setTransferValidation] =
    useState<TransferFormValidation>({
      amount: null,
      fromAccount: null,
      toAccount: null,
      general: null,
    });

  // Mock account data
  const mockAccounts: Account[] = [
    {
      id: "acc_1",
      name: "CMB Savings Card",
      type: "bank_card",
      balance: 15000,
      currency: "CNY",
      icon: "🏦",
      color: "#3B82F6",
    },
    {
      id: "acc_2",
      name: "Alipay",
      type: "alipay",
      balance: 2500,
      currency: "CNY",
      icon: "💙",
      color: "#1677FF",
    },
    {
      id: "acc_3",
      name: "WeChat Wallet",
      type: "wechat",
      balance: 800,
      currency: "CNY",
      icon: "💚",
      color: "#52C41A",
    },
    {
      id: "acc_4",
      name: "Cash",
      type: "cash",
      balance: 500,
      currency: "CNY",
      icon: "💰",
      color: "#FA8C16",
    },
  ];

  // Mock category data
  const mockCategories: Category[] = [
    {
      id: "1",
      name: "Dining",
      emoji: "🍕",
      type: "expense",
      children: [
        {
          id: "1-1",
          name: "Breakfast",
          emoji: "🥐",
          type: "expense",
          parentId: "1",
        },
        {
          id: "1-2",
          name: "Lunch",
          emoji: "🍚",
          type: "expense",
          parentId: "1",
        },
        {
          id: "1-3",
          name: "Dinner",
          emoji: "🍝",
          type: "expense",
          parentId: "1",
        },
        {
          id: "1-4",
          name: "Snack",
          emoji: "🍿",
          type: "expense",
          parentId: "1",
        },
      ],
    },
    {
      id: "2",
      name: "Shopping",
      emoji: "🛍️",
      type: "expense",
      children: [
        {
          id: "2-1",
          name: "Clothing",
          emoji: "👕",
          type: "expense",
          parentId: "2",
        },
        {
          id: "2-2",
          name: "Digital",
          emoji: "📱",
          type: "expense",
          parentId: "2",
        },
        {
          id: "2-3",
          name: "Necessities",
          emoji: "🧴",
          type: "expense",
          parentId: "2",
        },
      ],
    },
    {
      id: "3",
      name: "Transportation",
      emoji: "🚗",
      type: "expense",
      children: [
        {
          id: "3-1",
          name: "Taxi",
          emoji: "🚕",
          type: "expense",
          parentId: "3",
        },
        {
          id: "3-2",
          name: "Subway",
          emoji: "🚇",
          type: "expense",
          parentId: "3",
        },
        {
          id: "3-3",
          name: "Bus",
          emoji: "🚌",
          type: "expense",
          parentId: "3",
        },
      ],
    },
    {
      id: "4",
      name: "Salary Income",
      emoji: "💰",
      type: "income",
      children: [
        {
          id: "4-1",
          name: "Base Salary",
          emoji: "💵",
          type: "income",
          parentId: "4",
        },
        { id: "4-2", name: "Bonus", emoji: "🏆", type: "income", parentId: "4" },
        {
          id: "4-3",
          name: "Overtime Pay",
          emoji: "⏰",
          type: "income",
          parentId: "4",
        },
      ],
    },
    {
      id: "5",
      name: "Investment Income",
      emoji: "📈",
      type: "income",
      children: [
        { id: "5-1", name: "Stocks", emoji: "📊", type: "income", parentId: "5" },
        { id: "5-2", name: "Funds", emoji: "📋", type: "income", parentId: "5" },
        { id: "5-3", name: "Wealth Management", emoji: "💎", type: "income", parentId: "5" },
      ],
    },
  ];

  const filteredCategories = mockCategories.filter(
    (cat) =>
      cat.type ===
      (activeTab === TransactionType.INCOME ? "income" : "expense"),
  );

  // Get selected account info
  const getSelectedFromAccount = () =>
    mockAccounts.find((acc) => acc.id === formData.fromAccountId);
  const getSelectedToAccount = () =>
    mockAccounts.find((acc) => acc.id === formData.toAccountId);

  // Check transfer balance
  const checkTransferBalance = (): BalanceCheckResult => {
    const fromAccount = getSelectedFromAccount();
    const amount = parseFloat(formData.amount || "0");
    const transferFee = parseFloat(formData.transferFee || "0");
    const totalRequired = amount + transferFee;

    if (!fromAccount) {
      return {
        isValid: false,
        availableBalance: 0,
        requiredAmount: totalRequired,
      };
    }

    return {
      isValid: fromAccount.balance >= totalRequired,
      availableBalance: fromAccount.balance,
      requiredAmount: totalRequired,
      message: fromAccount.balance < totalRequired ? "Insufficient Balance" : undefined,
    };
  };

  // Validate transfer form
  const validateTransferForm = (): TransferFormValidation => {
    const validation: TransferFormValidation = {
      amount: null,
      fromAccount: null,
      toAccount: null,
      general: null,
    };

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      validation.amount = "Please enter valid transfer amount";
    }

    if (!formData.fromAccountId) {
      validation.fromAccount = "Please select from account";
    }

    if (!formData.toAccountId) {
      validation.toAccount = "Please select to account";
    }

    if (formData.fromAccountId === formData.toAccountId) {
      validation.general = "From and to accounts cannot be same";
    }

    const balanceCheck = checkTransferBalance();
    if (!balanceCheck.isValid) {
      validation.general = balanceCheck.message || "Insufficient Balance";
    }

    return validation;
  };

  // Handle tab change
  const handleTabChange = (tab: TransactionType) => {
    setActiveTab(tab);
    setFormData({
      type: tab,
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShowCategories(false);
    setTransferValidation({
      amount: null,
      fromAccount: null,
      toAccount: null,
      general: null,
    });
  };

  // Handle form field change
  const handleFormChange = (
    field: keyof TransactionFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // For transfer, real-time validation
    if (activeTab === TransactionType.TRANSFER) {
      setTransferValidation(validateTransferForm());
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setFormData((prev) => ({
      ...prev,
      categoryId: category.id,
      subcategoryId: undefined,
    }));
    if (!category.children || category.children.length === 0) {
      setShowCategories(false);
    }
  };

  const handleSubcategorySelect = (subcategory: Category) => {
    setSelectedSubcategory(subcategory);
    setFormData((prev) => ({ ...prev, subcategoryId: subcategory.id }));
    setShowCategories(false);
  };

  // Handle account selection
  const handleFromAccountSelect = (account: Account) => {
    handleFormChange("fromAccountId", account.id);
    setShowFromAccount(false);
  };

  const handleToAccountSelect = (account: Account) => {
    handleFormChange("toAccountId", account.id);
    setShowToAccount(false);
  };

  // Handle submit
  const handleSubmit = () => {
    if (activeTab === TransactionType.TRANSFER) {
      const validation = validateTransferForm();
      if (Object.values(validation).some((error) => error !== null)) {
        setTransferValidation(validation);
        return;
      }

      const transaction: Transaction = {
        type: TransactionType.TRANSFER,
        amount: parseFloat(formData.amount),
        fromAccountId: formData.fromAccountId!,
        toAccountId: formData.toAccountId!,
        transferFee: parseFloat(formData.transferFee || "0"),
        note: formData.note,
        date: formData.date,
      };

      onSave(transaction);
    } else {
      if (!formData.amount || !selectedCategory) return;

      const transaction: Transaction = {
        type: activeTab,
        amount: parseFloat(formData.amount),
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory?.id,
        accountId: selectedAssetAccountId, // Use asset account ID
        note: formData.note,
        date: formData.date,
      };

      onSave(transaction);
    }

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      type: TransactionType.EXPENSE,
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedAssetAccountId(undefined); // Reset asset account selection
    setShowCategories(false);
    setShowFromAccount(false);
    setShowToAccount(false);
    setTransferValidation({
      amount: null,
      fromAccount: null,
      toAccount: null,
      general: null,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ModalContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Add Record</h3>
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => handleTabChange(TransactionType.EXPENSE)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === TransactionType.EXPENSE
                ? "bg-red-50 text-red-700 border-b-2 border-red-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Expense
          </button>
          <button
            onClick={() => handleTabChange(TransactionType.INCOME)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === TransactionType.INCOME
                ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Income
          </button>
          <button
            onClick={() => handleTabChange(TransactionType.TRANSFER)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === TransactionType.TRANSFER
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            Transfer
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Amount Input */}
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
              value={formData.amount}
              onChange={(e) => handleFormChange("amount", e.target.value)}
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg ${transferValidation.amount ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          {transferValidation.amount && (
            <p className="text-red-500 text-sm mt-1">
              {transferValidation.amount}
            </p>
          )}
        </div>

        {/* Transfer Unique Fields */}
        {activeTab === TransactionType.TRANSFER && (
          <>
            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account *
              </label>
              <AccountSelector
                accounts={mockAccounts}
                selectedAccount={getSelectedFromAccount()}
                onSelect={handleFromAccountSelect}
                isOpen={showFromAccount}
                onToggle={() => setShowFromAccount(!showFromAccount)}
                placeholder="Please select from account"
                showBalance={true}
              />
              {transferValidation.fromAccount && (
                <p className="text-red-500 text-sm mt-1">
                  {transferValidation.fromAccount}
                </p>
              )}
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account *
              </label>
              <AccountSelector
                accounts={mockAccounts.filter(
                  (acc) => acc.id !== formData.fromAccountId,
                )}
                selectedAccount={getSelectedToAccount()}
                onSelect={handleToAccountSelect}
                isOpen={showToAccount}
                onToggle={() => setShowToAccount(!showToAccount)}
                placeholder="Please select to account"
                showBalance={false}
              />
              {transferValidation.toAccount && (
                <p className="text-red-500 text-sm mt-1">
                  {transferValidation.toAccount}
                </p>
              )}
            </div>

            {/* Transfer Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Fee (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  value={formData.transferFee || ""}
                  onChange={(e) =>
                    handleFormChange("transferFee", e.target.value)
                  }
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Balance Check Display */}
            {formData.fromAccountId && formData.amount && (
              <div
                className={`p-3 rounded-lg ${checkTransferBalance().isValid
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                  }`}
              >
                <div className="text-sm">
                  <div>
                    Account Balance: ¥
                    {getSelectedFromAccount()?.balance.toLocaleString()}
                  </div>
                  <div>
                    Required Amount: ¥
                    {checkTransferBalance().requiredAmount.toLocaleString()}
                  </div>
                  {!checkTransferBalance().isValid && (
                    <div className="font-medium mt-1">Insufficient Balance</div>
                  )}
                </div>
              </div>
            )}

            {/* Transfer Error Message */}
            {transferValidation.general && (
              <div className="p-3 bg-red-50 text-red-800 rounded-lg">
                <p className="text-sm">{transferValidation.general}</p>
              </div>
            )}
          </>
        )}

        {/* Income/Expense Unique Fields */}
        {activeTab !== TransactionType.TRANSFER && (
          <>
            {/* Category Select */}
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
                      <span className="text-lg">{selectedCategory.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedCategory.name}
                        </div>
                        {selectedSubcategory && (
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <span>{selectedSubcategory.emoji}</span>
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
                  className={`w-5 h-5 text-gray-400 transition-transform ${showCategories ? "rotate-180" : ""}`}
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
                  {filteredCategories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full p-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${selectedCategory?.id === category.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-900"
                          }`}
                      >
                        <span className="text-lg">{category.emoji}</span>
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
                                  {subcategory.emoji}
                                </span>
                                <span>{subcategory.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asset Account Selection (Income/Expense) */}
            <AssetAccountSelector
              assets={assets}
              selectedAssetId={selectedAssetAccountId}
              onSelect={setSelectedAssetAccountId}
              placeholder="No linked asset account"
              label="Linked Asset Account"
              showOptional={true}
            />
          </>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleFormChange("date", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => handleFormChange("note", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add note information..."
            rows={3}
          />
        </div>
      </div>

      {/* Bottom Buttons */}
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
            !formData.amount ||
            (activeTab !== TransactionType.TRANSFER && !selectedCategory) ||
            (activeTab === TransactionType.TRANSFER &&
              (!formData.fromAccountId || !formData.toAccountId))
          }
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${!formData.amount ||
              (activeTab !== TransactionType.TRANSFER && !selectedCategory) ||
              (activeTab === TransactionType.TRANSFER &&
                (!formData.fromAccountId || !formData.toAccountId))
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : activeTab === TransactionType.EXPENSE
                ? "bg-red-600 text-white hover:bg-red-700"
                : activeTab === TransactionType.INCOME
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          Save
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "visible" : "invisible"}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 flex flex-col max-h-[85vh] ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          <ModalContent />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <ModalContent />
      </div>
    </div>
  );
}
