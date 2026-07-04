"use client";

import { SessionProvider } from "next-auth/react";
import { ShopProvider } from "@/context/ShopContext";
import { ToastProvider } from "@/context/ToastContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ShopProvider>
          {children}
        </ShopProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
