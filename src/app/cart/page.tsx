"use client";
"use client";
import { useState } from "react";
import { Breadcrumb, Reveal } from "@/components/UI";
import { IconArrowRight, IconPlus, IconMinus, IconX } from "@/components/Icons";
import { navigate, useStore } from "@/store";

export default function Cart() {
  const { cart, removeFromCart, setQty } = useStore();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);

  const subtotal = cart.reduce((a, b) => a + b.product.price * b.qty, 0);
  const couponDisc = applied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal - couponDisc + shipping;

  if (cart.length === 0) return <EmptyCart/>;

  return (
    <div className="page-enter pt-24 lg:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag" }]}/>
        <div className="mt-10 lg:mt-16 grid lg:grid-cols-12 gap-8 items-end pb-12 lg:pb-16 border-b border-[#ECECEC]">
          <div className="lg:col-span-8">
            <h1 className="editorial-h text-ink text-[48px] md:text-[80px] lg:text-[112px]">Bag.</h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{cart.length} {cart.length === 1 ? "Item" : "Items"}</p>
          </div>
        </div>
      </div>

      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-10 lg:mt-16 grid lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Items */}
        <div className="lg:col-span-7 space-y-10 lg:space-y-12">
          {cart.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] gap-5 md:gap-8 pb-10 border-b border-[#ECECEC]">
                <a href={`#/product/${item.product.id}`} className="block aspect-[3/4] overflow-hidden bg-[#EFEDE7]">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-[1400ms] ease-out"/>
                </a>
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] tracking-[0.18em] uppercase text-muted">{item.product.collection}</p>
                      <a href={`#/product/${item.product.id}`} className="text-[16px] mt-1 block">{item.product.name}</a>
                      <p className="text-[13px] text-muted mt-2">Size {item.size} — {item.product.colors[0].name}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id, item.size)} className="text-muted hover:text-ink transition" aria-label="Remove"><IconX size={16}/></button>
                  </div>
                  <div className="mt-auto pt-6 flex items-end justify-between">
                    <div className="inline-flex items-center border border-[#ECECEC]">
                      <button onClick={() => setQty(item.product.id, item.size, item.qty - 1)} className="h-10 w-10 grid place-items-center hover:bg-[#F3F1EA]"><IconMinus size={12}/></button>
                      <span className="w-9 text-center text-[13px] tabular-nums">{item.qty}</span>
                      <button onClick={() => setQty(item.product.id, item.size, item.qty + 1)} className="h-10 w-10 grid place-items-center hover:bg-[#F3F1EA]"><IconPlus size={12}/></button>
                    </div>
                    <p className="text-[15px] tabular-nums">₹{(item.product.price * item.qty).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-32 space-y-8">
            <Reveal>
              <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">Order Summary</p>
              <div className="border-y border-[#ECECEC] py-6 space-y-3 text-[14px]">
                <Row l="Subtotal" v={`₹${subtotal.toLocaleString("en-IN")}`}/>
                <Row l="Shipping" v={shipping === 0 ? "Complimentary" : `₹${shipping}`}/>
                {couponDisc > 0 && <Row l="Coupon" v={`- ₹${couponDisc.toLocaleString("en-IN")}`}/>}
              </div>
              <div className="py-6 flex items-baseline justify-between border-b border-[#ECECEC]">
                <span className="text-[11px] tracking-[0.22em] uppercase">Total</span>
                <span className="text-[24px] tabular-nums font-display font-light">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[11px] text-muted mt-3 tracking-[0.06em]">Inclusive of all taxes</p>
            </Reveal>

            <Reveal delay={120}>
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-3">Promo Code</p>
                <div className="flex items-center border-b border-ink">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter code" className="flex-1 bg-transparent outline-none py-3 text-[14px] placeholder:text-muted"/>
                  <button onClick={() => setApplied(true)} className="text-[11px] tracking-[0.22em] uppercase py-2 hover:text-accent transition">Apply</button>
                </div>
                {applied && <p className="text-[11px] tracking-[0.12em] text-accent mt-2 uppercase">— 10% applied</p>}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <button onClick={() => navigate("/checkout")} className="btn-fill w-full">
                Checkout <IconArrowRight size={14}/>
              </button>
              <p className="mt-4 text-[11px] text-muted text-center tracking-[0.08em]">Secure checkout — Razorpay</p>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex items-baseline justify-between"><span className="text-muted">{l}</span><span className="tabular-nums">{v}</span></div>;
}

function EmptyCart() {
  return (
    <div className="page-enter pt-32 pb-24 max-w-[1500px] mx-auto px-6 lg:px-12">
      <div className="max-w-md mx-auto py-32 text-center">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Empty</p>
        <h1 className="editorial-h text-ink text-[48px] mt-6">Your bag is empty.</h1>
        <p className="text-[14px] text-muted mt-4">Nothing has been added yet.</p>
        <button onClick={() => navigate("/shop/women")} className="mt-10 btn-line">
          Begin Shopping <IconArrowRight size={14}/>
        </button>
      </div>
    </div>
  );
}


