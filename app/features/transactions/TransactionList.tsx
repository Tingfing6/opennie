import { useState, useEffect } from "react";
import { billApi, type BillWithDetails } from "~/lib/api";
import { useAccounts } from "~/contexts/AccountContext";
import { AddTransactionModal } from "./AddTransactionModal";

interface DayGroup {
  date: string;
  totalIncome: number;
  totalExpense: number;
  transactions: BillWithDetails[];
}

interface TransactionListProps {
  limit?: number;
  showTitle?: boolean;
}

export function TransactionList({
  limit,
  showTitle = true,
}: TransactionListProps = {}) {
  const { selectedAccountId } = useAccounts();
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<BillWithDetails | null>(null);
  const pageSize = 30;

  // Load transaction data
  const loadTransactions = async (page: number = 1) => {
    if (!selectedAccountId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await billApi.getBills({
        page,
        size: limit || pageSize,
        account_id: selectedAccountId, // Filter by selected account
      });

      if (page === 1) {
        // First page, replace all data
        let transactions = response.items;

        // If limit is set, only take first N items
        if (limit) {
          transactions = transactions.slice(0, limit);
        }

        const grouped = groupTransactionsByDate(transactions);
        setDayGroups(grouped);
      } else {
        // Load more pages, add data
        const transactions = response.items;
        const newGroups = groupTransactionsByDate(transactions);
        setDayGroups((prev) => mergeDayGroups(prev, newGroups));
      }

      // If a limit is set, do not show load more
      setHasMore(!limit && page < response.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group transactions by date
  const groupTransactionsByDate = (
    transactions: BillWithDetails[],
  ): DayGroup[] => {
    const grouped = transactions.reduce(
      (acc, transaction) => {
        if (!acc[transaction.date]) {
          acc[transaction.date] = {
            date: transaction.date,
            totalIncome: 0,
            totalExpense: 0,
            transactions: [],
          };
        }

        if (transaction.type === "income") {
          acc[transaction.date].totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          acc[transaction.date].totalExpense += transaction.amount;
        }

        acc[transaction.date].transactions.push(transaction);
        return acc;
      },
      {} as Record<string, DayGroup>,
    );

    // Sort by date in descending order
    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  // Merge day groups (for loading more)
  const mergeDayGroups = (
    existing: DayGroup[],
    newGroups: DayGroup[],
  ): DayGroup[] => {
    const mergedMap = new Map<string, DayGroup>();

    // Add existing data to Map
    existing.forEach((group) => {
      mergedMap.set(group.date, group);
    });

    // Merge new data
    newGroups.forEach((newGroup) => {
      const existingGroup = mergedMap.get(newGroup.date);
      if (existingGroup) {
        // Merge data for same day
        existingGroup.transactions.push(...newGroup.transactions);
        existingGroup.totalIncome += newGroup.totalIncome;
        existingGroup.totalExpense += newGroup.totalExpense;
      } else {
        mergedMap.set(newGroup.date, newGroup);
      }
    });

    // Re-sort by date
    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedAccountId]); // Reload data when selected account changes

  // Listen for transaction creation events to auto-refresh data
  useEffect(() => {
    const handleTransactionCreated = () => {
      console.log("Transaction created, refreshing list...");
      loadTransactions(1);
    };

    window.addEventListener("transactionCreated", handleTransactionCreated);
    return () => {
      window.removeEventListener(
        "transactionCreated",
        handleTransactionCreated,
      );
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    }
  };

  const getTransactionDisplayIcon = (transaction: BillWithDetails) => {
    if (transaction.type === "transfer") {
      return "🔄"; // Transfer icon
    }

    // Prefer category icon
    if (transaction.category.icon) {
      return transaction.category.icon;
    }

    // Use default icon
    const category = transaction.category.name || "Other";
    const icons: Record<string, string> = {
      Dining: "🍽️",
      Transport: "🚗",
      Shopping: "🛍️",
      Entertainment: "🎬",
      Salary: "💰",
      Other: "📝",
    };
    return icons[category] || "📝";
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadTransactions(currentPage + 1);
    }
  };

  const handleEditTransaction = (transaction: BillWithDetails) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleTransactionUpdated = () => {
    // Reload data
    loadTransactions(1);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }

    try {
      await billApi.deleteBill(transactionId);
      // Reload data
      loadTransactions(1);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  return (
    <div
      className={
        showTitle ? "bg-white rounded-lg shadow-sm border border-gray-200" : ""
      }
    >
      {showTitle && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All
            </button>
          </div>
        </div>
      )}

      {isLoading && dayGroups.length === 0 ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions
          </h3>
          <p className="text-gray-500">Start recording your first income or expense</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {dayGroups.map((dayGroup) => (
              <div
                key={dayGroup.date}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Day Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(dayGroup.date)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayGroup.transactions.length} transactions
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      {dayGroup.totalIncome > 0 && (
                        <span className="text-green-600 font-medium">
                          +{formatCurrency(dayGroup.totalIncome)}
                        </span>
                      )}
                      {dayGroup.totalExpense > 0 && (
                        <span className="text-red-500 font-medium">
                          -{formatCurrency(dayGroup.totalExpense)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div className="divide-y divide-gray-100">
                  {dayGroup.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="px-6 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Category Icon */}
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-lg">
                          {getTransactionDisplayIcon(transaction)}
                        </div>

                        {/* Transaction Info */}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description ||
                              transaction.category_name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2">
                            {transaction.type === "transfer" ? (
                              <>
                                <span>{transaction.account_name}</span>
                                <span>→</span>
                                <span>{transaction.to_account_name}</span>
                                {transaction.transfer_fee &&
                                  transaction.transfer_fee > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Fee ¥{transaction.transfer_fee}
                                      </span>
                                    </>
                                  )}
                              </>
                            ) : (
                              <>
                                <span>{transaction.category_name}</span>
                                {transaction.subcategory_name && (
                                  <>
                                    <span>•</span>
                                    <span>{transaction.subcategory_name}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{transaction.account_name}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{transaction.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${transaction.type === "income"
                            ? "text-green-600"
                            : transaction.type === "transfer"
                              ? "text-blue-600"
                              : "text-red-500"
                            }`}
                        >
                          {transaction.type === "income" && "+"}
                          {transaction.type === "expense" && "-"}
                          {formatCurrency(transaction.amount)}
                        </div>

                        {/* Quick Actions - 显示在 hover 时 */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="p-4 text-center border-t border-gray-200">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 disabled:text-gray-400"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editTransaction={editingTransaction}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </div>
  );
}
