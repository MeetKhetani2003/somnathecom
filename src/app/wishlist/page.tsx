"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useShop } from "@/context/ShopContext";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProductsList(data.products || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);
  
  const wishlistedProducts = productsList.filter(p => wishlist.includes(p.id));

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32 text-dark/50">
        <div className="mb-4 animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        Loading wishlist...
      </div>
    );
  }

  if (wishlistedProducts.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center md:py-32">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-primary/5 text-primary">
          <Heart className="h-10 w-10" />
        </div>
        <h2 className="text-[24px] font-bold text-dark">Your wishlist is empty</h2>
        <p className="mt-2 text-[15px] text-dark/60">Save your favorite comfort styles to review them later.</p>
        <Link href="/products" className="mt-8 rounded-full bg-primary px-8 py-3.5 text-[15px] font-bold text-white transition hover:bg-dark">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-dark md:text-[36px]">My Wishlist</h1>
          <p className="mt-2 text-[15px] text-dark/60">{wishlistedProducts.length} items saved</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlistedProducts.map((p) => (
          <motion.div key={p.id} whileHover={{ y: -6 }} className="group relative w-full">
            <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-dark/5">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-base">
                <Link href={`/product/${p.id}`}>
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                </Link>
                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-dark backdrop-blur-md shadow-sm">
                      {p.category.split(" > ").pop()?.replace(" Collection", "").replace(" Nightwear", "")}
                    </span>
                    {p.tag && (
                      <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }} className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-dark backdrop-blur-md shadow-sm transition-all hover:text-primary hover:scale-110">
                    <Heart className={cn("h-5 w-5 transition", wishlist.includes(p.id) && "fill-primary text-primary")} />
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <Link href={`/product/${p.id}`} className="font-display text-[17px] font-semibold text-dark transition-colors hover:text-primary line-clamp-1">{p.title}</Link>
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
                        <span className="text-[13px] text-dark/40 line-through">₹{p.mrp}</span>
                        <span className="ml-auto text-[12px] font-bold text-green-600">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off</span>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }} 
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3 text-[14px] font-bold text-primary transition hover:bg-primary hover:text-white"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
