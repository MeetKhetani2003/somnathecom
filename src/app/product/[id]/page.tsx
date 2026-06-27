"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, ChevronRight, ChevronDown, X, Trash2, Sparkles, Check } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

const ImageMagnifier = ({ src, alt }: { src: string, alt: string }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className="relative h-full w-full cursor-crosshair overflow-hidden rounded-[24px]"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105" />
      {showMagnifier && (
        <div
          className="pointer-events-none absolute inset-0 z-20 bg-white"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: '250%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

export default function ProductSlug() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart, wishlist, toggleWishlist } = useShop();

  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState<string>("description");

  // Size guide modal state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const isAdmin = (session?.user as any)?.role === "admin";

  // Reseller sharing states
  const [resellerCode, setResellerCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const defaultCode = (session.user as any).referralCode || session.user.name?.replace(/\s+/g, "").toUpperCase() || "";
      setResellerCode(defaultCode);
    } else {
      if (typeof window !== "undefined") {
        const savedCode = localStorage.getItem("somnath_ref");
        if (savedCode) {
          setResellerCode(savedCode);
        }
      }
    }
  }, [session]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && product) {
      const shareUrl = window.location.origin + "/product/" + product.id + (resellerCode ? "?ref=" + encodeURIComponent(resellerCode) : "");
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  useEffect(() => {
    if (id) fetchProductDetails();
    fetchProductsList();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        // Auto-select first color if colors exist
        if (data.product.colors && data.product.colors.length > 0) {
          setSelectedColor(data.product.colors[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      alert("Please sign in first to write a review.");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("Please type a comment.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: session.user.name || "Anonymous",
          userEmail: session.user.email,
          rating: reviewRating,
          comment: reviewComment,
        })
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setReviewComment("");
        setReviewRating(5);
        alert("Review submitted successfully!");
      } else {
        setReviewError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("An error occurred while submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/products/${product.id}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        alert("Review deleted successfully!");
      } else {
        alert(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="font-display text-[15px] font-bold text-dark/50">Preparing details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-bg-base">
        <div className="rounded-[32px] border border-border bg-surface p-12 text-center shadow-xl">
          <h2 className="font-display text-[24px] font-bold text-dark">Style Not Found</h2>
          <p className="mt-2 text-[15px] text-dark/60">The collection item you are looking for does not exist.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-primary px-8 py-3.5 font-bold text-white transition hover:bg-dark">
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  
  // ─── Color-aware image computation ────────────────────────────────────────
  const hasColors = product.colors && product.colors.length > 0;
  const activeColorObj = hasColors
    ? product.colors.find((c: any) => c.name === selectedColor) || product.colors[0]
    : null;

  // Images: if a color is selected and has images, use those. Otherwise use the product-level images.
  const colorImages = activeColorObj?.images || [];
  const detailedImages: string[] = product.images && product.images.length > 0 ? product.images : [];
  
  let images: string[];
  if (hasColors && colorImages.length > 0) {
    // Use color-specific images
    images = colorImages;
  } else {
    // Fallback to product-level images
    images = product.image
      ? [product.image, ...detailedImages.filter((img: string) => img !== product.image)]
      : detailedImages.length > 0 ? detailedImages : [];
  }

  // ─── Color-aware sizes ────────────────────────────────────────────────────
  const availableSizes = hasColors && activeColorObj
    ? activeColorObj.sizes || []
    : product.sizes || [];
  
  const reviewsList = product.reviews || [];

  // Reset activeImage when color changes (handled via effect)
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedSize(null); // Reset size when color changes
    setActiveImage(0);     // Reset to first image of new color
  };

  const handleAddToCart = () => {
    if (hasColors && !selectedColor) {
      alert('Please select a color first');
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      alert('Please select a size first');
      return;
    }
    addToCart(product, selectedColor || undefined, selectedSize || undefined);
  };

  const handleBuyNow = () => {
    if (hasColors && !selectedColor) {
      alert('Please select a color first');
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      alert('Please select a size first');
      return;
    }
    addToCart(product, selectedColor || undefined, selectedSize || undefined);
    router.push("/cart");
  };

  return (
    <div className="bg-bg-base py-6 md:py-12">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        
        {/* Breadcrumbs */}
        <nav className="mb-8 flex flex-wrap items-center text-[13px] font-medium text-dark/50 gap-y-1">
          <Link href="/" className="transition hover:text-primary shrink-0">Home</Link>
          <ChevronRight className="mx-2 h-3.5 w-3.5 shrink-0" />
          <Link href="/products" className="transition hover:text-primary shrink-0">Collection</Link>
          <ChevronRight className="mx-2 h-3.5 w-3.5 shrink-0" />
          <Link href={`/products?category=${product.category}`} className="transition hover:text-primary shrink-0">{product.category}</Link>
          <ChevronRight className="mx-2 h-3.5 w-3.5 shrink-0" />
          <span className="text-dark truncate max-w-[200px] sm:max-w-none">{product.title}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Images Section */}
          <div className="flex flex-col gap-4 md:sticky md:top-28 h-fit">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[32px] bg-surface shadow-sm border border-border group">
              <ImageMagnifier src={images[activeImage] || product.image} alt={product.title} />
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute right-6 top-6 z-30 grid h-12 w-12 place-items-center rounded-full bg-surface/90 text-dark/50 shadow-lg backdrop-blur-md transition-all hover:text-secondary hover:scale-110"
              >
                <Heart className={cn("h-6 w-6 transition", isWishlisted && "fill-secondary text-secondary")} />
              </button>
              {product.tag && (
                <div className="absolute left-6 top-6 z-30 rounded-full bg-primary px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-white shadow-lg">
                  {product.tag}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 sm:gap-4">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative aspect-[3/4] overflow-hidden rounded-2xl border-2 transition-all hover:shadow-lg",
                      activeImage === idx ? "border-primary" : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${product.title} view ${idx + 1}`} className="h-full w-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-widest text-primary">{product.category}</span>
            </div>

            <h1 className="font-display text-[32px] font-bold leading-[1.1] text-dark md:text-[42px] lg:text-[48px]">{product.title}</h1>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 shadow-sm">
                <Star className="h-4 w-4 fill-[#F5A524] text-[#F5A524]" />
                <span className="text-[13px] font-bold text-dark">{product.rating || 4.9}</span>
              </div>
              <span className="text-[14px] font-medium text-dark/50 hover:text-primary cursor-pointer transition" onClick={() => window.scrollTo({ top: document.getElementById('reviews')?.offsetTop || 0, behavior: 'smooth'})}>
                Read {reviewsList.length} Reviews
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-[36px] font-bold text-dark">₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-[20px] text-dark/40 line-through">₹{product.mrp}</span>
                  <span className="ml-2 rounded-lg bg-secondary/10 px-3 py-1 text-[14px] font-bold text-secondary border border-secondary/20">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-[13px] text-dark/50">Inclusive of all taxes. Free shipping on prepaid orders.</p>

            {/* ════════════ COLOR SELECTOR ════════════ */}
            {hasColors && (
              <div className="mt-10">
                <h3 className="font-display text-[16px] font-bold text-dark mb-4">
                  Select Color
                  {selectedColor && (
                    <span className="ml-2 text-[14px] font-medium text-primary">— {selectedColor}</span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-5">
                  {product.colors.map((colorObj: any, idx: number) => {
                    const isSelected = selectedColor === colorObj.name;
                    const colorTotalStock = (colorObj.sizes || []).reduce((s: number, sz: any) => s + (Number(sz.stock) || 0), 0);
                    const isOutOfStock = colorTotalStock === 0;
                    const colorThumb = colorObj.images && colorObj.images.length > 0 ? colorObj.images[0] : product.image;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleColorChange(colorObj.name)}
                        title={isOutOfStock ? `${colorObj.name} — Out of Stock` : `${colorObj.name} (${colorTotalStock} available)`}
                        className="group relative flex flex-col items-center gap-2 focus:outline-none transition-all cursor-pointer"
                      >
                        <div className={cn(
                          "relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all duration-300 shadow-sm",
                          isSelected 
                            ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md" 
                            : "border-border hover:border-primary/50 group-hover:scale-105"
                        )}>
                          <img src={colorThumb} alt={colorObj.name} className="h-full w-full object-cover object-top" />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                              <div className="w-full h-[1.5px] bg-red-500/60 rotate-45" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <Check className="h-5 w-5 text-primary bg-white rounded-full p-0.5 shadow-sm" />
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-[12px] font-bold tracking-tight transition-colors flex items-center gap-1",
                          isSelected ? "text-primary font-extrabold" : "text-dark/70 group-hover:text-primary"
                        )}>
                          {colorObj.name}
                          {isOutOfStock && (
                            <span className="text-[9px] font-semibold text-red-500 bg-red-50 px-1 rounded border border-red-100 leading-normal">Out</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════ SIZES ════════════ */}
            {availableSizes.length > 0 && (
              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-[16px] font-bold text-dark">Select Size</h3>
                  <button onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-1 text-[13px] font-bold text-primary hover:underline">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((sizeObj: any, idx: number) => {
                    const sizeLabel = typeof sizeObj === "object" && sizeObj !== null ? sizeObj.size : sizeObj;
                    const sizeStock = typeof sizeObj === "object" && sizeObj !== null ? Number(sizeObj.stock) : 1;
                    const isOutOfStock = sizeStock === 0;
                    return (
                      <button
                        key={idx}
                        onClick={() => !isOutOfStock && setSelectedSize(sizeLabel)}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? "Out of Stock" : `${sizeStock} in stock`}
                        className={cn(
                          "relative rounded-xl border-2 px-6 py-3 font-display text-[15px] font-bold transition-all focus:outline-none",
                          isOutOfStock
                            ? "cursor-not-allowed border-border bg-bg-base text-dark/30 line-through"
                            : selectedSize === sizeLabel
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                              : "border-border bg-surface text-dark hover:border-primary/50"
                        )}
                      >
                        {sizeLabel}
                      </button>
                    );
                  })}
                </div>
                
                {/* Real-time Stock Status Card */}
                <div className="mt-6">
                  {selectedSize ? (
                    (() => {
                      const selectedSizeObj = availableSizes.find(
                        (s: any) => (typeof s === "object" && s !== null ? s.size : s) === selectedSize
                      );
                      const stockCount = selectedSizeObj ? (typeof selectedSizeObj === "object" ? Number(selectedSizeObj.stock) : 10) : 0;
                      
                      if (stockCount === 0) {
                        return (
                          <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200/50 p-4 text-[14px] text-red-700 font-medium">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span>Out of stock in size <strong className="font-bold">{selectedSize}</strong>. Please select another variant.</span>
                          </div>
                        );
                      } else if (stockCount <= 5) {
                        return (
                          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200/50 p-4 text-[14px] text-amber-800 font-medium animate-pulse">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                            <span>Hurry! Only <strong className="font-bold">{stockCount}</strong> items left in size <strong className="font-bold">{selectedSize}</strong>!</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200/50 p-4 text-[14px] text-green-700 font-medium">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span>In Stock. <strong className="font-bold">{stockCount}</strong> items available. Ready to ship!</span>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl bg-bg-base border border-border p-4 text-[13.5px] text-dark/60 font-medium">
                      <span className="h-2 w-2 rounded-full bg-dark/40 shrink-0 animate-pulse"></span>
                      <span>Select a size to view real-time availability and stock levels.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-border bg-surface py-4 text-[15px] font-bold text-dark transition hover:border-primary hover:text-primary active:scale-[0.98]"
              >
                <ShoppingBag className="h-5 w-5" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-[#2E2387] active:scale-[0.98]"
              >
                Buy It Now
              </button>
            </div>

            {/* Selected variant summary */}
            {(selectedColor || selectedSize) && (
              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-[13px] text-dark/80">
                <span className="font-bold text-primary">Your Selection: </span>
                {selectedColor && <span>{selectedColor}</span>}
                {selectedColor && selectedSize && <span> — </span>}
                {selectedSize && <span>Size {selectedSize}</span>}
              </div>
            )}

            {/* 📢 RESELLER ONE-CLICK SHARE PANEL */}
            <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-display text-[16px] font-bold text-dark">Reseller & Affiliate Sharing</h3>
              </div>
              <p className="text-[13px] text-dark/70 mb-4">
                Share this product with your customers and earn commissions! Enter your Reseller Code to customize the links:
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter Reseller Code (e.g., RESELLER10)..."
                  value={resellerCode}
                  onChange={(e) => setResellerCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-dark focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this premium nightwear: *${product?.title}* at only *₹${product?.price}*! Buy here: ${
                      typeof window !== "undefined" && product
                        ? window.location.origin + "/product/" + product.id + (resellerCode ? "?ref=" + encodeURIComponent(resellerCode) : "")
                        : ""
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-[11px] font-bold text-white transition hover:bg-emerald-600 hover:scale-[1.02] shadow-sm cursor-pointer"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.5.003 9.961-4.454 9.964-9.948.002-2.661-1.034-5.163-2.92-7.049C16.431 1.721 13.93 .687 11.27.687c-5.498 0-9.957 4.455-9.96 9.95-.001 1.905.481 3.766 1.398 5.393L1.622 20.8l4.9-1.286zM16.92 13.41c-.287-.144-1.7-.838-1.962-.933-.263-.096-.454-.144-.645.144-.19.287-.739.933-.907 1.124-.167.19-.335.215-.622.072-.287-.144-1.21-.446-2.305-1.424-.853-.76-1.429-1.698-1.597-1.985-.168-.287-.018-.441.125-.584.13-.13.287-.335.43-.502.144-.167.191-.287.287-.478.096-.19.047-.358-.024-.502-.072-.143-.645-1.554-.884-2.128-.233-.56-.472-.482-.645-.491-.167-.008-.358-.01-.55-.01-.19 0-.501.072-.763.358-.263.287-1.004.98-1.004 2.39 0 1.41 1.027 2.772 1.171 2.964.143.19 2.021 3.086 4.896 4.328.684.296 1.218.473 1.634.605.688.219 1.314.188 1.81.114.553-.082 1.7-.694 1.939-1.365.239-.67.239-1.243.167-1.365-.072-.122-.263-.19-.55-.335z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
                
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    typeof window !== "undefined" && product
                      ? window.location.origin + "/product/" + product.id + (resellerCode ? "?ref=" + encodeURIComponent(resellerCode) : "")
                      : ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-blue-600 py-3 text-[11px] font-bold text-white transition hover:bg-blue-700 hover:scale-[1.02] shadow-sm cursor-pointer"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-pink-600 py-3 text-[11px] font-bold text-white transition hover:bg-pink-700 hover:scale-[1.02] shadow-sm cursor-pointer focus:outline-none"
                >
                  <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copy Link</span>
                </button>
              </div>

              {copied && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-[11.5px] font-semibold text-green-700 border border-green-200">
                  <Check className="h-3.5 w-3.5" />
                  <span>Referral link copied! Share it on Instagram, bio, or stories.</span>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-2 gap-4 rounded-[24px] border border-border bg-surface p-6 sm:grid-cols-4 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-[12px] font-bold text-dark">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="text-[12px] font-bold text-dark">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <RotateCcw className="h-6 w-6 text-primary" />
                <span className="text-[12px] font-bold text-dark">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-[12px] font-bold text-dark">Finest Fabric</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="mt-10 border-t border-border">
              {[
                { id: "description", title: "Product Description", content: product.description },
                { 
                  id: "materials", 
                  title: "Materials & Care", 
                  content: (
                    <div className="space-y-4">
                      <div>
                        <strong className="text-dark">Fabric:</strong> {product.material}
                      </div>
                      <div>
                        <strong className="text-dark">Care Instructions:</strong> {product.careInstructions}
                      </div>
                      {product.whatsIncluded && (
                         <div>
                           <strong className="text-dark">What&apos;s Included:</strong> {Array.isArray(product.whatsIncluded) ? product.whatsIncluded.join(", ") : product.whatsIncluded}
                         </div>
                      )}
                    </div>
                  )
                },
                { 
                  id: "shipping", 
                  title: "Shipping & Returns", 
                  content: "We offer free shipping on all prepaid orders. Delivery takes 3-5 business days. You can return the product within 7 days of delivery for a full refund or exchange. The item must be unused, unwashed, and have original tags attached." 
                }
              ].map((acc) => (
                <div key={acc.id} className="border-b border-border">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? "" : acc.id)}
                    className="flex w-full items-center justify-between py-5 text-left focus:outline-none"
                  >
                    <span className="font-display text-[16px] font-bold text-dark">{acc.title}</span>
                    <ChevronDown className={cn("h-5 w-5 text-dark/50 transition-transform duration-300", openAccordion === acc.id && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === acc.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-[14.5px] leading-relaxed text-dark/70">
                          {acc.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div id="reviews" className="mt-20 md:mt-32">
          <div className="text-center mb-12">
            <h2 className="font-display text-[32px] font-bold text-dark md:text-[40px]">Customer Reviews</h2>
            <p className="mt-3 text-[16px] text-dark/60">Real feedback from verified buyers.</p>
          </div>

          <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div className="space-y-8">
              <div className="rounded-[32px] border border-border bg-surface p-10 text-center shadow-sm">
                <div className="font-display text-[64px] font-bold text-dark leading-none">{product.rating || 4.9}</div>
                <div className="mt-4 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-6 w-6", i < Math.floor(product.rating || 4.9) ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                  ))}
                </div>
                <div className="mt-3 text-[14px] font-medium text-dark/50">Based on {reviewsList.length} Reviews</div>
              </div>

              {/* Write a Review Form */}
              <div className="rounded-[32px] border border-border bg-surface p-8 shadow-sm">
                <h3 className="font-display text-[20px] font-bold text-dark mb-6">Write a Review</h3>
                {session?.user ? (
                  <form onSubmit={handleAddReview} className="space-y-5">
                    {reviewError && (
                      <div className="text-[13px] font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{reviewError}</div>
                    )}
                    <div>
                      <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="transition hover:scale-110"
                          >
                            <Star className={cn("h-8 w-8", star <= reviewRating ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-dark/70">Your Experience</label>
                      <textarea
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell others what you loved about this piece..."
                        className="w-full rounded-2xl border border-border bg-bg-base p-4 text-[14px] outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full rounded-full bg-dark py-4 text-[14px] font-bold text-white transition hover:bg-primary disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[14px] text-dark/60 mb-4">Please log in to share your experience.</p>
                    <Link href="/profile" className="inline-block rounded-full border-2 border-primary px-8 py-3 text-[14px] font-bold text-primary transition hover:bg-primary hover:text-white">
                      Login to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border">
              {reviewsList.length === 0 ? (
                <div className="rounded-[32px] border border-border bg-surface py-20 text-center">
                  <p className="text-[15px] text-dark/40 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                reviewsList.map((rev: any) => (
                  <div key={rev._id} className="rounded-[24px] border border-border bg-surface p-6 sm:p-8 transition-shadow hover:shadow-lg hover:shadow-dark/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-base font-display text-[16px] font-bold text-primary">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-display text-[16px] font-bold text-dark">{rev.userName}</div>
                          <div className="text-[12px] font-medium text-dark/50 mt-0.5 flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" /> Verified Buyer
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className={cn("h-4 w-4", i < rev.rating ? "fill-[#F5A524] text-[#F5A524]" : "text-border")} />
                         ))}
                      </div>
                    </div>
                    <p className="text-[15px] leading-relaxed text-dark/80">&quot;{rev.comment}&quot;</p>

                    {isAdmin && (
                      <div className="mt-4 flex justify-end border-t border-border pt-4">
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-red-500 transition hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Review
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-20 border-t border-border pt-20 pb-10">
          <h2 className="font-display text-[32px] font-bold text-dark mb-10 text-center">Complete Your Collection</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {allProducts
              .filter((p) => p.id !== product.id && p.category === product.category)
              .concat(allProducts.filter((p) => p.id !== product.id && p.category !== product.category))
              .slice(0, 4)
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
        </div>

        {/* Size Guide Modal */}
        <AnimatePresence>
          {sizeGuideOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSizeGuideOpen(false)} className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-[560px] overflow-hidden rounded-[32px] bg-surface shadow-2xl">
                <div className="flex items-center justify-between border-b border-border p-6 md:p-8">
                  <h3 className="font-display text-[22px] font-bold text-dark">Size Guide</h3>
                  <button onClick={() => setSizeGuideOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-bg-base transition hover:bg-border">
                    <X className="h-5 w-5 text-dark" />
                  </button>
                </div>
                <div className="p-6 md:p-8 bg-bg-base">
                  <p className="text-[14px] text-dark/70 mb-6 font-medium">Find your perfect fit. Our nightwear is designed for a relaxed, comfortable feel.</p>

                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <table className="w-full text-left text-[14px]">
                      <thead>
                        <tr className="border-b border-border bg-bg-base">
                          <th className="p-4 font-bold text-dark">Size</th>
                          <th className="p-4 font-bold text-dark">Chest (in)</th>
                          <th className="p-4 font-bold text-dark">Waist (in)</th>
                          <th className="p-4 font-bold text-dark">Hip (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "M (Medium)", chest: "38-40", waist: "30-32", hip: "40-42" },
                          { size: "L (Large)", chest: "40-42", waist: "32-34", hip: "42-44" },
                          { size: "XL (X-Large)", chest: "42-44", waist: "34-36", hip: "44-46" },
                          { size: "XXL (2X-Large)", chest: "44-46", waist: "36-38", hip: "46-48" },
                          { size: "3XL (3X-Large)", chest: "46-48", waist: "38-40", hip: "48-50" },
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b border-border last:border-0 transition-colors hover:bg-bg-base/50">
                            <td className="p-4 font-bold text-primary">{row.size}</td>
                            <td className="p-4 text-dark/70 font-medium">{row.chest}</td>
                            <td className="p-4 text-dark/70 font-medium">{row.waist}</td>
                            <td className="p-4 text-dark/70 font-medium">{row.hip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-surface p-4 border border-border shadow-sm">
                    <Sparkles className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <p className="text-[13px] font-medium leading-relaxed text-dark/70">
                      <strong className="text-dark">Fit Advice:</strong> If you are between sizes or prefer an oversized, airy fit for sleeping, we recommend sizing up.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
