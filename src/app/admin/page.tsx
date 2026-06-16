"use client";
"use client";
import { useState } from "react";
import Logo from "@/components/Logo";
import { PRODUCTS } from "@/data";
import { IconHome, IconPackage, IconChart, IconUser, IconTag, IconSettings, IconSearch, IconPlus, IconCheck, IconArrowUpRight } from "@/components/Icons";
import { navigate } from "@/store";

const NAV = [
  { id: "dashboard", t: "Dashboard", Ic: IconHome },
  { id: "products", t: "Products", Ic: IconPackage },
  { id: "orders", t: "Orders", Ic: IconChart },
  { id: "users", t: "Customers", Ic: IconUser },
  { id: "coupons", t: "Promotions", Ic: IconTag },
  { id: "reviews", t: "Reviews", Ic: IconCheck },
  { id: "banners", t: "Banners", Ic: IconPackage },
  { id: "seo", t: "SEO", Ic: IconSettings },
  { id: "analytics", t: "Analytics", Ic: IconChart },
];

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  return (
    <div className="min-h-screen bg-bg">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:flex flex-col h-screen sticky top-0 border-r border-[#ECECEC] bg-bg">
          <div className="px-6 py-6 border-b border-[#ECECEC]">
            <Logo className="text-[14px]"/>
            <p className="text-[10px] tracking-[0.22em] uppercase text-muted mt-2">Console</p>
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {NAV.map(({ id, t, Ic }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${tab === id ? "bg-ink text-bg" : "text-ink hover:bg-[#F3F1EA]"}`}
              >
                <Ic size={14}/>{t}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-[#ECECEC]">
            <button onClick={() => navigate("/")} className="text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ink transition">← Back to site</button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur border-b border-[#ECECEC]">
            <div className="px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
              <div className="lg:hidden"><Logo className="text-[14px]"/></div>
              <div className="relative flex-1 max-w-md hidden md:block">
                <IconSearch size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted"/>
                <input placeholder="Search…" className="w-full h-10 pl-7 pr-3 bg-transparent border-b border-[#ECECEC] focus:border-ink outline-none text-[13px]"/>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] tracking-[0.22em] uppercase text-muted">Live</span>
                <div className="h-8 w-8 rounded-full bg-ink text-bg grid place-items-center text-[11px]">AV</div>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-10">
            {tab === "dashboard" && <Dashboard/>}
            {tab === "products" && <Products/>}
            {tab === "orders" && <OrdersAdmin/>}
            {tab === "users" && <Users/>}
            {tab === "coupons" && <Coupons/>}
            {tab === "reviews" && <Reviews/>}
            {tab === "banners" && <Banners/>}
            {tab === "seo" && <SEO/>}
            {tab === "analytics" && <Analytics/>}
          </div>
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Overview</p>
          <h1 className="font-display text-[40px] lg:text-[56px] font-light tracking-tight mt-2">Dashboard</h1>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-bg text-[12px] tracking-[0.18em] uppercase">
          <IconPlus size={12}/> New Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#ECECEC]">
        {[
          { t: "Revenue", v: "₹4,82,910", d: "+18.4%" },
          { t: "Orders", v: "1,284", d: "+12.1%" },
          { t: "Customers", v: "9,201", d: "+6.2%" },
          { t: "Conversion", v: "3.42%", d: "+0.4 pp" },
        ].map((k) => (
          <div key={k.t} className="bg-bg p-6 lg:p-8">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">{k.t}</p>
            <p className="font-display text-[32px] lg:text-[40px] font-light tracking-tight mt-3">{k.v}</p>
            <p className="text-[11px] tracking-[0.12em] text-muted mt-2">{k.d} vs last 30d</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-px bg-[#ECECEC]">
        <div className="lg:col-span-2 bg-bg p-6 lg:p-8">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Revenue Analytics</p>
            <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase">
              {["7D","30D","90D","12M"].map((p, i) => (
                <button key={p} className={i === 1 ? "text-ink" : "text-muted hover:text-ink"}>{p}</button>
              ))}
            </div>
          </div>
          <BigChart/>
        </div>
        <div className="bg-bg p-6 lg:p-8">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-5">Top Pieces</p>
          <div className="space-y-4">
            {PRODUCTS.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-[11px] text-muted">{i + 1}</span>
                <img src={p.image} className="h-10 w-10 object-cover" alt=""/>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] line-clamp-1">{p.name}</p>
                  <p className="text-[11px] text-muted">{50 + i * 12} sold</p>
                </div>
                <span className="text-[13px] tabular-nums">₹{p.price.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Recent Orders</p>
          <button className="text-[11px] tracking-[0.22em] uppercase link-underline">View all</button>
        </div>
        <OrdersTable/>
      </div>
    </div>
  );
}

function BigChart() {
  const data = [40,55,42,68,72,60,80,75,88,92,85,98];
  const max = 100;
  return (
    <svg viewBox="0 0 360 160" className="w-full h-44">
      <defs>
        <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3528A8" stopOpacity="0.18"/>
          <stop offset="1" stopColor="#3528A8" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,1,2,3].map((i) => <line key={i} x1="0" x2="360" y1={20 + i * 35} y2={20 + i * 35} stroke="#ECECEC" strokeDasharray="2 4"/>)}
      <polyline
        fill="none" stroke="#111111" strokeWidth="1.5"
        points={data.map((d, i) => `${(i * 360) / (data.length - 1)},${160 - (d / max) * 130}`).join(" ")}
      />
      <polygon
        fill="url(#ag)"
        points={`0,160 ${data.map((d, i) => `${(i * 360) / (data.length - 1)},${160 - (d / max) * 130}`).join(" ")} 360,160`}
      />
    </svg>
  );
}

function OrdersTable() {
  const ord = [
    { id: "SN847291", c: "Aanya Verma", p: "Tencel Full Night Suit", s: "Delivered", t: "₹4,900" },
    { id: "SN847290", c: "Rohan Mehta", p: "Men's Full Night Suit", s: "Shipped", t: "₹4,700" },
    { id: "SN847289", c: "Priya Sharma", p: "Oversized Tee + Plazo", s: "Processing", t: "₹5,200" },
    { id: "SN847288", c: "Sneha Kapoor", p: "Valentino Plazo", s: "Delivered", t: "₹4,200" },
    { id: "SN847287", c: "Vikram Singh", p: "Tencel Plazo", s: "Cancelled", t: "₹4,500" },
  ];
  return (
    <div className="border-t border-[#ECECEC]">
      {ord.map((o) => (
        <div key={o.id} className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-b border-[#ECECEC] items-center text-[13px]">
          <span className="tabular-nums">#{o.id}</span>
          <span>{o.c}</span>
          <span className="text-muted hidden md:inline">{o.p}</span>
          <span className={`text-[11px] tracking-[0.18em] uppercase ${o.s === "Delivered" ? "" : o.s === "Cancelled" ? "text-muted" : "text-accent"}`}>{o.s}</span>
          <span className="text-right tabular-nums">{o.t}</span>
        </div>
      ))}
    </div>
  );
}

function Products() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Catalog</p>
          <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Products</h1>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-bg text-[12px] tracking-[0.18em] uppercase">
          <IconPlus size={12}/> Add Product
        </button>
      </div>
      <div className="border-t border-[#ECECEC]">
        <div className="grid grid-cols-5 gap-4 py-3 border-b border-[#ECECEC] text-[10px] tracking-[0.22em] uppercase text-muted">
          <span className="col-span-2">Product</span><span>Fabric</span><span>Stock</span><span className="text-right">Price</span>
        </div>
        {PRODUCTS.map((p) => (
          <div key={p.id} className="grid grid-cols-5 gap-4 py-4 border-b border-[#ECECEC] items-center text-[13px]">
            <div className="col-span-2 flex items-center gap-3">
              <img src={p.image} className="h-12 w-10 object-cover" alt=""/>
              <div>
                <p>{p.name}</p>
                <p className="text-[11px] text-muted">{p.id.toUpperCase()}</p>
              </div>
            </div>
            <span className="text-muted">{p.fabric}</span>
            <span>In stock</span>
            <span className="text-right tabular-nums">₹{p.price.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Operations</p>
        <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Orders</h1>
      </div>
      <OrdersTable/>
    </div>
  );
}

function Users() {
  const u = [
    { n: "Aanya Verma", e: "aanya@email.com", o: 8, s: 38240 },
    { n: "Rohan Mehta", e: "rohan@email.com", o: 5, s: 22450 },
    { n: "Priya Sharma", e: "priya@email.com", o: 12, s: 57600 },
    { n: "Sneha Kapoor", e: "sneha@email.com", o: 3, s: 12850 },
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Database</p>
        <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Customers</h1>
      </div>
      <div className="border-t border-[#ECECEC]">
        {u.map((x) => (
          <div key={x.e} className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-[#ECECEC] items-center text-[13px]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-ink text-bg grid place-items-center text-[11px]">{x.n.split(" ").map((p) => p[0]).join("")}</div>
              <div>
                <p>{x.n}</p>
                <p className="text-[11px] text-muted">{x.e}</p>
              </div>
            </div>
            <span className="text-muted hidden md:inline">{x.o} orders</span>
            <span className="text-muted hidden md:inline">Member</span>
            <span className="text-right tabular-nums">₹{x.s.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Coupons() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Marketing</p>
          <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Promotions</h1>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-bg text-[12px] tracking-[0.18em] uppercase">
          <IconPlus size={12}/> New Code
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#ECECEC]">
        {[
          { c: "SN10", t: "10% off", e: "30 Nov", u: 1204 },
          { c: "TENCEL20", t: "20% off Tencel", e: "15 Dec", u: 420 },
          { c: "FREESHIP", t: "Free shipping", e: "Always", u: 8210 },
        ].map((k) => (
          <div key={k.c} className="bg-bg p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-muted">Active</p>
            <p className="font-display text-[32px] font-light mt-2 tabular-nums">{k.c}</p>
            <p className="text-[13px] mt-2">{k.t}</p>
            <p className="text-[11px] text-muted mt-1">Expires {k.e} — {k.u} uses</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Reviews() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Voice</p>
        <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Reviews</h1>
      </div>
      <div className="border-t border-[#ECECEC]">
        {[
          { n: "Priya S.", p: "Tencel Full Night Suit", r: 5, t: "Best purchase of the year." },
          { n: "Rohan M.", p: "Men's Full Night Suit", r: 4, t: "Great fit, fabric could be softer." },
          { n: "Sneha K.", p: "Valentino Plazo", r: 5, t: "Drape is perfect." },
        ].map((r, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-[#ECECEC] items-center text-[13px]">
            <span>{r.n}</span>
            <span className="text-muted">{r.p}</span>
            <span className="text-[11px] tracking-[0.18em] uppercase">{r.r} / 5</span>
            <span className="text-right text-muted line-clamp-1 italic serif-h text-[15px]">"{r.t}"</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Banners() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Content</p>
        <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Banners</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#ECECEC]">
        {["Tencel Drop","Festive Edit","New Arrivals"].map((b) => (
          <div key={b} className="bg-bg">
            <div className="aspect-[16/9] bg-[#EFEDE7] grid place-items-center">
              <p className="font-display text-[24px] font-light">{b}</p>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[13px]">{b}</p>
                <p className="text-[11px] text-muted mt-1">Scheduled — 18 Nov</p>
              </div>
              <button className="text-[11px] tracking-[0.18em] uppercase link-underline">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SEO() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Discoverability</p>
        <h1 className="font-display text-[40px] font-light tracking-tight mt-2">SEO</h1>
      </div>
      <div className="space-y-6">
        <Field l="Meta Title" v="Somnath NX — Premium Nightwear For Modern Living"/>
        <Field l="Meta Description" v="Considered nightwear and loungewear in Tencel and modal. Designed in Mumbai."/>
        <Field l="OG Image" v="https://somnathnx.com/og.jpg"/>
        <Field l="Sitemap" v="https://somnathnx.com/sitemap.xml"/>
      </div>
      <button className="px-5 py-2.5 bg-ink text-bg text-[12px] tracking-[0.18em] uppercase">Save</button>
    </div>
  );
}

function Field({ l, v }: { l: string; v: string }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted">{l}</span>
      <input defaultValue={v} className="mt-2 w-full bg-transparent border-b border-[#ECECEC] focus:border-ink py-2.5 outline-none text-[14px] transition"/>
    </label>
  );
}

function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Reports</p>
        <h1 className="font-display text-[40px] font-light tracking-tight mt-2">Analytics</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-px bg-[#ECECEC]">
        <div className="bg-bg p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Sales</p>
            <IconArrowUpRight size={14}/>
          </div>
          <BigChart/>
        </div>
        <div className="bg-bg p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted">Customers</p>
            <IconArrowUpRight size={14}/>
          </div>
          <BigChart/>
        </div>
      </div>
    </div>
  );
}


