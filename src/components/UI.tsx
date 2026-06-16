"use client";
"use client";
"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import type { Product } from "@/data";
import { useStore, useReveal } from "@/store";
import { IconHeart, IconHeartFill, IconCheck, IconChevron, IconX } from "./Icons";

/* ============================== REVEAL ============================== */
export function Reveal({ children, delay = 0, className = "", as = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" | "span" | "p" | "h1" | "h2" | "h3" }) {
  const [ref, visible] = useReveal<HTMLDivElement>();
  const Tag = as as any;
  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,28px,0)",
        transition: `opacity 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/* ============================== IMAGE WITH REVEAL ============================== */
export function RevealImage({ src, alt = "", className = "", ratio = "aspect-[4/5]", priority = false }: { src: string; alt?: string; className?: string; ratio?: string; priority?: boolean }) {
  const [ref, visible] = useReveal<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  return (
    <div ref={ref as any} className={cn("relative overflow-hidden bg-[#F1F5F9]", ratio, className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{
          transform: (visible && loaded) ? "scale(1)" : "scale(1.08)",
          opacity: (visible && loaded) ? 1 : 0,
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1), opacity 1.2s ease-out",
        }}
      />
    </div>
  );
}

/* ============================== PRODUCT CARD (Minimal) ============================== */
export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const [hover, setHover] = useState(false);
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const on = wishlist.includes(p.id);
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref as any}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,24px,0)",
        transition: `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${(index % 4) * 80}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${(index % 4) * 80}ms`,
      }}
    >
      <a href={`/product/${p.id}`} className="block relative aspect-[3/4] overflow-hidden bg-[#F1F5F9]">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            opacity: hover && p.image2 ? 0 : 1,
            transform: "scale(1)",
            transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 1.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        {p.image2 && (
          <img
            src={p.image2}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
            style={{
              opacity: hover ? 1 : 0,
              transform: hover ? "scale(1.02)" : "scale(1)",
              transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 1.2s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        )}
        {/* Wishlist — only on hover, minimal */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }}
          aria-label="Save"
          className="absolute top-4 right-4 text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        >
          {on ? <IconHeartFill size={16}/> : <IconHeart size={16}/>}
        </button>

        {/* Quick Add Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-bg/95 backdrop-blur-sm py-2 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center gap-1.5 z-10 border-t border-[#ECECEC]">
          <span className="text-[9px] tracking-[0.15em] uppercase text-muted">Quick Add</span>
          <div className="flex gap-1.5">
            {p.sizes.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(p, s);
                }}
                className="h-6 w-8 text-[10px] tracking-tighter border border-[#D1D1CE] hover:border-ink hover:bg-ink hover:text-bg transition flex items-center justify-center bg-bg"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </a>

      <div className="pt-5 flex items-baseline justify-between gap-4">
        <a href={`/product/${p.id}`} className="text-[14px] text-ink font-normal tracking-tight">
          {p.name}
        </a>
        <span className="text-[14px] text-ink tabular-nums shrink-0">
          ₹{p.price.toLocaleString("en-IN")}
        </span>
      </div>
      {p.colors.length > 1 && (
        <div className="mt-1.5 flex items-center gap-1">
          {p.colors.slice(0, 4).map((c) => (
            <span key={c.name} className="h-2 w-2 rounded-full border border-[#ECECEC]" style={{ background: c.hex }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== TOASTS (Minimal) ============================== */
export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-ink text-bg px-5 py-3 flex items-center gap-4 min-w-[260px] reveal"
        >
          <IconCheck size={14} />
          <p className="text-[12px] tracking-[0.12em] uppercase flex-1">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100"><IconX size={12}/></button>
        </div>
      ))}
    </div>
  );
}

/* ============================== ACCORDION ============================== */
export function Accordion({ items, defaultOpen = -1 }: { items: { title: string; content: ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number>(defaultOpen);
  return (
    <div className="border-t border-[#ECECEC]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-[#ECECEC]">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span className="text-[13px] tracking-[0.12em] uppercase font-normal">{it.title}</span>
              <span className={cn("transition-transform duration-500", isOpen ? "rotate-45" : "rotate-0")}>
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1">
                  <line x1="7" y1="1" x2="7" y2="13"/>
                  <line x1="1" y1="7" x2="13" y2="7"/>
                </svg>
              </span>
            </button>
            <AccordionPanel open={isOpen}>
              <div className="pb-6 text-[14px] text-muted leading-[1.7] max-w-2xl">{it.content}</div>
            </AccordionPanel>
          </div>
        );
      })}
    </div>
  );
}

function AccordionPanel({ open, children }: { open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    setH(open ? ref.current.scrollHeight : 0);
  }, [open, children]);
  return (
    <div style={{ height: h, overflow: "hidden", transition: "height 0.55s cubic-bezier(0.22,1,0.36,1)" }}>
      <div ref={ref}>{children}</div>
    </div>
  );
}

/* ============================== BREADCRUMB ============================== */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-muted">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {it.href ? <a href={it.href} className="hover:text-ink transition-colors">{it.label}</a> : <span className="text-ink">{it.label}</span>}
          {i < items.length - 1 && <IconChevron size={10} className="opacity-40"/>}
        </span>
      ))}
    </nav>
  );
}

/* ============================== SECTION NUMBER ============================== */
export function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-8">
      <span className="section-num">{num}</span>
      <span className="h-px flex-1 max-w-[80px] bg-[#ECECEC]"/>
      <span className="text-[11px] tracking-[0.22em] uppercase text-muted">{label}</span>
    </div>
  );
}



