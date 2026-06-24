"use client";

import { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, RotateCcw, Sparkles, ArrowRight, Check, Heart, ShoppingBag, IndianRupee } from "lucide-react";
import { heroSlides, testimonials, categories } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, ease: "easeOut" } as any
};

function HeroCarousel() {
  const [slides, setSlides] = useState(heroSlides);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/banners").then(r => r.json()).then(d => {
      if (d.success && d.banners.length > 0) {
        setSlides(d.banners.map((b: any) => ({
          id: b._id,
          image: b.image,
          title: b.title,
          subtitle: b.subtitle,
          eyebrow: b.eyebrow,
          cta: b.cta,
          badge: b.badge || "New Collection",
        })));
      }
    });
  }, []);

  const goTo = (idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setTransitioning(false); }, 900);
  };

  const next = () => goTo((current + 1) % slides.length);
  const prevSlide = () => goTo((current - 1 + slides.length) % slides.length);

  useEffect(() => {
    timerRef.current = setTimeout(next, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, slides.length]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-24">
      {/* Outer Rounded Container */}
      <div className="relative w-full overflow-hidden rounded-[32px] md:rounded-[40px] bg-dark aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/8] lg:h-[580px] lg:aspect-auto shadow-2xl">
        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: i === current ? 1 : i === prev ? 0 : 0,
              transitionDuration: "900ms",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
              zIndex: i === current ? 2 : i === prev ? 1 : 0,
            }}
          >
            {/* Background image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover object-top "
              style={{ transform: i === current ? "scale(1.04)" : "scale(1)", transition: "transform 6s ease-out" }}
            />
            {/* Gradient overlays matching premium design */}
            <div className="absolute inset-0 bg-dark/5" />
            <div className="absolute inset-0 bg-gradient-to-tr from-dark/65 via-dark/15 to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full items-end md:items-center">
          <div className="w-full px-6 pb-20 pt-12 md:px-16 md:py-16">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="transition-all"
                style={{
                  opacity: i === current ? 1 : 0,
                  transform: i === current ? "translateY(0)" : "translateY(24px)",
                  transitionDuration: "700ms",
                  transitionDelay: i === current ? "200ms" : "0ms",
                  position: i === current ? "relative" : "absolute",
                  pointerEvents: i === current ? "auto" : "none",
                }}
              >
                {/* Badges */}
                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-dark/60 border border-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {slide.eyebrow}
                  </div>
                  <div className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                    {slide.badge || "New Collection"}
                  </div>
                </div>

                {/* Headline */}
                <h1
                  className="font-display text-[28px] font-bold leading-[1.1] tracking-tight text-white/95 sm:text-[38px] md:text-[46px] lg:text-[52px] max-w-[700px]"
                  style={{ textWrap: "balance" } as any}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="mt-5 max-w-[500px] text-[14px] leading-relaxed text-white/70 md:text-[15px]">
                  {slide.subtitle}
                </p>

                {/* CTA Button */}
                <div className="mt-8">
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-bold text-primary transition-all hover:bg-white/95 hover:scale-105 hover:shadow-xl"
                  >
                    {slide.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel controls & indicators */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between md:bottom-8 md:left-16 md:right-16">
          {/* Slide Indicators */}
          <div className="flex gap-2 items-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300 cursor-pointer",
                  idx === current ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="grid h-11 w-11 place-items-center rounded-full bg-dark/50 text-white border border-white/10 transition hover:bg-dark/70 hover:scale-105 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="grid h-11 w-11 place-items-center rounded-full bg-dark/50 text-white border border-white/10 transition hover:bg-dark/70 hover:scale-105 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Features Grid */}
      <div className="relative z-30 mx-4 mt-8 sm:-mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:mx-12 md:-mt-8 md:gap-6">
        {[
          { title: "Next-Day Delivery", desc: "Metro cities", icon: Truck },
          { title: "Premium Fabrics", desc: "Kid-safe & soft", icon: ShieldCheck },
          { title: "Easy Returns", desc: "7-day exchanges", icon: RotateCcw },
          { title: "COD Available", desc: "Pay on delivery", icon: IndianRupee }
        ].map((feat, idx) => (
          <div key={idx} className="flex items-center gap-3.5 rounded-[24px] border border-border/40 bg-white/95 p-4 shadow-md backdrop-blur-md transition hover:-translate-y-1 hover:shadow-lg">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <feat.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-[13.5px] font-bold text-dark leading-tight">{feat.title}</div>
              <div className="text-[11px] text-dark/50 mt-0.5 leading-none">{feat.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const testimonialCarouselRef = useRef<HTMLDivElement>(null);
  const featuredCarouselRef = useRef<HTMLDivElement>(null);

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

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      if (testimonialCarouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = testimonialCarouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          testimonialCarouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = window.innerWidth >= 768 ? 424 : 324;
          testimonialCarouselRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollTestimonialCarousel = (dir: "left" | "right") => {
    if (!testimonialCarouselRef.current) return;
    const amount = testimonialCarouselRef.current.clientWidth * 0.8;
    testimonialCarouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const scrollFeaturedCarousel = (dir: "left" | "right") => {
    if (!featuredCarouselRef.current) return;
    const amount = featuredCarouselRef.current.clientWidth * 0.8;
    featuredCarouselRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <>
      {/* SECTION 1: Redesigned Hero Carousel */}
      <HeroCarousel />

      {/* SECTION 2: Featured Products Carousel */}
      <motion.section {...fadeInUp} className="mx-auto mt-12 max-w-[1400px] px-4 md:mt-20 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">Featured Products</h2>
            <p className="mt-2 text-[16px] text-dark/60">Our handpicked best-selling comfort styles</p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => scrollFeaturedCarousel("left")} className="grid h-12 w-12 place-items-center rounded-full border border-border text-dark transition hover:bg-bg-base hover:text-primary cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scrollFeaturedCarousel("right")} className="grid h-12 w-12 place-items-center rounded-full border border-border text-dark transition hover:bg-bg-base hover:text-primary cursor-pointer">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

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
          <div ref={featuredCarouselRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {productsList.map((p) => (
              <motion.div key={p.id} whileHover={{ y: -6 }} className="group relative w-[280px] shrink-0 snap-start md:w-[320px]">
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
                            <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(p.rating) ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                          ))}
                        </div>
                        <span className="text-[12.5px] text-dark/60 ml-1">{p.rating} Reviews</span>
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
        )}
      </motion.section>

      {/* SECTION 3: Proper Category Grid */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">Shop By Category</h2>
          <p className="mt-3 text-[16px] text-dark/60">Find the perfect comfort styles curated for you</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[24px] border border-border/40 bg-dark shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-dark/5"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/30 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div className="relative z-10 p-5 text-left text-white">
                <h3 className="font-display text-[16px] font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-secondary md:text-[18px]">
                  {cat.name.split(" > ").pop()}
                </h3>
                <span className="mt-1 block text-[12px] font-medium text-white/75">
                  {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* SECTION 4: Tencel Experience / Fabric Story */}
      <motion.section {...fadeInUp} className="mx-auto mt-20 max-w-[1400px] px-4 md:mt-32 md:px-8">
        <div className="overflow-hidden rounded-[40px] bg-dark text-surface md:grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-10 md:p-16 lg:p-24 relative overflow-hidden">
            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
            <div className="relative z-10">
              <div className="text-[12px] font-bold uppercase tracking-widest text-secondary mb-4">The Tencel Experience</div>
              <h2 className="font-display text-[36px] font-bold leading-[1.1] md:text-[48px] lg:text-[56px]">
                Sleep Like <br /> Never Before.
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
            <img src="/images/tencel_lifestyle.png" alt="Tencel Nightwear Lifestyle" className="absolute inset-0 h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/20 to-transparent md:hidden" />
          </div>
        </div>
      </motion.section>

      {/* SECTION 5: Why Customers Love Us */}
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

      {/* SECTION 6: Reviews */}
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
                  <div className="text-[13px] text-dark/60 flex items-center gap-1.5 mt-0.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="flex items-center gap-1 font-medium">
                      Google Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 7: CTA Banner */}
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

