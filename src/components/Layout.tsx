"use client";

import { useEffect, useState, useRef } from "react";
import Link from 'next/link';

import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Check, Sparkles } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useSession, signOut } from "next-auth/react";
import LoginModal from "@/components/LoginModal";

const megaMenuGroups = [
  {
    title: "Women's Nightwear",
    categories: [
      "Ladies Full Night Suit",
      "Ladies Capri Night Suit",
      "Ladies Short Night Suit",
      "Oversized T-Shirt",
      "Oversized T-Shirt + Plazo",
      "Oversized T-Shirt + Cargo Plazo",
      "Valentino Plazo",
      "Tencel Plazo"
    ]
  },
  {
    title: "Men's Nightwear",
    categories: [
      "Gents Full Night Suit",
      "Gents Capri Night Suit",
      "Gents Short Night Suit"
    ]
  },
  {
    title: "Premium Fabrics",
    categories: [
      "Tencel Collection",
      "Hosiery Collection"
    ]
  },
  {
    title: "Special Collections",
    categories: [
      "Oversized Collection",
      "Valentino Collection"
    ]
  }
];

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { wishlist, cartCount, showCart, setShowCart } = useShop();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const fetchSearchProducts = async () => {
    if (hasFetchedProducts) return;
    setLoadingSearch(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.products || []);
        setHasFetchedProducts(true);
      }
    } catch (err) {
      console.error("Error fetching products for search:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!hasFetchedProducts) {
      fetchSearchProducts();
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = searchQuery.toLowerCase().trim();
    const filtered = allProducts.filter((p) => {
      return (
        (p.title && p.title.toLowerCase().includes(lower)) ||
        (p.category && p.category.toLowerCase().includes(lower)) ||
        (p.description && p.description.toLowerCase().includes(lower)) ||
        (p.tag && p.tag.toLowerCase().includes(lower)) ||
        (p.sku && p.sku.toLowerCase().includes(lower))
      );
    });
    setSearchResults(filtered);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Announcement */}
      <div className="relative z-[60] w-full bg-gradient-to-r from-primary via-[#2E2387] to-secondary text-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-3 px-4 py-2.5 text-[12.5px] font-medium tracking-wide">
          <Sparkles className="h-3.5 w-3.5 opacity-90" />
          <span>Somnath NX Premium Nightwear Collection • Free Delivery Pan-India • COD Available</span>
        </div>
      </div>

      {/* Navbar */}
      <header className={cn("sticky top-0 z-50 w-full border-b transition-all duration-300", scrolled ? "border-border bg-surface/80 backdrop-blur-xl" : "border-transparent bg-surface/60 backdrop-blur-lg")}>
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-4 px-4 md:h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-display text-[22px] md:text-[26px] font-bold tracking-tight text-primary">SOMNATH<span className="text-secondary ml-1">NX</span></span>
          </Link>

          {/* Nav */}
          <nav className="ml-8 hidden items-center gap-8 lg:flex">
            <Link href="/" className="group relative py-2 text-[14px] font-medium text-dark transition-colors hover:text-primary">
              Home
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
            </Link>

            {/* Categories Mega Menu Trigger */}
            <div className="group relative py-2">
              <button className="flex items-center gap-1.5 text-[14px] font-medium text-dark transition-colors hover:text-primary outline-none">
                <span>Collections</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Mega Menu Dropdown */}
              <div className="invisible absolute left-1/2 top-full z-[100] w-[860px] -translate-x-[200px] pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                <div className="rounded-[24px] border border-border bg-surface p-8 shadow-2xl shadow-dark/10 backdrop-blur-xl">
                  <div className="grid grid-cols-4 gap-8">
                    {megaMenuGroups.map((group) => (
                      <div key={group.title} className="space-y-4">
                        <div className="text-[12.5px] font-bold uppercase tracking-wider text-primary">
                          {group.title}
                        </div>
                        <ul className="space-y-3 border-l-2 border-bg-base pl-4">
                          {group.categories.map((cat) => (
                            <li key={cat}>
                              <Link 
                                href={`/products?category=${encodeURIComponent(cat)}`}
                                className="block text-[13.5px] text-dark/70 transition-all duration-200 hover:translate-x-1 hover:text-primary hover:font-medium"
                              >
                                {cat}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link href="/products?category=Tencel Collection" className="group relative py-2 text-[14px] font-medium text-dark transition-colors hover:text-primary">
              Tencel Experience
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
            </Link>

            <Link href="/products" className="group relative py-2 text-[14px] font-medium text-dark transition-colors hover:text-primary">
              Shop All
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block" ref={searchRef}>
              <input
                placeholder="Search nightwear..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  setIsSearchFocused(true);
                  fetchSearchProducts();
                }}
                className="h-10 w-[240px] rounded-full border border-border bg-bg-base pl-10 pr-4 text-[13.5px] outline-none transition-all placeholder:text-dark/40 focus:w-[300px] focus:border-primary/30 focus:bg-surface focus:ring-4 focus:ring-primary/5"
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-[360px] rounded-2xl border border-border bg-surface p-3 shadow-2xl shadow-dark/10 z-[100]"
                  >
                    {loadingSearch ? (
                      <div className="flex items-center justify-center p-6 text-[13px] text-dark/60 gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Searching...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-[13px] text-dark/60">
                        No products found for <span className="font-semibold text-primary">"{searchQuery}"</span>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                          Products Found ({searchResults.length})
                        </div>
                        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                          {searchResults.map((p) => (
                            <Link
                              key={p.id}
                              href={`/product/${p.id}`}
                              onClick={() => {
                                setSearchQuery("");
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-3 rounded-xl p-2 transition duration-200 hover:bg-bg-base"
                            >
                              <img
                                src={p.image}
                                alt={p.title}
                                className="h-12 w-10 rounded-lg object-cover border border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13.5px] font-medium text-dark truncate hover:text-primary transition-colors">
                                  {p.title}
                               </h4>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span className="text-[11.5px] text-dark/50 truncate">
                                    {p.category}
                                  </span>
                                  <span className="text-[13.5px] font-semibold text-primary">
                                    ₹{p.price}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="relative grid h-10 w-10 place-items-center rounded-full text-dark transition hover:bg-bg-base hover:text-primary md:hidden">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" className="relative grid h-10 w-10 place-items-center rounded-full text-dark transition hover:bg-bg-base hover:text-primary">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-white">{wishlist.length}</span>}
            </Link>
            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-dark transition hover:bg-bg-base hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">{cartCount}</span>}
            </Link>
            {session ? (
              <Link href="/profile" className="hidden h-10 w-10 place-items-center rounded-full text-dark transition hover:bg-bg-base hover:text-primary md:grid">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="h-7 w-7 rounded-full border border-border object-cover" />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-white uppercase">
                    {session.user?.name ? session.user.name.substring(0, 1) : "U"}
                  </div>
                )}
              </Link>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:flex items-center gap-1.5 rounded-full border-2 border-primary/20 px-5 py-2 text-[13.5px] font-semibold text-primary hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 cursor-pointer outline-none"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
            <button onClick={() => setMobileMenu(true)} className="grid h-10 w-10 place-items-center rounded-full text-dark transition hover:bg-bg-base lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-dark/40 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 z-[80] h-full w-[86%] max-w-[360px] overflow-y-auto bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-5">
                <span className="font-display text-[18px] font-bold text-primary">SOMNATH<span className="text-secondary ml-1">NX</span></span>
                <button onClick={() => setMobileMenu(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg-base">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <div className="relative mb-6">
                  <input
                    placeholder="Search nightwear..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      fetchSearchProducts();
                    }}
                    className="h-12 w-full rounded-xl border border-border bg-bg-base pl-11 pr-4 text-[14px] outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                  />
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/40" />
                </div>

                {/* Mobile Search Results */}
                {searchQuery && (
                  <div className="mb-6 max-h-[280px] overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-inner">
                    {loadingSearch ? (
                      <div className="flex items-center justify-center p-3 text-[13px] text-dark/50 gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Searching...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center text-[13px] text-dark/50">
                        No products found
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.id}`}
                            onClick={() => {
                              setSearchQuery("");
                              setMobileMenu(false);
                            }}
                            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-bg-base"
                          >
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-10 w-8 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[13px] font-medium text-dark truncate">
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-dark/50 truncate">
                                {p.category} • ₹{p.price}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <Link href="/" onClick={() => setMobileMenu(false)} className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-dark hover:bg-bg-base">
                    Home
                  </Link>

                  {/* Categories Accordion */}
                  <details className="group [&_summary::-webkit-details-marker]:hidden border-b border-border/50 pb-2 mb-2">
                    <summary className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium text-dark hover:bg-bg-base cursor-pointer outline-none">
                      <span>Collections</span>
                      <ChevronDown className="h-4 w-4 text-dark/40 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="mt-1 pl-4 pr-2 pb-2 space-y-5 border-l-2 border-border ml-2">
                      {megaMenuGroups.map((group) => (
                        <div key={group.title} className="space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-primary px-3 py-1 bg-primary/5 rounded-lg inline-block">
                            {group.title}
                          </div>
                          <div className="space-y-1 pl-1">
                            {group.categories.map((cat) => (
                              <Link 
                                key={cat} 
                                href={`/products?category=${encodeURIComponent(cat)}`}
                                onClick={() => setMobileMenu(false)}
                                className="block rounded-lg px-3 py-2 text-[14px] text-dark/70 hover:bg-bg-base hover:text-primary hover:font-medium"
                              >
                                {cat}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>

                  <Link href="/products?category=Tencel Collection" onClick={() => setMobileMenu(false)} className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-dark hover:bg-bg-base">
                    Tencel Experience
                  </Link>

                  <Link href="/products" onClick={() => setMobileMenu(false)} className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-dark hover:bg-bg-base">
                    Shop All
                  </Link>

                  <div className="h-px w-full bg-border my-2" />

                  <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-dark hover:bg-bg-base">
                    My Wishlist
                  </Link>

                  {session ? (
                    <>
                      <Link href="/profile" onClick={() => setMobileMenu(false)} className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-dark hover:bg-bg-base">
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenu(false);
                          signOut();
                        }}
                        className="w-full text-left block rounded-xl px-4 py-3.5 text-[15px] font-medium text-red-500 hover:bg-red-50 cursor-pointer outline-none"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenu(false);
                        setIsLoginOpen(true);
                      }}
                      className="w-full text-left block rounded-xl px-4 py-3.5 text-[15px] font-bold text-primary hover:bg-bg-base cursor-pointer outline-none"
                    >
                      Login / Sign Up
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-surface">
        <div className="mx-auto max-w-[1240px] px-4 py-16">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <span className="font-display text-[26px] font-bold tracking-tight text-primary">SOMNATH<span className="text-secondary ml-1">NX</span></span>
              <p className="mt-6 max-w-[320px] text-[14.5px] leading-relaxed text-dark/70">India’s premium destination for nightwear and loungewear. Experience unmatched comfort, modern designs, and breathable fabrics.</p>
            </div>
            {[
              { title: "Shop", links: ["Women's Nightwear", "Men's Nightwear", "Tencel Collection", "Oversized Collection"] },
              { title: "Support", links: ["Size Guide", "Shipping Info", "Returns Policy", "Track Order", "Contact Us"] },
              { title: "Brand", links: ["Our Story", "Fabric Guide", "Journal", "Sustainability", "Privacy Policy"] },
            ].map((col) => (
               <div key={col.title}>
                <div className="text-[13px] font-bold uppercase tracking-wider text-dark">{col.title}</div>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l}><Link href={col.title === "Shop" ? `/products?category=${l}` : "#"} className="text-[14px] text-dark/60 transition hover:text-primary">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
            <div className="text-[13px] text-dark/50">© {new Date().getFullYear()} Somnath NX. All rights reserved. Premium Nightwear & Loungewear.</div>
            <div className="flex items-center gap-3 text-[12px] text-dark/60">
              <span className="rounded-full border border-border px-3 py-1.5">UPI</span>
              <span className="rounded-full border border-border px-3 py-1.5">Cards</span>
              <span className="rounded-full border border-border px-3 py-1.5">COD</span>
              <span className="rounded-full border border-border px-3 py-1.5">Netbanking</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Toast */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-5 left-1/2 z-[90] flex w-[92%] max-w-[420px] -translate-x-1/2 items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-2xl shadow-dark/10 md:bottom-8">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold text-dark">Added to cart</div>
              <div className="text-[13px] text-dark/60 mt-0.5">Premium comfort awaits you</div>
            </div>
            <Link href="/cart" onClick={() => setShowCart(false)} className="rounded-full px-4 py-2 text-[13px] font-semibold text-primary hover:bg-bg-base transition-colors">View Cart</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
