"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { User, MapPin, Package, Heart, LogOut, CheckCircle, Truck, ShoppingBag, ShoppingCart, Trash2, X, Tag, Download, Plus, Minus, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

function ProfileContent() {
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const { wishlist, cartItems, removeFromCart, updateQuantity } = useShop();
  const { success: toastSuccess, error: toastError } = useToast();
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

  const [activeSection, setActiveSection] = useState<"info" | "orders" | "wishlist" | "addresses" | "cart">("info");

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "orders" || tab === "wishlist" || tab === "addresses" || tab === "cart") {
      setActiveSection(tab);
    }
  }, [searchParams]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Tracking states
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Address fields
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  
  // Address form fields (Shiprocket aligned)
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [streetInput, setStreetInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressError, setAddressError] = useState("");

  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  // Return & Exchange states
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [selectedOrderForExchange, setSelectedOrderForExchange] = useState<any>(null);
  const [newExchangeAddress, setNewExchangeAddress] = useState("");
  const [exchangeAddressMode, setExchangeAddressMode] = useState<"saved" | "new">("saved");
  const [exchangeNewStreet, setExchangeNewStreet] = useState("");
  const [exchangeNewCity, setExchangeNewCity] = useState("");
  const [exchangeNewState, setExchangeNewState] = useState("");
  const [exchangeNewPincode, setExchangeNewPincode] = useState("");
  const [exchangeItems, setExchangeItems] = useState<any[]>([]);
  const [submittingExchange, setSubmittingExchange] = useState(false);
  const [allProductsForExchange, setAllProductsForExchange] = useState<any[]>([]);
  const exchangePaymentMethod: "online" | "cod" = "online";

  const [selectedProductIdForExchange, setSelectedProductIdForExchange] = useState<string>("");
  const [selectedColorForExchange, setSelectedColorForExchange] = useState<string>("");
  const [selectedSizeForExchange, setSelectedSizeForExchange] = useState<string>("");

  const handleSelectProductToExchange = (productId: string) => {
    setSelectedProductIdForExchange(productId);
    if (!productId) {
      setExchangeItems([]);
      setSelectedColorForExchange("");
      setSelectedSizeForExchange("");
      return;
    }
    const orderItem = selectedOrderForExchange.items.find((item: any) => String(item.productId) === String(productId));
    if (orderItem) {
      setSelectedColorForExchange(orderItem.color || "");
      setSelectedSizeForExchange(orderItem.size || "");
      
      setExchangeItems([{
        productId: orderItem.productId,
        title: orderItem.title,
        oldColor: orderItem.color || "",
        oldSize: orderItem.size,
        newColor: orderItem.color || "",
        newSize: orderItem.size,
        quantity: orderItem.quantity,
        image: orderItem.image
      }]);
    }
  };

  const isExchangeFormInvalid = !selectedProductIdForExchange || 
    !selectedSizeForExchange || 
    (exchangeItems[0] && 
     exchangeItems[0].newColor === exchangeItems[0].oldColor && 
     exchangeItems[0].newSize === exchangeItems[0].oldSize);

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


  const handleTrackShipment = async (trackingNum: string) => {
    setActiveTrackingId(trackingNum);
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const res = await fetch(`/api/shipping/track?trackingNumber=${trackingNum}`);
      const data = await res.json();
      if (data.success) {
        setTrackingData(data);
      } else {
        setTrackingData({ error: data.message || "Failed to load tracking details." });
      }
    } catch (err) {
      console.error(err);
      setTrackingData({ error: "Failed to connect to tracking service." });
    } finally {
      setTrackingLoading(false);
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
            oldColor: item.oldColor,
            newSize: item.newSize,
            newColor: item.newColor
          })),
          paymentMethod: exchangePaymentMethod
        })
      });
      const data = await res.json();
      if (!data.success) {
        toastError("Failed to request exchange: " + data.message);
        setSubmittingExchange(false);
        return;
      }

      // If COD, process immediately
      if (data.isCod) {
        toastSuccess("Exchange request submitted! ₹120 will be charged on delivery.");
        setIsExchangeModalOpen(false);
        fetchOrders();
        return;
      }

      // Online Payment Flow (Razorpay)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toastError("Razorpay SDK failed to load. Check your internet connection.");
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
              toastSuccess("Payment Success! [SIMULATED] Exchange request registered.");
              setIsExchangeModalOpen(false);
              fetchOrders();
            } else {
              toastError("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toastError("Error verifying simulated payment.");
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
              toastSuccess("Payment Success! Exchange request registered.");
              setIsExchangeModalOpen(false);
              fetchOrders();
            } else {
              toastError("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toastError("Error verifying payment.");
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
      toastError("An error occurred during submission.");
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
        toastSuccess("Phone number updated successfully.");
      } else {
        toastError("Failed to save phone number.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error saving phone number.");
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
    setAddressError("");
    if (!firstNameInput.trim() || !lastNameInput.trim() || !emailInput.trim() || !phoneInput.trim() || !streetInput.trim() || !cityInput.trim() || !stateInput.trim() || !pincodeInput.trim()) {
      setAddressError("All fields are required.");
      return;
    }

    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setAddressError("Please enter a valid 6-digit postal pincode.");
      return;
    }

    const newAddress = {
      firstName: firstNameInput.trim(),
      lastName: lastNameInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim(),
      street: streetInput.trim(),
      city: cityInput.trim(),
      state: stateInput.trim(),
      pincode: pincodeInput.trim(),
      country: "India"
    };

    const updatedAddresses = [...addresses, newAddress];
    const updatedDefault = defaultAddress ? defaultAddress : newAddress;

    setAddresses(updatedAddresses);
    if (!defaultAddress) {
      setDefaultAddress(updatedDefault);
    }
    
    // Clear inputs
    setFirstNameInput("");
    setLastNameInput("");
    setEmailInput("");
    setPhoneInput("");
    setStreetInput("");
    setCityInput("");
    setStateInput("");
    setPincodeInput("");

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleStartEditAddress = (idx: number) => {
    const addr = addresses[idx];
    if (!addr) return;
    
    setFirstNameInput(addr.firstName || "");
    setLastNameInput(addr.lastName || "");
    setEmailInput(addr.email || "");
    setPhoneInput(addr.phone || "");
    setStreetInput(addr.street || "");
    setCityInput(addr.city || "");
    setStateInput(addr.state || "");
    setPincodeInput(addr.pincode || "");
    setEditingAddressIndex(idx);
    setAddressError("");
  };

  const handleCancelEdit = () => {
    setFirstNameInput("");
    setLastNameInput("");
    setEmailInput("");
    setPhoneInput("");
    setStreetInput("");
    setCityInput("");
    setStateInput("");
    setPincodeInput("");
    setEditingAddressIndex(null);
    setAddressError("");
  };

  const handleSaveEditAddress = async () => {
    setAddressError("");
    if (editingAddressIndex === null) return;
    
    if (!firstNameInput.trim() || !lastNameInput.trim() || !emailInput.trim() || !phoneInput.trim() || !streetInput.trim() || !cityInput.trim() || !stateInput.trim() || !pincodeInput.trim()) {
      setAddressError("All fields are required.");
      return;
    }

    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setAddressError("Please enter a valid 6-digit postal pincode.");
      return;
    }

    const updatedAddress = {
      firstName: firstNameInput.trim(),
      lastName: lastNameInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim(),
      street: streetInput.trim(),
      city: cityInput.trim(),
      state: stateInput.trim(),
      pincode: pincodeInput.trim(),
      country: "India"
    };
    
    const updatedAddresses = [...addresses];
    const oldAddress = updatedAddresses[editingAddressIndex];
    updatedAddresses[editingAddressIndex] = updatedAddress;
    
    let updatedDefault = defaultAddress;
    if (JSON.stringify(defaultAddress) === JSON.stringify(oldAddress)) {
      updatedDefault = updatedAddress;
    }

    setAddresses(updatedAddresses);
    setDefaultAddress(updatedDefault);
    
    // Clear inputs & close edit mode
    setFirstNameInput("");
    setLastNameInput("");
    setEmailInput("");
    setPhoneInput("");
    setStreetInput("");
    setCityInput("");
    setStateInput("");
    setPincodeInput("");
    setEditingAddressIndex(null);

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleDeleteAddress = async (addrToDelete: any) => {
    const updatedAddresses = addresses.filter((a) => JSON.stringify(a) !== JSON.stringify(addrToDelete));
    let updatedDefault = defaultAddress;
    if (JSON.stringify(defaultAddress) === JSON.stringify(addrToDelete)) {
      updatedDefault = updatedAddresses.length > 0 ? updatedAddresses[0] : null;
    }

    setAddresses(updatedAddresses);
    setDefaultAddress(updatedDefault);

    await saveAddressesToDb(updatedAddresses, updatedDefault);
  };

  const handleSetDefaultAddress = async (addr: any) => {
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
              { id: "cart", icon: ShoppingCart, label: "My Cart", badge: cartItems.length > 0 ? cartItems.length : undefined },
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
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-dark block truncate group-hover:text-primary transition">{item.title}</span>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {item.size && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10.5px] font-bold text-indigo-700">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.color && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10.5px] font-bold text-purple-700">
                                      Color: {item.color}
                                    </span>
                                  )}
                                </div>
                              </div>
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
                              <div className="mt-6 text-[13.5px] font-medium text-dark/70 bg-bg-base p-5 rounded-2xl border border-border/80 shadow-sm">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                  <div>
                                    <strong className="text-dark">AWB Tracking:</strong>
                                    <span className="font-mono text-primary font-bold ml-1.5 bg-primary/5 px-2 py-0.5 rounded border border-primary/25 text-[12.5px]">{order.trackingNumber}</span>
                                  </div>
                                  <button
                                    onClick={() => handleTrackShipment(order.trackingNumber)}
                                    className="rounded-full bg-primary hover:bg-[#2E2387] text-white px-4 py-1.5 text-[12px] font-bold transition shadow shadow-primary/10"
                                  >
                                    {activeTrackingId === order.trackingNumber && trackingLoading ? "Fetching..." : "Track Package Live"}
                                  </button>
                                </div>

                                {/* Tracking Scans Detail Timeline */}
                                {activeTrackingId === order.trackingNumber && (
                                  <div className="mt-5 border-t border-border/70 pt-4">
                                    <h4 className="font-bold text-dark text-[13px] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                      <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" /> Shipment Journey
                                    </h4>
                                    {trackingLoading && (
                                      <div className="flex items-center gap-2 py-4 justify-center text-dark/40 text-[12px]">
                                        <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                                        <span>Loading live status from Shiprocket...</span>
                                      </div>
                                    )}
                                    
                                    {trackingData && trackingData.error && (
                                      <div className="text-red-500 text-[12.5px] bg-red-50 border border-red-100 p-3 rounded-lg">
                                        {trackingData.error}
                                      </div>
                                    )}

                                    {trackingData && !trackingData.error && (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[12.5px] text-dark/60 border-b border-border/50 pb-2 mb-2 font-semibold">
                                          <span>Partner: {trackingData.courier}</span>
                                          <span className="text-primary uppercase text-[11px] bg-primary/10 px-2.5 py-0.5 rounded-full font-bold">
                                            Status: {trackingData.currentStatus}
                                          </span>
                                        </div>
                                        {trackingData.scans && trackingData.scans.length > 0 ? (
                                          <div className="relative pl-4 border-l-2 border-primary/20 space-y-4 py-1.5">
                                            {trackingData.scans.map((scan: any, sIdx: number) => (
                                              <div key={sIdx} className="relative">
                                                {/* Bullet dot */}
                                                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white" />
                                                <div className="text-[12.5px] font-bold text-dark leading-tight">{scan.activity}</div>
                                                <div className="text-[11.5px] text-dark/50 mt-0.5">
                                                  {scan.date} {scan.location && `• ${scan.location}`}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-dark/50 text-[12px] italic text-center py-2">
                                            No detailed tracking scans recorded yet.
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
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

                          <div className="flex flex-wrap gap-3">
                            {order.shippingStatus !== "Cancelled" && (
                              <a
                                href={`/api/checkout/download-invoice?orderId=${order._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border-2 border-primary bg-primary/5 px-5 py-2.5 text-[14px] font-bold text-primary hover:bg-primary hover:text-white transition-all active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download className="h-4 w-4" /> Download Invoice
                              </a>
                            )}
                            {order.shippingStatus === "Delivered" && (() => {
                              const deliveryTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.createdAt).getTime();
                              const canExchange = ((Date.now() - deliveryTime) / (1000 * 60 * 60 * 24) <= 7) && !order.exchangeRequested;
                              return canExchange && (
                                <button
                                  onClick={() => {
                                    setSelectedOrderForExchange(order);
                                    setNewExchangeAddress(order.shippingDetails.address);
                                    setExchangeItems([]);
                                    setSelectedProductIdForExchange("");
                                    fetchProductsForExchange();
                                    setIsExchangeModalOpen(true);
                                  }}
                                  className="rounded-full border-2 border-dark bg-transparent px-5 py-2.5 text-[14px] font-bold text-dark hover:bg-dark hover:text-white transition-all active:scale-[0.98]"
                                >
                                  Exchange Size / Color / Address
                                </button>
                              );
                            })()}
                          </div>
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
                          <ProductCard key={p.id} p={p} />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* C. MY CART */}
            {activeSection === "cart" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-[24px] font-bold text-dark">My Cart</h2>
                  {cartItems.length > 0 && (
                    <span className="rounded-full bg-primary/10 text-primary text-[12px] font-bold px-3 py-1">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-dark/50">Review and manage items before checkout.</p>

                <div className="mt-8">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-20 rounded-[28px] border-2 border-dashed border-border">
                      <ShoppingCart className="h-14 w-14 text-dark/15 mx-auto mb-4" />
                      <p className="text-[16px] font-bold text-dark/40">Your cart is empty</p>
                      <p className="text-[13px] text-dark/30 mt-1 mb-6">Add some products to get started</p>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-white hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                      >
                        <Sparkles className="h-4 w-4" /> Browse Collection
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Premium Cart Items */}
                      {cartItems.map((item) => {
                        const saving = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                        return (
                          <motion.div
                            key={item.cartItemId}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="group relative flex gap-4 rounded-[20px] border border-border bg-white p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                          >
                            {/* Image */}
                            <Link href={`/product/${item.id}`} className="shrink-0">
                              <div className="relative h-[90px] w-[72px] overflow-hidden rounded-2xl bg-bg-base border border-border">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                />
                                {saving > 0 && (
                                  <span className="absolute top-1 left-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-black text-white leading-none">
                                    -{saving}%
                                  </span>
                                )}
                              </div>
                            </Link>

                            {/* Content */}
                            <div className="flex flex-1 flex-col justify-between min-w-0">
                              <div>
                                <Link href={`/product/${item.id}`}>
                                  <p className="font-display font-bold text-dark text-[14px] leading-tight line-clamp-2 hover:text-primary transition">
                                    {item.title}
                                  </p>
                                </Link>

                                {/* Variant Pills */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {item.selectedColor && (
                                    <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                      ● {item.selectedColor}
                                    </span>
                                  )}
                                  {item.selectedSize && (
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Price & Qty row */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-display font-bold text-dark text-[16px]">₹{item.price.toLocaleString("en-IN")}</span>
                                  {item.mrp > item.price && (
                                    <span className="text-[11px] text-dark/35 line-through font-medium">₹{item.mrp.toLocaleString("en-IN")}</span>
                                  )}
                                </div>

                                {/* Qty stepper */}
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center rounded-full border border-border bg-bg-base overflow-hidden">
                                    <button
                                      onClick={() => updateQuantity(item.cartItemId, -1)}
                                      className="grid h-7 w-7 place-items-center text-dark/50 hover:bg-white hover:text-dark transition text-[13px]"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-7 text-center text-[12px] font-bold text-dark">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.cartItemId, 1)}
                                      className="grid h-7 w-7 place-items-center text-dark/50 hover:bg-white hover:text-dark transition"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeFromCart(item.cartItemId)}
                                    className="grid h-7 w-7 place-items-center rounded-full text-dark/30 hover:bg-red-50 hover:text-red-500 border border-border transition active:scale-[0.92]"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Line subtotal */}
                              <div className="mt-1.5 text-right">
                                <span className="text-[11px] text-dark/40 font-medium">Subtotal: </span>
                                <span className="text-[13px] font-bold text-dark">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Order Summary Footer */}
                      <div className="mt-2 rounded-[20px] border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-5">
                        <div className="space-y-2 text-[13px]">
                          <div className="flex justify-between text-dark/60 font-medium">
                            <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                            <span>₹{cartItems.reduce((s, i) => s + i.mrp * i.quantity, 0).toLocaleString("en-IN")}</span>
                          </div>
                          {cartItems.some(i => i.mrp > i.price) && (
                            <div className="flex justify-between text-green-600 font-semibold">
                              <span>You Save</span>
                              <span>-₹{cartItems.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0).toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-dark text-[15px] border-t border-primary/15 pt-2 mt-1">
                            <span>Total</span>
                            <span className="text-primary">₹{cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <Link
                          href="/cart"
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-dark py-3.5 text-[14px] font-bold text-white hover:bg-primary transition-colors shadow-lg active:scale-[0.98]"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Proceed to Checkout
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
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
                        JSON.stringify(defaultAddress) === JSON.stringify(addr) ? "border-primary shadow-md shadow-primary/5" : "border-border hover:border-primary/50"
                      )}>
                        <div className="flex items-start gap-4 min-w-0">
                          <MapPin className={cn("h-6 w-6 shrink-0 mt-0.5", JSON.stringify(defaultAddress) === JSON.stringify(addr) ? "text-primary" : "text-dark/40")} />
                          <div className="min-w-0">
                            <p className="text-[15px] text-dark font-medium leading-relaxed break-words">{addr.firstName} {addr.lastName}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-[13px] text-dark/60 mt-1">{addr.phone} • {addr.email}</p>
                            {JSON.stringify(defaultAddress) === JSON.stringify(addr) && (
                              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-primary">
                                ★ Default
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:self-center self-end shrink-0">
                          {JSON.stringify(defaultAddress) !== JSON.stringify(addr) && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="rounded-full border border-border px-4 py-2 text-[13px] font-bold text-dark/70 hover:bg-bg-base hover:text-dark transition-all active:scale-[0.97]"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEditAddress(idx)}
                            className="rounded-full border border-border px-4 py-2 text-[13px] font-bold text-dark/70 hover:bg-bg-base hover:text-dark transition-all active:scale-[0.97]"
                          >
                            Edit
                          </button>
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
                    <h3 className="font-display text-[18px] font-bold text-dark mb-4">
                      {editingAddressIndex !== null ? "Edit Address" : "Add New Address"}
                    </h3>
                    
                    <div className="space-y-4 max-w-[600px]">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">First Name</label>
                          <input
                            type="text"
                            value={firstNameInput}
                            onChange={(e) => setFirstNameInput(e.target.value)}
                            placeholder="e.g. John"
                            className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">Last Name</label>
                          <input
                            type="text"
                            value={lastNameInput}
                            onChange={(e) => setLastNameInput(e.target.value)}
                            placeholder="e.g. Doe"
                            className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">Phone Number</label>
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">Email Address</label>
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="e.g. john@example.com"
                            className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">Street Address</label>
                        <input
                          type="text"
                          value={streetInput}
                          onChange={(e) => setStreetInput(e.target.value)}
                          placeholder="e.g. Flat 101, building name, street name"
                          className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">City</label>
                          <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            placeholder="e.g. Junagadh"
                            className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">State</label>
                          <input
                            type="text"
                            value={stateInput}
                            onChange={(e) => setStateInput(e.target.value)}
                            placeholder="e.g. Gujarat"
                            className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-dark/60">Pincode (Required for Shiprocket)</label>
                        <input
                          type="text"
                          value={pincodeInput}
                          onChange={(e) => setPincodeInput(e.target.value)}
                          placeholder="e.g. 362001"
                          maxLength={6}
                          className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>

                      {addressError && (
                        <div className="text-red-500 text-[13px] font-medium bg-red-50 border border-red-100 p-2.5 rounded-lg">
                          {addressError}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        {editingAddressIndex !== null ? (
                          <>
                            <button
                              onClick={handleSaveEditAddress}
                              className="rounded-xl bg-primary px-8 py-3 text-[14px] font-bold text-white hover:bg-opacity-90 transition shadow-lg active:scale-[0.98]"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="rounded-xl bg-gray-200 px-8 py-3 text-[14px] font-bold text-dark hover:bg-gray-300 transition active:scale-[0.98]"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleAddAddress}
                            className="rounded-xl bg-dark px-8 py-3 text-[14px] font-bold text-white hover:bg-primary transition-colors shadow-lg active:scale-[0.98]"
                          >
                            Save Address
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Exchange / Return Modal */}
        {isExchangeModalOpen && selectedOrderForExchange && (
          <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-6 md:items-center">
            <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setIsExchangeModalOpen(false)} />

            <div className="relative w-full max-w-[600px] rounded-[32px] bg-surface shadow-2xl flex flex-col" style={{ maxHeight: "calc(100dvh - 48px)" }}>

              {/* ── Sticky Header ── */}
              <div className="flex items-center justify-between border-b border-border px-6 py-5 shrink-0">
                <h3 className="font-display text-[20px] font-bold text-dark flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Exchange Request
                </h3>
                <button onClick={() => setIsExchangeModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-bg-base transition-colors">
                  <X className="h-5 w-5 text-dark" />
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">

                {/* Info banner */}
                <div className="text-[13px] text-primary font-medium bg-primary/5 border border-primary/20 p-4 rounded-2xl leading-relaxed">
                  Select the product &amp; variant you want to exchange, choose a delivery address, and confirm.
                  A flat processing fee of <span className="font-bold">₹120</span> applies.
                </div>

                {/* ── STEP 1: Product Cards ── */}
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-dark/50 mb-3">Step 1 — Select Product to Exchange</p>
                  <div className="space-y-3">
                    {selectedOrderForExchange.items.map((item: any) => {
                      const isSelected = String(selectedProductIdForExchange) === String(item.productId);
                      return (
                        <button
                          key={item.productId}
                          type="button"
                          onClick={() => handleSelectProductToExchange(String(item.productId))}
                          className={cn(
                            "w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                              : "border-border hover:border-primary/40 bg-bg-base"
                          )}
                        >
                          <div className="h-14 w-11 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white">
                            <img src={item.image} alt={item.title} className="h-full w-full object-cover object-top" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-dark text-[14px] truncate">{item.title}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {(item.selectedSize || item.size) && (
                                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10.5px] font-bold text-indigo-700">
                                  Size: {item.selectedSize || item.size}
                                </span>
                              )}
                              {(item.selectedColor || item.color) && (
                                <span className="rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10.5px] font-bold text-purple-700">
                                  Color: {item.selectedColor || item.color}
                                </span>
                              )}
                              <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10.5px] font-bold text-gray-600">
                                ×{item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className={cn(
                            "h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition",
                            isSelected ? "border-primary bg-primary" : "border-border"
                          )}>
                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── STEP 2: Variant Selection (appears after product pick) ── */}
                {selectedProductIdForExchange && (() => {
                  const orderItem = selectedOrderForExchange.items.find((item: any) => String(item.productId) === String(selectedProductIdForExchange));
                  const dbProduct = allProductsForExchange.find((p: any) => String(p.id) === String(selectedProductIdForExchange));
                  if (!orderItem) return null;

                  const colorOptions = dbProduct?.colors || [];
                  const colorObj = colorOptions.find((c: any) => c.name === selectedColorForExchange);
                  const sizeOptions = colorOptions.length > 0
                    ? (colorObj?.sizes || [])
                    : (dbProduct?.sizes || []);

                  const isIdentical = selectedColorForExchange === (orderItem.selectedColor || orderItem.color || "") &&
                    selectedSizeForExchange === (orderItem.selectedSize || orderItem.size || "");

                  return (
                    <div className="space-y-4">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-dark/50">Step 2 — Choose New Variant</p>
                      <div className="border border-border/80 p-4 rounded-2xl bg-bg-base/40 space-y-4">

                        {colorOptions.length > 0 && (
                          <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-dark/50">New Color</label>
                            <div className="flex flex-wrap gap-2">
                              {colorOptions.map((c: any) => (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedColorForExchange(c.name);
                                    setSelectedSizeForExchange("");
                                    setExchangeItems([{ ...exchangeItems[0], newColor: c.name, newSize: "" }]);
                                  }}
                                  className={cn(
                                    "rounded-full border-2 px-3.5 py-1.5 text-[12px] font-bold transition",
                                    selectedColorForExchange === c.name
                                      ? "border-primary bg-primary text-white"
                                      : "border-border bg-surface text-dark hover:border-primary/50"
                                  )}
                                >
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-dark/50">New Size</label>
                          <div className="flex flex-wrap gap-2">
                            {sizeOptions.length === 0 && (
                              <p className="text-[12px] text-dark/40">{colorOptions.length > 0 ? "Pick a color first" : "No sizes available"}</p>
                            )}
                            {sizeOptions.map((s: any) => {
                              const sizeLabel = typeof s === "object" ? s.size : s;
                              const sizeStock = typeof s === "object" ? s.stock : 10;
                              return (
                                <button
                                  key={sizeLabel}
                                  type="button"
                                  disabled={sizeStock === 0}
                                  onClick={() => {
                                    setSelectedSizeForExchange(sizeLabel);
                                    setExchangeItems([{ ...exchangeItems[0], newSize: sizeLabel }]);
                                  }}
                                  className={cn(
                                    "rounded-full border-2 px-3.5 py-1.5 text-[12px] font-bold transition",
                                    selectedSizeForExchange === sizeLabel
                                      ? "border-primary bg-primary text-white"
                                      : sizeStock === 0
                                        ? "border-border bg-gray-50 text-dark/30 cursor-not-allowed line-through"
                                        : "border-border bg-surface text-dark hover:border-primary/50"
                                  )}
                                >
                                  {sizeLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {isIdentical && selectedSizeForExchange && (
                          <p className="text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                            ⚠ Please select a different color or size from the original.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* ── STEP 3: Delivery Address ── */}
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-dark/50 mb-3">Step 3 — Delivery Address</p>

                  {/* Toggle: saved vs new */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setExchangeAddressMode("saved")}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-[13px] font-bold border-2 transition",
                        exchangeAddressMode === "saved" ? "border-primary bg-primary text-white" : "border-border bg-bg-base text-dark hover:border-primary/50"
                      )}
                    >
                      Use Saved Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setExchangeAddressMode("new")}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-[13px] font-bold border-2 transition",
                        exchangeAddressMode === "new" ? "border-primary bg-primary text-white" : "border-border bg-bg-base text-dark hover:border-primary/50"
                      )}
                    >
                      Enter New Address
                    </button>
                  </div>

                  {exchangeAddressMode === "saved" ? (
                    addresses.length === 0 ? (
                      <p className="text-[13px] text-dark/50 italic text-center py-4">
                        No saved addresses. Switch to &ldquo;Enter New Address&rdquo; above.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {addresses.map((addr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewExchangeAddress(JSON.stringify(addr))}
                            className={cn(
                              "w-full flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                              newExchangeAddress === JSON.stringify(addr)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 bg-bg-base"
                            )}
                          >
                            <MapPin className={cn("h-4 w-4 mt-0.5 shrink-0", newExchangeAddress === JSON.stringify(addr) ? "text-primary" : "text-dark/40")} />
                            <span className="text-[13px] font-medium text-dark leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</span>
                            {JSON.stringify(defaultAddress) === JSON.stringify(addr) && (
                              <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-dark/50">Street Address</label>
                        <input
                          type="text"
                          value={exchangeNewStreet}
                          onChange={(e) => {
                            setExchangeNewStreet(e.target.value);
                            setNewExchangeAddress(`${e.target.value}, ${exchangeNewCity}, ${exchangeNewState} - ${exchangeNewPincode}`);
                          }}
                          placeholder="Flat / Building / Street"
                          className="h-11 w-full rounded-xl border border-border bg-bg-base px-4 text-[13.5px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-dark/50">City</label>
                          <input
                            type="text"
                            value={exchangeNewCity}
                            onChange={(e) => {
                              setExchangeNewCity(e.target.value);
                              setNewExchangeAddress(`${exchangeNewStreet}, ${e.target.value}, ${exchangeNewState} - ${exchangeNewPincode}`);
                            }}
                            placeholder="City"
                            className="h-11 w-full rounded-xl border border-border bg-bg-base px-4 text-[13.5px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-dark/50">State</label>
                          <input
                            type="text"
                            value={exchangeNewState}
                            onChange={(e) => {
                              setExchangeNewState(e.target.value);
                              setNewExchangeAddress(`${exchangeNewStreet}, ${exchangeNewCity}, ${e.target.value} - ${exchangeNewPincode}`);
                            }}
                            placeholder="State"
                            className="h-11 w-full rounded-xl border border-border bg-bg-base px-4 text-[13.5px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-dark/50">Pincode</label>
                        <input
                          type="text"
                          value={exchangeNewPincode}
                          maxLength={6}
                          onChange={(e) => {
                            setExchangeNewPincode(e.target.value);
                            setNewExchangeAddress(`${exchangeNewStreet}, ${exchangeNewCity}, ${exchangeNewState} - ${e.target.value}`);
                          }}
                          placeholder="6-digit Pincode"
                          className="h-11 w-full rounded-xl border border-border bg-bg-base px-4 text-[13.5px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Fee Summary ── */}
                <div className="rounded-2xl bg-bg-base p-4 border border-border text-[13.5px] space-y-2 font-medium">
                  <div className="flex justify-between text-dark/60">
                    <span>Original Order Total:</span>
                    <span>₹{selectedOrderForExchange.total}</span>
                  </div>
                  <div className="flex justify-between text-dark/60">
                    <span>Exchange Delivery Charge:</span>
                    <span>₹120</span>
                  </div>
                  <div className="flex justify-between font-bold text-dark border-t border-border pt-2 mt-1">
                    <span>To Pay Now:</span>
                    <span className="text-[16px] text-primary">₹120</span>
                  </div>
                </div>

              </div>{/* end scroll body */}

              {/* ── Sticky Footer Submit ── */}
              <div className="shrink-0 border-t border-border px-6 py-4">
                <button
                  type="button"
                  onClick={handleExchangeSubmit as any}
                  disabled={submittingExchange || isExchangeFormInvalid || !newExchangeAddress.trim()}
                  className="w-full rounded-full bg-primary py-4 text-[15px] font-bold text-white transition hover:bg-[#2E2387] shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {submittingExchange ? "Processing..." : "Confirm Exchange & Pay ₹120"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
