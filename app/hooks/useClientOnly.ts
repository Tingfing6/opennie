import { useState, useEffect } from "react";

/**
 * Hook to ensure component renders only on client side
 * Prevents SSR hydration mismatches for browser-only components
 */
export function useClientOnly(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
