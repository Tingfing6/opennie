import { useState, useEffect } from "react";
import { useAccounts } from "~/contexts/AccountContext";
import { type AccountCreate, type AccountUpdate } from "~/lib/api";
import { SideNavigation } from "~/components/navigation/SideNavigation";
import { BottomNavigation } from "~/components/navigation/BottomNavigation";

interface AccountFormData {
  name: string;
  description: string;
  currency: string;
  is_shared: boolean;
}

const INITIAL_FORM_DATA: AccountFormData = {
  name: "",
  description: "",
  currency: "CNY",
  is_shared: false,
};

export function AccountsPage() {
  const {
    accounts,
    selectedAccount,
    selectedAccountId,
    setSelectedAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    isLoading,
    error,
    refreshAccounts,
  } = useAccounts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<AccountFormData>(INITIAL_FORM_DATA);
  const [selectedAccountForAction, setSelectedAccountForAction] = useState<
    string | null
  >(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      console.error("Account management error:", error);
    }
  }, [error]);

  const handleCreateAccount = async (data: AccountFormData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      const accountData: AccountCreate = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        currency: data.currency,
        is_shared: data.is_shared,
        members: data.is_shared ? [] : undefined,
      };

      await createAccount(accountData);
      setShowCreateModal(false);
      setEditingAccount(INITIAL_FORM_DATA);
      await refreshAccounts();
    } catch (err: any) {
      setFormError(err.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = async (data: AccountFormData) => {
    if (!selectedAccountForAction) return;

    try {
      setIsSubmitting(true);
      setFormError(null);

      const accountData: AccountUpdate = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        currency: data.currency,
        is_shared: data.is_shared,
        members: data.is_shared ? [] : undefined,
      };

      await updateAccount(selectedAccountForAction, accountData);
      setShowEditModal(false);
      setEditingAccount(INITIAL_FORM_DATA);
      setSelectedAccountForAction(null);
      await refreshAccounts();
    } catch (err: any) {
      setFormError(err.message || "Failed to update account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccountForAction) return;

    try {
      setIsSubmitting(true);
      await deleteAccount(selectedAccountForAction);
      setShowDeleteConfirm(false);
      setSelectedAccountForAction(null);
      await refreshAccounts();
    } catch (err: any) {
      setFormError(err.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) return;

    setSelectedAccountForAction(accountId);
    setEditingAccount({
      name: account.name,
      description: account.description || "",
      currency: account.currency,
      is_shared: account.is_shared,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (accountId: string) => {
    setSelectedAccountForAction(accountId);
    setShowDeleteConfirm(true);
  };

  const AccountForm = ({
    data,
    setData,
    onSubmit,
    onCancel,
    isEdit = false,
  }: {
    data: AccountFormData;
    setData: (data: AccountFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isEdit?: boolean;
  }) => (
    <div className="space-y-4">
      {formError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {formError}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Account Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter account name"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Account Description
        </label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter account description (optional)"
          rows={3}
        />
      </div>

      <div>
        <label
          htmlFor="currency"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Currency <span className="text-red-500">*</span>
        </label>
        <select
          id="currency"
          value={data.currency}
          onChange={(e) => setData({ ...data, currency: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="CNY">Chinese Yuan (CNY)</option>
          <option value="USD">US Dollar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="JPY">Japanese Yen (JPY)</option>
          <option value="GBP">British Pound (GBP)</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_shared"
          checked={data.is_shared}
          onChange={(e) => setData({ ...data, is_shared: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_shared" className="ml-2 text-sm text-gray-700">
          Shared Account (allows other users to access)
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !data.name.trim()}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : isEdit ? "Update Account" : "Create Account"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Navigation - Web only */}
      <SideNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
                <p className="text-gray-600 mt-1">
                  Manage your financial accounts, including personal and shared accounts
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAccount(INITIAL_FORM_DATA);
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span>New Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 bg-gray-400 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Accounts
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any accounts yet. Click the button below to create your first account.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span>Create First Account</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`bg-white rounded-lg border ${selectedAccountId === account.id
                        ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-20"
                        : "border-gray-200"
                      } p-6 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {account.description || "No description"}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{account.currency}</span>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${account.is_shared
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                                }`}
                            />
                            <span>
                              {account.is_shared ? "Shared" : "Personal"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedAccountId === account.id && (
                        <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                          Selected
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Created on{" "}
                        {new Date(account.created_at).toLocaleDateString(
                          "en-US",
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAccount(account.id)}
                          className={`px-3 py-1 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedAccountId === account.id
                              ? "bg-blue-100 text-blue-700 focus:ring-blue-500"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
                            }`}
                        >
                          Select
                        </button>
                        <button
                          onClick={() => openEditModal(account.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(account.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Create New Account
            </h2>
            <AccountForm
              data={editingAccount}
              setData={setEditingAccount}
              onSubmit={() => handleCreateAccount(editingAccount)}
              onCancel={() => {
                setShowCreateModal(false);
                setEditingAccount(INITIAL_FORM_DATA);
                setFormError(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Edit Account
            </h2>
            <AccountForm
              data={editingAccount}
              setData={setEditingAccount}
              onSubmit={() => handleEditAccount(editingAccount)}
              onCancel={() => {
                setShowEditModal(false);
                setEditingAccount(INITIAL_FORM_DATA);
                setSelectedAccountForAction(null);
                setFormError(null);
              }}
              isEdit
            />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete account "
              {accounts.find((a) => a.id === selectedAccountForAction)?.name}"
              ? This action cannot be undone.
            </p>
            {formError && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {formError}
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAccountForAction(null);
                  setFormError(null);
                }}
                disabled={isSubmitting}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
