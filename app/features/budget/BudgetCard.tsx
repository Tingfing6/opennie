import { useNavigate } from "react-router";

interface BudgetCardProps {
  selectedMonth: { year: number; month: number };
  selectedBook: string | null;
}

export function BudgetCard({ selectedMonth, selectedBook }: BudgetCardProps) {
  const navigate = useNavigate();

  // Mock data
  const budgetData = {
    totalBudget: 12000,
    spent: 8650.2,
    remaining: 3349.8,
    daysRemaining: 12,
    totalDays: 30,
  };

  const spentPercentage = (budgetData.spent / budgetData.totalBudget) * 100;

  const getProgressColor = () => {
    if (spentPercentage <= 70) return "bg-green-500";
    if (spentPercentage <= 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleCardClick = () => {
    if (!selectedBook) return;

    const params = new URLSearchParams({
      year: selectedMonth.year.toString(),
      month: selectedMonth.month.toString(),
      book: selectedBook,
    });
    navigate(`/budget-detail?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Budget</h2>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Budget Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Used / Budget</span>
          <span className="font-medium">
            {formatCurrency(budgetData.spent)} /{" "}
            {formatCurrency(budgetData.totalBudget)}
          </span>
        </div>

        {/* Simple Progress Bar using CSS */}
        <div className="h-4 mb-2 bg-gray-200 rounded-md overflow-hidden relative">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-md ${getProgressColor()}`}
            style={{
              width: `${Math.min(spentPercentage, 100)}%`,
              background:
                spentPercentage <= 70
                  ? "#10B981"
                  : spentPercentage <= 90
                    ? "#F59E0B"
                    : "#EF4444",
            }}
          />
          {spentPercentage > 100 && (
            <div className="absolute top-0 left-0 h-full w-full bg-red-500 opacity-20 animate-pulse" />
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {budgetData.daysRemaining} days remaining
          </span>
          <span
            className={`font-medium ${budgetData.remaining >= 0 ? "text-green-600" : "text-red-500"}`}
          >
            {budgetData.remaining >= 0 ? "Remaining" : "Overspent"}{" "}
            {formatCurrency(Math.abs(budgetData.remaining))}
          </span>
        </div>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500 mb-1">Usage</div>
          <div
            className={`font-medium ${spentPercentage <= 70
              ? "text-green-600"
              : spentPercentage <= 90
                ? "text-yellow-600"
                : "text-red-600"
              }`}
          >
            {spentPercentage.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Daily Average</div>
          <div className="font-medium text-gray-900">
            {formatCurrency(
              budgetData.spent /
              (budgetData.totalDays - budgetData.daysRemaining),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
