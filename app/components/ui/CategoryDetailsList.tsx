import type { CategoryStats } from "~/lib/reportStats";
import { formatCurrency } from "~/lib/reportStats";

interface CategoryDetailsListProps {
  categories: CategoryStats[];
  type: "income" | "expense";
}

export function CategoryDetailsList({
  categories,
  type,
}: CategoryDetailsListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-2xl mb-2">📝</div>
        <div className="text-sm">
          No {type === "expense" ? "expense" : "income"} category data
        </div>
      </div>
    );
  }

  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
        <span>Category Details</span>
        <span>{categories.length} categories</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {categories.map((category, index) => (
          <div
            key={category.categoryId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border">
                {index + 1}
              </div>

              {/* Category Icon & Name */}
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-lg">{category.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {category.categoryName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.transactionCount} transactions
                  </div>
                </div>
              </div>
            </div>

            {/* Amount & Percentage */}
            <div className="flex-shrink-0 text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(category.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {category.percentage.toFixed(1)}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-shrink-0 ml-3 w-16">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: category.color,
                    width: `${category.percentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">
            {type === "expense" ? "Total Expense" : "Total Income"}
          </span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
