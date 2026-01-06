import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router";
import { AddTransactionModal } from "~/features/transactions/AddTransactionModal";
import type { BillCreate } from "~/lib/api";

interface AddTransactionContextType {
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  isOpen: boolean;
}

const AddTransactionContext = createContext<
  AddTransactionContextType | undefined
>(undefined);

export function useAddTransaction() {
  const context = useContext(AddTransactionContext);
  if (context === undefined) {
    throw new Error(
      "useAddTransaction must be used within an AddTransactionProvider",
    );
  }
  return context;
}

interface AddTransactionProviderProps {
  children: React.ReactNode;
}

export function AddTransactionProvider({
  children,
}: AddTransactionProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openAddTransaction = useCallback(() => {
    // 检查当前是否在首页
    const isHomePage =
      location.pathname === "/" || location.pathname === "/home";

    // 无论在哪个页面，都立即打开弹窗
    setIsOpen(true);

    if (!isHomePage) {
      // 如果不在首页，在弹窗已经打开的状态下悄悄导航到首页
      // 这样用户看不到页面切换，只看到弹窗从当前页面打开
      setTimeout(() => {
        navigate("/");
      }, 50); // 很短的延迟，确保弹窗先渲染
    }
  }, [location.pathname, navigate]);

  const closeAddTransaction = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSaveTransaction = useCallback(
    async (bill: BillCreate) => {
      try {
        console.log("Saving bill:", bill);

        // 直接调用API保存数据
        const { billApi } = await import("~/lib/api");
        await billApi.createBill(bill);

        console.log("Transaction saved successfully");
        closeAddTransaction();

        // 可以在这里触发页面数据刷新
        // 例如发送自定义事件让其他组件知道数据已更新
        window.dispatchEvent(new CustomEvent("transactionCreated"));
      } catch (error) {
        console.error("Failed to save transaction:", error);
        // 这里应该显示错误提示给用户
        alert("保存失败，请重试");
      }
    },
    [closeAddTransaction],
  );

  const value: AddTransactionContextType = {
    openAddTransaction,
    closeAddTransaction,
    isOpen,
  };

  return (
    <AddTransactionContext.Provider value={value}>
      {children}

      {/* 全局的添加交易弹窗 */}
      <AddTransactionModal
        isOpen={isOpen}
        onClose={closeAddTransaction}
        onSave={handleSaveTransaction}
        onTransactionCreated={closeAddTransaction}
        isMobile={isMobile}
      />
    </AddTransactionContext.Provider>
  );
}
