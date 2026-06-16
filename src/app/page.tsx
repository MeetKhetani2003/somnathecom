"use client";

import { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, RotateCcw, Sparkles, Play, ArrowRight, Check, Heart, ShoppingBag, PlayCircle, Camera } from "lucide-react";
import { categories, testimonials } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" } as any
};

export default function Home() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const carouselRef = useRef<HTMLDivElement>(null);
  const testimonialCarouselRef = useRef<HTMLDivElement>(null);

  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProductsList(data.products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const scrollTestimonialCarousel = (dir: "left" | "right") => {
    if (!testimonialCarouselRef.current) return;
    const amount = testimonialCarouselRef.current.clientWidth * 0.8;
    testimonialCarouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <>
      {/* SECTION 1: Hero */}
      <section className="relative w-full overflow-hidden bg-bg-base pt-6 md:pt-10">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="grid min-h-[80vh] items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl py-10 lg:py-0"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[12px] font-semibold tracking-widest text-primary uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                Premium Nightwear
              </div>
              <h1 className="font-display text-[46px] font-bold leading-[1.1] tracking-tight text-dark md:text-[64px] lg:text-[72px]">
                That Feels As <br className="hidden lg:block"/>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Good As It Looks.</span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[16px] leading-relaxed text-dark/70 md:text-[18px]">
                Discover premium comfort, modern styles, and breathable fabrics designed for your best sleep and effortless lounging.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/products?category=Women's Nightwear" className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-[#2E2387] px-8 py-4 text-[15px] font-semibold text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/30">
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Women <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link href="/products?category=Men's Nightwear" className="group flex items-center gap-2 rounded-full border-2 border-border bg-transparent px-8 py-4 text-[15px] font-semibold text-dark transition-all hover:border-primary hover:text-primary">
                  Shop Men
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative h-[60vh] w-full min-h-[500px] lg:h-[80vh] lg:min-h-[600px]"
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-tr from-primary/10 via-secondary/5 to-transparent blur-3xl rounded-full" />
              <img 
                src="https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=1200&h=1600" 
                alt="Premium Nightwear" 
                className="relative z-10 h-full w-full object-cover rounded-[40px] shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 z-20 rounded-2xl bg-surface p-5 shadow-xl md:p-6 backdrop-blur-xl border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Star className="h-6 w-6 fill-primary" />
                  </div>
                  <div>
                    <div className="font-display text-[20px] font-bold text-dark">4.9/5</div>
                    <div className="text-[13px] text-dark/60">From 10,000+ Happy Sleepers</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Shop By Collection (Bento Grid) */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">Shop By Collection</h2>
          <p className="mt-3 text-[16px] text-dark/60">Curated styles for your comfort</p>
        </div>
        
        <div className="grid h-auto grid-cols-1 gap-4 md:h-[600px] md:grid-cols-3 md:grid-rows-2 md:gap-6">
          {/* Women's Nightwear */}
          <Link href="/products?category=Women's Nightwear" className="group relative col-span-1 overflow-hidden rounded-[32px] bg-bg-base md:col-span-2 md:row-span-2">
            <img src="https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?auto=format&fit=crop&q=80&w=1000&h=1200" alt="Women's Nightwear" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="text-[13px] font-bold uppercase tracking-widest text-white/80">Explore</div>
              <h3 className="font-display text-[28px] font-bold text-white md:text-[40px]">Women's Collection</h3>
            </div>
            <div className="absolute bottom-8 right-8 grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-primary">
              <ArrowRight className="h-5 w-5" />
            </div>
          </Link>

          {/* Men's Nightwear */}
          <Link href="/products?category=Men's Nightwear" className="group relative overflow-hidden rounded-[32px] bg-bg-base">
            <img src="https://images.unsplash.com/photo-1594938298596-eb5fd3f6b402?auto=format&fit=crop&q=80&w=800&h=800" alt="Men's Nightwear" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-display text-[22px] font-bold text-white">Men's Classic</h3>
            </div>
          </Link>

          {/* Premium Tencel */}
          <Link href="/products?category=Tencel Collection" className="group relative overflow-hidden rounded-[32px] bg-primary">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800&h=800" alt="Tencel Collection" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="font-display text-[22px] font-bold text-white">Premium Tencel</h3>
            </div>
          </Link>
        </div>
      </motion.section>

      {/* SECTION 3: Trending This Week */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">Trending This Week</h2>
            <p className="mt-2 text-[16px] text-dark/60">Most loved styles by our community</p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => scrollCarousel("left")} className="grid h-12 w-12 place-items-center rounded-full border border-border text-dark transition hover:bg-bg-base hover:text-primary">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scrollCarousel("right")} className="grid h-12 w-12 place-items-center rounded-full border border-border text-dark transition hover:bg-bg-base hover:text-primary">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={carouselRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loadingProducts ? (
            <div className="flex w-full items-center justify-center py-20 text-[15px] text-dark/50">
              <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading premium collection...
            </div>
          ) : productsList.length === 0 ? (
            <div className="flex w-full items-center justify-center py-20 text-[15px] text-dark/50">
              No products available right now. Check back later!
            </div>
          ) : (
            productsList.map((p) => (
              <motion.div key={p.id} whileHover={{ y: -8 }} className="group relative w-[280px] shrink-0 snap-start md:w-[320px]">
                <div className="overflow-hidden rounded-[24px] bg-surface transition-all duration-300">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-bg-base">
                    <Link href={`/product/${p.id}`}>
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    </Link>
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-dark backdrop-blur-md">{p.category.replace(" Collection", "").replace(" Nightwear", "")}</span>
                      {p.tag && <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">{p.tag}</span>}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-dark backdrop-blur-md transition-all hover:text-primary hover:scale-110">
                      <Heart className={cn("h-5 w-5 transition", wishlist.includes(p.id) && "fill-primary text-primary")} />
                    </button>
                    {/* Quick Add overlay */}
                    <div className="absolute inset-x-4 bottom-4 translate-y-[120%] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface/95 py-3.5 text-[14px] font-semibold text-dark backdrop-blur-md hover:bg-primary hover:text-white transition-colors shadow-lg">
                        <ShoppingBag className="h-4 w-4" /> Quick Add
                      </button>
                    </div>
                  </div>
                  <div className="pt-5">
                    <Link href={`/product/${p.id}`} className="font-display text-[18px] font-semibold text-dark transition-colors hover:text-primary line-clamp-1">{p.title}</Link>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("h-4 w-4", i < Math.floor(p.rating) ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                        ))}
                      </div>
                      <span className="text-[13px] text-dark/60 ml-1">{p.rating} Reviews</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-[20px] font-bold text-dark">₹{p.price}</span>
                      {p.mrp > p.price && (
                        <>
                          <span className="text-[14px] text-dark/40 line-through">₹{p.mrp}</span>
                          <span className="ml-2 rounded-md bg-secondary/10 px-2 py-0.5 text-[12px] font-bold text-secondary">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* SECTION 4 & 5: Tencel Experience / Fabric Story */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="overflow-hidden rounded-[40px] bg-dark text-surface md:grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-10 md:p-16 lg:p-24 relative overflow-hidden">
            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
            <div className="relative z-10">
              <div className="text-[12px] font-bold uppercase tracking-widest text-secondary mb-4">The Tencel Experience</div>
              <h2 className="font-display text-[36px] font-bold leading-[1.1] md:text-[48px] lg:text-[56px]">
                Sleep Like <br/> Never Before.
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed text-surface/80 md:text-[18px]">
                Our signature Tencel fabric is derived from sustainably sourced wood pulp. It offers incredible softness, superior breathability, and a luxurious drape that feels like a second skin.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-8">
                {[
                  { title: "Silky Soft", desc: "Gentle on sensitive skin" },
                  { title: "Breathable", desc: "Regulates body temperature" },
                  { title: "Eco-Friendly", desc: "Sustainably sourced" },
                  { title: "Lightweight", desc: "Zero restriction movement" }
                ].map((f) => (
                  <div key={f.title}>
                    <div className="flex items-center gap-2 font-semibold text-surface">
                      <Check className="h-5 w-5 text-secondary" /> {f.title}
                    </div>
                    <div className="mt-1.5 text-[14px] text-surface/60">{f.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link href="/products?category=Tencel Collection" className="inline-flex rounded-full bg-surface px-8 py-4 text-[15px] font-bold text-dark transition hover:bg-primary hover:text-white">
                  Shop Tencel Collection
                </Link>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] w-full md:h-auto">
            <img src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=1200&h=1600" alt="Tencel Fabric" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/20 to-transparent md:hidden" />
          </div>
        </div>
      </motion.section>

      {/* SECTION 7: Why Customers Love Us */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Sparkles, title: "Premium Fabrics", desc: "Silky, breathable & durable materials." },
            { icon: ShieldCheck, title: "Perfect Fit", desc: "Designed for every body type." },
            { icon: Truck, title: "Fast Shipping", desc: "Free Pan-India delivery." },
            { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free 7-day exchange." },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center rounded-[32px] border border-border bg-surface p-10 transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-dark/5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-bg-base text-primary mb-6">
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="font-display text-[20px] font-bold text-dark">{item.title}</h3>
              <p className="mt-3 text-[15px] text-dark/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 8 & 9: Video Shopping & Customer Gallery */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">The Somnath NX Community</h2>
          <p className="mt-3 text-[16px] text-dark/60">Follow us <a href="#" className="font-semibold text-primary">@somnathnx</a> for more inspiration</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {[
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800",
            "https://images.unsplash.com/photo-1594938298596-eb5fd3f6b402?auto=format&fit=crop&q=80&w=600&h=800",
            "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?auto=format&fit=crop&q=80&w=600&h=800",
            "https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&q=80&w=600&h=800",
            "https://images.unsplash.com/photo-1434389678232-04ce6ca86f2b?auto=format&fit=crop&q=80&w=600&h=800",
          ].map((src, i) => (
            <a key={i} href="#" className={cn("group relative overflow-hidden rounded-[24px] bg-bg-base aspect-[3/4]", i === 4 ? "hidden lg:block" : "")}>
              <img src={src} alt="Community" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-dark/0 transition duration-300 group-hover:bg-dark/30" />
              <div className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </a>
          ))}
        </div>
      </motion.section>

      {/* SECTION 10: Reviews */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">Verified Reviews</h2>
            <div className="mt-3 flex items-center gap-3 text-[16px] text-dark/60">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#F5A524] text-[#F5A524]" />
                ))}
              </div>
              <span>4.9/5 from 2000+ reviews</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scrollTestimonialCarousel("left")} className="grid h-12 w-12 place-items-center rounded-full border border-border text-dark transition hover:bg-bg-base hover:text-primary">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scrollTestimonialCarousel("right")} className="grid h-12 w-12 place-items-center rounded-full border border-border text-dark transition hover:bg-bg-base hover:text-primary">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={testimonialCarouselRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((t) => (
            <div key={t.name} className="group relative w-[300px] shrink-0 snap-start md:w-[400px] rounded-[32px] border border-border bg-surface p-8 transition-all hover:border-primary/20 hover:shadow-xl">
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" />
                ))}
              </div>
              <p className="text-[16px] leading-relaxed text-dark/80 min-h-[96px]">"{t.text}"</p>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-base font-display text-[16px] font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display text-[16px] font-bold text-dark">{t.name}</div>
                  <div className="text-[13px] text-dark/50 flex items-center gap-1 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-green-500" /> {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 12: CTA Banner */}
      <section className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8 pb-20">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary via-[#2E2387] to-secondary px-6 py-16 md:px-16 md:py-24 text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=2000&q=20')] opacity-10 mix-blend-overlay object-cover" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-[36px] font-bold leading-tight text-white md:text-[48px]">
              Upgrade Your Nightwear Experience Today.
            </h2>
            <p className="mt-6 text-[18px] text-white/80">
              Join thousands of others who have discovered the ultimate comfort of Somnath NX. 
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/products" className="rounded-full bg-white px-10 py-4 text-[16px] font-bold text-primary transition-all hover:scale-105 hover:shadow-xl">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
