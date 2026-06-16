"use client";
"use client";
import { useEffect, useState } from "react";
import { ALL_PRODUCTS, JOURNAL, GALLERY, PRODUCTS } from "@/data";
import { ProductCard, Reveal, RevealImage, SectionLabel } from "@/components/UI";
import { IconArrowRight, IconArrowDown } from "@/components/Icons";
import { navigate } from "@/store";

const HERO_IMG = "/hero_banner.png";

export default function Home() {
  return (
    <div>
      <Hero/>
      <CategoryNavigation/>
      <NewCollection/>
      <Women/>
      <Men/>
      <TencelStory/>
      <Featured/>
      <CampaignBanner/>
      <BestSellers/>
      <JournalSection/>
      <Gallery/>
    </div>
  );
}

/* ============================== CATEGORY NAVIGATION ============================== */
function CategoryNavigation() {
  const categories = [
    { name: "Women", desc: "Premium Loungewear & Night Suits", href: "/shop/women", img: "/women_banner.png" },
    { name: "Men", desc: "Quiet essentials & Pajamas", href: "/shop/men", img: "/men_banner.png" },
    { name: "Tencel", desc: "Organic eucalyptus softness", href: "/shop/tencel", img: "/lounge_set.png" },
    { name: "New Arrivals", desc: "The latest chapter in comfort", href: "/shop/new", img: "/hero_banner.png" }
  ];

  return (
    <section className="bg-bg py-20 lg:py-28 border-b border-[#ECECEC]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Reveal><SectionLabel num="— 01" label="Collections"/></Reveal>
        <Reveal delay={80}>
          <h2 className="editorial-h text-ink text-[40px] md:text-[60px] lg:text-[72px] mt-8 mb-12">
            Shop by <span className="serif-h">category.</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {categories.map((c, i) => (
            <a key={c.name} href={c.href} className="group block relative overflow-hidden bg-[#F1F5F9] aspect-[3/4]">
              <img 
                src={c.img} 
                alt={c.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent transition-opacity duration-500 group-hover:from-ink/80"/>
              <div className="absolute bottom-6 left-6 right-6 text-bg">
                <span className="text-[10px] tracking-[0.2em] uppercase opacity-75">{c.desc}</span>
                <h3 className="serif-h text-[24px] lg:text-[32px] leading-none mt-2">{c.name}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== HERO ============================== */
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden bg-ink">
      <img
        src={HERO_IMG}
        alt="Somnath NX Campaign"
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "scale(1)" : "scale(1.08)",
          transition: "opacity 1.6s ease-out, transform 2s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      {/* subtle vignette for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-ink/20"/>

      {/* Top label */}
      <div
        className="absolute top-[88px] lg:top-[110px] left-0 right-0 px-6 lg:px-12"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(12px)", transition: "all 1.2s ease-out 0.4s" }}
      >
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <span className="text-[11px] tracking-[0.22em] uppercase text-bg/85">SS / 26 Campaign</span>
          <span className="text-[11px] tracking-[0.22em] uppercase text-bg/85 hidden md:inline">Chapter 01</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 px-6 lg:px-12 pb-12 lg:pb-16">
        <div className="max-w-[1500px] mx-auto">
          <div
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end"
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(24px)", transition: "all 1.4s cubic-bezier(0.22,1,0.36,1) 0.7s" }}
          >
            <div className="lg:col-span-8">
              <p className="text-[11px] tracking-[0.28em] uppercase text-bg/85 mb-6 lg:mb-8">Somnath NX</p>
              <h1 className="editorial-h text-bg text-[44px] sm:text-[64px] md:text-[92px] lg:text-[128px]">
                Premium Nightwear<br/>
                <span className="serif-h">For Modern Living.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pl-8">
              <p className="text-[14px] lg:text-[15px] text-bg/85 leading-[1.7] max-w-sm mb-6">
                Crafted for comfort.<br/>Designed for everyday luxury.
              </p>
              <a href="/shop/women" className="btn-line text-bg" style={{ color: "#FAFAF7" }}>
                Shop Collection <IconArrowRight size={14}/>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-6 right-6 lg:right-12 text-bg/70"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 1.2s ease-out 1.2s" }}
      >
        <IconArrowDown size={16} className="animate-pulse"/>
      </div>
    </section>
  );
}

/* ============================== NEW COLLECTION (Split) ============================== */
function NewCollection() {
  return (
    <section className="bg-bg">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-24 lg:pt-40">
        <Reveal><SectionLabel num="— 02" label="New Arrivals"/></Reveal>
      </div>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-12 lg:mt-20 grid lg:grid-cols-12 gap-8 lg:gap-16 items-center pb-24 lg:pb-40">
        <div className="lg:col-span-7">
          <RevealImage src="/hero_banner.png" ratio="aspect-[4/5]"/>
        </div>
        <div className="lg:col-span-5 lg:pl-8">
          <Reveal delay={120}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Chapter One</p>
            <h2 className="editorial-h text-ink text-[44px] md:text-[64px] lg:text-[84px]">
              A study<br/>in stillness.
            </h2>
            <p className="mt-8 text-[15px] text-muted leading-[1.8] max-w-md">
              The new collection is built around two ideas — restraint and softness.
              Cut from natural fibres in our Mumbai atelier, each piece is finished by hand and
              made to be worn for years, not seasons.
            </p>
            <a href="/shop/new" className="mt-10 btn-line">
              Discover the Collection <IconArrowRight size={14}/>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================== WOMEN ============================== */
function Women() {
  return (
    <section className="bg-bg">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Reveal><SectionLabel num="— 03" label="Women"/></Reveal>
      </div>
      <div className="mt-12 lg:mt-16 relative">
        <RevealImage
          src="/women_banner.png"
          ratio="aspect-[16/10] md:aspect-[21/9]"
          className=""
        />
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-10 lg:mt-12 grid lg:grid-cols-12 gap-8 lg:gap-16 pb-24 lg:pb-40">
          <div className="lg:col-span-6">
            <Reveal>
              <h2 className="editorial-h text-ink text-[44px] md:text-[64px] lg:text-[80px]">
                <span className="serif-h">Women.</span><br/>
                The everyday wardrobe,<br/>reconsidered.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-6">
            <Reveal delay={140}>
              <p className="text-[15px] text-muted leading-[1.8]">
                Night suits, oversized silhouettes and wide-leg trousers — all engineered
                in Tencel, modal and breathable cotton-lyocell. Made to live in.
              </p>
              <a href="/shop/women" className="mt-8 btn-line">Shop Women <IconArrowRight size={14}/></a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== MEN (alternate) ============================== */
function Men() {
  return (
    <section className="bg-bg">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Reveal><SectionLabel num="— 04" label="Men"/></Reveal>
      </div>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-12 lg:mt-20 grid lg:grid-cols-12 gap-8 lg:gap-16 items-center pb-24 lg:pb-40">
        <div className="lg:col-span-5 lg:col-start-1 lg:order-1 order-2">
          <Reveal>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">04 — Men</p>
            <h2 className="editorial-h text-ink text-[44px] md:text-[64px] lg:text-[80px]">
              Quiet<br/><span className="serif-h">essentials.</span>
            </h2>
            <p className="mt-8 text-[15px] text-muted leading-[1.8] max-w-md">
              A small, considered collection. Full sets, capris and short pieces — built from soft cotton-lyocell
              and finished with mother-of-pearl buttons.
            </p>
            <a href="/shop/men" className="mt-10 btn-line">Shop Men <IconArrowRight size={14}/></a>
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:order-2 order-1">
          <RevealImage src="/men_banner.png" ratio="aspect-[4/5]"/>
        </div>
      </div>
    </section>
  );
}

/* ============================== TENCEL STORY ============================== */
function TencelStory() {
  const chapters = [
    { num: "01", t: "Breath", b: "Tencel breathes 50% more than cotton — measured, not claimed. The fibre opens with body heat and closes as you cool." },
    { num: "02", t: "Hand", b: "A close-set weave that's three times softer than standard cotton. The first wear feels like the fiftieth." },
    { num: "03", t: "Source", b: "Spun from the cellulose of sustainably-grown eucalyptus. Biodegradable, FSC-certified, complete." },
  ];
  return (
    <section className="bg-[#F1F5F9]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-40">
        <Reveal><SectionLabel num="— 05" label="Tencel Story"/></Reveal>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 mt-12 lg:mt-16 items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="editorial-h text-ink text-[44px] md:text-[72px] lg:text-[112px]">
                Not just fabric.<br/>
                <span className="serif-h">A better feeling.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={120}>
              <p className="text-[15px] text-muted leading-[1.8]">
                We spent eighteen months sourcing the right Tencel. What we found changed how we think about night fabric — completely.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Editorial paired images + chapter text */}
        <div className="mt-20 lg:mt-32 grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5">
            <RevealImage src="/tencel_full_suit.png" ratio="aspect-[3/4]"/>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-20 space-y-16">
            {chapters.map((c, i) => (
              <Reveal key={c.num} delay={i * 100}>
                <div className="grid grid-cols-[auto_1fr] gap-6 lg:gap-10">
                  <span className="section-num pt-1">{c.num}</span>
                  <div>
                    <h3 className="serif-h text-[28px] lg:text-[40px] text-ink mb-3">{c.t}</h3>
                    <p className="text-[15px] text-muted leading-[1.8] max-w-md">{c.b}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Second image */}
        <div className="mt-20 lg:mt-32 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 lg:col-start-2">
            <Reveal>
              <p className="serif-h text-[28px] lg:text-[40px] text-ink leading-[1.2] max-w-xl">
                "It is the closest thing to wearing nothing at all — without wearing nothing at all."
              </p>
              <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-muted">— Atelier Notes, Mumbai</p>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <RevealImage src="/lounge_set.png" ratio="aspect-[3/4]"/>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== FEATURED COLLECTION (Editorial composition) ============================== */
function Featured() {
  const a = PRODUCTS[0], b = PRODUCTS[1], c = PRODUCTS[2], d = PRODUCTS[3];
  return (
    <section className="bg-bg">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-24 lg:pt-40">
        <Reveal><SectionLabel num="— 06" label="Featured"/></Reveal>
        <div className="mt-10 lg:mt-12 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <h2 className="editorial-h text-ink text-[44px] md:text-[64px] lg:text-[80px]">
                Pieces in <span className="serif-h">rotation.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:pl-8">
            <Reveal delay={120}>
              <p className="text-[14px] text-muted leading-[1.8]">A selection from the season, chosen by our atelier — quiet wardrobe staples that last.</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Editorial grid — asymmetric */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-16 lg:mt-24 pb-24 lg:pb-40">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-16 lg:gap-y-24">
          {/* Large left */}
          <div className="lg:col-span-7">
            <a href={`/product/${a.id}`} className="block group">
              <RevealImage src={a.image} ratio="aspect-[4/5]"/>
              <div className="pt-6 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{a.category}</p>
                  <p className="text-[16px] mt-1.5">{a.name}</p>
                </div>
                <p className="text-[14px] tabular-nums">₹{a.price.toLocaleString("en-IN")}</p>
              </div>
            </a>
          </div>
          {/* Right column smaller, offset */}
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-32">
            <a href={`/product/${b.id}`} className="block group">
              <RevealImage src={b.image} ratio="aspect-[3/4]"/>
              <div className="pt-6 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{b.category}</p>
                  <p className="text-[16px] mt-1.5">{b.name}</p>
                </div>
                <p className="text-[14px] tabular-nums">₹{b.price.toLocaleString("en-IN")}</p>
              </div>
            </a>
          </div>
          {/* Lower row */}
          <div className="lg:col-span-4 lg:col-start-2 lg:pt-12">
            <a href={`/product/${c.id}`} className="block group">
              <RevealImage src={c.image} ratio="aspect-[3/4]"/>
              <div className="pt-6 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{c.category}</p>
                  <p className="text-[16px] mt-1.5">{c.name}</p>
                </div>
                <p className="text-[14px] tabular-nums">₹{c.price.toLocaleString("en-IN")}</p>
              </div>
            </a>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <a href={`/product/${d.id}`} className="block group">
              <RevealImage src={d.image} ratio="aspect-[4/5]"/>
              <div className="pt-6 flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{d.category}</p>
                  <p className="text-[16px] mt-1.5">{d.name}</p>
                </div>
                <p className="text-[14px] tabular-nums">₹{d.price.toLocaleString("en-IN")}</p>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-20 lg:mt-32 flex justify-center">
          <button onClick={() => navigate("/shop/women")} className="btn-line">
            View All Pieces <IconArrowRight size={14}/>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================== CAMPAIGN BANNER ============================== */
function CampaignBanner() {
  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-ink">
      <RevealImage
        src="/hero_banner.png"
        ratio="aspect-auto h-full"
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 to-ink/60"/>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <Reveal>
          <p className="text-[11px] tracking-[0.28em] uppercase text-bg/80 text-center mb-8">Campaign — Volume II</p>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="editorial-h text-bg text-[44px] md:text-[80px] lg:text-[128px] text-center max-w-5xl">
            Stillness, <span className="serif-h">considered.</span>
          </h2>
        </Reveal>
        <Reveal delay={300}>
          <a href="/shop/new" className="mt-10 btn-line text-bg" style={{ color: "#FAFAF7" }}>
            Explore <IconArrowRight size={14}/>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== BEST SELLERS ============================== */
function BestSellers() {
  const list = ALL_PRODUCTS.slice(0, 4);
  return (
    <section className="bg-bg">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-40">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16 lg:mb-20">
          <div className="lg:col-span-8">
            <Reveal><SectionLabel num="— 08" label="Best Sellers"/></Reveal>
            <Reveal delay={100}>
              <h2 className="editorial-h text-ink text-[44px] md:text-[64px] lg:text-[80px] mt-10">
                Most loved.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Reveal delay={200}>
              <a href="/shop/women" className="btn-line">All Best Sellers <IconArrowRight size={14}/></a>
            </Reveal>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-8 lg:gap-y-16">
          {list.map((p, i) => <ProductCard key={p.id} p={p} index={i}/>)}
        </div>
      </div>
    </section>
  );
}

/* ============================== JOURNAL ============================== */
function JournalSection() {
  return (
    <section className="bg-bg border-t border-[#ECECEC]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-40">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16 lg:mb-20">
          <div className="lg:col-span-8">
            <Reveal><SectionLabel num="— 09" label="Journal"/></Reveal>
            <Reveal delay={100}>
              <h2 className="editorial-h text-ink text-[44px] md:text-[64px] lg:text-[80px] mt-10">
                Notes from <span className="serif-h">the atelier.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Reveal delay={200}>
              <a href="/journal" className="btn-line">All Stories <IconArrowRight size={14}/></a>
            </Reveal>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-16">
          {/* Feature */}
          <a href={`/journal/${JOURNAL[0].id}`} className="lg:col-span-7 block group">
            <RevealImage src={JOURNAL[0].image} ratio="aspect-[4/5] lg:aspect-[5/6]"/>
            <div className="pt-6">
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{JOURNAL[0].category} — {JOURNAL[0].readTime}</p>
              <h3 className="serif-h text-[28px] lg:text-[44px] text-ink mt-3 leading-tight max-w-xl">{JOURNAL[0].title}</h3>
              <p className="mt-4 text-[15px] text-muted leading-[1.7] max-w-md">{JOURNAL[0].excerpt}</p>
            </div>
          </a>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-12 space-y-12">
            {JOURNAL.slice(1, 4).map((j, i) => (
              <a key={j.id} href={`/journal/${j.id}`} className="block group">
                <Reveal delay={i * 80}>
                  <div className="grid grid-cols-[120px_1fr] gap-5 items-start">
                    <div className="aspect-[3/4] overflow-hidden bg-[#F1F5F9]">
                      <img src={j.image} alt="" className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"/>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-muted">{j.category}</p>
                      <h4 className="serif-h text-[20px] text-ink mt-2 leading-tight">{j.title}</h4>
                      <p className="text-[11px] tracking-[0.12em] uppercase text-muted mt-3">{j.readTime}</p>
                    </div>
                  </div>
                </Reveal>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== GALLERY ============================== */
function Gallery() {
  return (
    <section className="bg-bg border-t border-[#ECECEC]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8">
            <Reveal><SectionLabel num="— 10" label="@somnathnx"/></Reveal>
            <Reveal delay={100}>
              <h2 className="editorial-h text-ink text-[36px] md:text-[56px] lg:text-[72px] mt-10">
                Worn at home.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Reveal delay={200}><a href="/" className="btn-line">@somnathnx <IconArrowRight size={14}/></a></Reveal>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {GALLERY.slice(0, 8).map((g, i) => (
            <a key={i} href="/" className="block relative overflow-hidden bg-[#F1F5F9] aspect-square group">
              <img src={g} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"/>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


