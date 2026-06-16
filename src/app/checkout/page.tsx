"use client";
"use client";
import { useState } from "react";
import { Breadcrumb } from "@/components/UI";
import { IconArrowRight, IconArrowLeft, IconCheck } from "@/components/Icons";
import { navigate, useStore } from "@/store";

const STEPS = ["Contact", "Shipping", "Payment"];

export default function Checkout() {
  const { cart, clearCart } = useStore();
  const [step, setStep] = useState(0);

  const subtotal = cart.reduce((a, b) => a + b.product.price * b.qty, 0);
  const shipping = subtotal > 999 ? 0 : 79;
  const total = subtotal + shipping;

  const place = () => {
    const id = "SN" + Math.floor(100000 + Math.random() * 900000);
    clearCart();
    navigate(`/order-success?id=${id}`);
  };

  return (
    <div className="page-enter pt-24 lg:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/cart" }, { label: "Checkout" }]}/>

        <div className="mt-10 lg:mt-16 grid lg:grid-cols-12 gap-8 items-end pb-10 border-b border-[#ECECEC]">
          <div className="lg:col-span-8">
            <h1 className="editorial-h text-ink text-[40px] md:text-[64px] lg:text-[88px]">Checkout.</h1>
          </div>
          <div className="lg:col-span-4">
            {/* Stepper */}
            <div className="flex items-center gap-6">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className={`text-[11px] tracking-[0.22em] uppercase ${i === step ? "text-ink" : i < step ? "text-muted" : "text-muted/50"}`}>
                    0{i + 1} {s}
                  </span>
                  {i < STEPS.length - 1 && <span className={`h-px w-6 ${i < step ? "bg-ink" : "bg-[#ECECEC]"}`}/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-12 lg:mt-16 grid lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Left — Steps */}
        <div className="lg:col-span-7 space-y-12">
          {step === 0 && <ContactStep next={() => setStep(1)}/>}
          {step === 1 && <ShippingStep next={() => setStep(2)} back={() => setStep(0)}/>}
          {step === 2 && <PaymentStep back={() => setStep(1)} place={place}/>}
        </div>

        {/* Right — Summary */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-32 space-y-6">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Order</p>
            <div className="space-y-5 max-h-[280px] overflow-y-auto pr-2 no-scrollbar">
              {cart.map((c, i) => (
                <div key={i} className="flex gap-4 pb-5 border-b border-[#ECECEC] last:border-0">
                  <img src={c.product.image} alt="" className="h-20 w-16 object-cover bg-[#EFEDE7]"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{c.product.collection}</p>
                    <p className="text-[14px] mt-1 line-clamp-1">{c.product.name}</p>
                    <p className="text-[11px] text-muted mt-1">Size {c.size} — Qty {c.qty}</p>
                  </div>
                  <span className="text-[14px] tabular-nums">₹{(c.product.price * c.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="border-y border-[#ECECEC] py-5 space-y-3 text-[14px]">
              <Row l="Subtotal" v={`₹${subtotal.toLocaleString("en-IN")}`}/>
              <Row l="Shipping" v={shipping === 0 ? "Complimentary" : `₹${shipping}`}/>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-[0.22em] uppercase">Total</span>
              <span className="text-[22px] tabular-nums font-display font-light">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex items-baseline justify-between"><span className="text-muted">{l}</span><span className="tabular-nums">{v}</span></div>;
}

function ContactStep({ next }: { next: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">01 — Contact</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
          <Field label="Full Name" placeholder="Aanya Verma" required/>
          <Field label="Email" type="email" placeholder="you@email.com" required/>
          <Field label="Phone" placeholder="+91" required/>
          <Field label="Date of Birth" placeholder="DD / MM / YYYY"/>
        </div>
        <label className="mt-6 flex items-center gap-3 text-[13px] text-muted">
          <input type="checkbox" defaultChecked className="accent-accent"/> Email me about new arrivals and stories
        </label>
      </div>
      <div className="pt-6 border-t border-[#ECECEC] flex items-center justify-between">
        <a href="/cart" className="btn-line">Back to Bag</a>
        <button className="btn-fill">Continue <IconArrowRight size={14}/></button>
      </div>
    </form>
  );
}

function ShippingStep({ next, back }: { next: () => void; back: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">02 — Shipping Address</p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
          <Field label="Address Line 1" placeholder="Flat 12B, Wing A" required className="sm:col-span-2"/>
          <Field label="Address Line 2" placeholder="Hiranandani Gardens" className="sm:col-span-2"/>
          <Field label="City" placeholder="Mumbai" required/>
          <Field label="State" placeholder="Maharashtra" required/>
          <Field label="Pincode" placeholder="400001" required/>
          <Field label="Country" placeholder="India" required/>
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Delivery</p>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-5 border border-ink cursor-pointer">
            <div>
              <p className="text-[14px]">Standard Delivery</p>
              <p className="text-[12px] text-muted mt-1">2–4 business days</p>
            </div>
            <span className="text-[14px] tabular-nums">Complimentary</span>
          </label>
          <label className="flex items-center justify-between p-5 border border-[#ECECEC] cursor-pointer hover:border-ink transition">
            <div>
              <p className="text-[14px]">Express Delivery</p>
              <p className="text-[12px] text-muted mt-1">Next-day metros</p>
            </div>
            <span className="text-[14px] tabular-nums">₹199</span>
          </label>
        </div>
      </div>
      <div className="pt-6 border-t border-[#ECECEC] flex items-center justify-between">
        <button type="button" onClick={back} className="btn-line"><IconArrowLeft size={14}/> Back</button>
        <button className="btn-fill">Continue <IconArrowRight size={14}/></button>
      </div>
    </form>
  );
}

function PaymentStep({ back, place }: { back: () => void; place: () => void }) {
  const [pay, setPay] = useState("upi");
  const opts = [
    { id: "upi", t: "UPI", s: "GPay · PhonePe · Paytm" },
    { id: "card", t: "Card", s: "Visa · Mastercard · AmEx · RuPay" },
    { id: "nb", t: "Net Banking", s: "All Indian banks" },
    { id: "cod", t: "Cash on Delivery", s: "Pay when it arrives — ₹49 fee" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">03 — Payment</p>
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o.id} className={`flex items-center justify-between p-5 border cursor-pointer transition ${pay === o.id ? "border-ink" : "border-[#ECECEC] hover:border-ink"}`}>
              <div className="flex items-center gap-4">
                <span className={`h-4 w-4 rounded-full border grid place-items-center ${pay === o.id ? "border-ink" : "border-[#D1D1CE]"}`}>
                  {pay === o.id && <span className="h-2 w-2 rounded-full bg-ink"/>}
                </span>
                <div>
                  <p className="text-[14px]">{o.t}</p>
                  <p className="text-[12px] text-muted mt-1">{o.s}</p>
                </div>
              </div>
              <input type="radio" checked={pay === o.id} onChange={() => setPay(o.id)} className="sr-only"/>
            </label>
          ))}
        </div>
        {pay === "upi" && (
          <div className="mt-6">
            <Field label="UPI ID" placeholder="name@bank"/>
          </div>
        )}
        {pay === "card" && (
          <div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-6">
            <Field label="Card Number" placeholder="•••• •••• •••• ••••" className="sm:col-span-2"/>
            <Field label="Name on Card" placeholder="Aanya Verma"/>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" placeholder="MM / YY"/>
              <Field label="CVV" placeholder="•••"/>
            </div>
          </div>
        )}
      </div>
      <div className="text-[12px] text-muted inline-flex items-center gap-2"><IconCheck size={14}/> Secure SSL — Powered by Razorpay</div>
      <div className="pt-6 border-t border-[#ECECEC] flex items-center justify-between">
        <button onClick={back} className="btn-line"><IconArrowLeft size={14}/> Back</button>
        <button onClick={place} className="btn-fill">Place Order <IconArrowRight size={14}/></button>
      </div>
    </div>
  );
}

function Field({ label, className, ...rest }: any) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted">{label}</span>
      <input {...rest} className="mt-2 w-full bg-transparent border-b border-[#ECECEC] focus:border-ink py-2.5 outline-none text-[14px] transition placeholder:text-muted/60"/>
    </label>
  );
}


