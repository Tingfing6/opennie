import type { Route } from "./+types/home";
import { useState } from "react";
import { HomePage } from "./HomePage";
import { checkAuthStatus, type User } from "~/contexts/AuthContext";
import { redirect } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Opennie - Smart Expense Tracker" },
    { name: "description", content: "Simple, smart, and comprehensive financial management solution" },
  ];
}

// Client-side auth check
export async function clientLoader(): Promise<{ user: User | null }> {
  console.log("[home clientLoader] Checking auth status");

  const user = await checkAuthStatus();

  if (!user) {
    console.log("[home clientLoader] Not authenticated, redirecting to login");
    throw redirect("/login");
  }

  console.log("[home clientLoader] Auth successful, returning user data");
  return { user };
}

// Run clientLoader on hydration
clientLoader.hydrate = true as const;

// Loading component during hydration
export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">O</span>
        </div>
        <p className="mt-4 text-gray-600">Verifying identity...</p>
      </div>
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage />;
}
