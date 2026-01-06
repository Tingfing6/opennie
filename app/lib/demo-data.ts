// 演示数据生成器
import {
  userStorage,
  accountStorage,
  assetStorage,
  categoryStorage,
  billStorage,
} from "./local-storage";
import type { User, AccountRead, AssetRead, CategoryRead } from "./api";

// 生成随机金额
function randomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机日期（过去30天内）
function randomDate(daysBack: number = 30): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

// 创建演示用户
function createDemoUser(): User {
  return {
    id: "demo_user",
    username: "Xiao Ming Zhang",
    email: "xiaoming.zhang@example.com",
    email_verified: true,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomingzhang",
    created_at: new Date().toISOString(),
  };
}

// 创建演示账本
function createDemoAccounts(): AccountRead[] {
  return [
    {
      id: "demo_account_personal",
      name: "Personal Account",
      description: "Personal daily income and expense management",
      currency: "CNY",
      is_shared: false,
      members: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "demo_account_family",
      name: "Family Account",
      description: "Family common expense management",
      currency: "CNY",
      is_shared: true,
      members: ["demo_user", "spouse_user"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

// 创建演示资产
function createDemoAssets(): AssetRead[] {
  return [
    {
      id: "demo_asset_cash",
      name: "Cash",
      type: "cash",
      balance: 1500.0,
      currency: "CNY",
      include_in_total: true,
      notes: "Daily cash expenses",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_asset_bank_icbc",
      name: "ICBC Savings Card",
      type: "bank_account",
      balance: 25800.5,
      currency: "CNY",
      include_in_total: true,
      notes: "Main bank account",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_asset_bank_ccb",
      name: "CCB Savings Card",
      type: "bank_account",
      balance: 12600.3,
      currency: "CNY",
      include_in_total: true,
      notes: "Salary card",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_asset_alipay",
      name: "Alipay",
      type: "other",
      balance: 3200.8,
      currency: "CNY",
      include_in_total: true,
      notes: "Mobile payment",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_asset_wechat",
      name: "WeChat Pay",
      type: "other",
      balance: 560.2,
      currency: "CNY",
      include_in_total: true,
      notes: "WeChat payment",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_asset_credit_card",
      name: "CMB Credit Card",
      type: "credit_card",
      balance: -2800.0,
      currency: "CNY",
      include_in_total: true,
      notes: "Credit card debt",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_asset_investment",
      name: "Fund Investment",
      type: "investment",
      balance: 15000.0,
      currency: "CNY",
      include_in_total: true,
      notes: "Fund portfolio",
      created_at: new Date().toISOString(),
    },
  ];
}

// 创建丰富的交易记录
function createDemoTransactions() {
  const accounts = accountStorage.getAccounts();
  const assets = assetStorage.getAssets();
  const categories = categoryStorage.getCategories();

  if (accounts.length === 0 || assets.length === 0 || categories.length === 0) {
    console.warn("Failed to create demo transactions: missing necessary base data");
    return;
  }

  const mainAccount = accounts[0];
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  // 创建收入记录
  const incomeTransactions = [
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_bank_ccb",
      category_id: "income_salary",
      amount: 12000,
      type: "income" as const,
      description: "Monthly Salary",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_bank_ccb",
      category_id: "income_bonus",
      amount: 3000,
      type: "income" as const,
      description: "Quarterly Bonus",
      date: randomDate(15),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_investment",
      category_id: "income_investment",
      amount: 500,
      type: "income" as const,
      description: "Fund Dividend",
      date: randomDate(20),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "income_other",
      amount: 200,
      type: "income" as const,
      description: "Friend repayment",
      date: randomDate(10),
    },
  ];

  // 创建支出记录
  const expenseTransactions = [
    // 餐饮美食
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_food",
      amount: 58.5,
      type: "expense" as const,
      description: "Lunch - Spicy Hot Pot",
      date: randomDate(2),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_wechat",
      category_id: "expense_food",
      amount: 128.0,
      type: "expense" as const,
      description: "Dinner - Hot Pot",
      date: randomDate(3),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_cash",
      category_id: "expense_food",
      amount: 25.0,
      type: "expense" as const,
      description: "Breakfast - Bun & Soy Milk",
      date: randomDate(1),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_food",
      amount: 88.8,
      type: "expense" as const,
      description: "Takeout - Roast Duck Rice",
      date: randomDate(4),
    },

    // 交通出行
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_transport",
      amount: 12.5,
      type: "expense" as const,
      description: "Subway Fare",
      date: randomDate(1),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_wechat",
      category_id: "expense_transport",
      amount: 35.0,
      type: "expense" as const,
      description: "Didi Ride",
      date: randomDate(2),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_bank_icbc",
      category_id: "expense_transport",
      amount: 300.0,
      type: "expense" as const,
      description: "Gasoline",
      date: randomDate(7),
    },

    // 购物消费
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_credit_card",
      category_id: "expense_shopping",
      amount: 599.0,
      type: "expense" as const,
      description: "Sneakers",
      date: randomDate(10),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_shopping",
      amount: 189.0,
      type: "expense" as const,
      description: "Taobao Shopping - Clothes",
      date: randomDate(5),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_wechat",
      category_id: "expense_shopping",
      amount: 79.9,
      type: "expense" as const,
      description: "Daily Necessities",
      date: randomDate(3),
    },

    // 娱乐休闲
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_entertainment",
      amount: 45.0,
      type: "expense" as const,
      description: "Movie Ticket",
      date: randomDate(8),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_wechat",
      category_id: "expense_entertainment",
      amount: 15.0,
      type: "expense" as const,
      description: "Tencent Video Membership",
      date: randomDate(15),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_cash",
      category_id: "expense_entertainment",
      amount: 120.0,
      type: "expense" as const,
      description: "KTV",
      date: randomDate(12),
    },

    // 医疗健康
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_bank_icbc",
      category_id: "expense_medical",
      amount: 280.0,
      type: "expense" as const,
      description: "Physical Checkup",
      date: randomDate(20),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_medical",
      amount: 45.5,
      type: "expense" as const,
      description: "Pharmacy Medicine",
      date: randomDate(6),
    },

    // 教育学习
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_education",
      amount: 199.0,
      type: "expense" as const,
      description: "Online Course",
      date: randomDate(25),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_wechat",
      category_id: "expense_education",
      amount: 89.0,
      type: "expense" as const,
      description: "Technical Books",
      date: randomDate(18),
    },

    // 居住缴费
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_bank_icbc",
      category_id: "expense_housing",
      amount: 3200.0,
      type: "expense" as const,
      description: "Rent",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 5)
        .toISOString()
        .split("T")[0],
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_alipay",
      category_id: "expense_housing",
      amount: 156.8,
      type: "expense" as const,
      description: "Utilities",
      date: randomDate(12),
    },
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_wechat",
      category_id: "expense_housing",
      amount: 89.0,
      type: "expense" as const,
      description: "Property Fee",
      date: randomDate(8),
    },

    // 其他支出
    {
      account_id: mainAccount.id,
      asset_id: "demo_asset_cash",
      category_id: "expense_other",
      amount: 50.0,
      type: "expense" as const,
      description: "Red Packet / Gift",
      date: randomDate(15),
    },
  ];

  // 随机生成更多交易记录
  const additionalTransactions = [];
  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() < 0.15; // 15%概率为收入
    const categoryList = isIncome ? incomeCategories : expenseCategories;
    const category =
      categoryList[Math.floor(Math.random() * categoryList.length)];
    const assetList = assets.filter(
      (a) => a.balance > 0 || a.type === "credit_card",
    );
    const asset = assetList[Math.floor(Math.random() * assetList.length)];

    let amount;
    if (isIncome) {
      amount = randomAmount(100, 2000);
    } else {
      // 根据分类设置不同的金额范围
      switch (category.id) {
        case "expense_food":
          amount = randomAmount(15, 150);
          break;
        case "expense_transport":
          amount = randomAmount(5, 80);
          break;
        case "expense_shopping":
          amount = randomAmount(50, 500);
          break;
        case "expense_entertainment":
          amount = randomAmount(20, 200);
          break;
        case "expense_medical":
          amount = randomAmount(30, 300);
          break;
        case "expense_education":
          amount = randomAmount(50, 300);
          break;
        case "expense_housing":
          amount = randomAmount(100, 1000);
          break;
        default:
          amount = randomAmount(20, 200);
      }
    }

    additionalTransactions.push({
      account_id: mainAccount.id,
      asset_id: asset.id,
      category_id: category.id,
      amount: amount,
      type: isIncome ? ("income" as const) : ("expense" as const),
      description: `${category.name} - ${isIncome ? "Income" : "Expense"}`,
      date: randomDate(30),
    });
  }

  // 创建所有交易记录
  const allTransactions = [
    ...incomeTransactions,
    ...expenseTransactions,
    ...additionalTransactions,
  ];

  // 按日期排序并添加到数据库
  allTransactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((transaction) => {
      billStorage.addBill(transaction);
    });

  console.log(`Successfully created ${allTransactions.length} demo transactions`);
}

// 初始化完整的演示数据
export function initializeDemoData(): void {
  console.log("Starting demo data initialization...");

  // 清空现有数据
  localStorage.clear();

  // 1. 创建演示用户
  const demoUser = createDemoUser();
  userStorage.setUser(demoUser);
  userStorage.setAuthToken("demo_token");

  // 2. 创建演示账本
  const demoAccounts = createDemoAccounts();
  accountStorage.setAccounts(demoAccounts);

  // 3. 创建演示资产
  const demoAssets = createDemoAssets();
  assetStorage.setAssets(demoAssets);

  // 4. 初始化分类（使用默认分类）
  categoryStorage.getCategories();

  // 5. 创建演示交易记录
  createDemoTransactions();

  console.log("Demo data initialization complete!");
}

// 检查是否需要初始化演示数据
export function shouldInitializeDemoData(): boolean {
  const user = userStorage.getUser();
  const bills = billStorage.getBills();

  // 如果没有用户或者交易记录很少，建议初始化演示数据
  return !user || bills.length < 10;
}

// 重置为演示数据
export function resetToDemoData(): void {
  if (confirm("This will clear all existing data and reload demo data. Are you sure you want to continue?")) {
    initializeDemoData();
    window.location.reload();
  }
}
