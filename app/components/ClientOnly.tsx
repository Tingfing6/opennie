import type { ReactNode } from "react";
import { useClientOnly } from "~/hooks/useClientOnly";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that only renders children on client side
 * Prevents SSR hydration issues for browser-dependent components
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useClientOnly();

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
