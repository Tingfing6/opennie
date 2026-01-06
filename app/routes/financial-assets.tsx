import type { Route } from "./+types/financial-assets";
import { FinancialAssetsPage } from "./FinancialAssetsPage";
import { checkAuthStatus, type User } from "~/contexts/AuthContext";
import { redirect } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Financial Assets - Opennie" },
    { name: "description", content: "Manage your financial assets, liabilities, and investment portfolio" },
  ];
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
        <p className="mt-2 text-gray-600">Verifying identity...</p>
      </div>
    </div>
  );
}

export default function FinancialAssets() {
  return <FinancialAssetsPage />;
}
