import type { Account } from "~/types/transactions";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount?: Account;
  onSelect: (account: Account) => void;
  isOpen: boolean;
  onToggle: () => void;
  placeholder?: string;
  showBalance?: boolean;
  disabled?: boolean;
}

export function AccountSelector({
  accounts,
  selectedAccount,
  onSelect,
  isOpen,
  onToggle,
  placeholder = "请选择账户",
  showBalance = true,
  disabled = false,
}: AccountSelectorProps) {
  // 格式化金额
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  // 获取账户类型名称
  const getAccountTypeName = (type: Account["type"]) => {
    const typeMap = {
      cash: "现金",
      bank_card: "银行卡",
      credit_card: "信用卡",
      alipay: "支付宝",
      wechat: "微信",
      investment: "投资",
      other: "其他",
    };
    return typeMap[type] || "其他";
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-full p-3 border rounded-lg text-left flex items-center justify-between transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-3">
          {selectedAccount ? (
            <>
              <span
                className="text-lg"
                style={{ color: selectedAccount.color }}
              >
                {selectedAccount.icon}
              </span>
              <div>
                <div className="font-medium text-gray-900">
                  {selectedAccount.name}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <span>{getAccountTypeName(selectedAccount.type)}</span>
                  {showBalance && (
                    <>
                      <span>•</span>
                      <span>{formatCurrency(selectedAccount.balance)}</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        {!disabled && (
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {accounts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm">暂无可用账户</div>
            </div>
          ) : (
            accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  onSelect(account);
                }}
                className={`w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedAccount?.id === account.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg" style={{ color: account.color }}>
                    {account.icon}
                  </span>
                  <div>
                    <div
                      className={`font-medium ${
                        selectedAccount?.id === account.id
                          ? "text-blue-700"
                          : "text-gray-900"
                      }`}
                    >
                      {account.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{getAccountTypeName(account.type)}</span>
                      {showBalance && (
                        <>
                          <span>•</span>
                          <span>{formatCurrency(account.balance)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {selectedAccount?.id === account.id && (
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
