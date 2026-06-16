"use client";

import { SessionProvider } from "next-auth/react";
import { ShopProvider } from "@/context/ShopContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ShopProvider>
        {children}
      </ShopProvider>
    </SessionProvider>
  );
}
