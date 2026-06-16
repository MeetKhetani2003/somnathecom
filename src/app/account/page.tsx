"use client";
"use client";
import { useState } from "react";
import { ALL_PRODUCTS } from "@/data";
import { Breadcrumb, ProductCard, Reveal } from "@/components/UI";
import { IconGoogle, IconArrowRight, IconLogout } from "@/components/Icons";
import { navigate, useStore } from "@/store";

const TABS = ["Overview", "Orders", "Wishlist", "Addresses", "Returns", "Profile"];

export default function Account() {
  const { user, login, logout, wishlist } = useStore();
  const [tab, setTab] = useState(0);

  if (!user) return <SignIn login={login}/>;

  return (
    <div className="page-enter pt-24 lg:pt-32 pb-24">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Account" }]}/>
        <div className="mt-10 lg:mt-16 grid lg:grid-cols-12 gap-8 items-end pb-12 lg:pb-16 border-b border-[#ECECEC]">
          <div className="lg:col-span-8">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-4">— Member since 2025</p>
            <h1 className="editorial-h text-ink text-[40px] md:text-[64px] lg:text-[88px]">Hello, {user.name.split(" ")[0]}.</h1>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <button onClick={logout} className="text-[11px] tracking-[0.22em] uppercase inline-flex items-center gap-3 hover:text-accent transition">
              Sign Out <IconLogout size={14}/>
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-10 lg:mt-16 grid lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="space-y-1">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`block w-full text-left py-3 text-[12px] tracking-[0.22em] uppercase border-b border-[#ECECEC] transition-colors ${tab === i ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {t}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9">
          {tab === 0 && <Overview wishlistCount={wishlist.length} user={user}/>}
          {tab === 1 && <Orders/>}
          {tab === 2 && <Wishlist/>}
          {tab === 3 && <Addresses/>}
          {tab === 4 && <Returns/>}
          {tab === 5 && <Profile user={user}/>}
        </div>
      </section>
    </div>
  );
}

function SignIn({ login }: { login: () => void }) {
  return (
    <div className="page-enter pt-32 pb-32 min-h-[80vh]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-muted">— Account</p>
          <h1 className="editorial-h text-ink text-[48px] md:text-[80px] mt-8">
            Sign in.<br/>
            <span className="serif-h">Or join us.</span>
          </h1>
          <p className="mt-8 serif-h text-[20px] lg:text-[24px] text-muted leading-[1.5] max-w-md">
            Track orders, save pieces, and receive considered correspondence from the atelier.
          </p>
          <button onClick={login} className="mt-12 inline-flex items-center justify-center gap-4 px-8 py-4 border border-ink hover:bg-ink hover:text-bg transition-colors">
            <IconGoogle size={18}/>
            <span className="text-[12px] tracking-[0.22em] uppercase">Continue with Google</span>
          </button>
          <p className="mt-6 text-[11px] tracking-[0.12em] uppercase text-muted max-w-sm">
            One-click sign in · Auto registration · By continuing you agree to our <a href="/terms" className="link-underline">Terms</a> & <a href="/privacy" className="link-underline">Privacy</a>
          </p>
        </div>
        <div className="hidden lg:block">
          <img src="/hero_banner.png" alt="" className="aspect-[3/4] object-cover w-full"/>
        </div>
      </div>
    </div>
  );
}

function Overview({ wishlistCount, user }: { wishlistCount: number; user: { name: string; email: string } }) {
  return (
    <div className="space-y-12">
      <Reveal>
        <p className="serif-h text-[28px] lg:text-[40px] text-ink leading-[1.3] max-w-2xl">
          Welcome back, {user.name.split(" ")[0]}. You have 2 orders in transit and {wishlistCount} pieces saved.
        </p>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-[#ECECEC]">
        {[
          ["Total Orders", "08"],
          ["Saved Pieces", String(wishlistCount).padStart(2, "0")],
          ["Member Tier", "Atelier"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{k}</p>
            <p className="serif-h text-[40px] lg:text-[56px] text-ink mt-3">{v}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Recent Orders</p>
        <Orders compact/>
      </div>
    </div>
  );
}

const ORDERS = [
  { id: "SN847291", date: "12 Nov 2025", status: "Delivered", total: 4900, items: 2 },
  { id: "SN846102", date: "02 Nov 2025", status: "In Transit", total: 6200, items: 1 },
  { id: "SN844710", date: "21 Oct 2025", status: "Delivered", total: 3400, items: 1 },
];

function Orders({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "space-y-2"}>
      <div className="border-t border-[#ECECEC]">
        {(compact ? ORDERS : ORDERS).map((o) => (
          <div key={o.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 py-6 border-b border-[#ECECEC] items-center">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Order</p>
              <p className="text-[14px] mt-1 tabular-nums">#{o.id}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Date</p>
              <p className="text-[14px] mt-1">{o.date}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Items</p>
              <p className="text-[14px] mt-1">{o.items}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">Status</p>
              <p className={`text-[14px] mt-1 ${o.status === "In Transit" ? "text-accent" : ""}`}>{o.status}</p>
            </div>
            <div className="md:text-right col-span-2 md:col-span-1">
              <p className="text-[14px] tabular-nums">₹{o.total.toLocaleString("en-IN")}</p>
              <a href="/" className="text-[11px] tracking-[0.22em] uppercase link-underline mt-2 inline-block">View</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Wishlist() {
  const { wishlist } = useStore();
  const list = ALL_PRODUCTS.filter((p) => wishlist.includes(p.id));
  if (list.length === 0) return (
    <div className="py-20 text-center">
      <p className="serif-h text-[32px] text-ink">Your wishlist is empty.</p>
      <button onClick={() => navigate("/shop/women")} className="mt-8 btn-line">Discover Pieces <IconArrowRight size={14}/></button>
    </div>
  );
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
      {list.map((p, i) => <ProductCard key={p.id} p={p} index={i}/>)}
    </div>
  );
}

function Addresses() {
  const adds = [
    { name: "Home", line: "Flat 12B, Wing A, Hiranandani Gardens, Powai", city: "Mumbai, MH 400076", def: true },
    { name: "Studio", line: "WeWork BKC, G Block, Bandra Kurla Complex", city: "Mumbai, MH 400051", def: false },
  ];
  return (
    <div className="space-y-2">
      {adds.map((a) => (
        <div key={a.name} className="border-y border-[#ECECEC] py-6 grid md:grid-cols-3 gap-4 items-start">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{a.name} {a.def && "— Default"}</p>
          </div>
          <p className="text-[14px] text-ink leading-[1.7] md:col-span-1">{a.line}<br/>{a.city}</p>
          <div className="md:text-right space-x-4">
            <button className="text-[11px] tracking-[0.22em] uppercase link-underline">Edit</button>
            <button className="text-[11px] tracking-[0.22em] uppercase link-underline text-muted">Remove</button>
          </div>
        </div>
      ))}
      <button className="w-full py-8 border border-dashed border-[#D1D1CE] text-[11px] tracking-[0.22em] uppercase text-muted hover:text-ink hover:border-ink transition">
        + Add Address
      </button>
    </div>
  );
}

function Returns() {
  return (
    <div className="space-y-12">
      <Reveal>
        <p className="serif-h text-[28px] lg:text-[40px] text-ink leading-[1.3] max-w-2xl">
          Free returns and exchanges within seven days of delivery.
        </p>
      </Reveal>
      <div className="border-t border-[#ECECEC] py-6 grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">RR48201</p>
          <p className="text-[15px] mt-2">Tencel Full Night Suit — Size L</p>
          <p className="text-[12px] text-muted mt-1">Refund ₹4,900 — In transit</p>
        </div>
        <div className="md:text-right">
          <p className="text-[11px] tracking-[0.22em] uppercase text-accent">In Transit</p>
        </div>
      </div>
    </div>
  );
}

function Profile({ user }: { user: { name: string; email: string } }) {
  return (
    <div className="space-y-12 max-w-xl">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Personal</p>
        <div className="space-y-6">
          <Field label="Name" value={user.name}/>
          <Field label="Email" value={user.email}/>
          <Field label="Phone" value="+91 98765 43210"/>
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Preferences</p>
        <div className="space-y-4">
          <Toggle label="New arrivals & stories" on/>
          <Toggle label="Order updates" on/>
          <Toggle label="Price drops on saved pieces" on={false}/>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted">{label}</span>
      <input defaultValue={value} className="mt-2 w-full bg-transparent border-b border-[#ECECEC] focus:border-ink py-2.5 outline-none text-[14px] transition"/>
    </label>
  );
}
function Toggle({ label, on: initial }: { label: string; on: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button onClick={() => setOn(!on)} className="flex items-center justify-between w-full py-3 border-b border-[#ECECEC]">
      <span className="text-[14px]">{label}</span>
      <span className={`relative inline-block h-5 w-9 transition ${on ? "bg-ink" : "bg-[#D1D1CE]"}`}>
        <span className={`absolute top-0.5 h-4 w-4 bg-bg transition-all ${on ? "left-[18px]" : "left-0.5"}`}/>
      </span>
    </button>
  );
}


