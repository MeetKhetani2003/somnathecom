"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, ChevronDown, Search, Check } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

const categoryGroups = [
  {
    title: "Ladies Collection",
    categories: [
      { label: "Ladies Full Night Suit", value: "Ladies Collection > Night Suits > Ladies Full Night Suit" },
      { label: "Ladies Capri Night Suit", value: "Ladies Collection > Night Suits > Ladies Capri Night Suit" },
      { label: "Ladies Short Night Suit", value: "Ladies Collection > Night Suits > Ladies Short Night Suit" },
      { label: "Oversized T-Shirt", value: "Ladies Collection > Oversized Collection > Oversized T-Shirt" },
      { label: "Oversized T-Shirt & Plazo Set", value: "Ladies Collection > Oversized Collection > Oversized T-Shirt & Plazo Set" },
      { label: "Oversized T-Shirt & Cargo Plazo Set", value: "Ladies Collection > Oversized Collection > Oversized T-Shirt & Cargo Plazo Set" },
      { label: "Valentino Plazo", value: "Ladies Collection > Plazo Collection > Valentino Plazo" },
      { label: "Tencel Plazo", value: "Ladies Collection > Plazo Collection > Tencel Plazo" }
    ]
  },
  {
    title: "Men's Collection",
    categories: [
      { label: "Gents Full Night Suit", value: "Men's Collection > Night Suits > Gents Full Night Suit" },
      { label: "Gents Capri Night Suit", value: "Men's Collection > Night Suits > Gents Capri Night Suit" },
      { label: "Gents Short Night Suit", value: "Men's Collection > Night Suits > Gents Short Night Suit" }
    ]
  },
  {
    title: "Tencel Collection",
    categories: [
      { label: "Tencel Full Night Suit", value: "Tencel Collection > Tencel Nightwear > Tencel Full Night Suit" },
      { label: "Tencel Capri Night Suit", value: "Tencel Collection > Tencel Nightwear > Tencel Capri Night Suit" },
      { label: "Tencel Short Night Suit", value: "Tencel Collection > Tencel Nightwear > Tencel Short Night Suit" },
      { label: "Tencel Plazo", value: "Tencel Collection > Tencel Plazo > Tencel Plazo" },
      { label: "Tencel Lounge Wear", value: "Tencel Collection > Future Collections > Tencel Lounge Wear" },
      { label: "Tencel Couple Set", value: "Tencel Collection > Future Collections > Tencel Couple Set" }
    ]
  },
  {
    title: "Hosiery Collection",
    categories: [
      { label: "Hosiery Full Night Suit", value: "Hosiery Collection > Hosiery Nightwear > Hosiery Full Night Suit" },
      { label: "Hosiery Capri Night Suit", value: "Hosiery Collection > Hosiery Nightwear > Hosiery Capri Night Suit" },
      { label: "Hosiery Short Night Suit", value: "Hosiery Collection > Hosiery Nightwear > Hosiery Short Night Suit" },
      { label: "Hosiery Oversized T-Shirt", value: "Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt" },
      { label: "Hosiery Oversized T-Shirt & Plazo Set", value: "Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt & Plazo Set" },
      { label: "Hosiery Oversized T-Shirt & Cargo Plazo Set", value: "Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt & Cargo Plazo Set" }
    ]
  }
];

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Products() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="font-display text-[15px] font-bold text-dark/50">Loading Collection...</div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}



function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams ? searchParams.get("category") : null;
  const activeCategory = categoryParam || "All";
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [activePrices, setActivePrices] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          const explodedProducts = data.products.flatMap((p: any) => {
            if (p.colors && p.colors.length > 0) {
              return p.colors.map((c: any) => ({
                ...p,
                _originalId: p.id,
                variantColor: c.name,
                title: c.title || `${c.name} ${p.title}`,
                featured: c.featured || false,
                image: (c.images && c.images.length > 0) ? c.images[0] : p.image,
                colors: [c], // keep only this color variant for sizes
                sizes: c.sizes || []
              }));
            }
            return [p];
          });
          setProductsList(explodedProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeCategory !== "All") {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const activeElement = document.getElementById("active-category-item");
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }
  }, [activeCategory]);

  const handleMobileFilterAction = () => {
    if (window.innerWidth < 768) {
      setShowFilters(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };



  const filteredProducts = useMemo(() => {
    let result = productsList;
    if (activeCategory !== "All") {
      const searchCategory = activeCategory.split(" > ").pop()?.toLowerCase() || "";
      console.log("DEBUG: activeCategory =", activeCategory);
      console.log("DEBUG: searchCategory =", searchCategory);
      result = result.filter(p => {
        const productCategory = p.category ? p.category.toLowerCase() : "";
        const matches = productCategory.includes(searchCategory);
        if (matches) console.log("DEBUG: Matched product:", p.title, "with category:", p.category);
        return matches;
      });
      console.log("DEBUG: result length after category filter =", result.length);
    }

    if (activeSizes.length > 0) {
      result = result.filter(p => {
        if (!p.sizes || p.sizes.length === 0) return false;
        return p.sizes.some((s: any) => activeSizes.includes(s.size));
      });
    }

    if (activePrices.length > 0) {
      result = result.filter(p => {
        if (activePrices.includes("Under ₹1000") && p.price < 1000) return true;
        if (activePrices.includes("₹1000 - ₹2000") && p.price >= 1000 && p.price <= 2000) return true;
        if (activePrices.includes("Over ₹2000") && p.price > 2000) return true;
        return false;
      });
    }

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [productsList, activeCategory, sortBy, activeSizes, activePrices]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12 bg-bg-base">
      <div className="mb-8 md:flex md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">
            {activeCategory === "All" ? "All Collections" : activeCategory.split(" > ").pop()}
          </h1>
          <p className="mt-2 text-[15px] text-dark/60 font-medium">
            Showing {filteredProducts.length} Premium Styles
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3 md:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-[14px] font-bold text-dark transition hover:bg-bg-base md:hidden shadow-sm"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>

          <div className="relative ml-auto md:ml-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-full border border-border bg-surface py-3 pl-5 pr-12 text-[14px] font-bold text-dark outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-sm cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/50" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Filters Sidebar */}
        <aside className={cn(
          "w-full shrink-0 md:w-[260px] md:block sticky top-[100px]",
          showFilters ? "block" : "hidden"
        )}>
          <div className="rounded-[32px] border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-5 font-display text-[18px] font-bold text-dark">Categories</h3>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
              {/* All Collections */}
              <button
                onClick={() => {
                  router.push("/products");
                  handleMobileFilterAction();
                }}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-left text-[14px] transition-all font-bold",
                  activeCategory === "All"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-dark/70 hover:bg-bg-base hover:text-primary"
                )}
              >
                All Collections
              </button>

              {/* Grouped Categories */}
              {categoryGroups.map((group) => (
                <div key={group.title} className="space-y-3">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-primary px-4 py-1.5 bg-primary/5 rounded-lg inline-block">
                    {group.title}
                  </div>
                  <ul className="space-y-1 pl-3 border-l-2 border-border ml-1.5">
                    {group.categories.map((cat) => (
                      <li key={cat.value}>
                        <button
                          id={activeCategory.toLowerCase() === cat.value.toLowerCase() ? "active-category-item" : undefined}
                          onClick={() => {
                            router.push(`/products?category=${encodeURIComponent(cat.value)}`);
                            handleMobileFilterAction();
                          }}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-[14px] transition-all",
                            activeCategory.toLowerCase() === cat.value.toLowerCase()
                              ? "bg-primary/10 font-bold text-primary"
                              : "text-dark/70 font-medium hover:bg-bg-base hover:text-primary"
                          )}
                        >
                          {cat.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-border pt-8">
              <h3 className="mb-5 font-display text-[18px] font-bold text-dark">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {["M", "L", "XL", "XXL", "3XL"].map(size => {
                  const isActive = activeSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
                        handleMobileFilterAction();
                      }}
                      className={cn(
                        "rounded-lg border py-2 text-[13px] font-bold transition-all",
                        isActive
                          ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                          : "border-border bg-surface text-dark/70 hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-8">
              <h3 className="mb-5 font-display text-[18px] font-bold text-dark">Price</h3>
              <ul className="space-y-3">
                {["Under ₹1000", "₹1000 - ₹2000", "Over ₹2000"].map(price => (
                  <li key={price}>
                    <label className="group flex cursor-pointer items-center gap-3">
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        activePrices.includes(price) ? "border-primary bg-primary" : "border-dark/20 bg-surface group-hover:border-primary/50"
                      )}>
                        {activePrices.includes(price) && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={activePrices.includes(price)}
                        onChange={() => {
                          setActivePrices(prev => prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]);
                          handleMobileFilterAction();
                        }}
                        className="hidden"
                      />
                      <span className={cn(
                        "text-[14.5px] font-medium transition-colors",
                        activePrices.includes(price) ? "text-primary font-bold" : "text-dark/70 group-hover:text-primary"
                      )}>{price}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-border bg-surface py-32 text-center text-dark/50">
              <div className="mb-4 animate-spin rounded-full h-10 w-10 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent" />
              <div className="font-display text-[18px] font-bold">Curating Collection...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div key="no-styles-found" className="flex flex-col items-center justify-center rounded-[32px] border border-border bg-surface py-32 text-center">
              <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-bg-base text-dark/30">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="font-display text-[24px] font-bold text-dark">No Styles Found</h3>
              <p className="mt-2 text-[15px] text-dark/60 max-w-[300px]">We couldn't find any nightwear matching your selected filters.</p>
              <button
                onClick={() => {
                  router.push("/products");
                  setActiveSizes([]);
                  setActivePrices([]);
                }}
                className="mt-8 rounded-full bg-dark px-8 py-3.5 text-[15px] font-bold text-surface transition hover:bg-primary shadow-xl hover:-translate-y-0.5"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div key="product-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredProducts.map((p, index) => (
                <ProductCard key={`${p.id}-${p.variantColor || index}`} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
