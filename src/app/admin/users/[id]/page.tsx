"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Mail, Calendar, Shield, MapPin, 
  ShoppingCart, Heart, Package
} from "lucide-react";

export default function UserDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (isAdmin && userId) {
      fetchUserDetail();
      fetchProducts();
    }
  }, [session, userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserData(data.user);
        setOrders(data.orders);
      } else {
        setError(data.message || "Failed to fetch user details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading user data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products list:", err);
    }
  };

  const handleToggleUserRole = async () => {
    if (!userData) return;
    const targetRole = userData.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, role: targetRole }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`User role updated to ${targetRole}`);
        setUserData((prev: any) => ({ ...prev, role: targetRole }));
      }
    } catch (error) {
      console.error(error);
    }
  };

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
        // Refresh orders
        fetchUserDetail();
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
        // Refresh orders
        fetchUserDetail();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingNum: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, shippingStatus: orders.find(o => o._id === orderId)?.shippingStatus, trackingNumber: trackingNum }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Tracking number updated to: ${trackingNum}`);
        fetchUserDetail();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-dark">Access Denied</h2>
        <p className="mt-2 text-[14px] text-dark/70">Please sign in to access the admin panel.</p>
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
        <p className="mt-2 text-[14px] text-dark/70">You do not have permission to view user accounts.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-[#1A0F1C] px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-black">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/admin?tab=users" className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard (Users)
        </Link>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center text-[14px] text-dark/50">
          Loading user details...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : !userData ? (
        <div className="text-center text-[14px] text-gray-500">User not found.</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Left Column: User Profile Card & Saved Addresses */}
          <div className="space-y-6">
            {/* Profile Summary Card */}
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {userData.image ? (
                  <img src={userData.image} alt={userData.name} className="h-24 w-24 rounded-full border-2 border-primary object-cover mb-4" />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-[#E91E7A] text-[28px] font-bold text-white mb-4">
                    {userData.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                )}
                <h2 className="text-[20px] font-bold text-dark">{userData.name}</h2>
                <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${userData.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                  {userData.role}
                </span>

                <div className="mt-6 w-full space-y-4 border-t border-border pt-4 text-left text-[13.5px] text-dark/80">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-dark/50 shrink-0" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-dark/50 shrink-0" />
                    <span>Registered: {new Date(userData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-dark/50 shrink-0" />
                    <span>User ID: <span className="font-mono text-[12px]">{userData._id}</span></span>
                  </div>
                </div>

                <button
                  onClick={handleToggleUserRole}
                  className="mt-6 w-full rounded-full border border-border py-2 text-[13px] font-semibold text-primary hover:bg-surface transition"
                >
                  Toggle to {userData.role === "admin" ? "User" : "Admin"} Role
                </button>
              </div>
            </div>

            {/* Address Book Card */}
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-[16px] font-semibold text-dark flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-primary" /> Saved Address Book
              </h3>
              {userData.addresses && userData.addresses.length > 0 ? (
                <ul className="space-y-3">
                  {userData.addresses.map((addr: string, i: number) => (
                    <li key={i} className="text-[13px] text-dark/80 flex items-start gap-2.5 rounded-2xl border border-border p-3 bg-[#FFFCFE]">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${addr === userData.defaultAddress ? "bg-primary" : "bg-[#D6C4D8]"}`} />
                      <div className="flex-1 leading-relaxed">
                        {addr}
                        {addr === userData.defaultAddress && (
                          <span className="ml-2 inline-block rounded bg-[var(--color-primary-light)] px-1.5 py-0.5 text-[9.5px] font-bold text-primary border border-[#E9D5ED]">
                            Default
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-gray-400 italic">No addresses saved in profile.</p>
              )}
            </div>
          </div>

          {/* Right Column: Cart, Wishlist, Order History */}
          <div className="space-y-6">
            
            {/* Synced Cart & Wishlist Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Sync Cart */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-[16px] font-semibold text-dark flex items-center gap-2">
                  <ShoppingCart className="h-4.5 w-4.5 text-primary" /> Synced Cart
                </h3>
                {userData.cart && userData.cart.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {userData.cart.map((item: any, i: number) => (
                      <Link href={`/product/${item.id}`} key={i} className="flex items-center gap-3 rounded-xl border border-border p-2 hover:bg-surface/30 transition group">
                        <img src={item.image} alt="" className="h-10 w-9 rounded object-cover bg-gray-50 border shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-semibold text-dark truncate group-hover:text-primary transition">{item.title}</h4>
                          <p className="text-[11px] text-dark/50">Qty: {item.quantity} • ₹{item.price} each</p>
                        </div>
                        <span className="text-[13px] font-bold text-dark">₹{item.price * item.quantity}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 italic">Cart is empty.</p>
                )}
              </div>

              {/* Sync Wishlist */}
              <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-[16px] font-semibold text-dark flex items-center gap-2">
                  <Heart className="h-4.5 w-4.5 text-red-500" /> Synced Wishlist
                </h3>
                {userData.wishlist && userData.wishlist.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {userData.wishlist.map((wId: number, i: number) => {
                      const prod = products.find(p => p.id === wId);
                      return (
                        <Link href={`/product/${wId}`} key={i} className="flex items-center gap-3 rounded-xl border border-border p-2 hover:bg-red-50/10 transition group">
                          {prod ? (
                            <>
                              <img src={prod.image} alt="" className="h-10 w-9 rounded object-cover bg-gray-50 border shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[13px] font-semibold text-dark truncate group-hover:text-primary transition">{prod.title}</h4>
                                <p className="text-[11px] text-dark/50">Category: {prod.category}</p>
                              </div>
                              <span className="text-[13.5px] font-semibold text-primary">₹{prod.price}</span>
                            </>
                          ) : (
                            <div className="text-[12px] text-gray-500">Product ID: {wId}</div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-gray-400 italic">Wishlist is empty.</p>
                )}
              </div>
            </div>

            {/* Orders History Card */}
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-[17px] font-semibold text-dark flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Order History ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <p className="text-[14px] text-center text-dark/50 py-8">No orders placed by this user yet.</p>
              ) : (
                <div className="space-y-5">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-border p-5 hover:border-primary/50 transition">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 mb-4">
                        <div>
                          <div className="text-[13px] text-dark/50">
                            Order ID: <span className="font-mono text-primary font-semibold">{order._id}</span>
                          </div>
                          <div className="text-[12px] text-dark/50 mt-0.5">
                            Date: {new Date(order.createdAt).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Payment Method badge */}
                          <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase">
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
                            className="rounded-full border border-border bg-white px-3 py-1 text-[12.5px] font-medium text-dark/80 outline-none"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Order Info & Items */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <ul className="space-y-2.5">
                            {order.items.map((item: any, idx: number) => (
                              <Link href={`/product/${item.productId || item.id}`} key={idx} className="flex items-center gap-3 text-[13px] text-dark/80 hover:bg-surface/50 p-1.5 rounded-lg transition group">
                                <img src={item.image} alt="" className="h-8 w-7 rounded bg-gray-50 border shrink-0 object-cover" />
                                <span className="font-medium text-dark truncate group-hover:text-primary transition">{item.title}</span>
                                <span className="text-dark/50 shrink-0">({item.quantity}x)</span>
                                <span className="ml-auto font-semibold">₹{item.price * item.quantity}</span>
                              </Link>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-xl bg-surface p-3 text-[12.5px] border border-border">
                          <div className="font-semibold text-dark mb-1.5">Delivery Details</div>
                          <div><strong>Contact:</strong> {order.shippingDetails.name}</div>
                          <div><strong>Phone:</strong> {order.shippingDetails.phone}</div>
                          <div className="mt-1 truncate"><strong>Addr:</strong> {order.shippingDetails.address}</div>
                          <div className="mt-2 border-t border-border pt-1.5 flex justify-between font-bold text-dark">
                            <span>Grand Total:</span>
                            <span>₹{order.total}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tracking number section */}
                      <div className="mt-4 border-t border-border pt-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[12.5px] text-dark/70 w-full max-w-[320px]">
                          <span>Tracking #:</span>
                          <input 
                            type="text" 
                            placeholder="Enter tracking ID..." 
                            defaultValue={order.trackingNumber || ""}
                            onBlur={(e) => handleUpdateTracking(order._id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateTracking(order._id, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="flex-1 rounded-lg border border-border px-2.5 py-1 text-[12.5px] focus:outline-primary bg-white text-dark"
                          />
                        </div>
                        <div className="text-[11.5px] text-dark/50 italic">Press Enter / Click away to save tracking #</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
