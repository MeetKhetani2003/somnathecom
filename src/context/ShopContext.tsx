"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";

export type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  image: string;
  tag: string;
  description?: string;
};

export type CartItem = Product & { quantity: number };

type ShopContextType = {
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  cartCount: number;
  addToCart: (product: Product) => void;
  cartItems: CartItem[];
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  showCart: boolean;
  setShowCart: (v: boolean) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart and wishlist from DB on session mount
  useEffect(() => {
    async function loadSyncedData() {
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/user/sync?email=${encodeURIComponent(session.user.email)}`);
          const data = await res.json();
          if (data.success) {
            if (data.cart) {
              setCartItems(data.cart);
            }
            if (data.wishlist) {
              setWishlist(data.wishlist);
            }
          }
        } catch (err) {
          console.error("Failed to load synced user data:", err);
        } finally {
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    }
    loadSyncedData();
  }, [session]);

  // Sync to database on cart/wishlist change
  useEffect(() => {
    if (!isLoaded || !session?.user?.email) return;

    const delayDebounce = setTimeout(async () => {
      try {
        await fetch("/api/user/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user!.email,
            cart: cartItems,
            wishlist
          })
        });
      } catch (err) {
        console.error("Failed to sync cart/wishlist to server:", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [cartItems, wishlist, isLoaded, session]);

  const toggleWishlist = (id: number) => {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  };

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
    setTimeout(() => setShowCart(false), 2000);
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) => prev.map((p) => {
      if (p.id === id) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) };
      }
      return p;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <ShopContext.Provider
      value={{ wishlist, toggleWishlist, cartCount, cartItems, addToCart, removeFromCart, updateQuantity, clearCart, showCart, setShowCart }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
