import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAddTransaction } from "~/contexts/AddTransactionContext";
import { useAuth } from "~/contexts/AuthContext";

export function SideNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAddTransaction } = useAddTransaction();
  const { user, logout } = useAuth();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname === "/" || location.pathname === "/home")
      return "home";
    if (location.pathname === "/accounts") return "accounts";
    if (location.pathname === "/financial-assets") return "assets";
    if (location.pathname === "/categories") return "categories";
    if (location.pathname === "/reports") return "reports";
    if (location.pathname === "/ai-assistant") return "ai";
    if (location.pathname === "/settings") return "settings";
    if (location.pathname.includes("budget-detail")) return "home";
    return "home";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Listen for path changes and update activeTab
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z" />
        </svg>
      ),
    },
    {
      id: "ai",
      label: "AI Assistant",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      id: "assets",
      label: "Asset Management",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "categories",
      label: "Categories",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      id: "accounts",
      label: "Accounts",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-600"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);

    // Route navigation
    switch (tabId) {
      case "home":
        navigate("/");
        break;
      case "accounts":
        navigate("/accounts");
        break;
      case "assets":
        navigate("/financial-assets");
        break;
      case "categories":
        navigate("/categories");
        break;
      case "reports":
        navigate("/reports");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "ai":
        navigate("/ai-assistant");
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img
              src="/icon/128.png"
              alt="Opennie Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Opennie</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeTab === item.id ? "nav-active" : "nav-hover"
                  }`}
              >
                <div className="flex-shrink-0">
                  {item.icon(activeTab === item.id)}
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Add Transaction Button */}
      <div className="px-4 pb-4">
        <button
          onClick={openAddTransaction}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 btn-primary rounded-lg shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5"
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
          <span className="font-medium">Add Record</span>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || "Username"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-expense-500 hover:bg-expense-50 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
