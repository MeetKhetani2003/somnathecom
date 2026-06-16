"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function CreateOfflineOrderPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Customer Details Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("Offline Walk-in Counter");

  // Selected Product Item
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Cart List
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("paid");
  const [shippingStatus, setShippingStatus] = useState<string>("Delivered");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddItem = () => {
    if (selectedProductId === "") return;
    const prod = products.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    if (prod.stock < selectedQuantity) {
      alert(`Only ${prod.stock} items left in stock for ${prod.title}.`);
      return;
    }

    // Check if product already added in cart
    const existingIdx = cartItems.findIndex(item => item.productId === prod.id);
    if (existingIdx !== -1) {
      const newQty = cartItems[existingIdx].quantity + selectedQuantity;
      if (prod.stock < newQty) {
        alert(`Cannot add more. Total added quantity (${newQty}) exceeds stock (${prod.stock}).`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIdx].quantity = newQty;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: prod.id,
          title: prod.title,
          price: prod.price,
          image: prod.image,
          quantity: selectedQuantity
        }
      ]);
    }

    // Reset selection inputs
    setSelectedProductId("");
    setSelectedQuantity(1);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - manualDiscount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Customer Name and Phone Number are required.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Please add at least one product item to the order.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerDetails: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: customerAddress
          },
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          discount: manualDiscount,
          paymentStatus,
          shippingStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Offline order created and stock updated successfully!");
        router.push("/admin?tab=orders");
      } else {
        setError(data.message || "Failed to create offline order.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred while creating order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-dark">Access Denied</h2>
        <p className="mt-2 text-[14px] text-dark/70">Please sign in to access the administrator console.</p>
        <Link href="/profile" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#7A187C]">
          Go to Profile
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-red-600">Admin Privileges Required</h2>
        <p className="mt-2 text-[14px] text-dark/70">Your account does not have admin permissions.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-[#1A0F1C] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-black">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/admin?tab=orders" className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-dark">Create Offline Order</h1>
        <p className="text-[14px] text-dark/70">Place a custom order for walk-in/counter sales. Inventory stocks will deduct automatically.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-[13.5px] text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid gap-8 md:grid-cols-[1.2fr_1fr]">

        {/* Left Side: Customer Info & Add Items */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-[17px] font-semibold text-dark mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-dark/80">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Walkin Client"
                    className="h-10.5 w-full rounded-xl border border-border px-3.5 text-[13.5px] focus:outline-primary bg-white text-dark"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12.5px] font-medium text-dark/80">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="98765 XXXXX"
                    className="h-10.5 w-full rounded-xl border border-border px-3.5 text-[13.5px] focus:outline-primary bg-white text-dark"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-medium text-dark/80">Email Address (Optional)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. client@email.com"
                  className="h-10.5 w-full rounded-xl border border-border px-3.5 text-[13.5px] focus:outline-primary bg-white text-dark"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-medium text-dark/80">Shipping/Store Address</label>
                <textarea
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Street / Walk-in Purchase Counter"
                  className="w-full rounded-xl border border-border p-3 text-[13.5px] focus:outline-primary bg-white text-dark"
                />
              </div>
            </div>
          </div>

          {/* Add Products Selector */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-[17px] font-semibold text-dark mb-4">Add Product Items</h2>

            {loadingProducts ? (
              <div className="text-[13px] text-gray-400">Loading shop inventory...</div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <label className="mb-1 block text-[12.5px] font-medium text-dark/80">Select Product (Searchable)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type product title or category to search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="h-11 flex-1 rounded-xl border border-border px-3.5 text-[13.5px] focus:outline-primary bg-white text-dark"
                    />
                    {selectedProductId !== "" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId("");
                          setSearchQuery("");
                        }}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 text-[12px] text-red-600 hover:bg-red-100"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {showDropdown && (
                    <div className="absolute z-20 mt-1 max-h-[200px] w-full overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-[13.5px] text-gray-400 italic">No products found</div>
                      ) : (
                        filteredProducts.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            disabled={p.stock <= 0}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setSearchQuery(`${p.title} (₹${p.price} | Stock: ${p.stock})`);
                              setShowDropdown(false);
                            }}
                            className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] border-b border-gray-50 last:border-0 hover:bg-surface transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <div>
                              <span className="font-semibold text-dark">{p.title}</span>
                              <span className="ml-2 inline-block rounded bg-surface px-1.5 py-0.5 text-[10px] text-dark/50">{p.category}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-primary">₹{p.price}</span>
                              <span className="ml-2 text-[11px] text-dark/50">Stock: {p.stock}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedProductId !== "" && (
                  <div className="flex items-end gap-4">
                    <div className="w-[120px]">
                      <label className="mb-1 block text-[12.5px] font-medium text-dark/80">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={products.find(p => p.id === Number(selectedProductId))?.stock || 1}
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value)))}
                        className="h-10.5 w-full rounded-xl border border-border px-3.5 text-[13.5px] focus:outline-primary bg-white text-dark"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="h-10.5 rounded-xl bg-primary px-5 text-[13.5px] font-semibold text-white hover:bg-[#7A187C] transition flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary & Checkout */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface/70 p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-dark mb-4">Cart List</h2>

            {cartItems.length === 0 ? (
              <p className="text-[13px] text-center text-gray-400 py-8">No items added to the list.</p>
            ) : (
              <div className="space-y-3.5 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl border border-white bg-white/60 p-2.5">
                    <img src={item.image} alt="" className="h-11 w-9 rounded object-cover bg-gray-50 border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-semibold text-dark truncate">{item.title}</h4>
                      <p className="text-[11px] text-dark/50">{item.quantity}x • ₹{item.price}</p>
                    </div>
                    <span className="text-[13px] font-bold text-dark mr-2">₹{item.price * item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-dark/40 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations & Fields */}
            <div className="border-t border-[#E9D5ED] pt-4 space-y-4 text-[13.5px] text-dark/80">
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-dark/50">Manual Discount Amount (₹)</label>
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={manualDiscount}
                  onChange={(e) => setManualDiscount(Math.min(subtotal, Math.max(0, Number(e.target.value))))}
                  className="h-9 w-full rounded-lg border border-border px-3 text-[13px] bg-white text-dark"
                />
              </div>

              <div className="flex justify-between font-bold text-dark text-[16px] border-t border-[#E9D5ED] pt-3">
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Settings Card */}
            <div className="mt-6 space-y-4 border-t border-[#E9D5ED] pt-4">
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-dark/50">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-border bg-white px-2.5 text-[12.5px] text-dark cursor-pointer"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-dark/50">Shipping Status</label>
                  <select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-border bg-white px-2.5 text-[12.5px] text-dark cursor-pointer"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="mt-6 w-full rounded-full bg-primary py-3 text-[14.5px] font-bold text-white transition hover:bg-[#7A187C] disabled:opacity-50"
            >
              {submitting ? "Creating Order..." : "Confirm & Save Order"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
