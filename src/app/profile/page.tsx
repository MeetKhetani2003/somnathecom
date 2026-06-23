"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { User, MapPin, Package, Heart, LogOut, CheckCircle, Truck, ShoppingBag, Trash2, X, Tag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "@/context/ShopContext";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Profile() {
  const { data: session, update } = useSession();
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [productsList, setProductsList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProductsList(data.products || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchProducts();
  }, []);

  const [activeSection, setActiveSection] = useState<"info" | "orders" | "wishlist" | "addresses">("info");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address fields
  const [addresses, setAddresses] = useState<string[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<string>("");
  const [newAddress, setNewAddress] = useState("");
  
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  // Return & Exchange states
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState<any>(null);
  const [newExchangeAddress, setNewExchangeAddress] = useState("");
  const [exchangeItems, setExchangeItems] = useState<any[]>([]);
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [allProductsForExchange, setAllProductsForExchange] = useState<any[]>([]);
  const [exchangePaymentMethod, setExchangePaymentMethod] = useState<"online" | "cod">("online");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchProductsForExchange = async () => {
    if (allProductsForExchange.length > 0) return;
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setAllProductsForExchange(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products for exchange:", err);
    }
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForExchange) return;
    setSubmittingExchange(true);
    try {
      const res = await fetch("/api/orders/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForExchange._id,
          newAddress: newExchangeAddress,
          newSizes: exchangeItems.map(item => ({
            productId: item.productId,
            oldSize: item.oldSize,
            newSize: item.newSize
          })),
          paymentMethod: exchangePaymentMethod
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to request exchange: " + data.message);
        setSubmittingExchange(false);
        return;
      }

      // If COD, process immediately
      if (data.isCod) {
        alert("Exchange request submitted successfully! A flat fee of ₹120 will be charged on delivery.");
        setIsExchangeModalOpen(false);
        fetchOrders();
        return;
      }

      // Online Payment Flow (Razorpay)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        setSubmittingExchange(false);
        return;
      }

      // Check if key is placeholder
      if (data.key === "rzp_test_placeholder") {
        const choice = window.confirm(
          "Razorpay Test Mode Bypass:\n\nClick OK to simulate a SUCCESSFUL payment for the ₹120 exchange fee.\nClick Cancel to abort."
        );
        if (choice) {
          // Simulate Payment Verification
          try {
            const verifyRes = await fetch("/api/orders/exchange/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: "mock_pay_" + Math.random().toString(36).substring(2, 11),
                razorpay_order_id: data.razorpayOrderId,
                razorpay_signature: "mock_signature",
                orderId: selectedOrderForExchange._id,
                newAddress: newExchangeAddress,
                newSizes: exchangeItems.map(item => ({
                  productId: item.productId,
                  oldSize: item.oldSize,
                  newSize: item.newSize
                }))
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment Success! [SIMULATED] Exchange request registered successfully.");
              setIsExchangeModalOpen(false);
              fetchOrders();
            } else {
              alert("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error verifying simulated payment.");
          }
        }
        setSubmittingExchange(false);
        return;
      }

      // Real Razorpay popup
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Somnath NX",
        description: "Exchange Processing Fee Payment",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/orders/exchange/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: selectedOrderForExchange._id,
                newAddress: newExchangeAddress,
                newSizes: exchangeItems.map(item => ({
                  productId: item.productId,
                  oldSize: item.oldSize,
                  newSize: item.newSize
                }))
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment Success! Exchange request registered successfully.");
              setIsExchangeModalOpen(false);
              fetchOrders();
            } else {
              alert("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#3D2FB3",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("An error occurred during submission.");
    } finally {
      setSubmittingExchange(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchOrders();
      setAddresses((session.user as any).addresses || []);
      setDefaultAddress((session.user as any).defaultAddress || "");
      setPhone((session.user as any).phone || "");
    }
  }, [session, activeSection]);

  const savePhoneToDb = async () => {
    if (!session?.user?.email) return;
    setSavingPhone(true);
    try {
      const res = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, phone }),
      });
      const data = await res.json();
      if (data.success) {
        await update();
        alert("Phone number updated successfully.");
      } else {
        alert("Failed to save phone number.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving phone number.");
    } finally {
      setSavingPhone(false);
    }
  };

  const saveAddressesToDb = async (newAddressesList: string[], newDefault: string) => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          addresses: newAddressesList,
          defaultAddress: newDefault,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await update();
      }
    } catch (err) {
      console.error("Failed to save addresses:", err);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;
    const trimmed = newAddress.trim();
    const updatedAddresses = [...addresses, trimmed];
    const updatedDefault = defaultAddress ? defaultAddress : trimmed;

    setAddresses(updatedAddresses);
    if (!defaultAddress) {
      setDefaultAddress(updatedDefault);
    }
    setNewAddress("");

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleDeleteAddress = async (addrToDelete: string) => {
    const updatedAddresses = addresses.filter((a) => a !== addrToDelete);
    let updatedDefault = defaultAddress;
    if (defaultAddress === addrToDelete) {
      updatedDefault = updatedAddresses.length > 0 ? updatedAddresses[0] : "";
    }

    setAddresses(updatedAddresses);
    setDefaultAddress(updatedDefault);

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleSetDefaultAddress = async (addr: string) => {
    setDefaultAddress(addr);
    await saveAddressesToDb(addresses, addr);
  };

  const fetchOrders = async () => {
    if (!session?.user?.email) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/admin/orders?email=${encodeURIComponent(session.user.email)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Sign in state check
  if (!session) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:py-24 flex items-center justify-center bg-bg-base min-h-[70vh]">
        <div className="w-full max-w-[450px] rounded-[32px] border border-border bg-surface p-10 text-center shadow-xl shadow-dark/5">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-bg-base border border-border/50 text-dark">
            <User className="h-8 w-8" />
          </div>
          <h2 className="font-display text-[28px] font-bold text-dark tracking-tight">Welcome Back</h2>
          <p className="mt-3 text-[15px] text-dark/60 leading-relaxed">Sign in to manage your orders, track deliveries, and save your favorite collection.</p>

          <button
            onClick={() => signIn("google")}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface py-4 text-[15px] font-bold text-dark transition-all hover:bg-bg-base hover:border-primary/50 shadow-sm"
          >
            {/* Google Colorful Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.64 15.01 1 12 1 7.24 1 3.2 3.74 1.25 7.74l3.83 2.97C6.01 7.27 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.4-4.92 3.4-8.54z"
              />
              <path
                fill="#FBBC05"
                d="M5.08 14.73c-.22-.66-.35-1.37-.35-2.1s.13-1.44.35-2.1L1.25 7.56C.45 9.17 0 10.97 0 12.87c0 1.9.45 3.7 1.25 5.31l3.83-3.45z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-4.27 1.09-3.22 0-5.99-2.23-6.96-5.26l-3.83 2.97C3.2 20.26 7.24 23 12 23z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-base min-h-[80vh]">
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

          {/* Sidebar */}
          <div className="flex flex-col gap-2">
            <div className="mb-6 flex items-center gap-4 rounded-[24px] border border-border p-6 bg-surface shadow-sm">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="h-14 w-14 rounded-full border-2 border-primary/20 object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full bg-dark text-[18px] font-bold text-white shadow-sm">
                  {session.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "US"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-display truncate text-[18px] font-bold text-dark">{session.user?.name}</div>
                <div className="truncate text-[13px] font-medium text-dark/50 mt-0.5">{session.user?.email}</div>
              </div>
            </div>

            {[
              { id: "info", icon: User, label: "Personal Information" },
              { id: "orders", icon: Package, label: "My Orders", badge: orders.length > 0 ? orders.length : undefined },
              { id: "wishlist", icon: Heart, label: "Wishlist", badge: wishlist.length > 0 ? wishlist.length : undefined },
              { id: "addresses", icon: MapPin, label: "Saved Addresses" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-5 py-4 text-[15px] font-bold transition-all",
                    isActive ? "bg-dark text-white shadow-md shadow-dark/10 translate-x-1" : "text-dark/70 hover:bg-surface hover:text-dark"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={cn(
                      "grid h-6 min-w-[24px] place-items-center rounded-full px-2 text-[11px] font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-bg-base text-dark"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}


            <button onClick={() => signOut()} className="mt-8 flex items-center gap-3 rounded-2xl px-5 py-4 text-[15px] font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>

          {/* Content Area */}
          <div className="rounded-[32px] border border-border bg-surface p-6 md:p-10 shadow-sm min-h-[500px]">

            {/* A. PERSONAL INFORMATION */}
            {activeSection === "info" && (
              <div>
                <h2 className="font-display text-[24px] font-bold text-dark">Personal Information</h2>
                <p className="mt-2 text-[15px] text-dark/60">Manage your personal details and account settings.</p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Full Name</label>
                    <input type="text" readOnly value={session.user?.name || ""} className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[15px] font-medium text-dark/60 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Email Address</label>
                    <input type="email" readOnly value={session.user?.email || ""} className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[15px] font-medium text-dark/60 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Mobile Number</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="Enter mobile number" 
                        className="h-12 flex-1 rounded-xl border border-border bg-bg-base px-4 text-[15px] font-medium text-dark outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10" 
                      />
                      <button 
                        onClick={savePhoneToDb}
                        disabled={savingPhone || phone === (session.user as any)?.phone}
                        className="h-12 rounded-xl bg-dark px-8 text-[14px] font-bold text-white hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingPhone ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. MY ORDERS (WITH TRACKING) */}
            {activeSection === "orders" && (
              <div>
                <h2 className="font-display text-[24px] font-bold text-dark">My Orders</h2>
                <p className="mt-2 text-[15px] text-dark/60">Track shipping and review order history.</p>

                {loadingOrders ? (
                  <div className="mt-16 text-center text-[15px] font-medium text-dark/50">Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="mt-20 text-center">
                    <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-bg-base text-dark/30 border border-border"><ShoppingBag className="h-8 w-8" /></div>
                    <div className="font-display text-[20px] font-bold text-dark">No orders yet</div>
                    <p className="text-[15px] text-dark/50 mt-2">Nightwear you purchase will appear here.</p>
                  </div>
                ) : (
                  <div className="mt-10 space-y-8">
                    {orders.map((order) => (
                      <div key={order._id} className="rounded-[24px] border border-border p-6 md:p-8 hover:shadow-lg hover:shadow-dark/5 transition-shadow bg-surface">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                          <div>
                            <div className="text-[13px] font-bold text-dark/60 uppercase tracking-wider">Order ID</div>
                            <div className="font-mono text-[16px] text-primary font-bold mt-1">{order._id}</div>
                            <div className="text-[13px] font-medium text-dark/50 mt-1">Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "rounded-full px-3 py-1 text-[12px] font-bold border",
                              order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            )}>
                              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                            </span>
                            <span className={cn(
                              "rounded-full px-3 py-1 text-[12px] font-bold border",
                              order.shippingStatus === "Delivered" ? "bg-blue-50 text-blue-700 border-blue-200" : order.shippingStatus === "Cancelled" ? "bg-red-50 text-red-700 border-red-200" : "bg-primary/10 text-primary border-primary/20"
                            )}>
                              {order.shippingStatus}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <ul className="py-6 space-y-4">
                          {order.items.map((item: any, idx: number) => (
                            <Link href={`/product/${item.productId || item.id}`} key={idx} className="flex items-center gap-5 text-[15px] hover:bg-surface/50 p-2 rounded-xl transition group">
                              <div className="h-16 w-12 rounded-lg bg-bg-base border border-border overflow-hidden shrink-0"><img src={item.image} className="h-full w-full object-cover" /></div>
                              <span className="font-bold text-dark flex-1 truncate group-hover:text-primary transition">{item.title}</span>
                              <span className="text-dark/60 font-medium">Qty: {item.quantity}</span>
                              <span className="font-display text-[16px] font-bold text-dark w-24 text-right">₹{item.price * item.quantity}</span>
                            </Link>
                          ))}
                        </ul>

                        {/* Stepper Tracking UI */}
                        {order.shippingStatus !== "Cancelled" && (
                          <div className="border-t border-border pt-6 mt-2">
                            <div className="text-[14px] font-bold text-dark mb-6 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Live Tracking Status</div>
                            <div className="relative flex items-center justify-between px-2">

                              {/* Tracking line */}
                              <div className="absolute left-6 right-6 top-1/2 h-1.5 -translate-y-1/2 bg-bg-base rounded-full" />
                              <div className="absolute left-6 top-1/2 h-1.5 -translate-y-1/2 bg-primary transition-all rounded-full" style={{
                                width: (order.shippingStatus === "Processing" || order.shippingStatus === "Exchange Processing") ? "15%" : order.shippingStatus === "Shipped" ? "50%" : "calc(100% - 48px)"
                              }} />

                              {[
                                { label: "Processing", icon: CheckCircle, reached: true },
                                { label: "Shipped", icon: Truck, reached: order.shippingStatus === "Shipped" || order.shippingStatus === "Delivered" },
                                { label: "Delivered", icon: CheckCircle, reached: order.shippingStatus === "Delivered" },
                              ].map((step, sIdx) => {
                                const StepIcon = step.icon;
                                return (
                                  <div key={sIdx} className="relative z-10 flex flex-col items-center">
                                    <div className={cn(
                                      "grid h-10 w-10 place-items-center rounded-full border-[3px] transition-colors",
                                      step.reached ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-surface border-border text-dark/30"
                                    )}>
                                      <StepIcon className="h-5 w-5" />
                                    </div>
                                    <span className={cn(
                                      "text-[12px] font-bold mt-2",
                                      step.reached ? "text-dark" : "text-dark/40"
                                    )}>{step.label}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {order.trackingNumber && (
                              <div className="mt-8 text-[13px] font-medium text-dark/70 bg-bg-base p-4 rounded-xl border border-border">
                                <strong className="text-dark">AWB Tracking:</strong> <span className="font-mono text-primary font-bold ml-1">{order.trackingNumber}</span> (Speed Post / Express Delivery)
                              </div>
                            )}
                          </div>
                        )}

                        <div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="font-display text-[16px] font-bold text-dark">
                            {order.couponUsed && (
                              <div className="text-[13px] text-green-600 font-medium mb-1 flex items-center gap-1.5">
                                <Tag className="h-4 w-4" /> Coupon Applied: <strong>{order.couponUsed}</strong>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span>Grand Total:</span>
                              <span className="ml-2 text-[20px] text-primary">₹{order.total}</span>
                            </div>
                            {order.exchangeRequested && (
                              <span className="ml-3 text-[12px] font-medium text-dark/50 block sm:inline mt-1 sm:mt-0">
                                (Includes ₹{order.exchangeFee} Exchange Delivery Fee)
                              </span>
                            )}
                          </div>

                          {/* Exchange button */}
                          {((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7) && order.shippingStatus !== "Cancelled" && !order.exchangeRequested && (
                            <button
                              onClick={() => {
                                setSelectedOrderForExchange(order);
                                setNewExchangeAddress(order.shippingDetails.address);
                                const initialExchangeSizes = order.items.map((item: any) => ({
                                  productId: item.productId, title: item.title,
                                  oldSize: item.size, newSize: item.size,
                                  quantity: item.quantity, image: item.image,
                                }));
                                setExchangeItems(initialExchangeSizes);
                                fetchProductsForExchange();
                                setIsExchangeModalOpen(true);
                              }}
                              className="rounded-full border-2 border-dark bg-transparent px-5 py-2.5 text-[14px] font-bold text-dark hover:bg-dark hover:text-white transition-all active:scale-[0.98]"
                            >
                              Exchange Size / Address
                            </button>
                          )}
                          {order.exchangeRequested && (
                            <span className="rounded-full bg-orange-50 border border-orange-200 px-4 py-2 text-[13px] font-bold text-orange-700 shadow-sm">
                              Exchange Processing
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* C. WISHLIST */}
            {activeSection === "wishlist" && (
              <div>
                <h2 className="font-display text-[24px] font-bold text-dark">My Wishlist</h2>
                <p className="mt-2 text-[15px] text-dark/60">Items you've bookmarked for later.</p>

                <div className="mt-10">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                      <Heart className="h-12 w-12 text-dark/20 mx-auto mb-4" />
                      <p className="text-[15px] text-dark/50 font-medium">Your wishlist is empty.</p>
                      <Link href="/products" className="inline-block mt-6 font-bold text-primary hover:underline">Browse Collection</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {productsList
                        .filter((p) => wishlist.includes(p.id))
                        .map((p) => (
                          <motion.div key={p.id} whileHover={{ y: -6 }} className="group relative w-full">
                            <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-dark/5">
                              <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-base">
                                <Link href={`/product/${p.id}`}>
                                  <img src={p.image} alt={p.title} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                                </Link>
                                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 gap-2">
                                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                    <span className="rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-dark backdrop-blur-md shadow-sm">
                                      {p.category.split(" > ").pop()?.replace(" Collection", "").replace(" Nightwear", "")}
                                    </span>
                                    {p.tag && (
                                      <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                                        {p.tag}
                                      </span>
                                    )}
                                  </div>
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }} className="shrink-0 grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-dark backdrop-blur-md shadow-sm transition-all hover:text-primary hover:scale-110">
                                    <Heart className={cn("h-5 w-5 transition", wishlist.includes(p.id) && "fill-primary text-primary")} />
                                  </button>
                                </div>
                              </div>
                              <div className="p-5 flex flex-col justify-between flex-1">
                                <div>
                                  <Link href={`/product/${p.id}`} className="font-display text-[17px] font-semibold text-dark transition-colors hover:text-primary line-clamp-1">{p.title}</Link>
                                  <div className="mt-2 flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={cn("h-3.5 w-3.5", i < Math.floor(p.rating || 4.9) ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                                      ))}
                                    </div>
                                    <span className="text-[12.5px] text-dark/60 ml-1">{p.rating || 4.9} Reviews</span>
                                  </div>
                                  <div className="mt-3 flex items-baseline gap-2">
                                    <span className="font-display text-[18px] font-bold text-dark">₹{p.price}</span>
                                    {p.mrp > p.price && (
                                      <>
                                        <span className="text-[13px] text-dark/40 line-through">₹{p.mrp}</span>
                                        <span className="ml-auto text-[12px] font-bold text-green-600">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }} 
                                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-3 text-[14px] font-bold text-primary transition hover:bg-primary hover:text-white"
                                >
                                  <ShoppingBag className="h-4 w-4" /> Add to cart
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* D. SAVED ADDRESSES */}
            {activeSection === "addresses" && (
              <div>
                <h2 className="font-display text-[24px] font-bold text-dark">Saved Addresses</h2>
                <p className="mt-2 text-[15px] text-dark/60">Manage delivery locations for speed checkout.</p>

                <div className="mt-10 space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-[15px] font-medium text-dark/50 py-4">No saved addresses yet. Add one below.</p>
                  ) : (
                    addresses.map((addr, idx) => (
                      <div key={idx} className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[24px] border-[2px] p-6 transition-all bg-surface",
                        addr === defaultAddress ? "border-primary shadow-md shadow-primary/5" : "border-border hover:border-primary/50"
                      )}>
                        <div className="flex items-start gap-4 min-w-0">
                          <MapPin className={cn("h-6 w-6 shrink-0 mt-0.5", addr === defaultAddress ? "text-primary" : "text-dark/40")} />
                          <div className="min-w-0">
                            <p className="text-[15px] text-dark font-medium leading-relaxed break-words">{addr}</p>
                            {addr === defaultAddress && (
                              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-primary">
                                ★ Default
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:self-center self-end shrink-0">
                          {addr !== defaultAddress && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="rounded-full border border-border px-4 py-2 text-[13px] font-bold text-dark/70 hover:bg-bg-base hover:text-dark transition-all active:scale-[0.97]"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr)}
                            className="grid h-10 w-10 place-items-center rounded-full text-dark/40 hover:bg-red-50 hover:text-red-500 border border-border transition-all active:scale-[0.95]"
                            title="Delete Address"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="mt-10 border-t border-border pt-8">
                    <h3 className="font-display text-[18px] font-bold text-dark mb-4">Add New Address</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Enter complete shipping address"
                        className="h-12 flex-1 rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                      <button
                        onClick={handleAddAddress}
                        className="rounded-xl bg-dark px-8 py-3 text-[14px] font-bold text-white hover:bg-primary transition-colors shadow-lg active:scale-[0.98]"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Exchange / Return Modal */}
        {isExchangeModalOpen && selectedOrderForExchange && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setIsExchangeModalOpen(false)}></div>
            <div className="relative w-full max-w-[540px] overflow-hidden rounded-[32px] bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6 md:p-8">
                <h3 className="font-display text-[20px] font-bold text-dark flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Exchange Form
                </h3>
                <button
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-bg-base transition-colors"
                >
                  <X className="h-5 w-5 text-dark" />
                </button>
              </div>

              <form onSubmit={handleExchangeSubmit} className="p-6 md:p-8 space-y-6">
                <div className="text-[13.5px] text-dark/70 font-medium bg-primary/5 border border-primary/20 p-4 rounded-xl leading-relaxed">
                  You can change the sizes of your items or edit the delivery address.
                  A flat redelivery and processing fee of <span className="font-bold text-primary">₹120</span> applies to all exchanges.
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-dark/70">Select New Sizes</label>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
                    {exchangeItems.map((item, idx) => {
                      const product = allProductsForExchange.find(p => p.id === item.productId);
                      const sizeOptions = product?.sizes || [];
                      return (
                        <div key={idx} className="flex gap-4 items-center border border-border p-3.5 rounded-2xl bg-bg-base">
                          {item.image && <img src={item.image} className="h-14 w-12 rounded-lg object-cover border border-border/50 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-bold text-dark truncate">{item.title}</h4>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[12px] font-bold text-dark/50">Size:</span>
                              <select
                                value={item.newSize}
                                onChange={(e) => {
                                  const updated = exchangeItems.map((x, i) => i === idx ? { ...x, newSize: e.target.value } : x);
                                  setExchangeItems(updated);
                                }}
                                className="h-8 rounded-lg border border-border bg-surface px-2 text-[13px] outline-none font-bold text-primary focus:border-primary/50"
                              >
                                <option value={item.oldSize}>{item.oldSize} (Current)</option>
                                {sizeOptions.filter((s: any) => s.size !== item.oldSize).map((s: any) => (
                                  <option key={s.size} value={s.size} disabled={s.stock === 0}>
                                    {s.size} {s.stock === 0 ? "(Out of stock)" : `(${s.stock} left)`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">New Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    value={newExchangeAddress}
                    onChange={(e) => setNewExchangeAddress(e.target.value)}
                    className="w-full rounded-xl border border-border p-4 text-[14px] font-medium transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 bg-bg-base text-dark outline-none"
                    placeholder="Enter the new shipping address..."
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold uppercase tracking-wider text-dark/70">Payment Method (Fee: ₹120)</label>
                  <button
                    type="button"
                    onClick={() => setExchangePaymentMethod("online")}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl w-full border-2 transition-all",
                      exchangePaymentMethod === "online"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-primary/50 bg-bg-base text-dark"
                    )}
                  >
                    <span className="text-[14px] font-bold">Pay Online</span>
                    <span className="text-[12px] text-dark/50 mt-1 font-medium">Razorpay / UPI / Cards</span>
                  </button>
                </div>

                {/* Fees Summary */}
                <div className="rounded-2xl bg-bg-base p-4 border border-border text-[14px] space-y-2 font-medium">
                  <div className="flex justify-between text-dark/60">
                    <span>Original Order Total:</span>
                    <span>₹{selectedOrderForExchange.total}</span>
                  </div>
                  <div className="flex justify-between text-dark/60">
                    <span>Exchange Delivery Charge:</span>
                    <span>₹120</span>
                  </div>
                  <div className="flex justify-between font-bold text-dark border-t border-border pt-2 mt-2">
                    <span>New Grand Total:</span>
                    <span className="text-[16px] text-primary">₹{selectedOrderForExchange.total + 120}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingExchange}
                    className="w-full rounded-full bg-primary py-4 text-[15px] font-bold text-white transition hover:bg-[#2E2387] shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {submittingExchange ? "Processing Request..." : "Confirm Exchange & Pay"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
