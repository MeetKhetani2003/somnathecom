"use client";

import { Breadcrumb, Reveal, RevealImage, SectionLabel } from "@/components/UI";
import { IconArrowRight } from "@/components/Icons";

export default function About() {
  return (
    <div className="page-enter pt-24 lg:pt-32">
      {/* Hero */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-24 lg:pb-32">
        <Reveal><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]}/></Reveal>
        <div className="mt-12 lg:mt-20 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-10">
            <Reveal delay={100}>
              <h1 className="editorial-h text-ink text-[56px] md:text-[96px] lg:text-[160px]">
                A house built<br/>around <span className="serif-h">stillness.</span>
              </h1>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Massive image */}
      <RevealImage
        src="https://images.pexels.com/photos/3992002/pexels-photo-3992002.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=2400"
        ratio="aspect-[21/9]"
        priority
      />

      {/* Story */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-40 grid lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal><SectionLabel num="— 01" label="Origin"/></Reveal>
        </div>
        <div className="lg:col-span-7 lg:col-start-6 space-y-8">
          <Reveal>
            <p className="serif-h text-[32px] lg:text-[48px] text-ink leading-[1.2]">
              Somnath NX was founded in Mumbai in 2020 around a simple belief — that the eight
              hours you spend at home deserve fabric you cannot forget.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-[15px] text-muted leading-[1.9] max-w-xl">
              Our pieces are built slowly. Cut and stitched in our own atelier. Finished with
              hardware sourced from craftsmen in Jaipur. We design for permanence — not seasons.
              Every Somnath NX piece is made to outlast its trend.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Editorial split — Factory */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-24 lg:pb-40 grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        <div className="lg:col-span-7 lg:order-1 order-2">
          <RevealImage src="https://images.pexels.com/photos/4814062/pexels-photo-4814062.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1300&w=1600" ratio="aspect-[5/4]"/>
        </div>
        <div className="lg:col-span-5 lg:order-2 order-1 lg:pl-8">
          <Reveal><SectionLabel num="— 02" label="Atelier"/></Reveal>
          <Reveal delay={120}>
            <h2 className="editorial-h text-ink text-[40px] lg:text-[64px] mt-10">
              Made by hand,<br/><span className="serif-h">in Mumbai.</span>
            </h2>
            <p className="mt-8 text-[15px] text-muted leading-[1.9] max-w-md">
              Our pieces are produced in a small atelier in Andheri. Eighteen tailors. One pattern-master.
              No mass production. Every garment is checked twice before it leaves us.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-[#F1F5F9]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-40 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 lg:col-start-2">
            <Reveal>
              <p className="serif-h text-[36px] md:text-[56px] lg:text-[80px] text-ink leading-[1.15]">
                "We don't design for the moment.<br/>We design for the years after."
              </p>
              <p className="mt-10 text-[11px] tracking-[0.22em] uppercase text-muted">— Founder, Somnath NX</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Fabric */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-40 grid lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal><SectionLabel num="— 03" label="Materials"/></Reveal>
          <Reveal delay={100}>
            <h2 className="editorial-h text-ink text-[40px] lg:text-[64px] mt-10">
              Two fibres.<br/><span className="serif-h">Considered.</span>
            </h2>
            <p className="mt-8 text-[15px] text-muted leading-[1.9] max-w-md">
              We work primarily in Tencel™ Lyocell and a custom modal blend.
              Both are biodegradable, sustainably-sourced, and selected for the way they
              feel on skin after fifty washes.
            </p>
            <a href="/shop/tencel" className="mt-10 btn-line">Discover Tencel <IconArrowRight size={14}/></a>
          </Reveal>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-2 gap-4">
          <RevealImage src="https://images.pexels.com/photos/7087669/pexels-photo-7087669.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=900" ratio="aspect-[3/4]"/>
          <RevealImage src="https://images.pexels.com/photos/4814062/pexels-photo-4814062.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=900" ratio="aspect-[3/4]" className="mt-12"/>
        </div>
      </section>
    </div>
  );
}
