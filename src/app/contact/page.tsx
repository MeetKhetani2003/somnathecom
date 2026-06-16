"use client";

import { Breadcrumb, Reveal, RevealImage } from "@/components/UI";
import { IconArrowRight } from "@/components/Icons";

export default function Contact() {
  return (
    <div className="page-enter pt-24 lg:pt-32">
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]}/>
        <div className="mt-12 lg:mt-20">
          <Reveal>
            <h1 className="editorial-h text-ink text-[56px] md:text-[88px] lg:text-[120px]">
              Say hello.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="serif-h text-[22px] lg:text-[28px] text-muted mt-8 max-w-2xl leading-[1.4]">
              Our team responds within twenty-four hours, six days a week.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-24 lg:pb-40 grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5 space-y-12">
          <Reveal>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Atelier</p>
            <p className="serif-h text-[26px] lg:text-[32px] mt-3 leading-[1.3]">
              Andheri West<br/>Mumbai, 400053<br/>India
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Care</p>
            <p className="serif-h text-[22px] lg:text-[26px] mt-3 leading-[1.3]">
              care@somnathnx.com<br/>+91 98765 43210
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">WhatsApp</p>
            <a href="#" className="serif-h text-[22px] lg:text-[26px] mt-3 leading-[1.3] block link-underline">
              Message us
            </a>
          </Reveal>
        </div>
        <form className="lg:col-span-6 lg:col-start-7 space-y-8" onSubmit={(e) => e.preventDefault()}>
          <Reveal><p className="text-[11px] tracking-[0.22em] uppercase text-muted">Send a Note</p></Reveal>
          <Reveal delay={100}>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
              <FormField label="Name"/>
              <FormField label="Email" type="email"/>
              <FormField label="Subject" className="sm:col-span-2"/>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <label className="block">
              <span className="text-[11px] tracking-[0.18em] uppercase text-muted">Message</span>
              <textarea rows={5} className="mt-2 w-full bg-transparent border-b border-[#ECECEC] focus:border-ink py-2.5 outline-none text-[14px] resize-none transition"/>
            </label>
            <button className="mt-10 btn-fill">Send Message <IconArrowRight size={14}/></button>
          </Reveal>
        </form>
      </section>
    </div>
  );
}

function FormField({ label, className, ...rest }: any) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted">{label}</span>
      <input {...rest} className="mt-2 w-full bg-transparent border-b border-[#ECECEC] focus:border-ink py-2.5 outline-none text-[14px] transition"/>
    </label>
  );
}
