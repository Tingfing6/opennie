import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAddTransaction } from "~/contexts/AddTransactionContext";

interface BottomNavigationProps {
  onAddTransaction?: () => void;
}

export function BottomNavigation({
  onAddTransaction,
}: BottomNavigationProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAddTransaction } = useAddTransaction();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname === "/" || location.pathname === "/home")
      return "home";
    if (location.pathname === "/financial-assets") return "assets";
    if (location.pathname === "/reports") return "reports";
    if (location.pathname === "/settings") return "settings";

    return "home";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Listen for path changes and update activeTab
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Left side tab items
  const leftNavItems = [
    {
      id: "home",
      label: "Home",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-400"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z" />
        </svg>
      ),
    },
    {
      id: "assets",
      label: "Assets",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-400"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  // Right side tab items
  const rightNavItems = [
    {
      id: "reports",
      label: "Reports",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-400"}`}
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
      id: "settings",
      label: "Settings",
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? "text-primary-600" : "text-gray-400"}`}
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
      case "assets":
        navigate("/financial-assets");
        break;

      case "reports":
        navigate("/reports");
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  const handleAddClick = () => {
    // Prefer global context, fallback to props
    if (openAddTransaction) {
      openAddTransaction();
    } else {
      onAddTransaction?.();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end">
          {/* Left Navigation Items */}
          {leftNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors hover:bg-gray-50 relative"
            >
              <div className="mb-1">{item.icon(activeTab === item.id)}</div>
              <span
                className={`text-xs font-medium ${
                  activeTab === item.id ? "text-primary-600" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              {activeTab === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          ))}

          {/* Center Add Button */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={handleAddClick}
              className="w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center -mt-6"
              title="Add Record"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Right Navigation Items */}
          {rightNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors hover:bg-gray-50 relative"
            >
              <div className="mb-1">{item.icon(activeTab === item.id)}</div>
              <span
                className={`text-xs font-medium ${
                  activeTab === item.id ? "text-primary-600" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              {activeTab === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Safe Area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
