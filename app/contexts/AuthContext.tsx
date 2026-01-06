import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi, userApi } from "~/lib/api";
import { userStorage } from "~/lib/local-storage";

export interface User {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUserProfile: (data: {
    username?: string;
    email?: string;
    avatar_url?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);

  const isAuthenticated = !!user;

  console.log("[AuthProvider] State:", {
    user: user ? "exists" : "null",
    isAuthenticated,
    initialUser: initialUser ? "provided" : "null",
  });

  const refreshToken = useCallback(async () => {
    try {
      const data = await authApi.refreshToken();
      localStorage.setItem("access_token", data.access_token);
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log("[AuthContext] 开始登录:", email);

    try {
      // 本地API调用
      const data = await authApi.login({ email, password });

      // 设置用户信息
      setUser(data.user);
    } catch (error) {
      console.error("[AuthContext] 登录失败:", error);
      throw new Error(error instanceof Error ? error.message : "登录失败");
    }
  }, []);

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
    ): Promise<void> => {
      try {
        // 本地注册后直接登录
        await authApi.register({ username, email, password });
        await login(email, password);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "注册失败");
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 清理本地状态
      setUser(null);
    }
  }, []);

  const updateUserProfile = useCallback(
    async (data: {
      username?: string;
      email?: string;
      avatar_url?: string;
    }) => {
      try {
        const updatedUser = await userApi.updateUser(data);
        setUser(updatedUser);
      } catch (error) {
        console.error("[AuthContext] 更新用户信息失败:", error);
        throw new Error(error instanceof Error ? error.message : "更新失败");
      }
    },
    [],
  );

  const value: AuthContextType = {
    user,
    isAuthenticated,
    setUser,
    login,
    register,
    logout,
    refreshToken,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 辅助函数：检查认证状态
export async function checkAuthStatus(): Promise<User | null> {
  console.log("[checkAuthStatus] 检查本地认证状态");

  try {
    // 检查是否在浏览器环境中
    if (typeof window === "undefined") {
      console.log("[checkAuthStatus] 不在浏览器环境中，跳过检查");
      return null;
    }

    // 直接从本地存储获取用户信息
    const user = userStorage.getUser();
    const isAuth = userStorage.isAuthenticated();

    console.log(
      "[checkAuthStatus] 本地认证状态:",
      isAuth ? "已登录" : "未登录",
    );

    if (user && isAuth) {
      console.log("[checkAuthStatus] 用户信息获取成功");
      return user;
    }

    return null;
  } catch (error) {
    console.error("[checkAuthStatus] 检查失败:", error);
    return null;
  }
}
