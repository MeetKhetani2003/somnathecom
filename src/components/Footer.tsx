"use client";
"use client";
"use client";
import Logo from "./Logo";
import { IconArrowRight, IconInstagram } from "./Icons";

export default function Footer() {
  return (
    <footer className="bg-bg border-t border-[#ECECEC]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-24 lg:pt-32 pb-10">
        {/* Top: oversized statement + newsletter */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 pb-20 border-b border-[#ECECEC]">
          <div className="lg:col-span-7">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Mailing List</p>
            <h2 className="editorial-h text-[44px] md:text-[72px] lg:text-[96px] text-ink">
              Considered<br/>
              correspondence.
            </h2>
          </div>
          <div className="lg:col-span-5 flex items-end">
            <form onSubmit={(e) => e.preventDefault()} className="w-full">
              <label className="block text-[11px] tracking-[0.22em] uppercase text-muted mb-3">Email Address</label>
              <div className="flex items-center border-b border-ink">
                <input type="email" placeholder="you@email.com" className="flex-1 bg-transparent outline-none py-3 text-[15px] placeholder:text-muted"/>
                <button type="submit" aria-label="Subscribe" className="p-2 hover:text-accent transition-colors">
                  <IconArrowRight size={18}/>
                </button>
              </div>
              <p className="mt-3 text-[11px] tracking-[0.08em] text-muted">By subscribing, you agree to our <a className="link-underline" href="/privacy">Privacy Policy</a>.</p>
            </form>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 py-16">
          <div className="col-span-2">
            <Logo className="text-[16px]"/>
            <p className="mt-6 max-w-xs text-[13px] leading-[1.7] text-muted">
              Premium nightwear and loungewear, considered for modern living. Designed in Mumbai.
            </p>
          </div>
          <FCol title="Shop" links={[
            ["Women", "/shop/women"], ["Men", "/shop/men"], ["Tencel", "/shop/tencel"], ["New Arrivals", "/shop/new"],
          ]}/>
          <FCol title="House" links={[
            ["About", "/about"], ["Journal", "/journal"], ["Contact", "/contact"], ["Stores", "/contact"],
          ]}/>
          <FCol title="Service" links={[
            ["Shipping", "/shipping"], ["Returns", "/returns"], ["FAQ", "/faq"], ["Privacy", "/privacy"],
          ]}/>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#ECECEC] pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">© {new Date().getFullYear()} Somnath NX · Mumbai</p>
          <div className="flex items-center gap-6">
            <a href="/" className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors inline-flex items-center gap-2">
              <IconInstagram size={14}/> Instagram
            </a>
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted">EN — INR ₹</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-5">{title}</p>
      <ul className="space-y-3">
        {links.map(([l, h]) => (
          <li key={l}><a href={h} className="text-[14px] hover:text-accent transition-colors">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}



