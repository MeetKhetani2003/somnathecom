"use client";
"use client";
"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { IconSearch, IconHeart, IconBag, IconUser, IconMenu, IconX } from "./Icons";
import { useRoute, useStore } from "@/store";
import { cn } from "../utils/cn";
import SearchOverlay from "./SearchOverlay";

const NAV = [
  { label: "Women", href: "/shop/women" },
  { label: "Men", href: "/shop/men" },
  { label: "Tencel", href: "/shop/tencel" },
  { label: "New Arrivals", href: "/shop/new" },
  { label: "Journal", href: "/journal" },
];

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const route = useRoute();
  const { cart, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMobile(false); }, [route]);

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const isLight = transparent && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
          isLight ? "bg-transparent" : "bg-bg",
          scrolled && "border-b border-[#ECECEC]"
        )}
      >
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 h-16 lg:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Left — logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden -ml-1"
              onClick={() => setMobile(true)}
              aria-label="Menu"
              style={{ color: isLight ? "#FAFAF7" : "#111111" }}
            >
              <IconMenu size={20}/>
            </button>
            <Logo tone={isLight ? "light" : "ink"} className="text-[14px]"/>
          </div>

          {/* Center — links */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV.map((n) => {
              const active = route === n.href || (n.href !== "/" && route.startsWith(n.href));
              return (
                <a
                  key={n.href}
                  href={n.href}
                  className="text-[12px] tracking-[0.18em] uppercase transition-colors duration-300"
                  style={{
                    color: isLight ? "#FAFAF7" : (active ? "#111111" : "#111111"),
                    opacity: active ? 1 : (isLight ? 0.85 : 0.7),
                  }}
                >
                  {n.label}
                </a>
              );
            })}
          </nav>

          {/* Right — icons */}
          <div className="flex items-center justify-end gap-5 lg:gap-6" style={{ color: isLight ? "#FAFAF7" : "#111111" }}>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hover:opacity-60 transition">
              <IconSearch size={18}/>
            </button>
            <a href="/wishlist" aria-label="Wishlist" className="hover:opacity-60 transition relative">
              <IconHeart size={18}/>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] tabular-nums">{wishlist.length}</span>
              )}
            </a>
            <a href="/cart" aria-label="Cart" className="hover:opacity-60 transition relative">
              <IconBag size={18}/>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] tabular-nums">{cartCount}</span>
              )}
            </a>
            <a href="/account" aria-label="Account" className="hidden md:inline-block hover:opacity-60 transition">
              <IconUser size={18}/>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMobile(false)} style={{ animation: "reveal-in 0.4s ease-out both" }}/>
          <aside
            className="absolute top-0 left-0 bottom-0 w-[88%] max-w-[420px] bg-bg flex flex-col"
            style={{ animation: "reveal-in 0.5s ease-out both" }}
          >
            <div className="flex items-center justify-between px-6 h-16 lg:h-[72px] border-b border-[#ECECEC]">
              <Logo/>
              <button onClick={() => setMobile(false)} aria-label="Close"><IconX size={18}/></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-12 space-y-6">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="block font-display text-[40px] leading-none tracking-tight font-light hover:text-accent transition-colors">
                  {n.label}
                </a>
              ))}
              <div className="pt-12 mt-12 border-t border-[#ECECEC] space-y-4">
                <a href="/account" className="block text-[12px] tracking-[0.18em] uppercase">Account</a>
                <a href="/wishlist" className="block text-[12px] tracking-[0.18em] uppercase">Wishlist ({wishlist.length})</a>
                <a href="/cart" className="block text-[12px] tracking-[0.18em] uppercase">Bag ({cartCount})</a>
                <a href="/about" className="block text-[12px] tracking-[0.18em] uppercase">About</a>
                <a href="/contact" className="block text-[12px] tracking-[0.18em] uppercase">Contact</a>
              </div>
            </nav>
          </aside>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)}/>
    </>
  );
}


