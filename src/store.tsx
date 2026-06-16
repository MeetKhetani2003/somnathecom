"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { Product } from "./data";

type CartItem = { product: Product; qty: number; size: string };
type Toast = { id: number; message: string };

type Ctx = {
  cart: CartItem[];
  wishlist: string[];
  user: { name: string; email: string } | null;
  toasts: Toast[];
  addToCart: (p: Product, size?: string, qty?: number) => void;
  removeFromCart: (id: string, size: string) => void;
  setQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  login: () => void;
  logout: () => void;
  toast: (m: string) => void;
  dismissToast: (id: number) => void;
};

const SNCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(["n-04", "n-08"]);
  const [user, setUser] = useState<Ctx["user"]>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart: Ctx["addToCart"] = (p, size = "M", qty = 1) => {
    setCart((c) => {
      const idx = c.findIndex((x) => x.product.id === p.id && x.size === size);
      if (idx >= 0) {
        const next = [...c];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...c, { product: p, qty, size }];
    });
    toast(`Added — ${p.name}`);
  };
  const removeFromCart: Ctx["removeFromCart"] = (id, size) =>
    setCart((c) => c.filter((x) => !(x.product.id === id && x.size === size)));
  const setQty: Ctx["setQty"] = (id, size, qty) =>
    setCart((c) => c.map((x) => (x.product.id === id && x.size === size ? { ...x, qty: Math.max(1, qty) } : x)));
  const clearCart = () => setCart([]);
  const toggleWishlist: Ctx["toggleWishlist"] = (id) => {
    setWishlist((w) => {
      const has = w.includes(id);
      toast(has ? "Removed from wishlist" : "Saved to wishlist");
      return has ? w.filter((x) => x !== id) : [...w, id];
    });
  };
  const login = () => { setUser({ name: "Aanya Verma", email: "aanya@somnathnx.com" }); toast("Welcome back"); };
  const logout = () => { setUser(null); toast("Signed out"); };
  const dismissToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const value = useMemo(
    () => ({ cart, wishlist, user, toasts, addToCart, removeFromCart, setQty, clearCart, toggleWishlist, login, logout, toast, dismissToast }),
    [cart, wishlist, user, toasts, toast]
  );
  return <SNCtx.Provider value={value}>{children}</SNCtx.Provider>;
}

export const useStore = () => {
  const ctx = useContext(SNCtx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
};

export function useRoute() {
  const pathname = usePathname();
  const [route, setRoute] = useState<string>(pathname || '/');
  useEffect(() => {
    if (pathname) setRoute(pathname);
  }, [pathname]);
  return route;
}
export const navigate = (path: string) => { 
  if (typeof window !== 'undefined') window.location.href = path; 
};

/* Intersection observer hook for reveal */
export function useReveal<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el, visible]);
  return [setEl, visible] as const;
}




