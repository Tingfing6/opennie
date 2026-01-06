import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/contexts/AuthContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar_url: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const updateData: any = {};

      // 只更新变化的字段
      if (formData.username !== user?.username) {
        updateData.username = formData.username;
      }
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }
      if (formData.avatar_url !== user?.avatar_url) {
        updateData.avatar_url = formData.avatar_url;
      }

      // 如果没有变化，直接关闭
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      await updateUserProfile(updateData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "更新失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  // 稳定的输入处理函数
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, username: e.target.value }));
    },
    [],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, email: e.target.value }));
    },
    [],
  );

  const handleAvatarUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, avatar_url: e.target.value }));
    },
    [],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              编辑个人信息
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* 头像预览 */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="头像"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <span
                  className={`text-white text-xl font-bold ${formData.avatar_url ? "hidden" : ""}`}
                >
                  {formData.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>

            {/* 用户名 */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleUsernameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
                required
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                邮箱地址
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            {/* 头像URL */}
            <div>
              <label
                htmlFor="avatar_url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                头像链接 (可选)
              </label>
              <input
                type="url"
                id="avatar_url"
                value={formData.avatar_url}
                onChange={handleAvatarUrlChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入头像图片链接"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
