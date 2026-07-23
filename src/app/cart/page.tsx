"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { useShop } from "@/context/ShopContext";
import { useToast } from "@/context/ToastContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, AlertCircle, ShieldCheck } from "lucide-react";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, referralCode } = useShop();
  const { data: session, update } = useSession();
  const router = useRouter();
  const toast = useToast();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Shipping form states
  const [shippingFirstName, setShippingFirstName] = useState("");
  const [shippingLastName, setShippingLastName] = useState("");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [shippingPhone, setShippingPhone] = useState((session?.user as any)?.phone || "");
  const [shippingEmail, setShippingEmail] = useState(session?.user?.email || "");
  const [checkoutError, setCheckoutError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [shippingCost, setShippingCost] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Saved address dropdown/saving states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>("");
  const [newAddressText, setNewAddressText] = useState<any>("");
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [newAddressAsDefault, setNewAddressAsDefault] = useState(false);

  const [addrL1, setAddrL1] = useState("");
  const [addrL2, setAddrL2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (selectedAddressIndex === "new") {
      const fullAddr = {
        firstName: shippingFirstName.trim(),
        lastName: shippingLastName.trim(),
        email: shippingEmail.trim(),
        phone: shippingPhone.trim(),
        street: `${addrL1.trim()}${addrL2.trim() ? `, ${addrL2.trim()}` : ""}`,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: "India"
      };
      setNewAddressText(fullAddr);
      setShippingAddress(fullAddr);
    }
  }, [shippingFirstName, shippingLastName, shippingEmail, shippingPhone, addrL1, addrL2, city, state, pincode, selectedAddressIndex]);

  useEffect(() => {
    const savedAddresses = (session?.user as any)?.addresses || [];
    const defaultAddress = (session?.user as any)?.defaultAddress || "";

    if (session) {
      if (session.user?.name && !shippingFirstName && !shippingLastName) {
        const parts = session.user.name.split(" ");
        setShippingFirstName(parts[0] || "");
        setShippingLastName(parts.slice(1).join(" ") || "");
      }
      if (session.user?.email && !shippingEmail) {
        setShippingEmail(session.user.email);
      }
      const userPhone = (session?.user as any)?.phone || "";
      if (userPhone && !shippingPhone) {
        setShippingPhone(userPhone);
      }
      if (savedAddresses.length > 0) {
        let initialIndex = 0;
        if (defaultAddress) {
          const idx = savedAddresses.indexOf(defaultAddress);
          if (idx !== -1) {
            initialIndex = idx;
          }
        }
        setSelectedAddressIndex(initialIndex.toString());
        setShippingAddress(savedAddresses[initialIndex]);
      } else {
        setSelectedAddressIndex("new");
        setShippingAddress(null);
      }
    } else {
      setSelectedAddressIndex("new");
      setShippingAddress(null);
    }
  }, [session]);

  const handleAddressSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressIndex(val);
    const savedAddresses = (session?.user as any)?.addresses || [];

    if (val === "new") {
      setShippingAddress(newAddressText);
    } else {
      const idx = parseInt(val, 10);
      if (!isNaN(idx) && savedAddresses[idx]) {
        setShippingAddress(savedAddresses[idx]);
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  useEffect(() => {
    const fetchShippingCost = async () => {
      if (paymentMethod !== "cod") {
        setShippingCost(0);
        return;
      }

      // Try to extract pincode
      const pincode = typeof shippingAddress === "object" && shippingAddress?.pincode ? shippingAddress.pincode : null;
      if (!pincode) {
        setShippingCost(0);
        return;
      }
      setIsCalculatingShipping(true);
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delivery_postcode: pincode,
            weight: cartItems.reduce((acc, item) => acc + item.quantity * 0.5, 0),
            declared_value: subtotal - discountAmount,
            cod: true
          })
        });
        const data = await res.json();
        if (data.success) {
          setShippingCost(data.shippingCost);
        } else {
          console.error("Failed to calculate shipping:", data.message);
          setShippingCost(80); // fallback
        }
      } catch (err) {
        console.error("Shipping calculate error:", err);
        setShippingCost(80); // fallback
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    fetchShippingCost();
  }, [paymentMethod, shippingAddress, cartItems, subtotal, discountAmount]);

  const baseTotal = subtotal - discountAmount;
  const gstAmount = Math.round(baseTotal * 0.05);
  const platformFee = Math.round(baseTotal * 0.02);
  const finalShippingCost = paymentMethod === "cod" ? shippingCost : 0;
  const total = baseTotal + gstAmount + platformFee + finalShippingCost;

  // Load Razorpay Script Helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(couponCode.toUpperCase());
        setDiscountPercent(data.discountPercent);
        setCouponCode("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError("Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const handlePlaceOrder = async () => {
    setCheckoutError("");

    if (!session) {
      setCheckoutError("Please sign in from the Profile page to continue.");
      return;
    }

    if (!shippingFirstName.trim() || !shippingLastName.trim() || !shippingAddress || !shippingPhone.trim() || !shippingEmail.trim()) {
      setCheckoutError("All shipping details (First Name, Last Name, Phone, Email, Address) are required.");
      return;
    }

    const pincode = shippingAddress?.pincode;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      setCheckoutError("A valid 6-digit postal pincode is required in the shipping address to calculate courier rates and deliver your order.");
      return;
    }

    setProcessing(true);

    try {
      if (session?.user?.email && selectedAddressIndex === "new" && saveNewAddress && newAddressText) {
        try {
          const currentAddresses = (session.user as any).addresses || [];
          const currentDefault = (session.user as any).defaultAddress || null;

          const updatedAddresses = [...currentAddresses, newAddressText];
          const updatedDefault = newAddressAsDefault || !currentDefault ? newAddressText : currentDefault;

          const saveRes = await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              addresses: updatedAddresses,
              defaultAddress: updatedDefault,
              phone: shippingPhone
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            await update();
            // Select newly added address index
            setSelectedAddressIndex((updatedAddresses.length - 1).toString());
          }
        } catch (saveErr) {
          console.error("Failed to save address during checkout:", saveErr);
        }
      } else if (session?.user?.email && shippingPhone && shippingPhone !== ((session.user as any).phone || "")) {
        // Automatically save updated phone number even for saved addresses
        try {
          const currentAddresses = (session.user as any).addresses || [];
          const currentDefault = (session.user as any).defaultAddress || "";
          const saveRes = await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              addresses: currentAddresses,
              defaultAddress: currentDefault,
              phone: shippingPhone
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            await update();
          }
        } catch (phoneErr) {
          console.error("Failed to auto-update phone in DB:", phoneErr);
        }
      }
      // 1. Call backend to create Order & reserve stock
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
          })),
          shippingDetails: typeof shippingAddress === "object" ? shippingAddress : {
            firstName: shippingFirstName,
            lastName: shippingLastName,
            email: shippingEmail,
            phone: shippingPhone,
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "India"
          },
          email: session.user?.email,
          userId: (session.user as any)?.id,
          username: session.user?.name || session.user?.email || "Guest User",
          couponCode: appliedCoupon,
          referralCode,
          paymentMethod,
          shippingCost: paymentMethod === "cod" ? shippingCost : 0,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed.");
      }

      // If COD, bypass Razorpay flow entirely
      if (orderData.isCod) {
        clearCart();
        toast.success("Order placed successfully via Cash on Delivery!");
        router.push(`/success?orderId=${orderData.orderId}`);
        return;
      }

      // 2. Load Razorpay script for Online payment
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      // If Razorpay key is mock/placeholder, simulate checkout in front-end
      if (orderData.key === "rzp_test_placeholder") {
        const choice = window.confirm(
          "Razorpay Test Mode Bypass:\n\nClick OK to simulate a SUCCESSFUL payment.\nClick Cancel to simulate CANCELLED checkout (restores inventory stock)."
        );
        if (choice) {
          // Simulate Payment Verification
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: "mock_pay_" + Math.random().toString(36).substring(2, 11),
                razorpay_order_id: orderData.razorpayOrderId,
                razorpay_signature: "mock_signature",
                orderId: orderData.orderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              toast.success("Payment Success! [SIMULATED] Order placed. Check your email for invoice.");
              router.push(`/success?orderId=${orderData.orderId}`);
            } else {
              toast.error("Verification failed: " + verifyData.message);
              setProcessing(false);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Error verifying simulated payment.");
            setProcessing(false);
          }
        } else {
          // Simulate Payment Dismissal / Cancel
          try {
            await fetch("/api/checkout/cancel-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: orderData.orderId }),
            });
            toast.info("Checkout cancelled. Stocks returned back to inventory.");
          } catch (cancelErr) {
            console.error(cancelErr);
          }
          setProcessing(false);
        }
        return;
      }

      // 3. Open Razorpay Checkout overlay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Somnath NX",
        description: "Premium Nightwear Checkout",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // Verification
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              toast.success("Payment Success! Order placed. Check your email for invoice.");
              router.push(`/success?orderId=${orderData.orderId}`);
            } else {
              toast.error("Verification failed: " + verifyData.message);
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Error verifying payment.");
          }
        },
        modal: {
          ondismiss: async function () {
            // Restore inventory stock on checkout cancel
            try {
              await fetch("/api/checkout/cancel-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: orderData.orderId }),
              });
              toast.info("Checkout cancelled. Stocks returned to shop inventory.");
            } catch (cancelErr) {
              console.error(cancelErr);
            }
            setProcessing(false);
          },
        },
        prefill: {
          name: `${shippingFirstName} ${shippingLastName}`.trim(),
          email: shippingEmail || session?.user?.email,
          contact: shippingPhone,
        },
        theme: {
          color: "#3D2FB3", // Somnath NX Primary Color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || "An error occurred during checkout processing.");
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-center px-4 py-20 text-center md:py-32 bg-bg-base">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-surface shadow-sm text-dark/30 border border-border">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="font-display text-[28px] font-bold text-dark">Your bag is empty</h2>
        <p className="mt-2 text-[15px] text-dark/60 max-w-[400px]">Looks like you haven't added any premium nightwear to your bag yet.</p>
        <Link href="/products" className="mt-8 rounded-full bg-dark px-10 py-4 text-[15px] font-bold text-white transition hover:bg-primary shadow-lg hover:-translate-y-0.5">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:py-12 md:px-8">
        <h1 className="mb-8 font-display text-[32px] font-bold tracking-tight text-dark md:text-[40px]">Shopping Bag</h1>
        
        <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
          
          {/* Left Side: Items & Checkout Form */}
          <div className="space-y-8">
            
            {/* Items List */}
            <div className="space-y-4">
              <h2 className="font-display text-[20px] font-bold text-dark">Order Items ({cartItems.length})</h2>
              {cartItems.map((item) => (
                <div key={item.cartItemId || item.id} className="flex gap-5 rounded-[24px] border border-border bg-surface p-5 transition-shadow hover:shadow-lg hover:shadow-dark/5">
                  <Link href={`/product/${item.id}`} className="block h-[120px] w-[90px] shrink-0 overflow-hidden rounded-xl bg-bg-base border border-border/50">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition hover:scale-105 duration-700" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-display text-[16px] font-bold text-dark hover:text-primary transition-colors cursor-pointer">{item.title}</div>
                        <div className="mt-1 text-[13px] font-medium text-dark/50">{item.category}</div>
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                                <span className="h-2 w-2 rounded-full bg-purple-400" /> {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(item.cartItemId || String(item.id))} className="grid h-10 w-10 place-items-center rounded-full text-dark/40 transition hover:bg-red-50 hover:text-red-500 shrink-0">
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 rounded-full border border-border bg-surface px-3 py-1.5 shadow-sm">
                        <button onClick={() => updateQuantity(item.cartItemId || String(item.id), -1)} className="grid h-6 w-6 place-items-center rounded-full bg-bg-base text-dark transition hover:bg-dark hover:text-white"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center text-[14px] font-bold text-dark">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId || String(item.id), 1)} className="grid h-6 w-6 place-items-center rounded-full bg-bg-base text-dark transition hover:bg-dark hover:text-white"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="font-display text-[18px] font-bold text-dark">₹{item.price * item.quantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Details Form */}
            <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
              <h2 className="font-display text-[20px] font-bold text-dark mb-6">Delivery Details</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">First Name</label>
                    <input
                      type="text"
                      value={shippingFirstName}
                      onChange={(e) => setShippingFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Last Name</label>
                    <input
                      type="text"
                      value={shippingLastName}
                      onChange={(e) => setShippingLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Phone Number</label>
                    <input
                      type="tel"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Email Address</label>
                    <input
                      type="email"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                </div>
                {session && ((session.user as any).addresses || []).length > 0 && (
                  <div>
                    <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Select Saved Address</label>
                    <div className="relative">
                      <select
                        value={selectedAddressIndex}
                        onChange={handleAddressSelectChange}
                        className="h-12 w-full appearance-none rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium text-dark outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 cursor-pointer pr-10"
                      >
                        {((session.user as any).addresses || []).map((addr: any, idx: number) => {
                          const isDefault = JSON.stringify(addr) === JSON.stringify((session.user as any).defaultAddress);
                          return (
                            <option key={idx} value={idx.toString()}>
                              {isDefault ? `★ [Default] ` : ""}{addr?.street}, {addr?.city}, {addr?.state} - {addr?.pincode}
                            </option>
                          );
                        })}
                        <option value="new">+ Deliver to a new address</option>
                      </select>
                    </div>
                  </div>
                )}

                {(!session || selectedAddressIndex === "new" || ((session.user as any).addresses || []).length === 0) && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Address Line 1</label>
                      <input
                        type="text"
                        value={addrL1}
                        onChange={(e) => setAddrL1(e.target.value)}
                        placeholder="House/Flat No., Building Name, Street"
                        className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={addrL2}
                        onChange={(e) => setAddrL2(e.target.value)}
                        placeholder="Landmark, Area, Colony"
                        className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Ahmedabad"
                          className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Gujarat"
                          className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Postal Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 380001"
                        maxLength={6}
                        className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    {session && (
                      <div className="space-y-3 rounded-xl bg-bg-base/50 p-4 border border-border/50">
                        <label className="group flex cursor-pointer items-center gap-3">
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                            saveNewAddress ? "border-primary bg-primary" : "border-dark/20 bg-surface group-hover:border-primary/50"
                          )}>
                            {saveNewAddress && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            checked={saveNewAddress}
                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                            className="hidden" 
                          />
                          <span className="text-[13.5px] font-medium text-dark">Save this address for future</span>
                        </label>

                        {saveNewAddress && (
                          <label className="group flex cursor-pointer items-center gap-3 pl-8">
                            <div className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                              newAddressAsDefault ? "border-primary bg-primary" : "border-dark/20 bg-surface group-hover:border-primary/50"
                            )}>
                              {newAddressAsDefault && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <input 
                              type="checkbox" 
                              checked={newAddressAsDefault}
                              onChange={(e) => setNewAddressAsDefault(e.target.checked)}
                              className="hidden" 
                            />
                            <span className="text-[12.5px] font-medium text-dark/70">Set as default address</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-2">
                  <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Contact Number</label>
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="h-12 w-full rounded-xl border border-border bg-bg-base px-4 text-[14px] font-medium outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Order Summary & Checkout */}
          <div className="space-y-6">
            
            {/* Coupon Discount */}
            <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
              <h3 className="font-display text-[18px] font-bold text-dark mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> Promotional Code
              </h3>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-green-50/50 border border-green-200 p-4 text-[14px] text-green-700 shadow-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="h-5 w-5 text-green-600" />
                    <span><strong>{appliedCoupon}</strong> Applied ({discountPercent}% Off)</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="font-bold text-red-500 hover:text-red-700">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. SOMNATH25"
                    className="h-12 flex-1 rounded-xl border border-border bg-bg-base px-4 text-[14px] outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-dark px-6 text-[14px] font-bold text-white transition hover:bg-primary"
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {couponError && (
                <div className="mt-3 text-[13px] font-medium text-red-500 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4" /> {couponError}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
              <h2 className="font-display text-[20px] font-bold text-dark mb-6">Order Summary</h2>
              <div className="space-y-4 text-[15px] font-medium text-dark/70">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-dark">₹{subtotal}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Coupon Discount</span>
                    <span className="font-bold">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping {paymentMethod === "cod" && " (COD & Delivery)"}</span>
                  <span className={cn(
                    "font-bold",
                    paymentMethod === "cod" ? (shippingCost > 0 ? "text-dark" : "text-dark/40 text-[13px]") : "text-green-600 uppercase text-[13px] tracking-wider mt-1"
                  )}>
                    {paymentMethod === "cod" 
                      ? (shippingCost > 0 ? `₹${shippingCost}` : "Enter address with pincode")
                      : "Free"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-bold text-dark">₹{gstAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (2%)</span>
                  <span className="font-bold text-dark">₹{platformFee}</span>
                </div>
                {paymentMethod === "cod" && isCalculatingShipping && (
                  <div className="text-[12px] text-dark/50 text-right mt-[-8px] animate-pulse">
                    Calculating delivery charges...
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-6 mt-6">
                  <span className="font-display text-[20px] font-bold text-dark">Total</span>
                  <span className="font-display text-[24px] font-bold text-dark">₹{total}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-8 border-t border-border pt-8">
                <h3 className="font-display text-[16px] font-bold text-dark mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className={cn(
                    "flex items-start gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all",
                    paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border bg-bg-base hover:border-primary/50"
                  )}>
                    <div className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      paymentMethod === "online" ? "border-primary" : "border-dark/30"
                    )}>
                      {paymentMethod === "online" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="hidden" />
                    <div>
                      <div className="text-[14px] font-bold text-dark">Online Payment</div>
                      <div className="text-[12.5px] text-dark/60 mt-0.5">Pay securely via UPI, Card, Netbanking</div>
                    </div>
                  </label>
                  
                  <label className={cn(
                    "flex items-start gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all",
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border bg-bg-base hover:border-primary/50"
                  )}>
                    <div className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      paymentMethod === "cod" ? "border-primary" : "border-dark/30"
                    )}>
                      {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="hidden" />
                    <div>
                      <div className="text-[14px] font-bold text-dark">Cash on Delivery (COD)</div>
                      <div className="text-[12.5px] text-dark/60 mt-0.5">Pay in cash when order is delivered</div>
                    </div>
                  </label>
                </div>
              </div>

              {checkoutError && (
                <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-[13px] font-medium text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[16px] font-bold text-white transition hover:bg-[#2E2387] shadow-xl shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {processing ? "Processing Order..." : paymentMethod === "cod" ? "Confirm Order" : "Pay Securely"}
                {!processing && <ArrowRight className="h-5 w-5" />}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] font-medium text-dark/40">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Secure Checkout powered by Razorpay</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
