"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Heart } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ProductCard } from "@/components/ProductCard";

export default function Wishlist() {
  const { wishlist } = useShop();
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
        {wishlistedProducts.map((p, index) => (
          <ProductCard key={`${p.id}-${p.variantColor || index}`} p={p} />
        ))}
      </div>
    </div>
  );
}
