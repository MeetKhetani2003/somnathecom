"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

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

export type CartItem = Product & {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  cartItemId: string; // unique key: `${id}-${color}-${size}`
};

type ShopContextType = {
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  cartCount: number;
  addToCart: (product: Product, color?: string, size?: string) => void;
  cartItems: CartItem[];
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  updateCartItemVariant: (cartItemId: string, newColor?: string, newSize?: string) => void;
  clearCart: () => void;
  showCart: boolean;
  setShowCart: (v: boolean) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

function makeCartItemId(productId: number, color?: string, size?: string): string {
  return `${productId}-${color || "default"}-${size || "default"}`;
}

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
              // Migrate old cart items that don't have cartItemId
              const migratedCart = data.cart.map((item: any) => ({
                ...item,
                cartItemId: item.cartItemId || makeCartItemId(item.id, item.selectedColor, item.selectedSize),
              }));
              setCartItems(migratedCart);
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
    if (!session?.user) {
      signIn("google");
      return;
    }
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  };

  const addToCart = (product: Product, color?: string, size?: string) => {
    const cartItemId = makeCartItemId(product.id, color, size);
    
    setCartItems((prev) => {
      const existing = prev.find((p) => p.cartItemId === cartItemId);
      if (existing) {
        return prev.map((p) => (p.cartItemId === cartItemId ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1, selectedColor: color, selectedSize: size, cartItemId }];
    });
    setShowCart(true);
    setTimeout(() => setShowCart(false), 2000);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((p) => p.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) => prev.map((p) => {
      if (p.cartItemId === cartItemId) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) };
      }
      return p;
    }));
  };

  const updateCartItemVariant = (cartItemId: string, newColor?: string, newSize?: string) => {
    setCartItems((prev) => {
      const item = prev.find(p => p.cartItemId === cartItemId);
      if (!item) return prev;

      const updatedColor = newColor !== undefined ? newColor : item.selectedColor;
      const updatedSize = newSize !== undefined ? newSize : item.selectedSize;
      const newCartItemId = makeCartItemId(item.id, updatedColor, updatedSize);

      // Check if an item with the new variant already exists
      const existingTarget = prev.find(p => p.cartItemId === newCartItemId);
      if (existingTarget && existingTarget.cartItemId !== cartItemId) {
        // Merge quantities
        return prev
          .map(p => p.cartItemId === newCartItemId ? { ...p, quantity: p.quantity + item.quantity } : p)
          .filter(p => p.cartItemId !== cartItemId);
      }

      return prev.map(p =>
        p.cartItemId === cartItemId
          ? { ...p, selectedColor: updatedColor, selectedSize: updatedSize, cartItemId: newCartItemId }
          : p
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <ShopContext.Provider
      value={{ wishlist, toggleWishlist, cartCount, cartItems, addToCart, removeFromCart, updateQuantity, updateCartItemVariant, clearCart, showCart, setShowCart }}
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
