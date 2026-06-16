"use client";
"use client";
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_PRODUCTS } from "@/data";
import { navigate } from "@/store";
import { IconX, IconArrowUpRight } from "./Icons";

const TRENDING = ["Tencel", "Oversized", "Plazo", "Co-ord", "Men's Set"];
const RECENT = ["Valentino Plazo", "Lounge Set"];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => ref.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQ("");
    }
  }, [open]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const qq = q.toLowerCase();
    return ALL_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(qq) ||
      p.category.toLowerCase().includes(qq) ||
      p.collection.toLowerCase().includes(qq) ||
      p.fabric.toLowerCase().includes(qq)
    ).slice(0, 4);
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-bg reveal-in">
      <div className="h-full flex flex-col">
        {/* Top bar */}
        <div className="border-b border-[#ECECEC]">
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-6">
            <span className="text-[11px] tracking-[0.22em] uppercase text-muted">Search</span>
            <button onClick={onClose} className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase hover:text-accent transition-colors">
              Close <IconX size={14}/>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="border-b border-[#ECECEC]">
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-10 lg:py-16">
            <input
              ref={ref}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full bg-transparent outline-none font-display text-[40px] md:text-[72px] lg:text-[96px] leading-none tracking-[-0.03em] font-light placeholder:text-[#D1D1CE]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-8 lg:gap-16">
            {!q && (
              <>
                <div className="lg:col-span-3 space-y-10">
                  <div>
                    <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Recent</p>
                    <ul className="space-y-2">
                      {RECENT.map((r) => (
                        <li key={r}><button onClick={() => setQ(r)} className="text-[15px] hover:text-accent transition-colors">{r}</button></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Trending</p>
                    <ul className="space-y-2">
                      {TRENDING.map((r) => (
                        <li key={r}><button onClick={() => setQ(r)} className="text-[15px] hover:text-accent transition-colors">{r}</button></li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="lg:col-span-9">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Featured</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {ALL_PRODUCTS.slice(0, 4).map((p) => (
                      <a key={p.id} href={`#/product/${p.id}`} onClick={onClose} className="group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEDE7]">
                          <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"/>
                        </div>
                        <div className="pt-3 flex items-baseline justify-between gap-2 text-[13px]">
                          <span>{p.name}</span>
                          <span className="tabular-nums shrink-0">₹{p.price.toLocaleString("en-IN")}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {q && results.length === 0 && (
              <div className="lg:col-span-12 py-12">
                <p className="text-muted text-[15px]">No results for "{q}". Try "Tencel" or "Plazo".</p>
              </div>
            )}

            {q && results.length > 0 && (
              <>
                <div className="lg:col-span-3">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{results.length} {results.length === 1 ? "Result" : "Results"}</p>
                </div>
                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  {results.map((p) => (
                    <a key={p.id} href={`#/product/${p.id}`} onClick={onClose} className="group">
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEDE7]">
                        <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"/>
                        <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"><IconArrowUpRight size={14}/></span>
                      </div>
                      <div className="pt-3 text-[13px]">
                        <p>{p.name}</p>
                        <p className="tabular-nums text-muted">₹{p.price.toLocaleString("en-IN")}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer bar */}
        <div className="border-t border-[#ECECEC]">
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12 h-12 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase text-muted">
            <span>ESC to close</span>
            <span>Somnath NX</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavigateHandler() {
  // helper for type satisfying use later
  navigate("/");
  return null;
}



