"use client";
"use client";
import { useMemo, useState } from "react";
import { ALL_PRODUCTS, Product } from "@/data";
import { Breadcrumb, ProductCard, Reveal } from "@/components/UI";
import { IconX, IconArrowDown, IconCheck, IconChevron } from "@/components/Icons";

const SIZES = ["XS","S","M","L","XL"];
const FABRICS = ["Tencel","Hosiery","Cotton Lyocell","Modal"];
const COLORS = [
  { n: "Ivory", c: "#EFEAE0" },{ n: "Bone", c: "#E7E2D6" },{ n: "Stone", c: "#C9C2B5" },
  { n: "Charcoal", c: "#3E3A36" },{ n: "Black", c: "#111111" },{ n: "Indigo", c: "#1E1B4B" },
];
const SORTS = ["Newest", "Price — Low to High", "Price — High to Low"];

export default function ShopPage() {
  return <Shop slug="new" />;
}

export function Shop({ slug = "new" }: { slug?: string }) {
  const titleMap: Record<string, { t: string; sub: string }> = {
    women: { t: "Women", sub: "Night suits, oversized silhouettes, and wide-leg trousers. The everyday wardrobe — reconsidered." },
    men: { t: "Men", sub: "A small, considered collection. Full sets, capris, and short pieces." },
    tencel: { t: "Tencel", sub: "Spun from sustainable eucalyptus. The softest fibre we have ever sourced." },
    new: { t: "New Arrivals", sub: "Just landed. Pieces from our newest chapter." },
    "tencel-plazo": { t: "Tencel Plazo", sub: "" },
  };
  const safeSlug = slug || "new";
  const meta = titleMap[safeSlug] || { t: safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1), sub: "" };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<{ sizes: string[]; fabrics: string[]; colors: string[] }>({ sizes: [], fabrics: [], colors: [] });
  const [sort, setSort] = useState(0);

  const filtered = useMemo(() => {
    let list: Product[] = [...ALL_PRODUCTS];
    if (safeSlug === "women") list = list.filter((p) => p.gender === "Women");
    else if (safeSlug === "men") list = list.filter((p) => p.gender === "Men");
    else if (safeSlug === "tencel") list = list.filter((p) => p.fabric === "Tencel" || p.collection === "Tencel");
    else if (safeSlug === "new") list = list.slice(0, 12);

    if (filters.sizes.length) list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    if (filters.fabrics.length) list = list.filter((p) => filters.fabrics.includes(p.fabric));
    if (filters.colors.length) list = list.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)));

    if (sort === 1) list.sort((a, b) => a.price - b.price);
    if (sort === 2) list.sort((a, b) => b.price - a.price);
    return list;
  }, [safeSlug, filters, sort]);

  const toggleIn = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const activeFilters = filters.sizes.length + filters.fabrics.length + filters.colors.length;

  return (
    <div className="page-enter pt-24 lg:pt-32">
      {/* Banner */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Reveal>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: meta.t }]}/>
        </Reveal>
        <div className="mt-10 lg:mt-16 grid lg:grid-cols-12 gap-8 items-end pb-12 lg:pb-16">
          <div className="lg:col-span-8">
            <Reveal delay={80}>
              <h1 className="editorial-h text-ink text-[48px] md:text-[80px] lg:text-[120px]">{meta.t}.</h1>
            </Reveal>
          </div>
          <div className="lg:col-span-4">
            <Reveal delay={160}>
              <p className="text-[14px] text-muted leading-[1.8] max-w-md">{meta.sub}</p>
              <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-muted">{filtered.length} Pieces</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="border-y border-[#ECECEC] bg-bg sticky top-16 lg:top-[72px] z-30 backdrop-blur-sm">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 h-14 flex items-center justify-between gap-4">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="text-[11px] tracking-[0.22em] uppercase inline-flex items-center gap-3 hover:text-accent transition-colors">
            {filtersOpen ? "Hide" : "Filter"} {activeFilters > 0 && <span className="text-muted">({activeFilters})</span>}
            {filtersOpen ? <IconX size={12}/> : <IconChevron size={12} className="rotate-90"/>}
          </button>
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="text-[11px] tracking-[0.22em] uppercase inline-flex items-center gap-3 hover:text-accent transition-colors">
              Sort — {SORTS[sort]} <IconArrowDown size={12}/>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-bg border border-[#ECECEC] py-2 w-[260px] z-10">
                {SORTS.map((s, i) => (
                  <button key={s} onClick={() => { setSort(i); setSortOpen(false); }} className="w-full text-left px-5 py-2.5 text-[13px] hover:bg-[#F3F1EA] transition-colors flex items-center justify-between">
                    {s} {sort === i && <IconCheck size={12}/>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters expanded */}
      {filtersOpen && (
        <div className="border-b border-[#ECECEC] bg-bg">
          <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-10 grid md:grid-cols-3 gap-10">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Size</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => {
                  const on = filters.sizes.includes(s);
                  return (
                    <button key={s} onClick={() => setFilters({ ...filters, sizes: toggleIn(filters.sizes, s) })}
                      className={`h-10 min-w-12 px-4 border text-[12px] tracking-[0.1em] transition ${on ? "border-ink bg-ink text-bg" : "border-[#ECECEC] hover:border-ink"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Fabric</p>
              <ul className="space-y-2.5">
                {FABRICS.map((f) => {
                  const on = filters.fabrics.includes(f);
                  return (
                    <li key={f}>
                      <button onClick={() => setFilters({ ...filters, fabrics: toggleIn(filters.fabrics, f) })} className="flex items-center gap-3 text-[13px] group">
                        <span className={`h-4 w-4 border grid place-items-center transition ${on ? "border-ink bg-ink text-bg" : "border-[#D1D1CE]"}`}>
                          {on && <IconCheck size={10}/>}
                        </span>
                        <span className={on ? "text-ink" : "text-muted group-hover:text-ink transition-colors"}>{f}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Colour</p>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((co) => {
                  const on = filters.colors.includes(co.n);
                  return (
                    <button key={co.n} title={co.n} onClick={() => setFilters({ ...filters, colors: toggleIn(filters.colors, co.n) })}
                      className={`h-8 w-8 rounded-full border transition ${on ? "ring-1 ring-offset-2 ring-offset-bg ring-ink border-ink" : "border-[#D1D1CE] hover:border-ink"}`}
                      style={{ background: co.c }}/>
                  );
                })}
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={() => setFilters({ sizes: [], fabrics: [], colors: [] })} className="md:col-span-3 text-left text-[11px] tracking-[0.22em] uppercase text-muted hover:text-ink transition-colors">Clear all</button>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="serif-h text-[32px] text-ink">Nothing matches.</p>
            <p className="text-[14px] text-muted mt-3">Try clearing the filters above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-16 lg:gap-x-6 lg:gap-y-20">
            {filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i}/>)}
          </div>
        )}
      </section>
    </div>
  );
}


