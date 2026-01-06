import type { ReactNode } from "react";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { BottomNavigation } from "~/components/navigation/BottomNavigation";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showMobileHeader?: boolean;
}

export function PageLayout({
  children,
  title,
  showMobileHeader = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {showMobileHeader && title && (
          <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-4 py-4">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 pb-20 md:pb-6">{children}</div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
}
