import { useState } from "react";
import { useAccounts } from "~/contexts/AccountContext";

interface BookSwitcherProps {
  selected: string | null;
  onSelect: (bookId: string) => void;
}

export function BookSwitcher({ selected, onSelect }: BookSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { accounts, isLoading } = useAccounts();

  // Convert account data to book format
  const books = accounts.map(account => ({
    id: account.id,
    name: account.name,
    type: account.is_shared ? "shared" : "personal"
  }));

  const selectedBook = books.find((book) => book.id === selected);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-2 md:px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 min-w-0">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 md:px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors min-w-0"
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${selectedBook?.type === "shared"
                ? "bg-green-500"
                : "bg-blue-500"
              }`}
          />
          <span className="text-sm font-medium text-gray-900 truncate">
            {selectedBook?.name || (books.length === 0 ? "No accounts" : "Select Account")}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full mt-1 right-0 w-48 md:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {books.length > 0 ? (
                books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      onSelect(book.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${selected === book.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-900"
                      }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${book.type === "shared"
                          ? "bg-green-500"
                          : "bg-blue-500"
                        }`}
                    />
                    <span className="text-sm">{book.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No accounts yet, please create one
                </div>
              )}

              {/* Add New Book */}
              <div className="border-t border-gray-100 mt-1">
                <button className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-600">
                  <svg
                    className="w-4 h-4"
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
                  <span className="text-sm">New Account</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}