import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { checkAuthStatus, type User } from "~/contexts/AuthContext";
import { categoryApi, type CategoryRead } from "~/lib/api";
import { redirect } from "react-router";

interface Category {
  id: string;
  name: string;
  icon?: string;
  type: "income" | "expense";
  parent_id?: string;
  children?: Category[];
  is_system?: boolean;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, "id" | "children">) => void;
  editingCategory?: Category;
  parentCategory?: Category;
}

function CategoryModal({
  isOpen,
  onClose,
  onSave,
  editingCategory,
  parentCategory,
}: CategoryModalProps) {
  const [name, setName] = useState(editingCategory?.name || "");
  const [icon, setIcon] = useState(editingCategory?.icon || "📁");
  const [type, setType] = useState<"income" | "expense">(
    editingCategory?.type || parentCategory?.type || "expense",
  );

  // Update form state when editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon || "📁");
      setType(editingCategory.type);
    } else {
      setName("");
      setIcon("📁");
      setType(parentCategory?.type || "expense");
    }
  }, [editingCategory, parentCategory]);

  const commonEmojis = {
    expense: [
      "🍕",
      "🛍️",
      "🚗",
      "🎬",
      "⚕️",
      "🏠",
      "📱",
      "⚡",
      "💡",
      "🎓",
      "✈️",
      "🎯",
      "🔧",
      "📦",
      "👕",
      "💄",
    ],
    income: [
      "💰",
      "💵",
      "💸",
      "🏆",
      "🎁",
      "📈",
      "🏢",
      "💼",
      "🔧",
      "📱",
      "🎯",
      "⭐",
      "🌟",
      "💎",
      "🎲",
      "🎪",
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon,
      type,
      parent_id: parentCategory?.id,
    });

    // Only reset form when creating, not editing
    if (!editingCategory) {
      setName("");
      setIcon("📁");
      setType("expense");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingCategory
              ? "Edit Category"
              : parentCategory
                ? `Add ${parentCategory.name} Sub-category`
                : "Add Category"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              required
            />
          </div>

          {!parentCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Type
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${type === "expense"
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } border`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${type === "income"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } border`}
                >
                  Income
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Icon
            </label>
            <div className="border border-gray-300 rounded-md p-3">
              <div className="flex items-center justify-center mb-3">
                <span className="text-4xl">{icon}</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis[type].map((iconOption) => (
                  <button
                    key={iconOption}
                    type="button"
                    onClick={() => setIcon(iconOption)}
                    className={`p-2 rounded-md text-2xl hover:bg-gray-100 transition-colors ${icon === iconOption ? "bg-blue-100" : ""
                      }`}
                  >
                    {iconOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Client-side auth check
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

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseCount, setExpenseCount] = useState(0);
  const [incomeCount, setIncomeCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [parentCategory, setParentCategory] = useState<Category | undefined>();
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategories({ size: 100 });
      const categoriesData = response.map((item: CategoryRead) => ({
        id: item.id,
        name: item.name,
        icon: item.icon || "📁",
        type: item.type,
        parent_id: item.parent_id,
        is_system: item.is_system,
        children: item.children || [],
      }));

      // API returns hierarchical structure, we only need root categories (without parent_id)
      const rootCategories = categoriesData.filter((cat: Category) => !cat.parent_id);
      setCategories(rootCategories);

      // Calculate category statistics
      const expenseCategories = categoriesData.filter((cat: Category) => cat.type === "expense");
      const incomeCategories = categoriesData.filter((cat: Category) => cat.type === "income");
      setExpenseCount(expenseCategories.length);
      setIncomeCount(incomeCategories.length);

      // Expand all root categories
      const expanded = new Set(rootCategories.map((cat: Category) => cat.id));
      setExpandedCategories(expanded);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = (parentCat?: Category) => {
    setParentCategory(parentCat);
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setParentCategory(undefined);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (
    categoryData: Omit<Category, "id" | "children">,
  ) => {
    try {
      if (editingCategory) {
        // Update category
        await categoryApi.updateCategory(editingCategory.id, {
          name: categoryData.name,
          type: categoryData.type,
          icon: categoryData.icon,
          parent_id: categoryData.parent_id,
        });
      } else {
        // Create category
        await categoryApi.createCategory({
          name: categoryData.name,
          type: categoryData.type,
          icon: categoryData.icon,
          parent_id: categoryData.parent_id,
        });
      }

      // Reload data
      await loadCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string, parentId?: string) => {
    try {
      await categoryApi.deleteCategory(categoryId);
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-700 hover:text-gray-900 mr-3 p-1 -ml-1 hover:bg-gray-100 rounded-md transition-colors"
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
            <h1 className="text-lg font-semibold text-gray-900">Categories</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">Manage your income and expense categories</p>
            </div>
            <button
              onClick={() => handleAddCategory()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Category</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("expense")}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "expense"
                      ? "bg-red-50 text-red-700 border-b-2 border-red-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  Expense ({expenseCount})
                </button>
                <button
                  onClick={() => setActiveTab("income")}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "income"
                      ? "bg-green-50 text-green-700 border-b-2 border-green-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  Income ({incomeCount})
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    No {activeTab === "expense" ? "expense" : "income"} categories yet
                  </p>
                  <button
                    onClick={() => handleAddCategory()}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add first category
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleExpanded(category.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${expandedCategories.has(category.id)
                                  ? "rotate-90"
                                  : ""
                                }`}
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {category.children?.length || 0} sub-categories
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddCategory(category)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Add Sub-category
                          </button>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {expandedCategories.has(category.id) &&
                        category.children && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            {category.children.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                No sub-categories
                              </div>
                            ) : (
                              <div className="p-4 space-y-2">
                                {category.children.map((child) => (
                                  <div
                                    key={child.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg">
                                        {child.icon}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {child.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          handleEditCategory(child)
                                        }
                                        className="text-gray-600 hover:text-gray-800"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteCategory(
                                            child.id,
                                            category.id,
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        parentCategory={parentCategory}
      />
    </div>
  );
}
