"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/hooks/useAuth";

/**
 * Client-side providers wrapper
 * Wraps the app with all necessary context providers
 */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
