import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  accountApi,
  type AccountRead,
  type AccountCreate,
  type AccountUpdate,
  type AccountSummary,
} from "~/lib/api";

interface AccountContextType {
  accounts: AccountRead[];
  selectedAccount: AccountRead | null;
  selectedAccountId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedAccount: (accountId: string | null) => void;
  createAccount: (data: AccountCreate) => Promise<AccountRead>;
  updateAccount: (id: string, data: AccountUpdate) => Promise<AccountRead>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountSummary: (
    id: string,
    params?: { start_date?: string; end_date?: string },
  ) => Promise<AccountSummary>;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider");
  }
  return context;
}

interface AccountProviderProps {
  children: React.ReactNode;
}

const SELECTED_ACCOUNT_KEY = "opennie_selected_account_id";

export function AccountProvider({ children }: AccountProviderProps) {
  const [accounts, setAccounts] = useState<AccountRead[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    () => {
      // 从本地存储加载上次选择的账本
      if (typeof window !== "undefined") {
        return localStorage.getItem(SELECTED_ACCOUNT_KEY);
      }
      return null;
    },
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) || null;

  // 加载账本列表
  const loadAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 使用本地API
      const response = await accountApi.getAccounts();
      setAccounts(response.data.items);

      // 验证当前选中的账本是否仍然存在
      const accountExists =
        selectedAccountId &&
        response.data.items.some((account) => account.id === selectedAccountId);

      // 如果没有选中账本或选中的账本不存在，自动选择第一个
      if (!accountExists && response.data.items.length > 0) {
        const firstAccountId = response.data.items[0].id;
        setSelectedAccountId(firstAccountId);
        // 更新本地存储
        if (typeof window !== "undefined") {
          localStorage.setItem(SELECTED_ACCOUNT_KEY, firstAccountId);
        }
      }
    } catch (err) {
      console.error("加载账本列表失败:", err);
      setError("加载账本列表失败");
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccountId]);

  // 组件加载时自动获取账本列表
  useEffect(() => {
    loadAccounts();
  }, []);

  // 创建账本
  const createAccount = useCallback(
    async (data: AccountCreate): Promise<AccountRead> => {
      try {
        setError(null);

        // 使用本地API
        const newAccount = await accountApi.createAccount(data);

        // 更新账本列表
        setAccounts((prev) => [...prev, newAccount]);

        // 自动选中新创建的账本
        setSelectedAccountId(newAccount.id);

        return newAccount;
      } catch (err) {
        console.error("创建账本失败:", err);
        setError("创建账本失败");
        throw err;
      }
    },
    [],
  );

  // 更新账本
  const updateAccount = useCallback(
    async (id: string, data: AccountUpdate): Promise<AccountRead> => {
      try {
        setError(null);

        // 使用本地API
        const updatedAccount = await accountApi.updateAccount(id, data);

        // 更新账本列表
        setAccounts((prev) =>
          prev.map((account) => (account.id === id ? updatedAccount : account)),
        );

        return updatedAccount;
      } catch (err) {
        console.error("更新账本失败:", err);
        setError("更新账本失败");
        throw err;
      }
    },
    [],
  );

  // 删除账本
  const deleteAccount = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        // 使用本地API
        await accountApi.deleteAccount(id);

        // 从账本列表中移除
        setAccounts((prev) => prev.filter((account) => account.id !== id));

        // 如果删除的是当前选中的账本，重新选择第一个账本
        if (selectedAccountId === id) {
          const remainingAccounts = accounts.filter(
            (account) => account.id !== id,
          );
          if (remainingAccounts.length > 0) {
            setSelectedAccountId(remainingAccounts[0].id);
          } else {
            setSelectedAccountId(null);
          }
        }
      } catch (err) {
        console.error("删除账本失败:", err);
        setError("删除账本失败");
        throw err;
      }
    },
    [selectedAccountId, accounts],
  );

  // 获取账本汇总
  const getAccountSummary = useCallback(
    async (
      id: string,
      params?: { start_date?: string; end_date?: string },
    ): Promise<AccountSummary> => {
      try {
        setError(null);
        const summary = await accountApi.getAccountSummary(id, params);
        return summary;
      } catch (err) {
        console.error("获取账本汇总失败:", err);
        setError("获取账本汇总失败");
        throw err;
      }
    },
    [],
  );

  // 手动刷新账本列表
  const refreshAccounts = useCallback(async () => {
    await loadAccounts();
  }, [loadAccounts]);

  // 设置选中的账本
  const handleSetSelectedAccount = useCallback((accountId: string | null) => {
    setSelectedAccountId(accountId);
    // 保存到本地存储
    if (typeof window !== "undefined") {
      if (accountId) {
        localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
      } else {
        localStorage.removeItem(SELECTED_ACCOUNT_KEY);
      }
    }
  }, []);

  const value: AccountContextType = {
    accounts,
    selectedAccount,
    selectedAccountId,
    isLoading,
    error,
    setSelectedAccount: handleSetSelectedAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountSummary,
    refreshAccounts,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}
