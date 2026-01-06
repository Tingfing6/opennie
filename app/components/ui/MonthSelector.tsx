import { useState } from "react";

interface SelectedMonth {
  year: number;
  month: number;
}

interface MonthSelectorProps {
  selected: SelectedMonth;
  onSelect: (month: SelectedMonth) => void;
}

export function MonthSelector({ selected, onSelect }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate month list (2 years before and after current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];

  const formatSelectedMonth = () => {
    return `${selected.year}/${selected.month}`;
  };

  const handleMonthSelect = (year: number, month: number) => {
    onSelect({ year, month });
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    let newYear = selected.year;
    let newMonth = selected.month;

    if (direction === "prev") {
      if (newMonth === 1) {
        newYear -= 1;
        newMonth = 12;
      } else {
        newMonth -= 1;
      }
    } else {
      if (newMonth === 12) {
        newYear += 1;
        newMonth = 1;
      } else {
        newMonth += 1;
      }
    }

    onSelect({ year: newYear, month: newMonth });
  };

  return (
    <div className="flex items-center space-x-1 md:space-x-2">
      {/* Previous Month Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Previous month clicked");
          navigateMonth("prev");
        }}
        className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10"
      >
        <svg
          className="w-4 h-4 text-gray-600"
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

      {/* Month Selector Dropdown */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Month selector clicked, current isOpen:", isOpen);
            setIsOpen(!isOpen);
          }}
          className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors min-w-0 md:min-w-[120px] relative z-10"
        >
          <span className="text-sm font-medium text-gray-900">
            {formatSelectedMonth()}
          </span>
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
            <div className="absolute top-full mt-1 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
              {/* Fixed Quick "Today" Button */}
              <div className="flex-shrink-0 p-4 border-b border-gray-100">
                <button
                  onClick={() => {
                    const today = new Date();
                    onSelect({
                      year: today.getFullYear(),
                      month: today.getMonth() + 1,
                    });
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Back to This Month
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-4">
                  {years.map((year) => (
                    <div key={year}>
                      <div className="text-sm font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">
                        {year}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {months.map((month) => {
                          const isSelected =
                            selected.year === year &&
                            selected.month === month.value;
                          const isCurrentMonth =
                            new Date().getFullYear() === year &&
                            new Date().getMonth() + 1 === month.value;

                          return (
                            <button
                              key={month.value}
                              onClick={() =>
                                handleMonthSelect(year, month.value)
                              }
                              className={`px-2 py-1.5 text-sm rounded-md transition-colors ${isSelected
                                  ? "bg-blue-600 text-white"
                                  : isCurrentMonth
                                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                            >
                              {month.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Next Month Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Next month clicked");
          navigateMonth("next");
        }}
        className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10"
      >
        <svg
          className="w-4 h-4 text-gray-600"
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
      </button>
    </div>
  );
}
