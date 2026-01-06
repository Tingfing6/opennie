import { useState } from "react";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { MonthSelector } from "~/components/ui/MonthSelector";
import { BookSwitcher } from "~/components/ui/BookSwitcher";
import { FinancialOverview } from "~/components/ui/FinancialOverview";
import { AssetOverview } from "~/components/ui/AssetOverview";
import { CategoryStats } from "~/components/ui/CategoryStats";
import { BudgetCard } from "~/features/budget/BudgetCard";
import { TrendChart } from "~/components/charts/TrendChart";
import { TransactionList } from "~/features/transactions/TransactionList";
import { BottomNavigation } from "~/components/navigation/BottomNavigation";
import { useAccounts } from "~/contexts/AccountContext";

interface SelectedMonth {
  year: number;
  month: number;
}

export function HomePage() {
  // Default to current month
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1, // getMonth() returns 0-11, we need 1-12
  });

  // Use account context
  const { selectedAccountId, setSelectedAccount } = useAccounts();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content */}
        <div className="flex-1 pb-20 md:pb-0">
          {/* Time Period & Book Selector */}
          {/* Mobile: Header style */}
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <MonthSelector
                  selected={selectedMonth}
                  onSelect={setSelectedMonth}
                />
                <BookSwitcher
                  selected={selectedAccountId}
                  onSelect={setSelectedAccount}
                />
              </div>
            </div>
          </div>

          {/* Web: Card style */}
          <div className="hidden md:block px-4 pt-4 sm:pt-6">
            <div className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <MonthSelector
                  selected={selectedMonth}
                  onSelect={setSelectedMonth}
                />
                <BookSwitcher
                  selected={selectedAccountId}
                  onSelect={setSelectedAccount}
                />
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="w-full px-4 pb-4 sm:pb-6 pt-4 md:pt-6 space-y-4 sm:space-y-6">
            {/* Financial Overview */}
            <FinancialOverview selectedMonth={selectedMonth} />

            {/* Asset Overview */}
            <AssetOverview />

            {/* Category Stats & Budget Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <CategoryStats selectedMonth={selectedMonth} />
              <BudgetCard
                selectedMonth={selectedMonth}
                selectedBook={selectedAccountId}
              />
            </div>

            {/* Trend Chart */}
            <TrendChart selectedMonth={selectedMonth} />

            {/* Recent Transactions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transactions
              </h2>
              <TransactionList limit={10} showTitle={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
}
