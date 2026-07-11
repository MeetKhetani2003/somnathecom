"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fireToast } from "@/context/ToastContext";

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
  stock?: number;
  colors?: { name: string; images: string[]; sizes: { size: string; stock: number; price?: number; mrp?: number }[] }[];
  sizes?: { size: string; stock: number; price?: number; mrp?: number }[];
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
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (v: boolean) => void;
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
  const [referralCode, setReferralCodeState] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const setReferralCode = (code: string | null) => {
    if (typeof window !== "undefined") {
      if (code) {
        localStorage.setItem("somnath_ref", code);
      } else {
        localStorage.removeItem("somnath_ref");
      }
    }
    setReferralCodeState(code);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setReferralCode(ref);
      } else {
        const savedRef = localStorage.getItem("somnath_ref");
        if (savedRef) {
          setReferralCodeState(savedRef);
        }
      }
    }
  }, []);

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
      setIsLoginOpen(true);
      return;
    }
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  };

  const addToCart = (product: Product, color?: string, size?: string) => {
    if (!session?.user) {
      setIsLoginOpen(true);
      return;
    }
    const cartItemId = makeCartItemId(product.id, color, size);
    
    // Find stock limit and price of the selected variant
    let maxStock = product.stock || 0;
    let itemPrice = product.price;
    let itemMrp = product.mrp;
    const hasColors = product.colors && product.colors.length > 0;
    
    if (hasColors && color) {
      const colorObj = product.colors?.find((c: any) => c.name === color);
      if (colorObj && size) {
        const sizeObj = colorObj.sizes.find((s: any) => s.size === size);
        if (sizeObj) {
          maxStock = Number(sizeObj.stock) || 0;
          if (sizeObj.price) itemPrice = Number(sizeObj.price);
          if (sizeObj.mrp) itemMrp = Number(sizeObj.mrp);
        }
      }
    } else if (product.sizes && product.sizes.length > 0 && size) {
      const sizeObj = product.sizes.find((s: any) => s.size === size);
      if (sizeObj) {
        maxStock = Number(sizeObj.stock) || 0;
        if (sizeObj.price) itemPrice = Number(sizeObj.price);
        if (sizeObj.mrp) itemMrp = Number(sizeObj.mrp);
      }
    }

    // Find color-specific image for cart thumbnail
    let itemImage = product.image;
    if (hasColors && color) {
      const colorObj = product.colors?.find((c: any) => c.name === color);
      if (colorObj && colorObj.images && colorObj.images.length > 0) {
        itemImage = colorObj.images[0];
      }
    }

    setCartItems((prev) => {
      const existing = prev.find((p) => p.cartItemId === cartItemId);
      if (existing) {
        if (existing.quantity >= maxStock) {
          fireToast(`Only ${maxStock} items available in this variant.`, "warning");
          return prev;
        }
        return prev.map((p) => (p.cartItemId === cartItemId ? { ...p, quantity: p.quantity + 1 } : p));
      }
      if (maxStock <= 0) {
        fireToast("Sorry, this variant is out of stock.", "error");
        return prev;
      }
      return [...prev, { ...product, image: itemImage, price: itemPrice, mrp: itemMrp, quantity: 1, selectedColor: color, selectedSize: size, cartItemId }];
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
        const newQty = Math.max(1, p.quantity + delta);
        
        // Find stock limit of the selected variant
        let maxStock = p.stock || 0;
        const hasColors = p.colors && p.colors.length > 0;
        
        if (hasColors && p.selectedColor) {
          const colorObj = p.colors?.find((c: any) => c.name === p.selectedColor);
          if (colorObj && p.selectedSize) {
            const sizeObj = colorObj.sizes.find((s: any) => s.size === p.selectedSize);
            if (sizeObj) maxStock = Number(sizeObj.stock) || 0;
          }
        } else if (p.sizes && p.sizes.length > 0 && p.selectedSize) {
          const sizeObj = p.sizes.find((s: any) => s.size === p.selectedSize);
          if (sizeObj) maxStock = Number(sizeObj.stock) || 0;
        }

        if (delta > 0 && newQty > maxStock) {
          fireToast(`Only ${maxStock} items available in this variant.`, "warning");
          return p;
        }

        return { ...p, quantity: newQty };
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

      // Find color-specific image and dynamic price for the updated color/size
      let updatedImage = item.image;
      let updatedPrice = item.price; // fallback if not found
      let updatedMrp = item.mrp;     // fallback if not found
      const hasColors = item.colors && item.colors.length > 0;

      if (hasColors && updatedColor) {
        const colorObj = item.colors?.find((c: any) => c.name === updatedColor);
        if (colorObj) {
          if (colorObj.images && colorObj.images.length > 0) {
            updatedImage = colorObj.images[0];
          }
          if (updatedSize) {
             const sizeObj = colorObj.sizes.find((s: any) => s.size === updatedSize);
             if (sizeObj) {
                if (sizeObj.price) updatedPrice = Number(sizeObj.price);
                if (sizeObj.mrp) updatedMrp = Number(sizeObj.mrp);
             }
          }
        }
      } else if (item.sizes && item.sizes.length > 0 && updatedSize) {
        const sizeObj = item.sizes.find((s: any) => s.size === updatedSize);
        if (sizeObj) {
           if (sizeObj.price) updatedPrice = Number(sizeObj.price);
           if (sizeObj.mrp) updatedMrp = Number(sizeObj.mrp);
        }
      }

      // Check if an item with the new variant already exists
      const existingTarget = prev.find(p => p.cartItemId === newCartItemId);
      if (existingTarget && existingTarget.cartItemId !== cartItemId) {
        return prev
          .map(p => p.cartItemId === newCartItemId ? { ...p, quantity: p.quantity + item.quantity } : p)
          .filter(p => p.cartItemId !== cartItemId);
      }

      return prev.map(p =>
        p.cartItemId === cartItemId
          ? { ...p, image: updatedImage, price: updatedPrice, mrp: updatedMrp, selectedColor: updatedColor, selectedSize: updatedSize, cartItemId: newCartItemId }
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
      value={{ wishlist, toggleWishlist, cartCount, cartItems, addToCart, removeFromCart, updateQuantity, updateCartItemVariant, clearCart, showCart, setShowCart, referralCode, setReferralCode, isLoginOpen, setIsLoginOpen }}
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
