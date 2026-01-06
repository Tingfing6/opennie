import type { Route } from "./+types/accounts";
import { AccountsPage } from "./AccountsPage";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Accounts - Opennie" },
    { name: "description", content: "Manage your financial accounts" },
  ];
}

// Client-side auth check
export async function clientLoader() {
  // Add permission checks if needed
  return {};
}

// Run clientLoader on hydration
clientLoader.hydrate = true as const;

export default function Accounts({ loaderData }: Route.ComponentProps) {
  return <AccountsPage />;
}