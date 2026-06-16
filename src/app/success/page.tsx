"use client";
"use client";
import { Reveal } from "@/components/UI";
import { IconArrowRight } from "@/components/Icons";
import { navigate } from "@/store";

import { useEffect, useState } from "react";

export default function OrderSuccess() {
  const [id, setId] = useState("SN847291");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlId = searchParams.get("id");
      if (urlId) setId(urlId);
    }
  }, []);

  return (
    <div className="page-enter pt-32 pb-32 min-h-screen bg-bg">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-[11px] tracking-[0.28em] uppercase text-muted">— Order Confirmed</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="editorial-h text-ink text-[56px] md:text-[88px] lg:text-[112px] mt-8">
              Thank you.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="serif-h text-[24px] lg:text-[36px] text-muted mt-6 leading-[1.3] max-w-xl">
              Your order is being prepared in our atelier and will be on its way shortly.
            </p>
          </Reveal>
        </div>

        {/* Order detail strip */}
        <div className="mt-16 lg:mt-24 grid lg:grid-cols-4 gap-8 lg:gap-12 pt-10 border-t border-[#ECECEC]">
          {[
            ["Order Number", `#${id}`],
            ["Estimated Delivery", "Wed, 18 Nov"],
            ["Items", "3"],
            ["Payment", "UPI"],
          ].map(([k, v], i) => (
            <Reveal key={k} delay={i * 80}>
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{k}</p>
              <p className="serif-h text-[24px] text-ink mt-3">{v}</p>
            </Reveal>
          ))}
        </div>

        {/* Tracker */}
        <div className="mt-16 lg:mt-24">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Tracking</p>
          <div className="grid grid-cols-4 gap-3">
            {["Confirmed","Packed","Shipped","Delivered"].map((s, i) => (
              <div key={s}>
                <div className={`h-px ${i === 0 ? "bg-ink" : "bg-[#ECECEC]"}`}/>
                <p className={`mt-3 text-[11px] tracking-[0.18em] uppercase ${i === 0 ? "text-ink" : "text-muted"}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col sm:flex-row gap-6">
          <button onClick={() => navigate("/account")} className="btn-fill">Track Your Order <IconArrowRight size={14}/></button>
          <button onClick={() => navigate("/")} className="btn-line">Continue Browsing</button>
        </div>
      </div>
    </div>
  );
}


