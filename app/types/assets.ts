// 资产类型定义

export enum Currency {
  CNY = "CNY",
  USD = "USD",
  EUR = "EUR",
  JPY = "JPY",
  HKD = "HKD",
}

export type AssetType =
  | "bank_account"
  | "cash"
  | "credit_card"
  | "investment"
  | "real_estate"
  | "fund"
  | "stock"
  | "alipay"
  | "wechat"
  | "other";

export enum AccountType {
  SAVINGS = "savings",
  CHECKING = "checking",
  CREDIT = "credit",
  INVESTMENT = "investment",
}

export enum DebtType {
  MORTGAGE = "mortgage",
  CREDIT_CARD = "credit_card",
  LOAN = "loan",
  PERSONAL = "personal",
  OTHER = "other",
}

// 资产分布数据
export interface AssetDistribution {
  type: AssetType;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// 资产总览数据
export interface AssetOverview {
  totalAssets: number;
  totalDebts: number;
  netAssets: number;
  debtRatio: number;
  currency: Currency;
}

// 资产趋势数据
export interface AssetTrend {
  date: Date;
  totalAssets: number;
  totalDebts: number;
  netAssets: number;
}

// 资产表单数据
export interface AssetFormData {
  name: string;
  type: AssetType;
  accountType?: AccountType;
  balance: string; // 表单中使用字符串，提交时转换为数字
  currency: Currency;
  isIncluded: boolean;
  description?: string;
}

// 资产统计接口
export interface AssetStats {
  overview: {
    totalAssets: number;
    totalDebts: number;
    netAssets: number;
    debtRatio: number;
    currency: Currency;
  };
  distribution: Array<{
    type: AssetType;
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  trends: Array<{
    date: Date;
    totalAssets: number;
    totalDebts: number;
    netAssets: number;
  }>;
  sankeyData: {
    nodes: Array<{ name: string }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
    }>;
  };
}

// 资产接口
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  accountType?: AccountType;
  balance: number;
  currency: Currency;
  isIncluded: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 负债接口
export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  amount: number;
  currency: Currency;
  interestRate?: number;
  dueDate?: Date;
  creditor: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 借出记录接口
export interface LendRecord {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  borrower: string;
  interestRate?: number;
  dueDate?: Date;
  actualReturnDate?: Date;
  status: "active" | "returned" | "overdue";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
