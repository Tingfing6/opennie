// 本地数据存储工具
import type {
  User,
  AccountRead,
  AssetRead,
  CategoryRead,
  BillWithDetails,
  TransactionRead,
} from "./api";

// 本地存储键名
const STORAGE_KEYS = {
  USER: "opennie_user",
  ACCOUNTS: "opennie_accounts",
  ASSETS: "opennie_assets",
  CATEGORIES: "opennie_categories",
  BILLS: "opennie_bills",
  TRANSACTIONS: "opennie_transactions",
  AUTH_TOKEN: "opennie_auth_token",
} as const;

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 通用存储操作
class LocalStorage {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}

// 用户数据管理
export const userStorage = {
  getUser(): User | null {
    return LocalStorage.get<User>(STORAGE_KEYS.USER);
  },

  setUser(user: User | null): void {
    if (user) {
      LocalStorage.set(STORAGE_KEYS.USER, user);
    } else {
      LocalStorage.remove(STORAGE_KEYS.USER);
    }
  },

  getAuthToken(): string | null {
    return LocalStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  setAuthToken(token: string | null): void {
    if (token) {
      LocalStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      LocalStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  isAuthenticated(): boolean {
    return !!(this.getUser() && this.getAuthToken());
  },
};

// 账本数据管理
export const accountStorage = {
  getAccounts(): AccountRead[] {
    return LocalStorage.get<AccountRead[]>(STORAGE_KEYS.ACCOUNTS) || [];
  },

  setAccounts(accounts: AccountRead[]): void {
    LocalStorage.set(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  getAccount(id: string): AccountRead | null {
    const accounts = this.getAccounts();
    return accounts.find((account) => account.id === id) || null;
  },

  addAccount(
    account: Omit<AccountRead, "id" | "created_at" | "updated_at">,
  ): AccountRead {
    const newAccount: AccountRead = {
      ...account,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const accounts = this.getAccounts();
    accounts.push(newAccount);
    this.setAccounts(accounts);

    return newAccount;
  },

  updateAccount(id: string, updates: Partial<AccountRead>): AccountRead | null {
    const accounts = this.getAccounts();
    const index = accounts.findIndex((account) => account.id === id);

    if (index === -1) return null;

    const updatedAccount = {
      ...accounts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    accounts[index] = updatedAccount;
    this.setAccounts(accounts);

    return updatedAccount;
  },

  deleteAccount(id: string): boolean {
    const accounts = this.getAccounts();
    const filteredAccounts = accounts.filter((account) => account.id !== id);

    if (filteredAccounts.length === accounts.length) {
      return false; // 没有找到要删除的账本
    }

    this.setAccounts(filteredAccounts);
    return true;
  },
};

// 资产数据管理
export const assetStorage = {
  getAssets(): AssetRead[] {
    return LocalStorage.get<AssetRead[]>(STORAGE_KEYS.ASSETS) || [];
  },

  setAssets(assets: AssetRead[]): void {
    LocalStorage.set(STORAGE_KEYS.ASSETS, assets);
  },

  getAsset(id: string): AssetRead | null {
    const assets = this.getAssets();
    return assets.find((asset) => asset.id === id) || null;
  },

  addAsset(asset: Omit<AssetRead, "id" | "created_at">): AssetRead {
    const newAsset: AssetRead = {
      ...asset,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    const assets = this.getAssets();
    assets.push(newAsset);
    this.setAssets(assets);

    return newAsset;
  },

  updateAsset(id: string, updates: Partial<AssetRead>): AssetRead | null {
    const assets = this.getAssets();
    const index = assets.findIndex((asset) => asset.id === id);

    if (index === -1) return null;

    const updatedAsset = {
      ...assets[index],
      ...updates,
    };

    assets[index] = updatedAsset;
    this.setAssets(assets);

    return updatedAsset;
  },

  deleteAsset(id: string): boolean {
    const assets = this.getAssets();
    const filteredAssets = assets.filter((asset) => asset.id !== id);

    if (filteredAssets.length === assets.length) {
      return false;
    }

    this.setAssets(filteredAssets);
    return true;
  },
};

// 分类数据管理
export const categoryStorage = {
  getCategories(): CategoryRead[] {
    return (
      LocalStorage.get<CategoryRead[]>(STORAGE_KEYS.CATEGORIES) ||
      this.getDefaultCategories()
    );
  },

  setCategories(categories: CategoryRead[]): void {
    LocalStorage.set(STORAGE_KEYS.CATEGORIES, categories);
  },

  getCategory(id: string): CategoryRead | null {
    const categories = this.getCategories();
    return categories.find((category) => category.id === id) || null;
  },

  addCategory(
    category: Omit<
      CategoryRead,
      "id" | "user_id" | "is_system" | "created_at" | "updated_at"
    >,
  ): CategoryRead {
    const newCategory: CategoryRead = {
      ...category,
      id: generateId(),
      user_id: userStorage.getUser()?.id || "default",
      is_system: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const categories = this.getCategories();
    categories.push(newCategory);
    this.setCategories(categories);

    return newCategory;
  },

  updateCategory(
    id: string,
    updates: Partial<CategoryRead>,
  ): CategoryRead | null {
    const categories = this.getCategories();
    const index = categories.findIndex((category) => category.id === id);

    if (index === -1) return null;

    const updatedCategory = {
      ...categories[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    categories[index] = updatedCategory;
    this.setCategories(categories);

    return updatedCategory;
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const category = categories.find((c) => c.id === id);

    // 不能删除系统分类
    if (category?.is_system) return false;

    const filteredCategories = categories.filter(
      (category) => category.id !== id,
    );

    if (filteredCategories.length === categories.length) {
      return false;
    }

    this.setCategories(filteredCategories);
    return true;
  },

  // 获取默认分类
  getDefaultCategories(): CategoryRead[] {
    const defaultCategories: CategoryRead[] = [
      // 支出分类
      {
        id: "expense_food",
        name: "Food & Dining",
        type: "expense",
        icon: "🍽️",
        color: "#ff6b6b",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_transport",
        name: "Transport",
        type: "expense",
        icon: "🚗",
        color: "#4ecdc4",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_shopping",
        name: "Shopping",
        type: "expense",
        icon: "🛍️",
        color: "#45b7d1",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_entertainment",
        name: "Entertainment",
        type: "expense",
        icon: "🎮",
        color: "#96ceb4",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_medical",
        name: "Medical & Health",
        type: "expense",
        icon: "🏥",
        color: "#ffeaa7",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_education",
        name: "Education",
        type: "expense",
        icon: "📚",
        color: "#fd79a8",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_housing",
        name: "Housing",
        type: "expense",
        icon: "🏠",
        color: "#e17055",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "expense_other",
        name: "Other Expenses",
        type: "expense",
        icon: "📝",
        color: "#a29bfe",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },

      // 收入分类
      {
        id: "income_salary",
        name: "Salary",
        type: "income",
        icon: "💰",
        color: "#00b894",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "income_bonus",
        name: "Bonus & Subsidy",
        type: "income",
        icon: "🎁",
        color: "#00cec9",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "income_investment",
        name: "Investment",
        type: "income",
        icon: "📈",
        color: "#fdcb6e",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "income_other",
        name: "Other Income",
        type: "income",
        icon: "💸",
        color: "#6c5ce7",
        user_id: "system",
        is_system: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 保存默认分类到本地存储
    this.setCategories(defaultCategories);
    return defaultCategories;
  },
};

// 账单数据管理
export const billStorage = {
  getBills(): BillWithDetails[] {
    return LocalStorage.get<BillWithDetails[]>(STORAGE_KEYS.BILLS) || [];
  },

  setBills(bills: BillWithDetails[]): void {
    LocalStorage.set(STORAGE_KEYS.BILLS, bills);
  },

  getBill(id: string): BillWithDetails | null {
    const bills = this.getBills();
    return bills.find((bill) => bill.id === id) || null;
  },

  addBill(bill: {
    account_id: string;
    to_account_id?: string;
    asset_id: string;
    to_asset_id?: string;
    category_id: string;
    amount: number;
    currency?: string;
    type: "income" | "expense" | "transfer";
    description?: string;
    date: string;
  }): BillWithDetails | null {
    const account = accountStorage.getAccount(bill.account_id);
    const asset = assetStorage.getAsset(bill.asset_id);
    const category = categoryStorage.getCategory(bill.category_id);

    if (!account || !asset || !category) {
      return null;
    }

    const newBill: BillWithDetails = {
      id: generateId(),
      account_id: bill.account_id,
      to_account_id: bill.to_account_id,
      asset_id: bill.asset_id,
      to_asset_id: bill.to_asset_id,
      category_id: bill.category_id,
      amount: bill.amount,
      currency: bill.currency || "CNY",
      type: bill.type,
      description: bill.description,
      date: bill.date,
      user_id: userStorage.getUser()?.id || "default",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      account: {
        id: account.id,
        name: account.name,
      },
      asset: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
      },
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
      },
      // 兼容字段，用于TransactionList组件
      category_name: category.name,
      account_name: account.name,
      time: new Date().toLocaleTimeString(),
      transfer_fee: 0,
    } as any;

    const bills = this.getBills();
    bills.push(newBill);
    this.setBills(bills);

    // 更新资产余额
    if (bill.type === "expense") {
      assetStorage.updateAsset(bill.asset_id, {
        balance: asset.balance - bill.amount,
      });
    } else if (bill.type === "income") {
      assetStorage.updateAsset(bill.asset_id, {
        balance: asset.balance + bill.amount,
      });
    } else if (bill.type === "transfer" && bill.to_asset_id) {
      const toAsset = assetStorage.getAsset(bill.to_asset_id);
      if (toAsset) {
        assetStorage.updateAsset(bill.asset_id, {
          balance: asset.balance - bill.amount,
        });
        assetStorage.updateAsset(bill.to_asset_id, {
          balance: toAsset.balance + bill.amount,
        });
      }
    }

    return newBill;
  },

  updateBill(
    id: string,
    updates: Partial<BillWithDetails>,
  ): BillWithDetails | null {
    const bills = this.getBills();
    const index = bills.findIndex((bill) => bill.id === id);

    if (index === -1) return null;

    const oldBill = bills[index];

    // 如果金额或资产变化，需要先恢复原来的资产余额变化
    if (
      updates.amount !== undefined ||
      updates.asset_id !== undefined ||
      updates.type !== undefined
    ) {
      const oldAsset = assetStorage.getAsset(oldBill.asset_id);
      if (oldAsset) {
        if (oldBill.type === "expense") {
          assetStorage.updateAsset(oldBill.asset_id, {
            balance: oldAsset.balance + oldBill.amount,
          });
        } else if (oldBill.type === "income") {
          assetStorage.updateAsset(oldBill.asset_id, {
            balance: oldAsset.balance - oldBill.amount,
          });
        }
      }
    }

    const updatedBill = {
      ...oldBill,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    bills[index] = updatedBill;
    this.setBills(bills);

    // 应用新的资产余额变化
    if (
      updates.amount !== undefined ||
      updates.asset_id !== undefined ||
      updates.type !== undefined
    ) {
      const newAsset = assetStorage.getAsset(updatedBill.asset_id);
      if (newAsset) {
        if (updatedBill.type === "expense") {
          assetStorage.updateAsset(updatedBill.asset_id, {
            balance: newAsset.balance - updatedBill.amount,
          });
        } else if (updatedBill.type === "income") {
          assetStorage.updateAsset(updatedBill.asset_id, {
            balance: newAsset.balance + updatedBill.amount,
          });
        }
      }
    }

    return updatedBill;
  },

  deleteBill(id: string): boolean {
    const bills = this.getBills();
    const billIndex = bills.findIndex((bill) => bill.id === id);

    if (billIndex === -1) return false;

    const bill = bills[billIndex];

    // 恢复资产余额
    const asset = assetStorage.getAsset(bill.asset_id);
    if (asset) {
      if (bill.type === "expense") {
        assetStorage.updateAsset(bill.asset_id, {
          balance: asset.balance + bill.amount,
        });
      } else if (bill.type === "income") {
        assetStorage.updateAsset(bill.asset_id, {
          balance: asset.balance - bill.amount,
        });
      } else if (bill.type === "transfer" && bill.to_asset_id) {
        const toAsset = assetStorage.getAsset(bill.to_asset_id);
        if (toAsset) {
          assetStorage.updateAsset(bill.asset_id, {
            balance: asset.balance + bill.amount,
          });
          assetStorage.updateAsset(bill.to_asset_id, {
            balance: toAsset.balance - bill.amount,
          });
        }
      }
    }

    const filteredBills = bills.filter((bill) => bill.id !== id);
    this.setBills(filteredBills);

    return true;
  },
};

// 初始化默认数据
export function initializeDefaultData(): void {
  // 初始化默认用户（如果没有登录用户）
  if (!userStorage.getUser()) {
    const defaultUser: User = {
      id: "default_user",
      username: "Default User",
      email: "user@example.com",
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    userStorage.setUser(defaultUser);
    userStorage.setAuthToken("local_token");
  }

  // 初始化默认账本
  if (accountStorage.getAccounts().length === 0) {
    accountStorage.addAccount({
      name: "My Ledger",
      description: "Personal finance management",
      currency: "CNY",
      is_shared: false,
      members: [],
    });
  }

  // 初始化默认资产
  if (assetStorage.getAssets().length === 0) {
    assetStorage.addAsset({
      name: "Cash",
      type: "cash",
      balance: 1000,
      currency: "CNY",
      include_in_total: true,
      notes: "Cash assets",
    });

    assetStorage.addAsset({
      name: "Bank Card",
      type: "bank_account",
      balance: 5000,
      currency: "CNY",
      include_in_total: true,
      notes: "Primary bank account",
    });
  }

  // 分类会在第一次访问时自动初始化
  categoryStorage.getCategories();
}
