import { useLocation, Link } from "react-router";
import type { Route } from "./+types/$";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Page Not Found - Opennie" },
    { name: "description", content: "Sorry, the page you are looking for does not exist" },
  ];
}

export default function NotFound() {
  const location = useLocation();

  // For Chrome DevTools and other browser special requests, return empty response
  if (location.pathname.includes('.well-known') ||
    location.pathname.includes('favicon') ||
    location.pathname.includes('robots.txt') ||
    location.pathname.includes('sitemap')) {
    return new Response(null, { status: 404 });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.43.18-6.053.489M5.5 17.5L4 19l-1.5-1.5M20.5 17.5L19 19l1.5-1.5"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-8">
            Sorry, the page <code className="bg-gray-100 px-2 py-1 rounded text-sm">{location.pathname}</code> does not exist
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          If you believe this is an error, please contact our support team
        </div>
      </div>
    </div>
  );
}
