"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, MapPin, Phone, Calendar, ArrowRight, ShoppingBag, Loader, Download } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID was found in the checkout success URL.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/admin/orders?orderId=${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          triggerInvoiceEmail(data.order._id);
        } else {
          setError(data.message || "Failed to load order details.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("An error occurred while loading your order summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const triggerInvoiceEmail = async (id: string) => {
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/checkout/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("sent");
      } else {
        setEmailStatus("error");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailStatus("error");
    }
  };

  const handleDownloadPDF = () => {
    if (orderId) {
      window.location.href = `/api/checkout/download-invoice?orderId=${orderId}`;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1240px] flex-col items-center justify-center px-4 py-24 text-center bg-bg-base">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 text-[15px] font-bold text-dark/60">Fetching order details and preparing your invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1240px] flex-col items-center justify-center px-4 py-20 text-center bg-bg-base">
        <div className="mb-8 grid h-24 w-24 place-items-center rounded-full bg-red-50 text-red-500 border border-red-100 shadow-sm">
          <Loader className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="font-display text-[28px] font-bold text-dark">Order Inquiry Status</h2>
        <p className="mt-3 text-[15px] text-dark/60 max-w-[400px] leading-relaxed font-medium">
          {error || "We could not find the order details for this checkout."}
        </p>
        <Link href="/" className="mt-10 rounded-full bg-dark px-8 py-4 text-[15px] font-bold text-white hover:bg-primary transition shadow-lg hover:-translate-y-0.5">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="mx-auto max-w-[800px] px-4 py-12 md:py-20">
        {/* Success Banner Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-green-50 text-green-500 border-2 border-green-200 shadow-xl shadow-green-100/50"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
          </motion.div>
          
          <h1 className="font-display text-[32px] md:text-[42px] font-bold text-dark tracking-tight">Order Confirmed!</h1>
          <p className="mt-4 text-[16px] text-dark/60 max-w-[500px] mx-auto leading-relaxed font-medium">
            Thank you for choosing Somnath NX. Your premium nightwear order has been successfully placed and is being prepared for dispatch.
          </p>

          {/* Email Invoice Dispatch Status Badge */}
          <div className="mt-6 flex justify-center">
            {emailStatus === "sending" && (
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-200 px-4 py-1.5 text-[13px] font-bold text-yellow-700">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Sending invoice to <strong>{order.email}</strong>...</span>
              </div>
            )}
            {emailStatus === "sent" && (
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-[13px] font-bold text-green-700">
                <Mail className="h-4 w-4" />
                <span>Invoice successfully sent to <strong>{order.email}</strong>!</span>
              </div>
            )}
            {emailStatus === "error" && (
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-[13px] font-bold text-red-700">
                <Mail className="h-4 w-4" />
                <span>Could not deliver email. You can download the invoice below.</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Card Container */}
        <div className="rounded-[32px] border border-border bg-surface p-8 md:p-12 shadow-xl shadow-dark/5 print:border-none print:shadow-none print:p-0">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border pb-8 mb-8">
            <div>
              <div className="font-display text-[24px] font-bold text-primary">Somnath NX</div>
              <div className="text-[13px] font-bold text-dark/50 mt-1 uppercase tracking-widest">Premium Nightwear</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[13px] font-bold text-dark/50 uppercase tracking-wider">Order Reference</div>
              <div className="font-mono text-[16px] font-bold text-dark mt-1">{order._id}</div>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-bg-base border border-border rounded-[24px] p-6 mb-10 text-[14px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-dark">
                <Calendar className="h-5 w-5 text-dark/40" />
                <span><strong className="text-dark/70">Order Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
              </div>
              <div className="flex items-center gap-3 text-dark">
                <CheckCircle className="h-5 w-5 text-dark/40" />
                <span><strong className="text-dark/70">Payment Status:</strong> <span className="text-green-600 font-bold ml-1">Paid (Secured)</span></span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-dark">
                <MapPin className="h-5 w-5 text-dark/40 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <strong className="text-dark/70 block mb-1">Shipping Address:</strong>
                  <p className="text-dark font-medium leading-relaxed break-words">{order.shippingDetails.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-dark mt-2">
                <Phone className="h-5 w-5 text-dark/40" />
                <span><strong className="text-dark/70">Contact Number:</strong> {order.shippingDetails.phone}</span>
              </div>
            </div>
          </div>

          {/* Invoice Items List */}
          <div className="mb-10">
            <h3 className="font-display text-[18px] font-bold text-dark border-b border-border pb-4 mb-6">Order Items</h3>
            <div className="space-y-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-12 rounded-lg bg-bg-base border border-border overflow-hidden shrink-0 hidden sm:block">
                      <img src={item.image} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold text-dark truncate">{item.title}</div>
                      <div className="text-[13px] font-medium text-dark/50 mt-1">Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                  </div>
                  <div className="font-display text-[16px] font-bold text-dark shrink-0">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Table */}
          <div className="w-full sm:w-[320px] ml-auto space-y-4 text-[15px] font-medium text-dark/70 border-t border-border pt-8">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-dark">₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-secondary">
                <span>Promotional Discount:</span>
                <span className="font-bold">-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-bold text-green-600 uppercase text-[13px] tracking-wider mt-0.5">Free</span>
            </div>
            <div className="flex justify-between border-t border-border pt-6 mt-2 text-[20px] font-display">
              <span className="font-bold text-dark">Grand Total:</span>
              <span className="font-bold text-primary">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-border bg-surface px-8 py-4 text-[14px] font-bold text-dark hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            <span>Download Invoice PDF</span>
          </button>

          <Link
            href="/profile"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary/10 px-8 py-4 text-[14px] font-bold text-primary hover:bg-primary/20 transition-all active:scale-[0.98]"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>View Orders</span>
          </Link>

          <Link
            href="/products"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-[14px] font-bold text-white hover:bg-[#2E2387] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:-translate-y-0.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-screen max-w-[1240px] flex-col items-center justify-center px-4 py-24 text-center bg-bg-base">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-6 text-[15px] font-bold text-dark/60">Loading confirmation details...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
