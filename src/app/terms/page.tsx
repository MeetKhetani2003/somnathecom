"use client";

import { Breadcrumb, Reveal } from "@/components/UI";

export default function TermsOfService() {
  return (
    <Wrap title="Terms of Service" crumb="Terms of Service">
      <div className="max-w-3xl space-y-12">
        <Reveal>
          <p className="serif-h text-[24px] lg:text-[32px] text-ink leading-[1.4]">
            By using somnathnx.com you agree to our terms of use, pricing, and dispute resolution policies. Please read each section carefully for full details.
          </p>
        </Reveal>
        <div className="space-y-8 pt-8 border-t border-[#ECECEC]">
          {["Eligibility","Coverage","Process","Exceptions","Contact"].map((s, i) => (
            <Reveal key={s} delay={i * 60}>
              <div className="grid grid-cols-[60px_1fr] gap-6 pb-8 border-b border-[#ECECEC] last:border-0">
                <span className="section-num pt-1">0{i + 1}</span>
                <div>
                  <h3 className="text-[15px] tracking-[0.04em] uppercase">{s}</h3>
                  <p className="mt-3 text-[14px] text-muted leading-[1.8]">
                    Pieces remain eligible for exchange or return within the stated window. Our team will review each request individually to ensure fairness.
                    Please reach out to care@somnathnx.com for special cases.
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

function Wrap({ title, crumb, children }: { title: string; crumb: string; children: any }) {
  return (
    <div className="page-enter pt-24 lg:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: crumb }]}/>
        <div className="mt-12 lg:mt-20 mb-20 lg:mb-24">
          <Reveal>
            <h1 className="editorial-h text-ink text-[56px] md:text-[88px] lg:text-[120px]">{title}.</h1>
          </Reveal>
        </div>
        {children}
      </div>
    </div>
  );
}
