// 本地化重构：使用本地存储替代外部API
import {
  localAuthApi,
  localUserApi,
  localAccountApi,
  localAssetApi,
  localCategoryApi,
  localBillApi,
  localTransactionApi,
  initializeLocalData,
} from "./local-api";

// 初始化本地数据
if (typeof window !== "undefined") {
  initializeLocalData();
}

// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      reason: string;
    }>;
  };
  message?: string;
  code?: string;
  timestamp: string;
}

// 分类类型定义
export type CategoryType = "expense" | "income";

// 分类创建接口
export interface CategoryCreate {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  parent_id?: string;
}

// 分类更新接口
export interface CategoryUpdate {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
  parent_id?: string;
}

// 分类读取接口
export interface CategoryRead {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  parent_id?: string;
  user_id: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  children?: CategoryRead[];
}

// 交易类型定义
export type TransactionType = "income" | "expense" | "transfer";

// 账单类型定义（匹配后端 API）
export interface BillCreate {
  account_id: string;
  to_account_id?: string; // 转账目标账户，仅转账时需要
  asset_id: string;
  to_asset_id?: string; // 转账目标资产，仅转账时需要
  category_id: string;
  amount: number;
  currency?: string;
  type: TransactionType;
  description?: string;
  date: string;
}

// 账单更新接口
export interface BillUpdate {
  account_id?: string;
  to_account_id?: string;
  asset_id?: string;
  to_asset_id?: string;
  category_id?: string;
  amount?: number;
  currency?: string;
  type?: TransactionType;
  description?: string;
  date?: string;
}

// 账单读取接口
export interface BillRead {
  id: string;
  account_id: string;
  to_account_id?: string;
  asset_id: string;
  to_asset_id?: string;
  category_id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  description?: string;
  date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// 带详情的账单接口
export interface BillWithDetails extends BillRead {
  account: {
    id: string;
    name: string;
  };
  asset: {
    id: string;
    name: string;
    type: string;
  };
  category: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  // 兼容字段，用于TransactionList组件
  category_name: string;
  account_name: string;
  to_account_name?: string;
  subcategory_name?: string;
  time: string;
  transfer_fee?: number;
}

// 旧的交易接口（保持向后兼容）
export interface TransactionCreate {
  type: TransactionType;
  amount: number;
  category_id: string;
  subcategory_id?: string;
  account_id: string;
  description?: string;
  note?: string;
  date: string;
  // 转账特有字段
  to_account_id?: string;
  transfer_fee?: number;
}

// 交易更新接口
export interface TransactionUpdate {
  type?: TransactionType;
  amount?: number;
  category_id?: string;
  subcategory_id?: string;
  account_id?: string;
  description?: string;
  note?: string;
  date?: string;
  to_account_id?: string;
  transfer_fee?: number;
}

// 交易读取接口
export interface TransactionRead {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  subcategory_id?: string;
  category_name: string;
  subcategory_name?: string;
  category_icon?: string;
  category_color?: string;
  account_id: string;
  account_name: string;
  description?: string;
  note?: string;
  date: string;
  time: string;
  // 转账特有字段
  to_account_id?: string;
  to_account_name?: string;
  transfer_fee?: number;
  created_at: string;
  updated_at: string;
}

// 交易查询参数
export interface TransactionQueryParams {
  page?: number;
  size?: number;
  type?: TransactionType;
  category_id?: string;
  account_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// 响应模型
export interface ResponseModel<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  timestamp: string;
}

// 分页响应类型
export interface PaginationResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      size: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  timestamp: string;
}

// 请求配置接口
interface RequestConfig extends RequestInit {
  requireAuth?: boolean;
}

// API请求错误类
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Array<{ field: string; reason: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 获取Authorization头
function getAuthHeader(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const token = localStorage.getItem("access_token");
  return token ? `Bearer ${token}` : undefined;
}

// 本地化：移除原有的网络请求函数，直接使用本地API

// 用户接口定义
export interface User {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

// 认证相关API - 使用本地API
export const authApi = localAuthApi;

// 用户相关API - 使用本地API
export const userApi = localUserApi;

// 账本相关API - 使用本地API
export const accountApi = localAccountApi;

// 账本类型定义
export interface AccountRead {
  id: string;
  name: string;
  description?: string;
  currency: string;
  is_shared: boolean;
  members: string[];
  created_at: string;
  updated_at: string;
}

// 账本创建接口
export interface AccountCreate {
  name: string;
  description?: string;
  currency: string;
  is_shared?: boolean;
  members?: string[];
}

// 账本更新接口
export interface AccountUpdate {
  name?: string;
  description?: string;
  currency?: string;
  is_shared?: boolean;
  members?: string[];
}

// 账本汇总接口
export interface AccountSummary {
  total_income: number;
  total_expense: number;
  net_amount: number;
  transaction_count: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

// 资产类型定义
export type AssetType =
  | "bank_account"
  | "cash"
  | "credit_card"
  | "investment"
  | "other";

// 资产创建接口
export interface AssetCreate {
  name: string;
  type: AssetType;
  balance?: number;
  currency?: string;
  include_in_total?: boolean;
  notes?: string;
}

// 资产更新接口
export interface AssetUpdate {
  name?: string;
  type?: AssetType;
  balance?: number;
  currency?: string;
  include_in_total?: boolean;
  notes?: string;
}

// 资产读取接口
export interface AssetRead {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency: string;
  include_in_total: boolean;
  notes?: string;
  created_at: string;
}

// 资产管理API - 使用本地API
export const assetApi = localAssetApi;

// 分类管理API - 使用本地API
export const categoryApi = localCategoryApi;

// 账单管理API - 使用本地API
export const billApi = localBillApi;

// 交易记录管理API - 使用本地API（保持向后兼容）
export const transactionApi = localTransactionApi;

// 本地化：简化Token处理
export async function handleTokenExpired(): Promise<string> {
  try {
    const newToken = await authApi.refreshToken();
    return newToken.access_token;
  } catch (error) {
    // 本地存储模式下，重定向到登录页面
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw error;
  }
}
