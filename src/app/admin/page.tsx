"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Package, ShoppingBag, Users, HelpCircle, Plus, Edit, Trash2, 
  RefreshCw, LayoutDashboard, DollarSign, Heart, ShoppingCart, Star, ArrowLeftRight, LogOut, ShieldCheck
} from "lucide-react";

function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "exchanges" | "users" | "inquiries">("overview");

  const isEnvAdmin = (session?.user as any)?.isEnvAdmin === true;

  // State lists
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [exchanges, setExchanges] = useState<any[]>([]);

  // Loading & Action states
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to admin login if not authenticated as env admin
    if (status === "unauthenticated" || (status === "authenticated" && !isEnvAdmin)) {
      router.replace("/admin/login");
    }
  }, [status, isEnvAdmin, router]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "products", "orders", "exchanges", "users", "inquiries"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEnvAdmin) {
      fetchData();
    }
  }, [session, activeTab, isEnvAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const [prodRes, orderRes, userRes, inqRes, exchRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/admin/orders"),
          fetch("/api/admin/users"),
          fetch("/api/inquiries"),
          fetch("/api/admin/orders?exchangeOnly=true")
        ]);
        const [prodData, orderData, userData, inqData, exchData] = await Promise.all([
          prodRes.json(),
          orderRes.json(),
          userRes.json(),
          inqRes.json(),
          exchRes.json()
        ]);
        if (prodData.success) setProducts(prodData.products);
        if (orderData.success) setOrders(orderData.orders);
        if (userData.success) setUsers(userData.users);
        if (inqData.success) setInquiries(inqData.inquiries);
        if (exchData.success) setExchanges(exchData.orders.filter((o: any) => o.exchangeRequested));
      } else if (activeTab === "products") {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } else if (activeTab === "orders") {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } else if (activeTab === "exchanges") {
        const res = await fetch("/api/admin/orders?exchangeOnly=true");
        const data = await res.json();
        if (data.success) setExchanges(data.orders.filter((o: any) => o.exchangeRequested));
      } else if (activeTab === "users") {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } else if (activeTab === "inquiries") {
        const res = await fetch("/api/inquiries");
        const data = await res.json();
        if (data.success) setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Product CRUD

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully!");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const formData = new FormData();
      formData.append("featured", currentFeatured ? "false" : "true");
      
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update the UI to feel instant
        setProducts(products.map(p => p.id === id ? { ...p, featured: !currentFeatured } : p));
      } else {
        alert("Error updating featured status: " + data.message);
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  // Order Status Updates
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, shippingStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Order status updated to ${status}`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOrderPaymentStatusUpdate = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payment status updated to ${paymentStatus}`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle user admin role
  const handleToggleUserRole = async (email: string, currentRole: string) => {
    const targetRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`User role updated to ${targetRole}`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Show loading while auth status resolves
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-bg-base">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/20 text-primary">
            <ShieldCheck className="h-7 w-7 animate-pulse" />
          </div>
          <p className="text-[14px] text-white/50">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect handled by useEffect, show nothing
  if (!isEnvAdmin) return null;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[var(--color-secondary)] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight text-dark">Admin Console</h1>
          </div>
          <p className="text-[14px] text-dark/70 pl-12">Manage products stock, review order histories, users and customer inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-dark/70 transition hover:bg-surface" title="Refresh">
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[12.5px] font-medium text-red-700 transition hover:bg-red-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        
        {/* Navigation Sidebar */}
        <aside className="flex flex-col gap-1">
          {[
            { id: "overview", label: "Overview Dashboard", icon: LayoutDashboard },
            { id: "products", label: "Products CRUD", icon: Package },
            { id: "orders", label: "Orders Tracking", icon: ShoppingBag },
            { id: "exchanges", label: "Exchange Requests", icon: ArrowLeftRight, badge: exchanges.length },
            { id: "users", label: "User Accounts", icon: Users },
            { id: "inquiries", label: "Support Inquiries", icon: HelpCircle },
          ].map((tab: any) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14.5px] font-medium transition ${isTabActive ? "bg-primary text-white" : "text-dark/80 hover:bg-surface"}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[10.5px] font-bold ${
                    isTabActive ? "bg-white text-primary" : "bg-orange-100 text-orange-700"
                  }`}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Section */}
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm min-h-[500px]">
          
          {loading ? (
            <div className="flex h-[400px] items-center justify-center text-[14px] text-dark/50">Loading admin information...</div>
          ) : (
            <>
              {/* 0. OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div>
                  <h2 className="mb-6 text-[18px] font-semibold text-dark">Business Overview Dashboard</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {/* Profit Card */}
                    <div className="rounded-2xl border border-green-100 bg-green-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-green-500 p-3 text-white">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-green-800">Total Profit (Paid)</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">₹{orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0)}</div>
                      </div>
                    </div>

                    {/* Orders Card */}
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-primary p-3 text-white">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-purple-800">Total Orders</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">{orders.length}</div>
                      </div>
                    </div>

                    {/* Products Card */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-blue-500 p-3 text-white">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-blue-800">Products Count</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">{products.length}</div>
                      </div>
                    </div>

                    {/* Support Inquiries Card */}
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-orange-500 p-3 text-white">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-orange-800">Inquiries</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">{inquiries.length}</div>
                      </div>
                    </div>

                    {/* Wishlist Card */}
                    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-red-500 p-3 text-white">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-red-800">Wishlist Items</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">{users.reduce((sum, u) => sum + (u.wishlist?.length || 0), 0)}</div>
                      </div>
                    </div>

                    {/* Cart/Bag Card */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 flex items-center gap-4">
                      <div className="rounded-xl bg-indigo-500 p-3 text-white">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-indigo-800">Items in Bags</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">{users.reduce((sum, u) => sum + (u.cart?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0), 0)}</div>
                      </div>
                    </div>

                    {/* Exchange Requests Card */}
                    <div
                      className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50/40 p-5 flex items-center gap-4 cursor-pointer hover:border-orange-300 transition"
                      onClick={() => setActiveTab("exchanges")}
                    >
                      <div className="rounded-xl bg-orange-500 p-3 text-white">
                        <ArrowLeftRight className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-orange-800">Exchange Requests</div>
                        <div className="text-[22px] font-bold text-dark mt-0.5">{exchanges.length}</div>
                        {exchanges.length > 0 && <div className="text-[10.5px] text-orange-600 font-medium mt-0.5">Needs attention</div>}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="rounded-2xl border border-border p-5">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                        <h3 className="text-[15px] font-bold text-dark">Recent Orders</h3>
                        <button onClick={() => setActiveTab("orders")} className="text-[12px] font-semibold text-primary hover:underline">View All</button>
                      </div>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order._id} className="flex items-center justify-between text-[13px] border-b border-[#FDFBFE] pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-semibold text-dark">{order.shippingDetails.name}</div>
                              <div className="text-[11px] text-dark/50">{new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod === "cod" ? "COD" : "Online"}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-dark">₹{order.total}</div>
                              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                        {orders.length === 0 && <p className="text-[13px] text-gray-400 italic text-center py-4">No recent orders.</p>}
                      </div>
                    </div>

                    {/* Recent Support Inquiries */}
                    <div className="rounded-2xl border border-border p-5">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                        <h3 className="text-[15px] font-bold text-dark">Recent Inquiries</h3>
                        <button onClick={() => setActiveTab("inquiries")} className="text-[12px] font-semibold text-primary hover:underline">View All</button>
                      </div>
                      <div className="space-y-3">
                        {inquiries.slice(0, 5).map((inq) => (
                          <div key={inq._id} className="text-[13px] border-b border-[#FDFBFE] pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between font-semibold">
                              <span className="text-dark">{inq.name}</span>
                              <span className="text-[11px] font-normal text-dark/50">{new Date(inq.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[12px] text-dark/70 mt-1 truncate">"{inq.message}"</p>
                          </div>
                        ))}
                        {inquiries.length === 0 && <p className="text-[13px] text-gray-400 italic text-center py-4">No recent support messages.</p>}
                      </div>
                    </div>

                    {/* Exchange Requests Summary */}
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/20 p-5 col-span-full md:col-span-1">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-orange-100">
                        <h3 className="text-[15px] font-bold text-dark flex items-center gap-2">
                          <ArrowLeftRight className="h-4 w-4 text-orange-500" />
                          Pending Exchanges
                        </h3>
                        <button onClick={() => setActiveTab("exchanges")} className="text-[12px] font-semibold text-orange-600 hover:underline">Manage All</button>
                      </div>
                      <div className="space-y-3">
                        {exchanges.slice(0, 4).map((order) => (
                          <div key={order._id} className="flex items-start justify-between text-[13px] border-b border-orange-50 pb-2 last:border-0 last:pb-0 gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-dark truncate">{order.shippingDetails?.name}</div>
                              <div className="text-[11px] text-dark/50">
                                {new Date(order.exchangeDetails?.requestedAt || order.createdAt).toLocaleDateString("en-IN")} •
                                {order.exchangeDetails?.paymentMethod === "cod" ? " COD Fee" : " Online Paid"}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10.5px] font-bold text-orange-700">
                              ₹{order.exchangeFee || 120} fee
                            </span>
                          </div>
                        ))}
                        {exchanges.length === 0 && <p className="text-[13px] text-gray-400 italic text-center py-4">No pending exchange requests.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. PRODUCTS TAB */}
              {activeTab === "products" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-dark">Somnath NX Inventory</h2>
                    <Link href="/admin/products/create" className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]">
                      <Plus className="h-4 w-4" /> Add Product
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-border text-left text-dark/50 font-medium">
                          <th className="pb-3 pr-4">Image</th>
                          <th className="pb-3 pr-4">Title</th>
                          <th className="pb-3 pr-4">Category</th>
                          <th className="pb-3 pr-4 text-right">Price</th>
                          <th className="pb-3 pr-4 text-right">Stock</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/30">
                            <td className="py-3.5 pr-4">
                              <img src={p.image} className="h-12 w-10 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                            </td>
                            <td className="py-3.5 pr-4 font-medium text-dark">{p.title}</td>
                            <td className="py-3.5 pr-4 text-dark/70">{p.category}</td>
                            <td className="py-3.5 pr-4 text-right font-semibold text-dark">₹{p.price}</td>
                            <td className={`py-3.5 pr-4 text-right font-medium ${p.stock < 10 ? "text-red-500 font-bold" : "text-[#0F8A4B]"}`}>
                              {p.stock}
                            </td>
                            <td className="py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button 
                                  onClick={() => handleToggleFeatured(p.id, !!p.featured)} 
                                  title={p.featured ? "Remove from Featured" : "Mark as Featured"}
                                  className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                                    p.featured 
                                      ? "border-primary/50 bg-surface text-primary hover:bg-white" 
                                      : "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-primary"
                                  }`}
                                >
                                  <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-primary" : ""}`} />
                                </button>
                                <Link href={`/admin/products/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-primary">
                                  <Edit className="h-3.5 w-3.5" />
                                </Link>
                                <button onClick={() => handleDeleteProduct(p.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. ORDERS TAB */}
              {activeTab === "orders" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-dark">Customer Order Tracking</h2>
                    <Link href="/admin/orders/create" className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]">
                      <Plus className="h-4 w-4" /> Create Offline Order
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <p className="text-[14px] text-center text-dark/50 py-8">No orders placed yet.</p>
                    ) : (
                      orders.map((order) => (
                        <div key={order._id} className="rounded-2xl border border-border p-5 hover:border-primary/50 transition">
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                            <div>
                              <div className="text-[13px] text-dark/50">Order ID: <span className="font-mono text-primary font-semibold">{order._id}</span></div>
                              <div className="text-[12px] text-dark/50 mt-0.5">Date: {new Date(order.createdAt).toLocaleString("en-IN")}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Payment Method Badge */}
                              <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-[11px] font-semibold uppercase">
                                {order.paymentMethod === "cod" ? "COD" : "Online"}
                              </span>

                              {/* Payment Status Dropdown */}
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => handleOrderPaymentStatusUpdate(order._id, e.target.value)}
                                className="rounded-full border border-border bg-white px-3 py-1 text-[12.5px] font-medium text-dark/80 outline-none cursor-pointer"
                              >
                                <option value="pending">Pending Payment</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                              
                              {/* Shipping Status Dropdown */}
                              <select
                                value={order.shippingStatus}
                                onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                className="rounded-full border border-border bg-white px-3 py-1 text-[12.5px] font-medium text-dark/80 outline-none cursor-pointer"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Exchange Processing">Exchange Processing</option>
                              </select>
                            </div>
                          </div>

                          <div className="py-4 grid gap-4 md:grid-cols-[2fr_1fr]">
                            <div>
                              <div className="text-[13.5px] font-semibold text-dark mb-2">Products</div>
                              <ul className="space-y-2">
                                {order.items.map((item: any, i: number) => (
                                  <li key={i} className="flex items-center gap-3 text-[13.5px] text-dark/80">
                                    <div className="h-8 w-7 rounded bg-gray-50 border border-gray-100 overflow-hidden shrink-0"><img src={item.image} className="h-full w-full object-cover" /></div>
                                    <span className="font-medium text-dark">{item.title}</span>
                                    <span className="text-dark/50">({item.quantity}x)</span>
                                    <span className="ml-auto font-semibold">₹{item.price * item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-xl bg-surface p-3 text-[13px] border border-border">
                              <div className="font-semibold text-dark mb-1.5">Delivery & Totals</div>
                              <div><strong>Customer:</strong> {order.shippingDetails.name}</div>
                              <div><strong>Address:</strong> {order.shippingDetails.address}</div>
                              <div><strong>Phone:</strong> {order.shippingDetails.phone}</div>
                              <div className="mt-2 border-t border-border pt-2 flex justify-between font-bold text-dark">
                                <span>Grand Total:</span>
                                <span>₹{order.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 2b. EXCHANGE REQUESTS TAB */}
              {activeTab === "exchanges" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-[18px] font-semibold text-dark flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-orange-500" />
                        Exchange Requests
                      </h2>
                      <p className="text-[13px] text-dark/70 mt-0.5">Customers requesting product size exchanges or address changes within the 7-day window.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-orange-100 text-orange-700 border border-orange-200 px-3.5 py-1 text-[12px] font-bold">
                        {exchanges.length} Pending
                      </span>
                    </div>
                  </div>

                  {exchanges.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-orange-400">
                        <ArrowLeftRight className="h-7 w-7" />
                      </div>
                      <div className="text-[16px] font-semibold text-dark">No exchange requests</div>
                      <p className="text-[13.5px] text-dark/70 mt-1">When customers submit exchange requests, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {exchanges.map((order) => (
                        <div key={order._id} className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/40 to-amber-50/20 p-5 hover:border-orange-200 transition">
                          
                          {/* Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 pb-4 mb-4">
                            <div>
                              <div className="text-[13px] text-dark/50">Order ID: <span className="font-mono text-primary font-semibold">{order._id}</span></div>
                              <div className="text-[12px] text-dark/50 mt-0.5">
                                Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} •
                                Exchange Requested: {order.exchangeDetails?.requestedAt ? new Date(order.exchangeDetails.requestedAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "N/A"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-[11px] font-bold text-orange-700 uppercase tracking-wide">
                                Exchange Processing
                              </span>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${
                                order.exchangeDetails?.paymentMethod === "cod"
                                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                  : "bg-green-50 border-green-200 text-green-700"
                              }`}>
                                {order.exchangeDetails?.paymentMethod === "cod" ? "💵 Fee on Delivery (₹120)" : "✅ Online Paid (₹120)"}
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">

                            {/* Items & Size Changes */}
                            <div className="md:col-span-1">
                              <div className="text-[12px] font-bold text-dark/80 uppercase tracking-wide mb-2">Size Changes</div>
                              <div className="space-y-2">
                                {order.items?.map((item: any, i: number) => {
                                  const origSize = order.exchangeDetails?.originalSizes?.find((s: any) => s.productId === item.productId)?.size;
                                  const newSize = order.exchangeDetails?.newSizes?.find((s: any) => s.productId === item.productId)?.size;
                                  return (
                                    <div key={i} className="flex items-center gap-2 text-[13px] bg-white rounded-xl p-2.5 border border-orange-100">
                                      <img src={item.image} className="h-10 w-8 rounded object-cover border border-gray-100 shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-dark truncate text-[12px]">{item.title}</div>
                                        {origSize && newSize && origSize !== newSize ? (
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10.5px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md border border-red-100 line-through">{origSize}</span>
                                            <span className="text-[10px] text-gray-400">→</span>
                                            <span className="text-[10.5px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md border border-green-100 font-bold">{newSize}</span>
                                          </div>
                                        ) : (
                                          <div className="text-[10.5px] text-gray-400 mt-0.5">Size unchanged — {item.size}</div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Address & Customer */}
                            <div className="md:col-span-1">
                              <div className="text-[12px] font-bold text-dark/80 uppercase tracking-wide mb-2">Delivery Details</div>
                              <div className="bg-white rounded-xl p-3 border border-orange-100 text-[13px] space-y-1.5">
                                <div><span className="font-semibold text-dark">Customer:</span> <span className="text-dark/80">{order.shippingDetails?.name}</span></div>
                                <div><span className="font-semibold text-dark">Phone:</span> <span className="text-dark/80">{order.shippingDetails?.phone}</span></div>
                                {order.exchangeDetails?.previousAddress && (
                                  <div>
                                    <div className="font-semibold text-dark mb-0.5">Old Address:</div>
                                    <div className="text-[12px] text-gray-500 line-through">{order.exchangeDetails.previousAddress}</div>
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-dark mb-0.5">New Address:</div>
                                  <div className="text-[12px] text-dark/80">{order.shippingDetails?.address}</div>
                                </div>
                              </div>
                            </div>

                            {/* Totals & Actions */}
                            <div className="md:col-span-1">
                              <div className="text-[12px] font-bold text-dark/80 uppercase tracking-wide mb-2">Order Totals</div>
                              <div className="bg-white rounded-xl p-3 border border-orange-100 text-[13px] space-y-1.5 mb-3">
                                <div className="flex justify-between text-dark/70">
                                  <span>Subtotal:</span>
                                  <span>₹{order.total - (order.exchangeFee || 120)}</span>
                                </div>
                                <div className="flex justify-between text-orange-700 font-semibold">
                                  <span>Exchange Fee:</span>
                                  <span>+ ₹{order.exchangeFee || 120}</span>
                                </div>
                                <div className="flex justify-between font-bold text-dark border-t border-orange-100 pt-1.5">
                                  <span>Grand Total:</span>
                                  <span>₹{order.total}</span>
                                </div>
                              </div>

                              {/* Admin Action Dropdown */}
                              <div className="space-y-2">
                                <label className="text-[11px] font-semibold text-dark/50 uppercase tracking-wide">Update Status</label>
                                <select
                                  value={order.shippingStatus}
                                  onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                  className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-[13px] font-medium text-dark/80 outline-none cursor-pointer hover:border-orange-300 transition"
                                >
                                  <option value="Exchange Processing">🔄 Exchange Processing</option>
                                  <option value="Processing">📦 Processing (Repack)</option>
                                  <option value="Shipped">🚚 Shipped (New Size)</option>
                                  <option value="Delivered">✅ Exchange Completed</option>
                                </select>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. USERS TAB */}
              {activeTab === "users" && (
                <div>
                  <h2 className="mb-6 text-[18px] font-semibold text-dark">User Management</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b border-border text-left text-dark/50 font-medium">
                          <th className="pb-3 pr-4">User</th>
                          <th className="pb-3 pr-4">Email</th>
                          <th className="pb-3 pr-4">Registered</th>
                          <th className="pb-3 pr-4">Role</th>
                          <th className="pb-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <React.Fragment key={u._id}>
                            <tr className="border-b border-border last:border-0 hover:bg-surface/30">
                              <td className="py-3.5 pr-4">
                                <Link href={`/admin/users/${u._id}`} className="flex items-center gap-3 hover:underline">
                                  {u.image ? (
                                    <img src={u.image} alt="" className="h-8 w-8 rounded-full border border-border object-cover" />
                                  ) : (
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-[#E91E7A] text-[12px] font-semibold text-white">
                                      {u.name.split(" ").map((n: string)=>n[0]).join("")}
                                    </div>
                                  )}
                                  <span className="font-semibold text-dark">{u.name}</span>
                                </Link>
                              </td>
                              <td className="py-3.5 pr-4 text-dark/70">{u.email}</td>
                              <td className="py-3.5 pr-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="py-3.5 pr-4">
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Link
                                    href={`/admin/users/${u._id}`}
                                    className="rounded-full bg-primary px-3.5 py-1 text-[12.5px] font-semibold text-white hover:bg-[#7A187C] transition"
                                  >
                                    View Profile
                                  </Link>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleUserRole(u.email, u.role);
                                    }}
                                    className="rounded-full border border-border px-3.5 py-1 text-[12px] font-semibold text-primary hover:bg-surface"
                                  >
                                    Toggle {u.role === "admin" ? "User" : "Admin"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. INQUIRIES TAB */}
              {activeTab === "inquiries" && (
                <div>
                  <h2 className="mb-6 text-[18px] font-semibold text-dark">Customer Support Inquiries</h2>
                  <div className="space-y-4">
                    {inquiries.length === 0 ? (
                      <p className="text-[14px] text-center text-dark/50 py-8">No customer inquiries submitted.</p>
                    ) : (
                      inquiries.map((inq) => (
                        <div key={inq._id} className="rounded-2xl border border-border p-5 bg-surface/50">
                          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                            <div>
                              <div className="font-semibold text-dark">{inq.name}</div>
                              <div className="text-[12px] text-dark/50">{inq.email} • {new Date(inq.createdAt).toLocaleDateString("en-IN")}</div>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${inq.status === "resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {inq.status === "resolved" ? "Resolved" : "Pending Action"}
                            </span>
                          </div>
                          <p className="text-[13.5px] text-dark/80 leading-relaxed">"{inq.message}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>



    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-bg-base">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/20 text-primary">
            <ShieldCheck className="h-7 w-7 animate-pulse" />
          </div>
          <p className="text-[14px] text-white/50">Loading admin console...</p>
        </div>
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  );
}
