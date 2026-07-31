"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");
import { useShop } from "@/context/ShopContext";
import { fireToast } from "@/context/ToastContext";

export function ProductCard({ p, className }: { p: any; className?: string }) {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const selectedColor = p.variantColor || (p.colors && p.colors.length > 0 ? p.colors[0].name : "");
  const [selectedSize, setSelectedSize] = useState("");

  const selectedColorObj = p.colors?.find((c: any) => c.name === selectedColor);
  const availableSizes = p.colors && p.colors.length > 0
    ? (selectedColorObj?.sizes || [])
    : (p.sizes || []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (p.colors && p.colors.length > 0 && !selectedColor) {
      fireToast("Please select a color first", "warning");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      fireToast("Please select a size first", "warning");
      return;
    }

    addToCart(p, selectedColor || undefined, selectedSize || undefined);
  };

  return (
    <div className={cn("group relative shrink-0", className || "w-full")}>
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-border/50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-dark/5">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-base">
          <Link href={`/product/${p._originalId || p.id}${p.variantColor ? `?color=${encodeURIComponent(p.variantColor)}` : ''}`}>
            <img src={p.image} alt={p.title} className="h-full w-full object-cover object-top transition duration-1000 group-hover:scale-105" />
          </Link>
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 gap-2">
            {/* <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-dark backdrop-blur-md shadow-sm">
                {p.category.split(" > ").pop()?.replace(" Collection", "").replace(" Nightwear", "")}
              </span>
              {p.tag && <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">{p.tag}</span>}
            </div> */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }}
              className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-dark/50 shadow-sm backdrop-blur-md transition-all hover:text-secondary hover:scale-110"
            >
              <Heart className={cn("h-5 w-5 transition", wishlist.includes(p.id) && "fill-secondary text-secondary")} />
            </button>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            <Link href={`/product/${p._originalId || p.id}${p.variantColor ? `?color=${encodeURIComponent(p.variantColor)}` : ''}`} className="font-display text-[16px] font-bold text-dark transition-colors hover:text-primary line-clamp-1">{p.title}</Link>

            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(p.rating || 4.9) ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                ))}
              </div>
              <span className="text-[12.5px] text-dark/60 ml-1">{p.rating || 4.9} Reviews</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[18px] font-bold text-dark">₹{p.price}</span>
              {p.mrp > p.price && (
                <>
                  <span className="text-[14px] text-dark/40 line-through">₹{p.mrp}</span>
                  <span className="ml-auto text-[13px] font-bold text-green-600">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off</span>
                </>
              )}
            </div>

            {/* Sizes Selector */}
            {((p.colors && p.colors.length > 0) || (p.sizes && p.sizes.length > 0)) && (
              <div className="mt-4 text-[13px]">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 font-semibold text-dark/80 outline-none focus:border-primary"
                >
                  <option value="">Select Size</option>
                  {availableSizes.map((s: any) => {
                    const sizeLabel = typeof s === "object" ? s.size : s;
                    const sizeStock = typeof s === "object" ? s.stock : 10;
                    return (
                      <option key={sizeLabel} value={sizeLabel} disabled={sizeStock === 0}>
                        {sizeLabel} {sizeStock === 0 ? "(Out of Stock)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3 text-[14px] font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
