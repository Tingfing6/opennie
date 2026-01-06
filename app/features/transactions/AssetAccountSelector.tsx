import { useState } from "react";
import type { AssetRead } from "~/lib/api";

interface AssetAccountSelectorProps {
  assets: AssetRead[];
  selectedAssetId?: string;
  onSelect: (assetId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  showOptional?: boolean;
}

export function AssetAccountSelector({
  assets,
  selectedAssetId,
  onSelect,
  placeholder = "Select asset account",
  disabled = false,
  className = "",
  label = "Linked Asset Account",
  showOptional = true,
}: AssetAccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAsset = selectedAssetId
    ? assets.find((asset) => asset.id === selectedAssetId)
    : null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  // Get asset type icon
  const getAssetIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      cash: "💰",
      bank_deposit: "🏦",
      investment: "📈",
      real_estate: "🏠",
      vehicle: "🚗",
      other: "💼",
      // Can extend more types as needed
    };
    return iconMap[type] || "💼";
  };

  // Get asset type name
  const getAssetTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      cash: "Cash",
      bank_deposit: "Bank Deposit",
      investment: "Investment",
      real_estate: "Real Estate",
      vehicle: "Vehicle",
      other: "Other",
    };
    return typeMap[type] || "Other";
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (assetId: string | undefined) => {
    onSelect(assetId);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {showOptional && <span className="text-xs text-gray-400">(Optional)</span>}
      </div>

      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg text-left flex items-center justify-between transition-colors ${disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-25 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            }`}
        >
          <div className="flex items-center space-x-3">
            {selectedAsset ? (
              <>
                <span className="text-lg">
                  {getAssetIcon(selectedAsset.type)}
                </span>
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedAsset.name}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{getAssetTypeName(selectedAsset.type)}</span>
                    <span>•</span>
                    <span>{formatCurrency(selectedAsset.balance)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-lg text-gray-300">💳</span>
                <span className="text-gray-500">{placeholder}</span>
              </>
            )}
          </div>
          {!disabled && (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-dropdown max-h-64 overflow-y-auto">
            {/* No selection option */}
            <button
              onClick={() => handleSelect(undefined)}
              className={`w-full p-3 text-left flex items-center justify-between hover:bg-gray-25 transition-colors border-b border-gray-100 ${!selectedAssetId ? "bg-primary-25 text-primary-600" : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">❌</span>
                <div>
                  <div className="font-medium">No linked asset account</div>
                  <div className="text-sm text-gray-500">
                    This transaction will not affect asset balance
                  </div>
                </div>
              </div>
              {!selectedAssetId && (
                <svg
                  className="w-5 h-5 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Asset account list */}
            {assets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-2xl mb-2">💼</div>
                <div className="text-sm">No asset accounts available</div>
                <div className="text-xs text-gray-400 mt-1">
                  Please add asset accounts in Asset Management first
                </div>
              </div>
            ) : (
              assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelect(asset.id)}
                  className={`w-full p-3 text-left flex items-center justify-between hover:bg-gray-25 transition-colors border-b border-gray-100 last:border-b-0 ${selectedAssetId === asset.id ? "bg-primary-25" : ""
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getAssetIcon(asset.type)}</span>
                    <div>
                      <div
                        className={`font-medium ${selectedAssetId === asset.id
                            ? "text-primary-600"
                            : "text-gray-900"
                          }`}
                      >
                        {asset.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{getAssetTypeName(asset.type)}</span>
                        <span>•</span>
                        <span>{formatCurrency(asset.balance)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAssetId === asset.id && (
                    <svg
                      className="w-5 h-5 text-primary-500"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Hint text */}
      {selectedAsset && (
        <div className="text-xs text-gray-500 pl-3">
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>After linking this asset account, transaction amounts will automatically update the account balance</span>
          </div>
        </div>
      )}
    </div>
  );
}
