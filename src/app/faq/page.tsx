"use client";

import { Accordion, Breadcrumb, Reveal } from "@/components/UI";

export default function FAQ() {
  return (
    <Wrap title="FAQ" crumb="FAQ">
      <div className="max-w-3xl">
        <Accordion defaultOpen={0} items={[
          { title: "What is your return policy?", content: "Complimentary returns within seven days of delivery. Pieces must be unworn, unwashed, with original tags. Reverse pickup is free. Refunds are processed within five to seven business days." },
          { title: "How long does shipping take?", content: "Metros 2–4 business days. Pan India 3–6 business days. Complimentary shipping on orders over ₹999." },
          { title: "What is Tencel?", content: "Tencel™ Lyocell is a fibre spun from sustainably-grown eucalyptus. It is biodegradable, breathable, and approximately three times softer than standard cotton." },
          { title: "How do I find my size?", content: "Each piece has a detailed size guide on its page. Our pieces are cut to fit relaxed — if in doubt, size as you normally would." },
          { title: "Do you ship internationally?", content: "Currently we ship across India. International shipping launches in early 2026." },
          { title: "How do I care for my pieces?", content: "Machine wash cold with like colours. Line dry in shade. Warm iron only when needed. Do not bleach." },
        ]}/>
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
