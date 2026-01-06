interface TimeRangeOption {
  label: string;
  startDate: string;
  endDate: string;
}

interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
  datePresets: Record<string, TimeRangeOption>;
}

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
  datePresets,
}: TimeRangeSelectorProps) {
  const presetOptions = [
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'thisQuarter', label: 'This Quarter' },
    { key: 'thisYear', label: 'This Year' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Time Range</h3>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presetOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onRangeChange(option.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRange === option.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {selectedRange === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={customStartDate}
              onChange={(e) => onCustomStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={customEndDate}
              onChange={(e) => onCustomEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Current Range Display */}
      {selectedRange !== 'custom' && datePresets[selectedRange] && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <span className="font-medium">Current Range: </span>
          {datePresets[selectedRange].startDate} to {datePresets[selectedRange].endDate}
        </div>
      )}

      {selectedRange === 'custom' && customStartDate && customEndDate && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <span className="font-medium">Current Range: </span>
          {customStartDate} to {customEndDate}
        </div>
      )}
    </div>
  );
}
