// 交易和转账相关类型定义

// 交易类型枚举
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

// 账户类型（用于转账账户选择）
export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank_card' | 'credit_card' | 'alipay' | 'wechat' | 'investment' | 'other';
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
}

// 分类接口
export interface Category {
  id: string;
  name: string;
  emoji: string;
  type: "income" | "expense";
  parentId?: string;
  children?: Category[];
}

// 基础交易接口
export interface BaseTransaction {
  id?: string;
  amount: number;
  note: string;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 收入/支出交易接口
export interface IncomeExpenseTransaction extends BaseTransaction {
  type: TransactionType.INCOME | TransactionType.EXPENSE;
  categoryId: string;
  subcategoryId?: string;
  accountId?: string; // 关联的账户
}

// 转账交易接口
export interface TransferTransaction extends BaseTransaction {
  type: TransactionType.TRANSFER;
  fromAccountId: string;   // 转出账户
  toAccountId: string;     // 转入账户
  transferFee?: number;    // 转账手续费（可选）
}

// 联合交易类型
export type Transaction = IncomeExpenseTransaction | TransferTransaction;

// 交易表单数据接口
export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  note: string;
  date: string;

  // 收入/支出特有字段
  categoryId?: string;
  subcategoryId?: string;
  accountId?: string;

  // 转账特有字段
  fromAccountId?: string;
  toAccountId?: string;
  transferFee?: string;
}

// 转账表单验证接口
export interface TransferFormValidation {
  amount: string | null;
  fromAccount: string | null;
  toAccount: string | null;
  general: string | null;
}

// 账户余额检查结果
export interface BalanceCheckResult {
  isValid: boolean;
  availableBalance: number;
  requiredAmount: number;
  message?: string;
}

// 转账确认信息
export interface TransferConfirmation {
  fromAccount: Account;
  toAccount: Account;
  amount: number;
  transferFee: number;
  totalAmount: number; // 实际扣除金额（包含手续费）
  note: string;
  date: string;
}
