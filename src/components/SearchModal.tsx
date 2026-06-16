"use client";
"use client";
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconSearch, IconX, IconArrowRight } from "./Icons";
import { ALL_PRODUCTS } from "@/data";
import { navigate } from "@/store";

const TRENDING = ["Tencel Plazo","Oversized Tee","Full Night Suit","Valentino","Men Capri","Co-ord set"];
const RECENT = ["Cloud Tencel","Cargo Plazo","Short Night Suit"];

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => ref.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQ(""); setActive(0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter" && results[active]) { navigate(`/product/${results[active].id}`); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const qq = q.toLowerCase();
    return ALL_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(qq) ||
      p.category.toLowerCase().includes(qq) ||
      p.collection.toLowerCase().includes(qq) ||
      p.fabric.toLowerCase().includes(qq)
    ).slice(0, 6);
  }, [q]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] animate-fade-in">
      <div className="absolute inset-0 bg-sn-dark/50 backdrop-blur-md" onClick={onClose}/>
      <div className="relative max-w-3xl mx-auto mt-8 md:mt-20 px-4">
        <div className="bg-white rounded-3xl overflow-hidden sn-shadow-lg border border-sn-border animate-fade-up">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-sn-border">
            <IconSearch className="text-sn-muted"/>
            <input
              ref={ref}
              value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0); }}
              placeholder="Search for nightwear, plazos, fabrics…"
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-sn-muted"
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sn-bg border border-sn-border text-sn-muted">ESC</kbd>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sn-bg"><IconX size={18}/></button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {!q && (
              <div className="p-3 space-y-6">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-sn-muted font-semibold mb-2">Recent</p>
                  <div className="flex flex-wrap gap-2">
                    {RECENT.map((r) => (
                      <button key={r} onClick={() => setQ(r)} className="px-3 py-1.5 rounded-full bg-sn-bg text-sm text-sn-dark hover:bg-sn-primary/8 hover:text-sn-primary transition">{r}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-sn-muted font-semibold mb-2">Trending</p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((r) => (
                      <button key={r} onClick={() => setQ(r)} className="px-3 py-1.5 rounded-full sn-gradient-soft text-sm sn-text-gradient font-medium hover:scale-105 transition">{r}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-sn-muted font-semibold mb-2">Picks for you</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_PRODUCTS.slice(0, 3).map((p) => (
                      <a key={p.id} href={`#/product/${p.id}`} onClick={onClose} className="group block rounded-2xl overflow-hidden bg-sn-bg hover:sn-shadow transition">
                        <div className="aspect-[3/4] overflow-hidden">
                          <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition"/>
                        </div>
                        <div className="p-2.5">
                          <p className="text-[11px] text-sn-muted">{p.collection}</p>
                          <p className="text-xs font-semibold text-sn-dark line-clamp-1">{p.name}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {q && results.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl sn-gradient-soft grid place-items-center mb-3">
                  <IconSearch className="text-sn-primary"/>
                </div>
                <p className="font-display font-semibold text-sn-dark">No matches for "{q}"</p>
                <p className="text-sm text-sn-muted mt-1">Try searching for "Tencel" or "Oversized".</p>
              </div>
            )}

            {q && results.length > 0 && (
              <div className="space-y-1">
                {results.map((p, i) => (
                  <a
                    key={p.id}
                    href={`#/product/${p.id}`}
                    onClick={onClose}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition ${active === i ? "bg-sn-primary/8" : "hover:bg-sn-bg"}`}
                  >
                    <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-sn-muted">{p.collection}</p>
                      <p className="font-medium text-sn-dark line-clamp-1">{highlight(p.name, q)}</p>
                    </div>
                    <span className="text-sm font-semibold text-sn-dark">₹{p.price.toLocaleString("en-IN")}</span>
                    <IconArrowRight size={16} className="text-sn-muted"/>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-sn-border px-5 py-3 flex items-center justify-between text-[11px] text-sn-muted">
            <span><kbd className="px-1.5 py-0.5 rounded bg-sn-bg border border-sn-border font-mono mr-1">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-sn-bg border border-sn-border font-mono mr-1">↵</kbd> Open</span>
            <span>Powered by SN Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function highlight(text: string, q: string) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-sn-secondary/25 text-sn-dark rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}



