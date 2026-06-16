"use client";

import { Breadcrumb, Reveal, RevealImage } from "@/components/UI";
import { IconArrowRight } from "@/components/Icons";
import { JOURNAL } from "@/data";

export default function Journal() {
  return (
    <div className="page-enter pt-24 lg:pt-32">
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Journal" }]}/>
        <div className="mt-12 lg:mt-20">
          <Reveal>
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted">— Issue No. 04</p>
            <h1 className="editorial-h text-ink text-[56px] md:text-[88px] lg:text-[140px] mt-8">
              Journal.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Feature */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-20 lg:pb-32">
        <a href={`/journal/${JOURNAL[0].id}`} className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end group">
          <div className="lg:col-span-7">
            <RevealImage src={JOURNAL[0].image} ratio="aspect-[4/5]"/>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{JOURNAL[0].category} — {JOURNAL[0].readTime}</p>
              <h2 className="serif-h text-[40px] lg:text-[64px] text-ink mt-5 leading-[1.1]">{JOURNAL[0].title}</h2>
              <p className="mt-6 text-[16px] text-muted leading-[1.8] max-w-md">{JOURNAL[0].excerpt}</p>
              <span className="mt-10 btn-line">Read Story <IconArrowRight size={14}/></span>
            </Reveal>
          </div>
        </a>
      </section>

      {/* Magazine grid */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-16 lg:py-24 border-t border-[#ECECEC]">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-16">
          {JOURNAL.slice(1).map((j, i) => (
            <a key={j.id} href={`/journal/${j.id}`} className={`block group ${i === 0 ? "lg:col-span-5" : i === 1 ? "lg:col-span-4" : "lg:col-span-3"}`}>
              <RevealImage src={j.image} ratio={i === 2 ? "aspect-[3/4]" : "aspect-[4/5]"}/>
              <div className="pt-5">
                <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{j.category}</p>
                <h3 className="serif-h text-[22px] lg:text-[28px] text-ink mt-2 leading-tight">{j.title}</h3>
                <p className="text-[11px] tracking-[0.12em] uppercase text-muted mt-4">{j.readTime}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
