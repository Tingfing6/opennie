// 本地API模拟层 - 替换外部API调用
import {
  userStorage,
  accountStorage,
  assetStorage,
  categoryStorage,
  billStorage,
  initializeDefaultData,
} from "./local-storage";

import type {
  User,
  AccountRead,
  AccountCreate,
  AccountUpdate,
  AccountSummary,
  AssetRead,
  AssetCreate,
  AssetUpdate,
  CategoryRead,
  CategoryCreate,
  CategoryUpdate,
  BillWithDetails,
  BillCreate,
  BillUpdate,
  TransactionRead,
  TransactionCreate,
  TransactionUpdate,
  TransactionQueryParams,
  PaginationResponse,
  CategoryType,
  TransactionType,
} from "./api";

// 模拟网络延迟
function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 分页处理函数
function paginate<T>(
  items: T[],
  page: number = 1,
  size: number = 20,
): PaginationResponse<T>["data"] {
  const total = items.length;
  const pages = Math.ceil(total / size);
  const start = (page - 1) * size;
  const end = start + size;

  return {
    items: items.slice(start, end),
    pagination: {
      page,
      size,
      total,
      pages,
      has_next: page < pages,
      has_prev: page > 1,
    },
  };
}

// 认证相关API
export const localAuthApi = {
  async register(data: { username: string; email: string; password: string }) {
    await delay();

    const newUser: User = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      email_verified: true,
      created_at: new Date().toISOString(),
    };

    userStorage.setUser(newUser);
    userStorage.setAuthToken("local_token_" + newUser.id);

    return newUser;
  },

  async login(data: { email: string; password: string }) {
    await delay();

    // 检查是否已有用户，如果没有则创建默认用户
    let user = userStorage.getUser();
    if (!user) {
      user = {
        id: "default_user",
        username: data.email.split("@")[0] || "用户",
        email: data.email,
        email_verified: true,
        created_at: new Date().toISOString(),
      };
      userStorage.setUser(user);
    }

    const token = "local_token_" + user.id;
    userStorage.setAuthToken(token);

    return {
      user,
      access_token: token,
      refresh_token: "refresh_" + token,
      expires_in: 86400,
    };
  },

  async refreshToken() {
    await delay();
    const user = userStorage.getUser();
    if (!user) throw new Error("用户未登录");

    const newToken = "local_token_" + user.id + "_" + Date.now();
    userStorage.setAuthToken(newToken);

    return {
      access_token: newToken,
      expires_in: 86400,
    };
  },

  async logout() {
    await delay();
    // 保持用户数据，只清除token
    userStorage.setAuthToken(null);
  },

  async getCurrentUser() {
    await delay();
    const user = userStorage.getUser();
    if (!user) throw new Error("用户未登录");
    return user;
  },
};

// 用户相关API
export const localUserApi = {
  async getCurrentUser() {
    await delay();
    const user = userStorage.getUser();
    if (!user) throw new Error("用户未登录");
    return user;
  },

  async updateUser(data: {
    username?: string;
    email?: string;
    avatar_url?: string;
  }) {
    await delay();
    const user = userStorage.getUser();
    if (!user) throw new Error("用户未登录");

    const updatedUser = { ...user, ...data };
    userStorage.setUser(updatedUser);
    return updatedUser;
  },
};

// 账本相关API
export const localAccountApi = {
  async getAccounts(params?: { page?: number; size?: number }) {
    await delay();
    const accounts = accountStorage.getAccounts();
    const paginatedData = paginate(accounts, params?.page, params?.size);

    return {
      success: true,
      data: paginatedData,
      timestamp: new Date().toISOString(),
    } as PaginationResponse<AccountRead>;
  },

  async createAccount(data: AccountCreate): Promise<AccountRead> {
    await delay();
    return accountStorage.addAccount({
      ...data,
      is_shared: data.is_shared || false,
      members: data.members || [],
    });
  },

  async getAccount(id: string): Promise<AccountRead> {
    await delay();
    const account = accountStorage.getAccount(id);
    if (!account) throw new Error("账本不存在");
    return account;
  },

  async updateAccount(id: string, data: AccountUpdate): Promise<AccountRead> {
    await delay();
    const account = accountStorage.updateAccount(id, data);
    if (!account) throw new Error("账本不存在");
    return account;
  },

  async deleteAccount(id: string): Promise<void> {
    await delay();
    const success = accountStorage.deleteAccount(id);
    if (!success) throw new Error("账本不存在");
  },

  async getAccountSummary(
    id: string,
    params?: { start_date?: string; end_date?: string },
  ): Promise<AccountSummary> {
    await delay();

    const bills = billStorage
      .getBills()
      .filter((bill) => bill.account_id === id);

    let filteredBills = bills;
    if (params?.start_date || params?.end_date) {
      filteredBills = bills.filter((bill) => {
        const billDate = new Date(bill.date);
        const startDate = params.start_date
          ? new Date(params.start_date)
          : null;
        const endDate = params.end_date ? new Date(params.end_date) : null;

        if (startDate && billDate < startDate) return false;
        if (endDate && billDate > endDate) return false;
        return true;
      });
    }

    const totalIncome = filteredBills
      .filter((bill) => bill.type === "income")
      .reduce((sum, bill) => sum + bill.amount, 0);

    const totalExpense = filteredBills
      .filter((bill) => bill.type === "expense")
      .reduce((sum, bill) => sum + bill.amount, 0);

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_amount: totalIncome - totalExpense,
      transaction_count: filteredBills.length,
      period: {
        start_date: params?.start_date || "",
        end_date: params?.end_date || "",
      },
    };
  },
};

// 资产相关API
export const localAssetApi = {
  async getAssets(params?: {
    type?: string;
    include_in_total?: boolean;
  }): Promise<AssetRead[]> {
    await delay();
    let assets = assetStorage.getAssets();

    if (params?.type) {
      assets = assets.filter((asset) => asset.type === params.type);
    }

    if (params?.include_in_total !== undefined) {
      assets = assets.filter(
        (asset) => asset.include_in_total === params.include_in_total,
      );
    }

    return assets;
  },

  async createAsset(data: AssetCreate): Promise<AssetRead> {
    await delay();
    return assetStorage.addAsset({
      ...data,
      balance: data.balance || 0,
      currency: data.currency || "CNY",
      include_in_total: data.include_in_total !== false,
    });
  },

  async getAsset(id: string): Promise<AssetRead> {
    await delay();
    const asset = assetStorage.getAsset(id);
    if (!asset) throw new Error("资产不存在");
    return asset;
  },

  async updateAsset(id: string, data: AssetUpdate): Promise<AssetRead> {
    await delay();
    const asset = assetStorage.updateAsset(id, data);
    if (!asset) throw new Error("资产不存在");
    return asset;
  },

  async deleteAsset(id: string): Promise<void> {
    await delay();
    const success = assetStorage.deleteAsset(id);
    if (!success) throw new Error("资产不存在");
  },

  async getAssetOverview() {
    await delay();
    const assets = assetStorage.getAssets();

    const totalAssets = assets
      .filter((asset) => asset.include_in_total && asset.balance >= 0)
      .reduce((sum, asset) => sum + asset.balance, 0);

    const liabilities = assets
      .filter((asset) => asset.include_in_total && asset.balance < 0)
      .reduce((sum, asset) => sum + Math.abs(asset.balance), 0);

    const positiveAssets = assets
      .filter((asset) => asset.balance > 0)
      .reduce((sum, asset) => sum + asset.balance, 0);

    const netWorth = totalAssets - liabilities;
    const assetCount = assets.length;
    const liabilityRatio = totalAssets > 0 ? liabilities / totalAssets : 0;

    // 按类型分组统计
    const assetBreakdown = assets.reduce(
      (acc, asset) => {
        const existing = acc.find((item) => item.type === asset.type);
        if (existing) {
          existing.count++;
          existing.total_balance += asset.balance;
        } else {
          acc.push({
            type: asset.type,
            count: 1,
            total_balance: asset.balance,
            percentage: 0,
          });
        }
        return acc;
      },
      [] as Array<{
        type: string;
        count: number;
        total_balance: number;
        percentage: number;
      }>,
    );

    // 计算百分比
    assetBreakdown.forEach((item) => {
      item.percentage =
        totalAssets > 0 ? (item.total_balance / totalAssets) * 100 : 0;
    });

    return {
      total_assets: totalAssets,
      positive_assets: positiveAssets,
      liabilities,
      net_worth: netWorth,
      asset_count: assetCount,
      liability_ratio: liabilityRatio,
      asset_breakdown: assetBreakdown,
    };
  },
};

// 分类相关API
export const localCategoryApi = {
  async getCategories(params?: {
    page?: number;
    size?: number;
    type?: CategoryType;
  }): Promise<CategoryRead[]> {
    await delay();
    let categories = categoryStorage.getCategories();

    if (params?.type) {
      categories = categories.filter(
        (category) => category.type === params.type,
      );
    }

    return categories;
  },

  async createCategory(data: CategoryCreate): Promise<CategoryRead> {
    await delay();
    return categoryStorage.addCategory(data);
  },

  async getCategory(id: string): Promise<CategoryRead> {
    await delay();
    const category = categoryStorage.getCategory(id);
    if (!category) throw new Error("分类不存在");
    return category;
  },

  async updateCategory(
    id: string,
    data: CategoryUpdate,
  ): Promise<CategoryRead> {
    await delay();
    const category = categoryStorage.updateCategory(id, data);
    if (!category) throw new Error("分类不存在");
    return category;
  },

  async deleteCategory(id: string): Promise<void> {
    await delay();
    const success = categoryStorage.deleteCategory(id);
    if (!success) throw new Error("分类不存在或为系统分类");
  },
};

// 账单相关API
export const localBillApi = {
  async getBills(params?: {
    page?: number;
    size?: number;
    account_id?: string;
    type?: TransactionType;
    category_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    await delay();
    let bills = billStorage.getBills();

    // 应用过滤条件
    if (params?.account_id) {
      bills = bills.filter((bill) => bill.account_id === params.account_id);
    }

    if (params?.type) {
      bills = bills.filter((bill) => bill.type === params.type);
    }

    if (params?.category_id) {
      bills = bills.filter((bill) => bill.category_id === params.category_id);
    }

    if (params?.start_date || params?.end_date) {
      bills = bills.filter((bill) => {
        const billDate = new Date(bill.date);
        const startDate = params.start_date
          ? new Date(params.start_date)
          : null;
        const endDate = params.end_date ? new Date(params.end_date) : null;

        if (startDate && billDate < startDate) return false;
        if (endDate && billDate > endDate) return false;
        return true;
      });
    }

    // 按日期降序排序
    bills.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return paginate(bills, params?.page, params?.size);
  },

  async createBill(data: BillCreate): Promise<BillWithDetails> {
    await delay();
    const bill = billStorage.addBill(data);
    if (!bill) throw new Error("创建账单失败，请检查相关资产和分类是否存在");
    return bill;
  },

  async getBill(id: string): Promise<BillWithDetails> {
    await delay();
    const bill = billStorage.getBill(id);
    if (!bill) throw new Error("账单不存在");
    return bill;
  },

  async updateBill(id: string, data: BillUpdate): Promise<BillWithDetails> {
    await delay();
    const bill = billStorage.updateBill(id, data);
    if (!bill) throw new Error("账单不存在");
    return bill;
  },

  async deleteBill(id: string): Promise<void> {
    await delay();
    const success = billStorage.deleteBill(id);
    if (!success) throw new Error("账单不存在");
  },
};

// 交易记录API（兼容旧接口）
export const localTransactionApi = {
  async getTransactions(params?: TransactionQueryParams) {
    await delay();

    // 将账单转换为交易记录格式
    const bills = billStorage.getBills();
    const transactions: TransactionRead[] = bills.map((bill) => ({
      id: bill.id,
      type: bill.type,
      amount: bill.amount,
      category_id: bill.category_id,
      category_name: bill.category.name,
      category_icon: bill.category.icon,
      category_color: bill.category.color,
      account_id: bill.account_id,
      account_name: bill.account.name,
      description: bill.description,
      date: bill.date,
      time: new Date(bill.created_at).toLocaleTimeString(),
      to_account_id: bill.to_account_id,
      created_at: bill.created_at,
      updated_at: bill.updated_at,
    }));

    // 应用过滤
    let filteredTransactions = transactions;

    if (params?.type) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.type === params.type,
      );
    }

    if (params?.category_id) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.category_id === params.category_id,
      );
    }

    if (params?.account_id) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.account_id === params.account_id,
      );
    }

    if (params?.start_date || params?.end_date) {
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        const startDate = params.start_date
          ? new Date(params.start_date)
          : null;
        const endDate = params.end_date ? new Date(params.end_date) : null;

        if (startDate && transactionDate < startDate) return false;
        if (endDate && transactionDate > endDate) return false;
        return true;
      });
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchLower) ||
          t.category_name.toLowerCase().includes(searchLower) ||
          t.account_name.toLowerCase().includes(searchLower),
      );
    }

    // 按日期降序排序
    filteredTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const paginatedData = paginate(
      filteredTransactions,
      params?.page,
      params?.size,
    );

    return {
      success: true,
      data: paginatedData,
      timestamp: new Date().toISOString(),
    } as PaginationResponse<TransactionRead>;
  },

  async createTransaction(data: TransactionCreate): Promise<TransactionRead> {
    await delay();

    // 转换为账单格式
    const billData: BillCreate = {
      account_id: data.account_id,
      to_account_id: data.to_account_id,
      asset_id: data.account_id, // 假设账户ID就是资产ID
      category_id: data.category_id,
      amount: data.amount,
      type: data.type,
      description: data.description || data.note,
      date: data.date,
    };

    const bill = billStorage.addBill(billData);
    if (!bill) throw new Error("创建交易失败");

    // 转换回交易格式
    return {
      id: bill.id,
      type: bill.type,
      amount: bill.amount,
      category_id: bill.category_id,
      category_name: bill.category.name,
      category_icon: bill.category.icon,
      category_color: bill.category.color,
      account_id: bill.account_id,
      account_name: bill.account.name,
      description: bill.description,
      date: bill.date,
      time: new Date(bill.created_at).toLocaleTimeString(),
      to_account_id: bill.to_account_id,
      created_at: bill.created_at,
      updated_at: bill.updated_at,
    };
  },

  async getTransaction(id: string): Promise<TransactionRead> {
    await delay();
    const bill = billStorage.getBill(id);
    if (!bill) throw new Error("交易不存在");

    return {
      id: bill.id,
      type: bill.type,
      amount: bill.amount,
      category_id: bill.category_id,
      category_name: bill.category.name,
      category_icon: bill.category.icon,
      category_color: bill.category.color,
      account_id: bill.account_id,
      account_name: bill.account.name,
      description: bill.description,
      date: bill.date,
      time: new Date(bill.created_at).toLocaleTimeString(),
      to_account_id: bill.to_account_id,
      created_at: bill.created_at,
      updated_at: bill.updated_at,
    };
  },

  async updateTransaction(
    id: string,
    data: TransactionUpdate,
  ): Promise<TransactionRead> {
    await delay();

    const billUpdate: BillUpdate = {
      account_id: data.account_id,
      to_account_id: data.to_account_id,
      category_id: data.category_id,
      amount: data.amount,
      type: data.type,
      description: data.description || data.note,
      date: data.date,
    };

    const bill = billStorage.updateBill(id, billUpdate);
    if (!bill) throw new Error("交易不存在");

    return {
      id: bill.id,
      type: bill.type,
      amount: bill.amount,
      category_id: bill.category_id,
      category_name: bill.category.name,
      category_icon: bill.category.icon,
      category_color: bill.category.color,
      account_id: bill.account_id,
      account_name: bill.account.name,
      description: bill.description,
      date: bill.date,
      time: new Date(bill.created_at).toLocaleTimeString(),
      to_account_id: bill.to_account_id,
      created_at: bill.created_at,
      updated_at: bill.updated_at,
    };
  },

  async deleteTransaction(id: string): Promise<void> {
    await delay();
    const success = billStorage.deleteBill(id);
    if (!success) throw new Error("交易不存在");
  },

  async getTransactionStats(params?: {
    start_date?: string;
    end_date?: string;
    type?: TransactionType;
  }) {
    await delay();

    let bills = billStorage.getBills();

    // 应用过滤
    if (params?.type) {
      bills = bills.filter((bill) => bill.type === params.type);
    }

    if (params?.start_date || params?.end_date) {
      bills = bills.filter((bill) => {
        const billDate = new Date(bill.date);
        const startDate = params.start_date
          ? new Date(params.start_date)
          : null;
        const endDate = params.end_date ? new Date(params.end_date) : null;

        if (startDate && billDate < startDate) return false;
        if (endDate && billDate > endDate) return false;
        return true;
      });
    }

    const totalIncome = bills
      .filter((bill) => bill.type === "income")
      .reduce((sum, bill) => sum + bill.amount, 0);

    const totalExpense = bills
      .filter((bill) => bill.type === "expense")
      .reduce((sum, bill) => sum + bill.amount, 0);

    // 分类统计
    const categoryStats = bills.reduce(
      (acc, bill) => {
        const existing = acc.find(
          (stat) => stat.category_id === bill.category_id,
        );
        if (existing) {
          existing.total_amount += bill.amount;
          existing.transaction_count++;
        } else {
          acc.push({
            category_id: bill.category_id,
            category_name: bill.category.name,
            category_icon: bill.category.icon,
            category_color: bill.category.color,
            total_amount: bill.amount,
            transaction_count: 1,
            percentage: 0,
          });
        }
        return acc;
      },
      [] as Array<{
        category_id: string;
        category_name: string;
        category_icon?: string;
        category_color?: string;
        total_amount: number;
        transaction_count: number;
        percentage: number;
      }>,
    );

    // 计算百分比
    const totalAmount = totalIncome + totalExpense;
    categoryStats.forEach((stat) => {
      stat.percentage =
        totalAmount > 0 ? (stat.total_amount / totalAmount) * 100 : 0;
    });

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_amount: totalIncome - totalExpense,
      transaction_count: bills.length,
      category_stats: categoryStats,
    };
  },

  async getDailyStats(params?: { start_date?: string; end_date?: string }) {
    await delay();

    let bills = billStorage.getBills();

    if (params?.start_date || params?.end_date) {
      bills = bills.filter((bill) => {
        const billDate = new Date(bill.date);
        const startDate = params.start_date
          ? new Date(params.start_date)
          : null;
        const endDate = params.end_date ? new Date(params.end_date) : null;

        if (startDate && billDate < startDate) return false;
        if (endDate && billDate > endDate) return false;
        return true;
      });
    }

    // 按日期分组
    const dailyStats = bills.reduce(
      (acc, bill) => {
        const date = bill.date.split("T")[0]; // 获取日期部分

        const existing = acc.find((stat) => stat.date === date);
        if (existing) {
          if (bill.type === "income") {
            existing.income += bill.amount;
          } else if (bill.type === "expense") {
            existing.expense += bill.amount;
          }
          existing.transaction_count++;
        } else {
          acc.push({
            date,
            income: bill.type === "income" ? bill.amount : 0,
            expense: bill.type === "expense" ? bill.amount : 0,
            net: 0,
            transaction_count: 1,
          });
        }
        return acc;
      },
      [] as Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
        transaction_count: number;
      }>,
    );

    // 计算净值
    dailyStats.forEach((stat) => {
      stat.net = stat.income - stat.expense;
    });

    // 按日期排序
    dailyStats.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return dailyStats;
  },
};

// 初始化函数
export function initializeLocalData(): void {
  console.log("[Local API] Initializing local data...");

  // 简化初始化，只使用默认数据
  // 演示数据功能可通过设置页面手动触发
  initializeDefaultData();

  console.log("[Local API] Local data initialized");
}
