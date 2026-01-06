import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MonthSelector } from "~/components/ui/MonthSelector";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { checkAuthStatus, type User } from "~/contexts/AuthContext";
import { redirect } from "react-router";

interface BudgetData {
  totalBudget: number;
  spent: number;
  remaining: number;
  daysRemaining: number;
  totalDays: number;
  categories: Array<{
    id: string;
    name: string;
    budget: number;
    spent: number;
    color: string;
    icon: string;
  }>;
}

// Client-side authentication check
export async function clientLoader(): Promise<{ user: User | null }> {
  const user = await checkAuthStatus();
  if (!user) {
    throw redirect("/login");
  }
  return { user };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function BudgetDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataUpdating, setIsDataUpdating] = useState(false);

  // Get month and book info from URL parameters
  const [selectedMonth, setSelectedMonth] = useState({
    year: parseInt(
      searchParams.get("year") || String(new Date().getFullYear()),
    ),
    month: parseInt(
      searchParams.get("month") || String(new Date().getMonth() + 1),
    ),
  });
  const selectedBook = searchParams.get("book") || "personal";

  // Update URL parameters and reload data when month changes
  const handleMonthChange = (newMonth: { year: number; month: number }) => {
    setSelectedMonth(newMonth);

    // Use window.history.replaceState to avoid page refresh
    const params = new URLSearchParams(searchParams);
    params.set("year", newMonth.year.toString());
    params.set("month", newMonth.month.toString());
    const newUrl = `/budget-detail?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);

    // Show data update indicator
    setIsDataUpdating(true);

    // Mock data loading, should be API call in real project
    setTimeout(() => {
      loadBudgetData(newMonth);
      setIsDataUpdating(false);
    }, 200); // Short delay to simulate network request
  };

  // Data loading function
  const loadBudgetData = (month: { year: number; month: number }) => {
    // Simulate data changes for different months
    const baseData = {
      totalBudget: 12000,
      spent: 8650.2 + month.month * 100, // Simulate spending for different months
      remaining: 12000 - (8650.2 + month.month * 100),
      daysRemaining: 12,
      totalDays: 30,
      categories: [
        {
          id: "1",
          name: "Dining",
          budget: 3000,
          spent: 2650 + month.month * 50,
          color: "#EF4444",
          icon: "🍕",
        },
        {
          id: "2",
          name: "Shopping",
          budget: 2000,
          spent: 1850 + month.month * 30,
          color: "#10B981",
          icon: "🛍️",
        },
        {
          id: "3",
          name: "Transportation",
          budget: 800,
          spent: 420 + month.month * 20,
          color: "#3B82F6",
          icon: "🚗",
        },
        {
          id: "4",
          name: "Entertainment",
          budget: 1500,
          spent: 680 + month.month * 40,
          color: "#8B5CF6",
          icon: "🎬",
        },
        {
          id: "5",
          name: "Medical",
          budget: 1200,
          spent: 850 + month.month * 25,
          color: "#F59E0B",
          icon: "⚕️",
        },
        {
          id: "6",
          name: "Others",
          budget: 3500,
          spent: 2200.2 + month.month * 35,
          color: "#6B7280",
          icon: "📦",
        },
      ],
    };
    setBudgetData(baseData);
  };

  // Mock budget data
  const [budgetData, setBudgetData] = useState<BudgetData>({
    totalBudget: 12000,
    spent: 8650.2,
    remaining: 3349.8,
    daysRemaining: 12,
    totalDays: 30,
    categories: [
      {
        id: "1",
        name: "Dining",
        budget: 3000,
        spent: 2650,
        color: "#EF4444",
        icon: "🍕",
      },
      {
        id: "2",
        name: "Shopping",
        budget: 2000,
        spent: 1850,
        color: "#10B981",
        icon: "🛍️",
      },
      {
        id: "3",
        name: "Transportation",
        budget: 800,
        spent: 420,
        color: "#3B82F6",
        icon: "🚗",
      },
      {
        id: "4",
        name: "Entertainment",
        budget: 1500,
        spent: 680,
        color: "#8B5CF6",
        icon: "🎬",
      },
      {
        id: "5",
        name: "Medical",
        budget: 1200,
        spent: 850,
        color: "#F59E0B",
        icon: "⚕️",
      },
      {
        id: "6",
        name: "Others",
        budget: 3500,
        spent: 2200.2,
        color: "#6B7280",
        icon: "📦",
      },
    ],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  useEffect(() => {
    // Initial data load
    loadBudgetData(selectedMonth);
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    // Save logic
    setIsEditMode(false);
    // Show save success message
  };

  const updateCategoryBudget = (categoryId: string, newBudget: number) => {
    setBudgetData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, budget: newBudget } : cat,
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-700 hover:text-gray-900 flex-shrink-0 p-1 -ml-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Center Month Selector */}
            <div className="flex-1 mx-3 flex items-center justify-center">
              <MonthSelector
                selected={selectedMonth}
                onSelect={handleMonthChange}
              />
              {isDataUpdating && (
                <div className="ml-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            <button
              onClick={handleEditToggle}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${isEditMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {isEditMode ? "Done" : "Edit"}
            </button>
          </div>
        </div>

        {/* Web Header */}
        <div className="hidden md:block">
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Budget Details</h1>
                  <div className="ml-6 flex items-center">
                    <MonthSelector
                      selected={selectedMonth}
                      onSelect={handleMonthChange}
                    />
                    {isDataUpdating && (
                      <div className="ml-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {isEditMode && (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  )}
                  <button
                    onClick={handleEditToggle}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditMode
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                  >
                    {isEditMode ? "Cancel" : "Edit Budget"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 transition-opacity duration-200 ${isDataUpdating ? "opacity-75" : "opacity-100"}`}
        >
          {/* Mobile Layout */}
          <div className="md:hidden space-y-6">
            {/* Budget Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                预算 Overview
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Total Budget</div>
                  <div className="text-base font-bold text-gray-900">
                    {formatCurrency(budgetData.totalBudget)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Spent</div>
                  <div className="text-base font-bold text-red-500">
                    {formatCurrency(budgetData.spent)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Remaining</div>
                  <div className="text-base font-bold text-green-600">
                    {formatCurrency(budgetData.remaining)}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Category Details
              </h3>
              <div className="space-y-4">
                {budgetData.categories.map((category) => {
                  const percentage = (category.spent / category.budget) * 100;
                  const isOverBudget = category.spent > category.budget;

                  return (
                    <div
                      key={category.id}
                      className="border border-gray-100 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${isOverBudget ? "text-red-600" : "text-gray-600"}`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Spent: {formatCurrency(category.spent)}</span>
                        {isEditMode ? (
                          <input
                            type="number"
                            value={category.budget}
                            onChange={(e) =>
                              updateCategoryBudget(
                                category.id,
                                Number(e.target.value),
                              )
                            }
                            className="w-20 text-right border border-gray-300 rounded px-1 py-0.5 text-xs"
                          />
                        ) : (
                          <span>Budget: {formatCurrency(category.budget)}</span>
                        )}
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverBudget
                              ? "#EF4444"
                              : category.color,
                          }}
                        ></div>
                      </div>

                      {isOverBudget && (
                        <div className="mt-2 text-xs text-red-600">
                          Over budget{" "}
                          {formatCurrency(category.spent - category.budget)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block space-y-8">
            {/* Budget Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Budget Overview
              </h2>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Total Budget</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budgetData.totalBudget)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Spent</div>
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(budgetData.spent)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">Remaining</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(budgetData.remaining)}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">Category Details</h3>
                {isEditMode && (
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    + Add Category
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {budgetData.categories.map((category) => {
                  const percentage = (category.spent / category.budget) * 100;
                  const isOverBudget = category.spent > category.budget;

                  return (
                    <div
                      key={category.id}
                      className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{category.icon}</span>
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${isOverBudget ? "text-red-600" : "text-gray-600"}`}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-600 mb-3">
                        <span>Spent: {formatCurrency(category.spent)}</span>
                        {isEditMode ? (
                          <div className="flex items-center space-x-1">
                            <span>Budget:</span>
                            <input
                              type="number"
                              value={category.budget}
                              onChange={(e) =>
                                updateCategoryBudget(
                                  category.id,
                                  Number(e.target.value),
                                )
                              }
                              className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          </div>
                        ) : (
                          <span>Budget: {formatCurrency(category.budget)}</span>
                        )}
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverBudget
                              ? "#EF4444"
                              : category.color,
                          }}
                        ></div>
                      </div>

                      {isOverBudget && (
                        <div className="mt-2 text-sm text-red-600">
                          Over budget{" "}
                          {formatCurrency(category.spent - category.budget)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Save Button */}
        {isEditMode && (
          <div className="md:hidden fixed bottom-20 left-4 right-4">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
