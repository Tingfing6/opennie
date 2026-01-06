import { useState } from "react";
import type { Debt, LendRecord, AssetStats } from "~/types/assets";

interface DebtManagementProps {
  debts: Debt[];
  lendRecords: LendRecord[];
  onDebtsChange: (debts: Debt[]) => void;
  onLendRecordsChange: (lendRecords: LendRecord[]) => void;
  onStatsChange: (stats: AssetStats) => void;
}

export function DebtManagement({
  debts,
  lendRecords,
  onDebtsChange,
  onLendRecordsChange,
  onStatsChange,
}: DebtManagementProps) {
  const [activeTab, setActiveTab] = useState<"borrowed" | "lent">("borrowed");

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN");
  };

  // 计算总负债
  const totalBorrowed = debts.reduce((sum, debt) => sum + debt.amount, 0);

  // 计算总借出
  const totalLent = lendRecords.reduce((sum, record) => sum + record.amount, 0);

  // 计算已回收
  const totalReturned = lendRecords
    .filter((record) => record.status === "returned")
    .reduce((sum, record) => sum + record.amount, 0);

  // 计算待回收
  const totalPending = lendRecords
    .filter((record) => record.status === "active")
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6">
      {/* 头部概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 借入概览 */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Borrowed</h3>
            <svg
              className="w-8 h-8 opacity-75"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-3xl font-bold mb-2">
            {formatCurrency(totalBorrowed)}
          </div>
          <div className="text-sm opacity-90">
            {debts.length} loans • Avg Interest Rate{" "}
            {debts.length > 0
              ? (
                debts.reduce(
                  (sum, debt) => sum + (debt.interestRate || 0),
                  0,
                ) / debts.length
              ).toFixed(1)
              : 0}
            %
          </div>
        </div>

        {/* 借出概览 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Lending Management</h3>
            <svg
              className="w-8 h-8 opacity-75"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <div className="flex items-baseline gap-4 mb-2">
            <div>
              <div className="text-lg">Returned</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalReturned)}
              </div>
            </div>
            <div>
              <div className="text-lg">Pending</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPending)}
              </div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            {lendRecords.length} lendings • Return Rate{" "}
            {totalLent > 0 ? ((totalReturned / totalLent) * 100).toFixed(1) : 0}
            %
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("borrowed")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "borrowed"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Borrowed Management ({debts.length})
        </button>
        <button
          onClick={() => setActiveTab("lent")}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "lent"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
            }`}
        >
          Lending Management ({lendRecords.length})
        </button>
      </div>

      {/* 借入管理 */}
      {activeTab === "borrowed" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Borrowed Records</h3>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Add Borrowed
            </button>
          </div>

          {debts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No borrowed records
              </h3>
              <p className="text-gray-600 mb-6">
                Manage your loans, credit cards and other debt information
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Borrowed
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {debts.map((debt) => (
                <div
                  key={debt.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {debt.name}
                        </h4>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          {debt.type === "loan" && "Loan"}
                          {debt.type === "credit_card" && "Credit Card"}
                          {debt.type === "mortgage" && "Mortgage"}
                          {debt.type === "personal" && "Personal Loan"}
                          {debt.type === "other" && "Other"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {debt.creditor && <div>Creditor: {debt.creditor}</div>}
                        {debt.interestRate && (
                          <div>Rate: {debt.interestRate}%</div>
                        )}
                        {debt.dueDate && (
                          <div>Due Date: {formatDate(debt.dueDate)}</div>
                        )}
                        {debt.description && (
                          <div>Notes: {debt.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(debt.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(debt.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 借出管理 */}
      {activeTab === "lent" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Lent Records</h3>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Add Lent
            </button>
          </div>

          {lendRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No lent records
              </h3>
              <p className="text-gray-600 mb-6">Record funds you lent to others</p>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Lent
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lendRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {record.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${record.status === "returned"
                              ? "bg-green-100 text-green-800"
                              : record.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {record.status === "returned" && "Returned"}
                          {record.status === "overdue" && "Overdue"}
                          {record.status === "active" && "Active"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Borrower: {record.borrower}</div>
                        {record.interestRate && (
                          <div>Rate: {record.interestRate}%</div>
                        )}
                        {record.dueDate && (
                          <div>Expected Return: {formatDate(record.dueDate)}</div>
                        )}
                        {record.actualReturnDate && (
                          <div>
                            Actual Return: {formatDate(record.actualReturnDate)}
                          </div>
                        )}
                        {record.description && (
                          <div>Notes: {record.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(record.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(record.createdAt)}
                      </div>
                      {record.status === "active" && (
                        <button className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors">
                          Mark as Returned
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
