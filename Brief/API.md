# 记账App API文档

## 基础信息

- **Base URL**: `http://192.168.0.173:8000/api/v1` (开发环境)
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **时区**: UTC

## 环境配置

### 服务器配置
- **开发环境**: 配置文件位于 `backend/.env.development`
- **服务器地址**: 由 `SERVER_HOST` 和 `SERVER_PORT` 环境变量控制
- **当前配置**: `SERVER_HOST=0.0.0.0`, `SERVER_PORT=8000`
- **局域网访问**: 服务器绑定到 `0.0.0.0`，支持局域网内其他设备访问

### 邮件验证配置
- **功能开关**: `EMAIL_VERIFICATION_ENABLED` (当前为 `false`)
- **当前状态**: 邮件验证功能已禁用，用户注册后可直接登录
- **Token过期时间**: `ACCESS_TOKEN_EXPIRE_MINUTES=30` (30分钟)

### 启动服务
```bash
cd backend
python run.py
```

### 测试API
```bash
# 运行认证测试
cd backend
python -m pytest tests/test_auth.py -v
```

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据不合法",
    "details": [
      {
        "field": "email",
        "reason": "邮箱格式不正确"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| SUCCESS | 200 | 成功 |
| VALIDATION_ERROR | 400 | 输入验证错误 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| EMAIL_NOT_VERIFIED | 422 | 邮箱未验证 |
| VERIFICATION_CODE_EXPIRED | 422 | 验证码已过期 |
| VERIFICATION_CODE_INVALID | 422 | 验证码无效 |
| EMAIL_ALREADY_EXISTS | 409 | 邮箱已存在 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 1. 用户认证 (Auth)

### 1.1 用户注册
```http
POST /auth/register
```

**请求体:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "email_verified": false,
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "注册成功，验证邮件已发送到您的邮箱，请查收并验证邮箱后登录",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

> **注意**: 如果邮件验证功能被禁用(`EMAIL_VERIFICATION_ENABLED=false`)，用户注册后可直接登录，`email_verified`字段将为`true`。
```

### 1.2 发送邮箱验证码
```http
POST /auth/send-verification-email
```

**请求体:**
```json
{
  "email": "john@example.com"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "验证邮件已发送",
    "email": "john@example.com",
    "expires_in": 1800
  },
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 1.3 验证邮箱
```http
POST /auth/verify-email
```

**请求体 (通过验证码):**
```json
{
  "email": "john@example.com",
  "verification_code": "123456"
}
```

**或者 (通过令牌):**
```json
{
  "verification_token": "verification_token_from_email"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "邮箱验证成功",
    "email": "john@example.com"
  },
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 1.4 用户登录
```http
POST /auth/login
```

**请求体:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "email_verified": true,
      "avatar_url": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 1800
  },
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

> **注意**:
> - `expires_in` 值由配置文件中的 `ACCESS_TOKEN_EXPIRE_MINUTES` 决定(默认30分钟=1800秒)
> - 如果邮件验证功能启用但用户邮箱未验证，将返回422错误
```

**错误响应 (邮箱未验证):**
```json
{
  "detail": "邮箱未验证，请先验证邮箱后登录"
}
```

### 1.5 刷新Token
```http
POST /auth/refresh
```

**请求头:**
```
Authorization: Bearer <refresh_token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 1800
  },
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 1.6 用户登出
```http
POST /auth/logout
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "message": "登出成功"
  },
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

---

## 2. 用户管理 (Users)

### 2.1 获取当前用户信息
```http
GET /users/me
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "email_verified": true,
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "操作成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2.2 更新当前用户信息
```http
PUT /users/me
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "username": "new_username",
  "email": "new@example.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "new_username",
    "email": "new@example.com",
    "email_verified": false,
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "用户信息更新成功",
  "code": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

> **注意**: 如果更改邮箱地址，`email_verified` 将重置为 `false`，需要重新验证邮箱。

---

## 9. 周期账单管理 (Recurring Bills) ✅ [已实现]

### 9.1 获取周期账单列表
```http
GET /recurring-bills?page=1&size=20&account_id=uuid&frequency=monthly&is_active=true
```

**查询参数:**
- `account_id`: 账本ID (可选)
- `frequency`: 周期频率 (daily/weekly/monthly/yearly)
- `is_active`: 是否启用
- `page`: 页码
- `size`: 每页数量

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "account_id": "uuid",
        "asset_id": "uuid",
        "category_id": "uuid",
        "name": "房租",
        "amount": 3000.00,
        "currency": "CNY",
        "type": "expense",
        "frequency": "monthly",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "next_execution_date": "2024-02-01",
        "description": "每月房租支出",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

### 9.2 创建周期账单
```http
POST /recurring-bills
```

**请求体:**
```json
{
  "account_id": "uuid",
  "asset_id": "uuid",
  "category_id": "uuid",
  "name": "工资收入",
  "amount": 8000.00,
  "currency": "CNY",
  "type": "income",
  "frequency": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "description": "每月工资收入",
  "is_active": true
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "account_id": "uuid",
    "asset_id": "uuid",
    "category_id": "uuid",
    "name": "工资收入",
    "amount": 8000.00,
    "currency": "CNY",
    "type": "income",
    "frequency": "monthly",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "next_execution_date": "2024-01-01",
    "description": "每月工资收入",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "周期账单创建成功",
  "code": 200
}
```

### 9.3 获取周期账单详情
```http
GET /recurring-bills/{recurring_bill_id}
```

### 9.4 更新周期账单
```http
PUT /recurring-bills/{recurring_bill_id}
```

### 9.5 删除周期账单
```http
DELETE /recurring-bills/{recurring_bill_id}
```

### 9.6 执行周期账单
```http
POST /recurring-bills/{recurring_bill_id}/execute
```

**请求体:**
```json
{
  "description": "2024年1月工资发放",
  "amount": 8500.00
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "bill": {
      "id": "uuid",
      "account_id": "uuid",
      "asset_id": "uuid",
      "category_id": "uuid",
      "amount": 8500.00,
      "currency": "CNY",
      "type": "income",
      "description": "2024年1月工资发放",
      "date": "2024-01-15",
      "created_at": "2024-01-15T00:00:00Z"
    },
    "next_execution_date": "2024-02-01"
  },
  "message": "周期账单执行成功",
  "code": 200
}
```

### 9.7 切换周期账单状态
```http
POST /recurring-bills/{recurring_bill_id}/toggle
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_active": false,
    "message": "周期账单已禁用"
  },
  "message": "操作成功",
  "code": 200
}
```

### 9.8 获取周期账单汇总
```http
GET /recurring-bills/summary?account_id=uuid
```

**响应:**
```json
{
  "success": true,
  "data": {
    "total_count": 10,
    "active_count": 8,
    "monthly_estimated_income": 8000.00,
    "monthly_estimated_expense": 5500.00,
    "net_monthly_flow": 2500.00,
    "frequency_distribution": {
      "daily": 2,
      "weekly": 1,
      "monthly": 6,
      "yearly": 1
    },
    "type_distribution": {
      "income": 3,
      "expense": 7
    },
    "next_executions": [
      {
        "id": "uuid",
        "name": "房租",
        "amount": 3000.00,
        "type": "expense",
        "next_execution_date": "2024-02-01"
      }
    ]
  }
}
```

---

## 10. 高级报表功能 (Advanced Reports) ✅ [已实现]

### 10.1 分类统计
```http
GET /reports/category-stats?account_id=uuid&start_date=2024-01-01&end_date=2024-01-31&type=expense&include_subcategories=true
```

**响应:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "type": "expense",
    "total_amount": 8000.00,
    "categories": [
      {
        "category_id": "uuid",
        "category_name": "餐饮",
        "total_amount": 2500.00,
        "percentage": 31.25,
        "transaction_count": 25,
        "average_amount": 100.00,
        "subcategories": [
          {
            "category_id": "uuid",
            "category_name": "早餐",
            "total_amount": 800.00,
            "percentage": 10.0,
            "transaction_count": 8
          }
        ]
      }
    ]
  }
}
```

### 10.2 对比分析
```http
GET /reports/comparison-analysis?account_id=uuid&current_start=2024-01-01&current_end=2024-01-31&compare_start=2023-01-01&compare_end=2023-01-31&type=both
```

**响应:**
```json
{
  "success": true,
  "data": {
    "current_period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "total_income": 15000.00,
      "total_expense": 8000.00,
      "net_amount": 7000.00,
      "transaction_count": 45
    },
    "compare_period": {
      "start_date": "2023-01-01",
      "end_date": "2023-01-31",
      "total_income": 12000.00,
      "total_expense": 7000.00,
      "net_amount": 5000.00,
      "transaction_count": 38
    },
    "comparison": {
      "income_change": 3000.00,
      "income_change_percentage": 25.0,
      "expense_change": 1000.00,
      "expense_change_percentage": 14.29,
      "net_change": 2000.00,
      "net_change_percentage": 40.0,
      "transaction_count_change": 7
    },
    "category_comparisons": [
      {
        "category_name": "餐饮",
        "current_amount": 2500.00,
        "compare_amount": 2000.00,
        "change": 500.00,
        "change_percentage": 25.0
      }
    ]
  }
}
```

---

## 待实现的功能

以下功能在API设计中规划但尚未实现：

### 忘记密码
```http
POST /auth/forgot-password
```

### 重置密码
```http
POST /auth/reset-password
```

---

## 3. 账本管理 (Accounts) ✅

> **✅ 实现状态**: 账本管理功能已完全实现并测试通过！
>
> **当前已实现的功能包括**:
> - ✅ 用户认证系统 (注册、登录、邮箱验证、令牌管理)
> - ✅ 用户管理 (获取用户信息、更新用户信息) - **已实现**
> - ✅ 账本管理 (创建、查询、更新、删除、汇总) - **已实现**
> - ✅ 账单管理 (创建、查询、更新、删除、详情查看) - **已实现**
> - ✅ 资产管理 (创建、查询、更新、删除、总览) - **已实现**
> - ✅ 分类管理 (创建、查询、更新、删除、层级结构) - **已实现**
> - ⏳ 预算管理、报表统计 - 待后续开发
>
> **开发进度**: 核心记账功能（用户+账本+账单+资产+分类）已全部实现！预算和报表功能待开发。

### 3.1 获取账本列表
```http
GET /accounts?page=1&size=20
```

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "个人账本",
        "description": "我的个人财务记录",
        "currency": "CNY",
        "is_shared": false,
        "members": [],
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 1,
      "pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

### 3.2 创建账本
```http
POST /accounts
```

**请求体:**
```json
{
  "name": "家庭账本",
  "description": "家庭共同财务管理",
  "currency": "CNY",
  "is_shared": true,
  "members": ["uuid1", "uuid2"]
}
```

### 3.3 获取账本详情
```http
GET /accounts/{account_id}
```

### 3.4 更新账本
```http
PUT /accounts/{account_id}
```

### 3.5 删除账本
```http
DELETE /accounts/{account_id}
```

### 3.6 获取账本汇总
```http
GET /accounts/{account_id}/summary?start_date=2024-01-01&end_date=2024-01-31
```

**响应:**
```json
{
  "success": true,
  "data": {
    "total_income": 10000.00,
    "total_expense": 6000.00,
    "net_amount": 4000.00,
    "transaction_count": 25,
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  }
}
```

---

## 4. 账单管理 (Bills) ✅

### 4.1 获取账单列表
```http
GET /bills?account_id=uuid&page=1&size=20&start_date=2024-01-01&end_date=2024-01-31&type=expense&category_id=uuid
```

**查询参数:**
- `account_id`: 账本ID (可选)
- `type`: 类型 (income/expense/transfer)
- `category_id`: 分类ID
- `start_date`: 开始日期
- `end_date`: 结束日期
- `page`: 页码
- `size`: 每页数量

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "account_id": "uuid",
        "asset_id": "uuid",
        "category_id": "uuid",
        "to_account_id": null,          // 转账目标账户ID
        "to_asset_id": null,            // 转账目标资产ID
        "amount": 100.00,
        "currency": "CNY",
        "type": "expense",              // expense | income | transfer
        "description": "午餐",
        "date": "2024-01-01",
        "created_at": "2024-01-01T12:00:00Z",
        "account": {
          "id": "uuid",
          "name": "个人账本"
        },
        "asset": {
          "id": "uuid",
          "name": "招商银行卡",
          "type": "bank_account"
        },
        "category": {
          "id": "uuid",
          "name": "餐饮",
          "icon": "🍽️",
          "color": "#FF6B6B"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 4.2 创建账单
```http
POST /bills
```

**请求体:**

普通收支账单：
```json
{
  "account_id": "uuid",
  "asset_id": "uuid",
  "category_id": "uuid",
  "amount": 100.00,
  "currency": "CNY",
  "type": "expense",  // expense | income | transfer
  "description": "午餐",
  "date": "2024-01-01"
}
```

**转账账单 (新功能):**
```json
{
  "account_id": "uuid",           // 转出账户ID
  "to_account_id": "uuid",        // 转入账户ID (必需)
  "asset_id": "uuid",             // 转出资产ID
  "to_asset_id": "uuid",          // 转入资产ID (可选)
  "category_id": "uuid",
  "amount": 500.00,
  "currency": "CNY",
  "type": "transfer",             // 转账类型
  "description": "转账到家庭账户",
  "date": "2024-01-01"
}
```

**字段说明:**
- `to_account_id`: 转账目标账户ID，仅转账交易时必需
- `to_asset_id`: 转账目标资产ID，可选，用于不同资产间转账
- 转账时系统会验证转出和转入账户的权限

**转账响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "f9e54735-69dc-40b1-9231-2b3ad38c46f2",
    "account_id": "7eca8fae-1fb1-405b-a2bd-465a20afb022",
    "to_account_id": "0d6b9a7b-050b-4d4c-8e70-230897f298ed",
    "asset_id": "5dc2c080-202a-4df7-87bf-8e43e5926d04",
    "to_asset_id": null,
    "category_id": "16f0f5e7-14ad-4b96-82ff-ed4604141656",
    "amount": "100.00",
    "currency": "CNY",
    "type": "transfer",
    "description": "测试转账交易",
    "date": "2025-01-15",
    "user_id": "93730b67-ed7e-45ce-9bf7-20f67c049a3a",
    "created_at": "2025-09-28T22:10:28.951771Z",
    "updated_at": "2025-09-28T22:10:28.951771Z"
  },
  "message": "账单创建成功",
  "code": 200,
  "timestamp": "2025-09-28T22:10:29.089946Z"
}
```

### 4.3 获取账单详情
```http
GET /bills/{bill_id}
```

### 4.4 更新账单
```http
PUT /bills/{bill_id}
```

### 4.5 删除账单
```http
DELETE /bills/{bill_id}
```



---

## 5. 资产管理 (Assets) ✅

### 5.1 获取资产列表
```http
GET /assets?type=bank_account&include_in_total=true
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "招商银行卡",
      "type": "bank_account",
      "balance": 15000.00,
      "currency": "CNY",
      "include_in_total": true,
      "notes": "主要储蓄账户",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 5.2 创建资产
```http
POST /assets
```

**请求体:**
```json
{
  "name": "支付宝余额",
  "type": "cash",
  "balance": 500.00,
  "currency": "CNY",
  "include_in_total": true,
  "notes": "日常小额支付"
}
```

### 5.3 获取资产详情
```http
GET /assets/{asset_id}
```

### 5.4 更新资产
```http
PUT /assets/{asset_id}
```

### 5.5 删除资产
```http
DELETE /assets/{asset_id}
```

### 5.6 获取资产总览
```http
GET /assets/overview
```

**响应:**
```json
{
  "success": true,
  "data": {
    "total_assets": 50000.00,
    "positive_assets": 52000.00,
    "liabilities": 2000.00,
    "net_worth": 50000.00,
    "asset_count": 8,
    "liability_ratio": 0.04,
    "asset_breakdown": [
      {
        "type": "bank_account",
        "count": 3,
        "total_balance": 30000.00,
        "percentage": 0.6
      },
      {
        "type": "investment",
        "count": 2,
        "total_balance": 15000.00,
        "percentage": 0.3
      }
    ]
  }
}
```

### 5.7 获取资产趋势 [待实现]
```http
GET /assets/trends?period=6months&asset_id=uuid
```

> **注意**: 此端点在文档中设计但尚未实现。

---

## 6. 分类管理 (Categories) ✅

### 6.1 获取分类列表
```http
GET /categories?type=expense&parent_id=uuid
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "餐饮",
      "type": "expense",
      "icon": "🍽️",
      "color": "#FF6B6B",
      "parent_id": null,
      "children": [
        {
          "id": "uuid",
          "name": "早餐",
          "icon": "🌅",
          "color": "#FF6B6B"
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 6.2 创建分类
```http
POST /categories
```

**请求体:**
```json
{
  "name": "健身",
  "type": "expense",
  "icon": "💪",
  "color": "#4ECDC4",
  "parent_id": null
}
```

### 6.3 更新分类
```http
PUT /categories/{category_id}
```

### 6.4 删除分类
```http
DELETE /categories/{category_id}
```

---

## 7. 预算管理 (Budgets) [接口定义但未实现]

### 7.1 获取预算列表
```http
GET /budgets?account_id=uuid&period_type=monthly&year=2024
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "name": "2024年1月预算",
      "total_amount": 5000.00,
      "period_type": "monthly",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "categories": [
        {
          "category_id": "uuid",
          "category_name": "餐饮",
          "allocated_amount": 1000.00,
          "spent_amount": 800.00,
          "remaining_amount": 200.00,
          "usage_percentage": 0.8
        }
      ],
      "total_spent": 3200.00,
      "remaining_amount": 1800.00,
      "usage_percentage": 0.64,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 7.2 创建预算
```http
POST /budgets
```

**请求体:**
```json
{
  "account_id": "uuid",
  "name": "2024年2月预算",
  "total_amount": 5500.00,
  "period_type": "monthly",
  "start_date": "2024-02-01",
  "end_date": "2024-02-29",
  "categories": [
    {
      "category_id": "uuid",
      "allocated_amount": 1200.00
    },
    {
      "category_id": "uuid",
      "allocated_amount": 800.00
    }
  ]
}
```

### 7.3 获取预算详情
```http
GET /budgets/{budget_id}
```

### 7.4 更新预算
```http
PUT /budgets/{budget_id}
```

### 7.5 删除预算
```http
DELETE /budgets/{budget_id}
```

### 7.6 获取预算执行进度
```http
GET /budgets/{budget_id}/progress
```

**响应:**
```json
{
  "success": true,
  "data": {
    "budget": {
      "id": "uuid",
      "name": "2024年1月预算",
      "total_amount": 5000.00,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "progress": {
      "total_spent": 3200.00,
      "remaining_amount": 1800.00,
      "usage_percentage": 0.64,
      "days_elapsed": 15,
      "days_remaining": 16,
      "daily_average_spent": 213.33,
      "projected_total": 4960.00,
      "is_on_track": true
    },
    "categories": [
      {
        "category_id": "uuid",
        "category_name": "餐饮",
        "allocated_amount": 1000.00,
        "spent_amount": 800.00,
        "remaining_amount": 200.00,
        "usage_percentage": 0.8,
        "status": "warning",
        "daily_average": 53.33
      }
    ],
    "alerts": [
      {
        "type": "category_overspend",
        "category_name": "娱乐",
        "message": "娱乐分类已超出预算20%"
      }
    ]
  }
}
```

---

## 8. 报表统计 (Reports) ✅ [已实现]

### 8.1 收支汇总
```http
GET /reports/income-expense-summary?start_date=2025-09-01&end_date=2025-09-30&period=month&account_id=uuid&category_ids=uuid1,uuid2
```

**响应:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "group_by": "month"
    },
    "summary": {
      "total_income": 15000.00,
      "total_expense": 8000.00,
      "net_amount": 7000.00,
      "transaction_count": 45
    },
    "groups": [
      {
        "period": "2024-01",
        "total_income": 15000.00,
        "total_expense": 8000.00,
        "net_amount": 7000.00,
        "transaction_count": 45
      }
    ]
  }
}
```

### 8.2 趋势分析
```http
GET /reports/trends?account_id=uuid&period=6months&metric=expense&group_by=month
```

**响应:**
```json
{
  "success": true,
  "data": {
    "metric": "expense",
    "period": "6months",
    "group_by": "month",
    "data_points": [
      {
        "period": "2023-08",
        "value": 6500.00,
        "change": 0.0,
        "change_percentage": 0.0
      },
      {
        "period": "2023-09",
        "value": 7200.00,
        "change": 700.00,
        "change_percentage": 0.108
      }
    ],
    "statistics": {
      "average": 7100.00,
      "min": 6500.00,
      "max": 8200.00,
      "total_change": 1700.00,
      "total_change_percentage": 0.262
    }
  }
}
```

### 8.3 分类统计
```http
GET /reports/categories?account_id=uuid&start_date=2024-01-01&end_date=2024-01-31&type=expense
```

**响应:**
```json
{
  "success": true,
  "data": {
    "type": "expense",
    "total_amount": 8000.00,
    "categories": [
      {
        "category_id": "uuid",
        "category_name": "餐饮",
        "category_icon": "🍽️",
        "category_color": "#FF6B6B",
        "amount": 2400.00,
        "percentage": 0.3,
        "transaction_count": 24,
        "average_amount": 100.00,
        "trend": {
          "previous_period_amount": 2200.00,
          "change": 200.00,
          "change_percentage": 0.091
        }
      }
    ],
    "top_categories": [
      {
        "rank": 1,
        "category_name": "餐饮",
        "amount": 2400.00,
        "percentage": 0.3
      }
    ]
  }
}
```

### 8.4 对比分析
```http
GET /reports/comparison?account_id=uuid&period1_start=2024-01-01&period1_end=2024-01-31&period2_start=2023-01-01&period2_end=2023-01-31
```

**响应:**
```json
{
  "success": true,
  "data": {
    "period1": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "total_income": 15000.00,
      "total_expense": 8000.00,
      "net_amount": 7000.00
    },
    "period2": {
      "start_date": "2023-01-01",
      "end_date": "2023-01-31",
      "total_income": 12000.00,
      "total_expense": 7500.00,
      "net_amount": 4500.00
    },
    "comparison": {
      "income_change": 3000.00,
      "income_change_percentage": 0.25,
      "expense_change": 500.00,
      "expense_change_percentage": 0.067,
      "net_change": 2500.00,
      "net_change_percentage": 0.556
    },
    "category_comparison": [
      {
        "category_name": "餐饮",
        "period1_amount": 2400.00,
        "period2_amount": 2000.00,
        "change": 400.00,
        "change_percentage": 0.2
      }
    ]
  }
}
```

---

## 9. 债务管理 (Debts) ✅ [已实现]

### 9.1 获取债务列表
```http
GET /debts?type=borrow_in&is_settled=false&page=1&size=20
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "borrow_in",
      "counterpart": "张三",
      "amount": 5000.00,
      "currency": "CNY",
      "description": "创业资金借款",
      "due_date": "2024-06-01",
      "is_settled": false,
      "days_until_due": 150,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 8.2 创建债务记录
```http
POST /debts
```

**请求体:**
```json
{
  "type": "lend_out",
  "counterpart": "李四",
  "amount": 2000.00,
  "currency": "CNY",
  "description": "朋友急用",
  "due_date": "2024-03-01"
}
```

### 8.3 更新债务记录
```http
PUT /debts/{debt_id}
```

### 8.4 结清债务
```http
POST /debts/{debt_id}/settle
```

### 9.5 删除债务记录
```http
DELETE /debts/{debt_id}
```

### 9.6 获取债务统计汇总 ✅ [新增]
```http
GET /debts/summary
```

**响应:**
```json
{
  "total_borrow_in": "5000.00",
  "total_lend_out": "2000.00",
  "net_amount": "3000.00",
  "settled_count": 5,
  "unsettled_count": 3,
  "overdue_count": 1,
  "due_soon_count": 2,
  "average_debt_amount": "875.0000000000000000"
}
```

---

## 9. 周期账单 (Recurring Bills) ✅ [已实现]

### 9.1 获取周期账单列表
```http
GET /recurring-bills?is_active=true&frequency=monthly
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Netflix订阅",
      "amount": 68.00,
      "currency": "CNY",
      "asset_id": "uuid",
      "category_id": "uuid",
      "frequency": "monthly",
      "next_due_date": "2024-02-01",
      "end_date": null,
      "is_active": true,
      "description": "视频流媒体服务",
      "asset": {
        "name": "信用卡"
      },
      "category": {
        "name": "娱乐",
        "icon": "🎬"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 9.2 创建周期账单
```http
POST /recurring-bills
```

**请求体:**
```json
{
  "name": "手机话费",
  "amount": 89.00,
  "currency": "CNY",
  "asset_id": "uuid",
  "category_id": "uuid",
  "frequency": "monthly",
  "next_due_date": "2024-02-05",
  "end_date": null,
  "description": "中国移动月租费"
}
```

### 9.3 更新周期账单
```http
PUT /recurring-bills/{recurring_bill_id}
```

### 9.4 执行周期账单
```http
POST /recurring-bills/{recurring_bill_id}/execute
```

**请求体:**
```json
{
  "execution_date": "2024-02-01",
  "amount": 68.00,
  "description": "Netflix订阅 - 2024年2月"
}
```

### 9.5 暂停/恢复周期账单
```http
POST /recurring-bills/{recurring_bill_id}/toggle
```

### 9.6 删除周期账单
```http
DELETE /recurring-bills/{recurring_bill_id}
```

---

## 10. AI对话 (AI) [待实现]

### 10.1 发送AI对话
```http
POST /ai/chat
```

**请求体:**
```json
{
  "message": "本周我花了多少钱在餐饮上？",
  "session_id": "uuid",
  "account_id": "uuid"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "response": "根据您的账单记录，本周(1月22日-1月28日)您在餐饮分类上总共花费了420元，包括15笔交易。",
    "sql_query": "SELECT SUM(amount) FROM bills WHERE user_id = ? AND category_id IN (SELECT id FROM categories WHERE name = '餐饮') AND date BETWEEN '2024-01-22' AND '2024-01-28'",
    "query_result": {
      "total_amount": 420.00,
      "transaction_count": 15,
      "details": [
        {
          "date": "2024-01-22",
          "amount": 65.00,
          "description": "午餐"
        }
      ]
    },
    "suggestions": [
      "查看餐饮分类的历史趋势",
      "与上月同期对比",
      "查看最大单笔餐饮支出"
    ]
  }
}
```

### 10.2 获取AI建议
```http
GET /ai/suggestions?account_id=uuid&type=budget
```

**响应:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "budget_alert",
        "title": "餐饮预算即将超支",
        "description": "您本月的餐饮支出已达到预算的85%，建议控制后续支出",
        "priority": "medium",
        "action": "调整预算或减少支出"
      },
      {
        "type": "saving_opportunity",
        "title": "投资建议",
        "description": "您的现金资产较多，可以考虑进行一些低风险投资",
        "priority": "low",
        "action": "查看投资选项"
      }
    ]
  }
}
```

### 10.3 获取对话历史
```http
GET /ai/conversations?session_id=uuid&page=1&size=20
```

---

## 11. 文件上传 (Uploads) [待实现]

### 11.1 上传图片
```http
POST /uploads/image
```

**请求体 (multipart/form-data):**
```
file: 图片文件
purpose: bill_receipt | avatar | other
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "receipt_20240101.jpg",
    "file_path": "https://cdn.example.com/uploads/images/uuid.jpg",
    "file_size": 1024000,
    "mime_type": "image/jpeg",
    "recognition_result": {
      "amount": 125.50,
      "merchant": "星巴克",
      "date": "2024-01-01",
      "items": [
        {
          "name": "美式咖啡",
          "price": 35.00
        },
        {
          "name": "三明治",
          "price": 90.50
        }
      ]
    }
  }
}
```

### 11.2 上传语音
```http
POST /uploads/voice
```

**请求体 (multipart/form-data):**
```
file: 音频文件
format: wav | mp3 | m4a
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_path": "https://cdn.example.com/uploads/voice/uuid.wav",
    "transcription": "今天午餐花了八十五块钱在湘菜馆",
    "recognition_result": {
      "amount": 85.00,
      "description": "午餐",
      "suggested_category": "餐饮",
      "confidence": 0.92
    }
  }
}
```

### 11.3 上传CSV文件
```http
POST /uploads/csv
```

**请求体 (multipart/form-data):**
```
file: CSV文件
source: alipay | wechat | bank | other
account_id: uuid
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "alipay_bills_202401.csv",
    "preview": [
      {
        "date": "2024-01-01",
        "amount": 100.00,
        "description": "午餐",
        "merchant": "麦当劳",
        "mapped_category": "餐饮"
      }
    ],
    "total_records": 156,
    "import_status": "pending",
    "mapping_suggestions": {
      "amount_column": "金额",
      "date_column": "交易时间",
      "description_column": "商品说明"
    }
  }
}
```

### 11.4 确认CSV导入
```http
POST /uploads/{upload_id}/import
```

**请求体:**
```json
{
  "column_mapping": {
    "date": "交易时间",
    "amount": "金额",
    "description": "商品说明",
    "merchant": "交易对方"
  },
  "category_mapping": {
    "餐饮": "uuid",
    "交通": "uuid"
  },
  "skip_duplicates": true
}
```

---

## 12. 通知和提醒 (Notifications) [待实现]

### 12.1 获取通知列表
```http
GET /notifications?is_read=false&type=budget_alert
```

### 12.2 标记通知为已读
```http
PUT /notifications/{notification_id}/read
```

### 12.3 获取通知设置
```http
GET /notifications/settings
```

### 12.4 更新通知设置
```http
PUT /notifications/settings
```

---

## 13. 系统配置 (System) [待实现]

### 13.1 获取汇率信息
```http
GET /system/exchange-rates?from=USD&to=CNY
```

### 13.2 获取系统配置
```http
GET /system/config
```

**响应:**
```json
{
  "success": true,
  "data": {
    "supported_currencies": ["CNY", "USD", "EUR", "JPY", "GBP"],
    "default_currency": "CNY",
    "file_upload_limits": {
      "max_size": 10485760,
      "allowed_types": ["jpg", "png", "pdf", "csv"]
    },
    "features": {
      "ai_chat": true,
      "voice_recognition": true,
      "image_recognition": true
    }
  }
}
```

---

## 认证和权限

### JWT Token格式
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704070800,
  "type": "access"
}
```

### 权限级别
- **owner**: 账本创建者，拥有全部权限
- **admin**: 管理员，可管理账本和成员
- **member**: 普通成员，可查看和记账
- **viewer**: 只读权限

### 请求头示例
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Accept: application/json
X-Request-ID: uuid (可选，用于请求追踪)
```

---

## 限流和配额

- **认证接口**: 10次/分钟
- **文件上传**: 20次/小时
- **AI对话**: 100次/天
- **一般API**: 1000次/小时

## WebSocket接口 [待实现]

### 连接地址
```
wss://api.billapp.com/ws?token=jwt_token
```

### 实时事件
```json
{
  "type": "bill_created",
  "data": {
    "account_id": "uuid",
    "bill": {...}
  }
}

{
  "type": "budget_alert",
  "data": {
    "budget_id": "uuid",
    "message": "预算即将超支"
  }
}
```

---

## 📊 API实现进度总结

### ✅ 已完成模块 (2025-09-29)

#### 1. 用户认证系统 - 100% 完成
- ✅ 用户注册 (`POST /auth/register`)
- ✅ 用户登录 (`POST /auth/login`)
- ✅ 邮箱验证 (`POST /auth/send-verification-email`, `POST /auth/verify-email`)
- ✅ 刷新令牌 (`POST /auth/refresh`)
- ✅ 用户登出 (`POST /auth/logout`)

#### 2. 账本管理 - 100% 完成
- ✅ 创建账本 (`POST /accounts`)
- ✅ 获取账本列表 (`GET /accounts`) - 支持分页
- ✅ 获取账本详情 (`GET /accounts/{id}`)
- ✅ 更新账本 (`PUT /accounts/{id}`)
- ✅ 删除账本 (`DELETE /accounts/{id}`)
- ✅ 账本汇总统计 (`GET /accounts/{id}/summary`)

#### 3. 账单管理 - 100% 完成 (含转账功能)
- ✅ 创建账单 (`POST /bills`) - 支持收入、支出、转账
- ✅ 获取账单列表 (`GET /bills`) - 支持多条件过滤和分页
- ✅ 获取账单详情 (`GET /bills/{id}`)
- ✅ 更新账单 (`PUT /bills/{id}`) - 支持转账验证
- ✅ 删除账单 (`DELETE /bills/{id}`)
- ✅ **转账功能** - 支持账户间资金转移

### ⚠️ 需要优先实现的关联模块

#### 4. 资产管理 - 高优先级
账单功能需要资产模块支持，建议下一步实现：
- 资产创建和管理
- 资产类型（银行卡、现金、投资等）
- 资产余额跟踪

#### 5. 分类管理 - 高优先级
账单分类功能需要此模块：
- 收入/支出分类
- 分类层级结构
- 分类图标和颜色

#### 7. 债务管理 - 100% 完成 ✨ [新增 2025-09-29]
- ✅ 创建债务记录 (`POST /debts`)
- ✅ 获取债务列表 (`GET /debts`) - 支持类型筛选和分页
- ✅ 更新债务记录 (`PUT /debts/{id}`)
- ✅ 结清债务 (`POST /debts/{id}/settle`)
- ✅ 删除债务记录 (`DELETE /debts/{id}`)
- ✅ 债务统计汇总 (`GET /debts/summary`) - 包含借入/借出统计、到期提醒

#### 8. 报表统计 - 基础版完成 ✨ [新增 2025-09-29]
- ✅ 收支汇总 (`GET /reports/income-expense-summary`) - 支持时间筛选和账本筛选
- ✅ 数据准确性验证 - 已通过实际账单数据测试验证
- ⏳ 趋势分析 (接口已定义，待实现)
- ⏳ 分类统计 (接口已定义，待实现)
- ⏳ 对比分析 (接口已定义，待实现)

### ⏳ 待开发模块

- 周期账单 (Recurring Bills) - 中等优先级
- AI对话 (AI) - 扩展功能
- 文件上传 (Uploads) - 扩展功能
- 通知提醒 (Notifications) - 扩展功能
- 系统配置 (System) - 基础功能
- WebSocket实时更新 - 扩展功能

### 🎯 开发建议

**第一优先级**: 资产管理 + 分类管理
- 完善账单功能的必要依赖
- 实现完整的记账业务流程

**🎉 转账功能已完成 (2025-09-29)**:
- ✅ 支持账户间资金转移
- ✅ 双账户ID验证 (`account_id` + `to_account_id`)
- ✅ 可选不同资产间转账 (`to_asset_id`)
- ✅ 完整的权限验证和数据完整性检查
- ✅ 端到端测试验证通过

**第二优先级**: 预算管理 + 报表统计
- 核心财务管理功能
- 用户价值较高的功能

**第三优先级**: 其他扩展功能
- 根据用户需求和反馈优先级调整

---

*文档最后更新: 2025-09-29*
*当前实现状态: 核心记账功能基础完成，账本+账单管理已可用*
