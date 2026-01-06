import { useNavigate } from "react-router";
import { useState } from "react";
import { BottomNavigation } from "~/components/navigation/BottomNavigation";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { UserProfileModal } from "~/components/user/UserProfileModal";
import { checkAuthStatus, type User, useAuth } from "~/contexts/AuthContext";
import { redirect } from "react-router";
import type { Route } from "./+types/settings";
import { resetToDemoData } from "~/lib/demo-data";

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
        <p className="mt-2 text-gray-600">Verifying identity...</p>
      </div>
    </div>
  );
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = loaderData.user;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Base settings items (shared by all platforms)
  const baseSettingsItems = [
    {
      id: "account",
      title: "Account Settings",
      description: "Personal information and security settings",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      onClick: () => setIsProfileModalOpen(true),
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Message alerts and push settings",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM15 17H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v10z"
          />
        </svg>
      ),
      onClick: () => console.log("Notification settings not implemented yet"),
    },
    {
      id: "backup",
      title: "Data Backup",
      description: "Backup and restore data",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      ),
      onClick: () => console.log("Data backup not implemented yet"),
    },
    {
      id: "demo-data",
      title: "Load Demo Data",
      description: "Reset to demo data (will clear existing data)",
      icon: (
        <svg
          className="w-6 h-6 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      onClick: resetToDemoData,
      isDestructive: true,
    },
    {
      id: "about",
      title: "About",
      description: "Version info and help",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: () => console.log("About app not implemented yet"),
    },
    {
      id: "logout",
      title: "Log Out",
      description: "Securely log out of your account",
      icon: (
        <svg
          className="w-6 h-6 text-red-600"
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
      ),
      onClick: handleLogout,
      isDestructive: true,
    },
  ];

  // Mobile-only category management item
  const mobileOnlyItems = [
    {
      id: "categories",
      title: "Categories",
      description: "Manage income and expense categories",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
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
      onClick: () => navigate("/categories"),
      isDestructive: false,
    },
  ];

  // Mobile settings list (includes category management)
  const mobileSettingsItems = [...mobileOnlyItems, ...baseSettingsItems];

  // Web settings list (excludes category management as it's in sidebar)
  const webSettingsItems = baseSettingsItems;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>

        {/* Web Header */}
        <div className="hidden md:block">
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {/* Mobile Layout */}
          <div className="md:hidden px-4 py-6 pb-24">
            {/* User Profile Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {user?.username || "Username"}
                  </h2>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {user?.email_verified ? "✓ Email verified" : "Email not verified"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {mobileSettingsItems.map((item) => (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className={`bg-white rounded-lg p-4 border shadow-sm transition-colors cursor-pointer ${item.isDestructive
                    ? "border-red-200 active:bg-red-50"
                    : "border-gray-200 active:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base font-medium ${item.isDestructive ? "text-red-600" : "text-gray-900"
                          }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${item.isDestructive ? "text-red-500" : "text-gray-500"
                          }`}
                      >
                        {item.description}
                      </p>
                    </div>
                    {!item.isDestructive && (
                      <div className="flex-shrink-0">
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
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* App Info */}
            <div className="mt-8 text-center">
              <div className="text-sm text-gray-500">Opennie Accounting App</div>
              <div className="text-xs text-gray-400 mt-1">Version 1.0.0</div>
            </div>
          </div>

          {/* Web Layout */}
          <div className="hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Profile Section */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {user?.username || "Username"}
                      </h2>
                      <p className="text-gray-500 mt-1">
                        {user?.email || "user@example.com"}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {user?.email_verified ? "✓ Email verified" : "Email not verified"}
                      </p>
                      <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* App Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                      <div className="text-sm text-gray-500">
                        Opennie Accounting App
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Version 1.0.0
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {webSettingsItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={item.onClick}
                        className={`bg-white rounded-lg p-6 border shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md ${item.isDestructive
                          ? "border-red-200 hover:border-red-300 hover:bg-red-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-lg font-medium ${item.isDestructive
                                ? "text-red-600"
                                : "text-gray-900"
                                }`}
                            >
                              {item.title}
                            </h3>
                            <p
                              className={`text-sm mt-2 ${item.isDestructive
                                ? "text-red-500"
                                : "text-gray-500"
                                }`}
                            >
                              {item.description}
                            </p>
                          </div>
                          {!item.isDestructive && (
                            <div className="flex-shrink-0 mt-1">
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
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Mobile only */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
