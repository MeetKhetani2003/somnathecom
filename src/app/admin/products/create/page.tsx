"use client";
import { fireToast } from "@/context/ToastContext";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Plus, Trash2, X, ImageIcon, Palette } from "lucide-react";
import CreatableSelect from "react-select/creatable";



interface SizeEntry {
  size: string;
  stock: number;
}

interface ColorVariant {
  name: string;
  title: string;
  featured?: boolean;
  imageFiles: File[];
  imagePreviews: string[];
  sizes: SizeEntry[];
}

export default function CreateProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Ladies Collection > Night Suits > Ladies Full Night Suit");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formNetPrice, setFormNetPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formWhatsIncluded, setFormWhatsIncluded] = useState("");
  const [formCareInstructions, setFormCareInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Color Variants
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const colorImageInputRef = useRef<HTMLInputElement>(null);

  // Legacy fallback: sizes without colors (used when no colors are defined)
  const [legacySizeEntries, setLegacySizeEntries] = useState<SizeEntry[]>([
    { size: "", stock: 0 },
  ]);
  const [legacyDetailedFiles, setLegacyDetailedFiles] = useState<File[]>([]);
  const [legacyDetailedPreviews, setLegacyDetailedPreviews] = useState<string[]>([]);
  const legacyDetailInputRef = useRef<HTMLInputElement>(null);



  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      legacyDetailedPreviews.forEach(url => URL.revokeObjectURL(url));
      colorVariants.forEach(cv => cv.imagePreviews.forEach(url => URL.revokeObjectURL(url)));
    };
  }, []);

  const hasColors = colorVariants.length > 0;

  // ─── Color Variant Helpers ──────────────────────────────────────────────────
  const addColorVariant = () => {
    setColorVariants(prev => [...prev, { name: "", title: "", featured: false, imageFiles: [], imagePreviews: [], sizes: [{ size: "", stock: 0 }] }]);
    setActiveColorIdx(colorVariants.length);
  };

  const removeColorVariant = (idx: number) => {
    setColorVariants(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated;
    });
    setActiveColorIdx(a => Math.min(a, Math.max(0, colorVariants.length - 2)));
  };

  const updateColorName = (idx: number, name: string) => {
    setColorVariants(prev => prev.map((cv, i) => i === idx ? { ...cv, name } : cv));
  };

  const updateColorTitle = (idx: number, title: string) => {
    setColorVariants(prev => prev.map((cv, i) => i === idx ? { ...cv, title } : cv));
  };

  const updateColorFeatured = (idx: number, featured: boolean) => {
    setColorVariants(prev => prev.map((cv, i) => i === idx ? { ...cv, featured } : cv));
  };

  const addColorImage = (idx: number, files: File[]) => {
    setColorVariants(prev => prev.map((cv, i) => {
      if (i !== idx) return cv;
      const newPreviews = files.map(f => URL.createObjectURL(f));
      return { ...cv, imageFiles: [...cv.imageFiles, ...files], imagePreviews: [...cv.imagePreviews, ...newPreviews] };
    }));
  };

  const removeColorImage = (colorIdx: number, imgIdx: number) => {
    setColorVariants(prev => prev.map((cv, i) => {
      if (i !== colorIdx) return cv;
      URL.revokeObjectURL(cv.imagePreviews[imgIdx]);
      return {
        ...cv,
        imageFiles: cv.imageFiles.filter((_, j) => j !== imgIdx),
        imagePreviews: cv.imagePreviews.filter((_, j) => j !== imgIdx),
      };
    }));
  };

  const addColorSizeRow = (colorIdx: number) => {
    setColorVariants(prev => prev.map((cv, i) => i === colorIdx ? { ...cv, sizes: [...cv.sizes, { size: "", stock: 0 }] } : cv));
  };

  const removeColorSizeRow = (colorIdx: number, sizeIdx: number) => {
    setColorVariants(prev => prev.map((cv, i) => i === colorIdx ? { ...cv, sizes: cv.sizes.filter((_, j) => j !== sizeIdx) } : cv));
  };

  const updateColorSizeRow = (colorIdx: number, sizeIdx: number, field: keyof SizeEntry, value: string | number) => {
    setColorVariants(prev => prev.map((cv, i) => {
      if (i !== colorIdx) return cv;
      return { ...cv, sizes: cv.sizes.map((s, j) => j === sizeIdx ? { ...s, [field]: field === "stock" ? Number(value) : value } : s) };
    }));
  };

  // ─── Legacy Size Helpers (no colors) ────────────────────────────────────────
  const addLegacySizeRow = () => {
    setLegacySizeEntries(prev => [...prev, { size: "", stock: 0 }]);
  };

  const removeLegacySizeRow = (idx: number) => {
    setLegacySizeEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLegacySizeRow = (idx: number, field: keyof SizeEntry, value: string | number) => {
    setLegacySizeEntries(prev =>
      prev.map((entry, i) =>
        i === idx ? { ...entry, [field]: field === "stock" ? Number(value) : value } : entry
      )
    );
  };

  // ─── Total Stock ────────────────────────────────────────────────────────────
  const totalStock = hasColors
    ? colorVariants.reduce((sum, cv) => sum + cv.sizes.reduce((s, e) => s + (Number(e.stock) || 0), 0), 0)
    : legacySizeEntries.reduce((sum, e) => sum + (Number(e.stock) || 0), 0);

  const isAdmin = (session?.user as any)?.role === "admin";

  if (status === "loading") {
    return <div className="p-8 text-center text-dark/50">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[500px] px-4 py-20 text-center">
        <h2 className="text-[22px] font-semibold text-red-600">Admin Privileges Required</h2>
        <Link href="/profile" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#7A187C]">
          Go to Profile
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const MAX_SIZE = 500 * 1024; // 500KB

    if (hasColors) {
      // Validate color variants
      for (const cv of colorVariants) {
        if (!cv.name.trim()) {
          fireToast("Each color variant must have a name.");
          setSubmitting(false);
          return;
        }
        const validSizes = cv.sizes.filter(s => s.size.trim());
        if (validSizes.length === 0) {
          fireToast(`Color "${cv.name}" needs at least one size.`);
          setSubmitting(false);
          return;
        }
        for (const file of cv.imageFiles) {
          if (file.size > MAX_SIZE) {
            fireToast(`Image ${file.name} in color "${cv.name}" exceeds 500KB limit.`);
            setSubmitting(false);
            return;
          }
        }
      }
    } else {
      // Legacy validation
      for (const file of legacyDetailedFiles) {
        if (file.size > MAX_SIZE) {
          fireToast(`Image ${file.name} exceeds 500KB limit.`);
          setSubmitting(false);
          return;
        }
      }
      const validSizes = legacySizeEntries.filter((e) => e.size.trim());
      if (validSizes.length === 0) {
        fireToast("Please add at least one size with stock quantity.");
        setSubmitting(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", formTitle);
    formData.append("category", formCategory);
    formData.append("price", formPrice);
    formData.append("mrp", formMrp);
    formData.append("netPrice", formNetPrice);
    formData.append("description", formDescription);
    formData.append("tag", formTag);
    formData.append("material", formMaterial);
    formData.append("whatsIncluded", formWhatsIncluded);
    formData.append("careInstructions", formCareInstructions);

    if (hasColors) {
      // Build colors metadata (without files)
      const colorsMeta = colorVariants.map(cv => ({
        name: cv.name,
        title: cv.title,
        featured: cv.featured,
        sizes: cv.sizes.filter(s => s.size.trim()),
        imageCount: cv.imageFiles.length,
      }));
      formData.append("colorsMeta", JSON.stringify(colorsMeta));

      // Append color images in order: all images for color 0, then color 1, etc.
      for (const cv of colorVariants) {
        for (const file of cv.imageFiles) {
          formData.append("colorImages", file);
        }
      }

      // Also send legacy sizes as the union of all color sizes for backward compat
      const allSizes = colorVariants.flatMap(cv => cv.sizes.filter(s => s.size.trim()));
      formData.append("sizes", JSON.stringify(allSizes));
    } else {
      const validSizes = legacySizeEntries.filter((e) => e.size.trim());
      formData.append("sizes", JSON.stringify(validSizes));
      legacyDetailedFiles.forEach((f) => {
        formData.append("images", f);
      });
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        fireToast("Product created successfully! SKU: " + data.product.sku);
        router.push("/admin");
      } else {
        fireToast("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
      fireToast("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeColor = colorVariants[activeColorIdx];

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 md:py-12">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[14px] font-medium text-dark/70 hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="rounded-3xl border border-border bg-white p-6 md:p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-dark">Add New Product</h1>
            <p className="text-[14px] text-dark/70">Create a new product in your inventory.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Title / Product Name</label>
            <input required type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="h-12 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary/50" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Category</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="h-12 w-full rounded-xl border border-border px-3 text-[14px] outline-none bg-white">
                <optgroup label="Ladies Collection">
                  <option value="Ladies Collection > Night Suits > Ladies Full Night Suit">Ladies Full Night Suit</option>
                  <option value="Ladies Collection > Night Suits > Ladies Capri Night Suit">Ladies Capri Night Suit</option>
                  <option value="Ladies Collection > Night Suits > Ladies Short Night Suit">Ladies Short Night Suit</option>
                  <option value="Ladies Collection > Oversized Collection > Oversized T-Shirt">Oversized T-Shirt</option>
                  <option value="Ladies Collection > Oversized Collection > Oversized T-Shirt & Plazo Set">Oversized T-Shirt & Plazo Set</option>
                  <option value="Ladies Collection > Oversized Collection > Oversized T-Shirt & Cargo Plazo Set">Oversized T-Shirt & Cargo Plazo Set</option>
                  <option value="Ladies Collection > Plazo Collection > Valentino Plazo">Valentino Plazo</option>
                  <option value="Ladies Collection > Plazo Collection > Tencel Plazo">Tencel Plazo</option>
                </optgroup>
                <optgroup label="Men's Collection">
                  <option value="Men's Collection > Night Suits > Gents Full Night Suit">Gents Full Night Suit</option>
                  <option value="Men's Collection > Night Suits > Gents Capri Night Suit">Gents Capri Night Suit</option>
                  <option value="Men's Collection > Night Suits > Gents Short Night Suit">Gents Short Night Suit</option>
                </optgroup>
                <optgroup label="Tencel Collection">
                  <option value="Tencel Collection > Tencel Nightwear > Tencel Full Night Suit">Tencel Full Night Suit</option>
                  <option value="Tencel Collection > Tencel Nightwear > Tencel Capri Night Suit">Tencel Capri Night Suit</option>
                  <option value="Tencel Collection > Tencel Nightwear > Tencel Short Night Suit">Tencel Short Night Suit</option>
                  <option value="Tencel Collection > Tencel Plazo > Tencel Plazo">Tencel Plazo</option>
                  <option value="Tencel Collection > Future Collections > Tencel Lounge Wear">Tencel Lounge Wear</option>
                  <option value="Tencel Collection > Future Collections > Tencel Couple Set">Tencel Couple Set</option>
                </optgroup>
                <optgroup label="Hosiery Collection">
                  <option value="Hosiery Collection > Hosiery Nightwear > Hosiery Full Night Suit">Hosiery Full Night Suit</option>
                  <option value="Hosiery Collection > Hosiery Nightwear > Hosiery Capri Night Suit">Hosiery Capri Night Suit</option>
                  <option value="Hosiery Collection > Hosiery Nightwear > Hosiery Short Night Suit">Hosiery Short Night Suit</option>
                  <option value="Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt">Hosiery Oversized T-Shirt</option>
                  <option value="Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt & Plazo Set">Hosiery Oversized T-Shirt & Plazo Set</option>
                  <option value="Hosiery Collection > Hosiery Oversized > Hosiery Oversized T-Shirt & Cargo Plazo Set">Hosiery Oversized T-Shirt & Cargo Plazo Set</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Tag / Badge</label>
              <select value={formTag} onChange={(e) => setFormTag(e.target.value)} className="h-12 w-full rounded-xl border border-border px-3 text-[14px] outline-none bg-white focus:border-primary/50">
                <option value="">No Badge</option>
                <option value="Bestseller">🏆 Bestseller</option>
                <option value="New Arrival">✨ New Arrival</option>
                <option value="Hot">🔥 Hot</option>
                <option value="Trending">📈 Trending</option>
                <option value="Limited Stock">⚡ Limited Stock</option>
                <option value="Sale">🏷️ Sale</option>
                <option value="Exclusive">💎 Exclusive</option>
                <option value="Top Rated">⭐ Top Rated</option>
                <option value="Festival Special">🎉 Festival Special</option>
                <option value="School Favourite">🎓 School Favourite</option>
              </select>
            </div>
          </div>

          <div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Net Cost Price (₹)</label>
                <input type="number" value={formNetPrice} onChange={(e) => setFormNetPrice(e.target.value)} placeholder="e.g. 500" className="h-12 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Selling Price (₹)</label>
                <input required type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="h-12 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dark/80">MRP (₹)</label>
                <input required type="number" value={formMrp} onChange={(e) => setFormMrp(e.target.value)} className="h-12 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary/50" />
              </div>
            </div>

            {/* Profit Display */}
            {formPrice && formNetPrice && (
              <div className="mt-2 text-[13px] font-medium">
                <span className="text-dark/70">Estimated Profit per unit: </span>
                <span className={Number(formPrice) - Number(formNetPrice) >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  ₹{(Number(formPrice) - Number(formNetPrice)).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* ════════════ COLOR VARIANTS SECTION ════════════ */}
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <label className="block text-[14px] font-semibold text-dark">Color Variants</label>
                  <p className="text-[12px] text-dark/50 mt-0.5">
                    {hasColors
                      ? `${colorVariants.length} color(s) added. Each color has its own images & sizes.`
                      : "Optional — Add colors to manage separate images & stock per color."
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addColorVariant}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Color
              </button>
            </div>

            {hasColors && (
              <div className="space-y-4">
                {/* Color Tabs */}
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((cv, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveColorIdx(idx)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition ${
                        activeColorIdx === idx
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-white border border-border text-dark/80 hover:border-primary/50"
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full border-2 border-current inline-block" />
                      {cv.name || `Color ${idx + 1}`}
                    </button>
                  ))}
                </div>

                {/* Active Color Panel */}
                {activeColor && (
                  <div className="rounded-2xl border border-border bg-white p-5 space-y-5">
                    {/* Color Name and Title */}
                    <div className="flex items-start gap-3">
                      <div className="grid flex-1 grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-dark/50">Color Name *</label>
                          <input
                            type="text"
                            value={activeColor.name}
                            onChange={(e) => updateColorName(activeColorIdx, e.target.value)}
                            placeholder="e.g. Navy Blue, Red, Maroon"
                            className="h-11 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[12px] font-semibold uppercase tracking-wide text-dark/50">Variant Title (Optional)</label>
                          <input
                            type="text"
                            value={activeColor.title || ""}
                            onChange={(e) => updateColorTitle(activeColorIdx, e.target.value)}
                            placeholder="e.g. Beautiful Navy Blue Nightgown"
                            className="h-11 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      
                      {/* Featured Checkbox */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id={`featured-cv-${activeColorIdx}`}
                          checked={activeColor.featured || false}
                          onChange={(e) => updateColorFeatured(activeColorIdx, e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor={`featured-cv-${activeColorIdx}`} className="text-[13px] font-medium text-dark/80 cursor-pointer">
                          Feature this variant on the home page
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorVariant(activeColorIdx)}
                        className="mt-5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-100 text-red-400 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        title="Remove this color"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Color Images */}
                    <div>
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-dark/50">
                        Images for "{activeColor.name || `Color ${activeColorIdx + 1}`}"
                        {activeColor.imagePreviews.length > 0 && (
                          <span className="ml-2 rounded-full bg-[var(--color-primary-light)] px-2 py-0.5 text-[11px] font-semibold text-primary normal-case">
                            {activeColor.imagePreviews.length} image{activeColor.imagePreviews.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </label>
                      <input
                        ref={colorImageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) addColorImage(activeColorIdx, files);
                          if (colorImageInputRef.current) colorImageInputRef.current.value = "";
                        }}
                      />
                      <div className="flex flex-wrap gap-3">
                        {activeColor.imagePreviews.map((src, imgIdx) => (
                          <div key={imgIdx} className="relative">
                            <img src={src} alt={`Color img ${imgIdx + 1}`} className="h-24 w-24 rounded-xl object-cover border border-primary/50 shadow-sm" />
                            <div className="mt-1 text-center">
                              <span className="text-[10px] text-[#9A8A9D]">{((activeColor.imageFiles[imgIdx]?.size || 0) / 1024).toFixed(0)} KB</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeColorImage(activeColorIdx, imgIdx)}
                              className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => colorImageInputRef.current?.click()}
                          className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary/50 bg-surface/50 text-dark/50 transition hover:border-primary hover:text-primary"
                        >
                          <Plus className="h-6 w-6" />
                          <span className="text-[11px] font-medium">Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Color Sizes */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label className="block text-[12px] font-semibold uppercase tracking-wide text-dark/50">
                          Sizes & Stock for "{activeColor.name || `Color ${activeColorIdx + 1}`}"
                        </label>
                        <button
                          type="button"
                          onClick={() => addColorSizeRow(activeColorIdx)}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[12px] font-medium text-primary transition hover:bg-primary/20"
                        >
                          <Plus className="h-3 w-3" /> Add Size
                        </button>
                      </div>

                      <div className="space-y-2">
                        {activeColor.sizes.map((entry, sIdx) => (
                          <div key={sIdx} className="grid grid-cols-[1fr_100px_36px] items-center gap-2">
                            <input
                              type="text"
                              value={entry.size}
                              onChange={(e) => updateColorSizeRow(activeColorIdx, sIdx, "size", e.target.value)}
                              placeholder="e.g. M, L, XL"
                              className="h-10 rounded-xl border border-border bg-white px-3 text-[13px] outline-none focus:border-primary"
                            />
                            <input
                              type="number"
                              min={0}
                              value={entry.stock}
                              onChange={(e) => updateColorSizeRow(activeColorIdx, sIdx, "stock", e.target.value)}
                              className={`h-10 w-full rounded-xl border px-3 text-[13px] text-center font-semibold outline-none focus:border-primary ${entry.stock === 0 ? "border-red-200 bg-red-50 text-red-600" : "border-border bg-white text-dark"}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeColorSizeRow(activeColorIdx, sIdx)}
                              disabled={activeColor.sizes.length === 1}
                              className="grid h-10 w-10 place-items-center rounded-xl border border-border text-dark/50 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Size pills */}
                      {activeColor.sizes.filter(s => s.size.trim()).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {activeColor.sizes.filter(s => s.size.trim()).map((entry, idx) => (
                            <span
                              key={idx}
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${entry.stock === 0 ? "bg-red-50 text-red-500 line-through" : "bg-[var(--color-primary-light)] text-[#7A187C]"}`}
                            >
                              {entry.size} ({entry.stock > 0 ? `${entry.stock}` : "Out"})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total stock across all colors */}
                <div className="text-[13px] text-dark/60 font-medium">
                  Total stock across all colors: <span className="font-bold text-primary">{totalStock}</span>
                </div>
              </div>
            )}
          </div>

          {/* Legacy Size & Stock (only shown when no colors) */}
          {!hasColors && (
            <>
              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <label className="block text-[14px] font-semibold text-dark">Sizes & Stock Inventory</label>
                    <p className="text-[12px] text-dark/50 mt-0.5">
                      Add each size with its available stock quantity. Total stock: <span className="font-bold text-primary">{totalStock}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addLegacySizeRow}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Size
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-[1fr_120px_40px] gap-3 px-1">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-dark/50">Size / Age Group</span>
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-dark/50 text-center">Stock (Qty)</span>
                  <span></span>
                </div>

                <div className="space-y-2.5">
                  {legacySizeEntries.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_120px_40px] items-center gap-3">
                      <input
                        type="text"
                        value={entry.size}
                        onChange={(e) => updateLegacySizeRow(idx, "size", e.target.value)}
                        placeholder="e.g. 3-4 Yrs, Size 26"
                        className="h-11 rounded-xl border border-border bg-white px-4 text-[13.5px] outline-none focus:border-primary"
                      />
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={entry.stock}
                          onChange={(e) => updateLegacySizeRow(idx, "stock", e.target.value)}
                          className={`h-11 w-full rounded-xl border px-4 text-[13.5px] text-center font-semibold outline-none focus:border-primary ${entry.stock === 0
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-border bg-white text-dark"
                            }`}
                        />
                        {entry.stock === 0 && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLegacySizeRow(idx)}
                        disabled={legacySizeEntries.length === 1}
                        className="grid h-11 w-11 place-items-center rounded-xl border border-border text-dark/50 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {legacySizeEntries.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {legacySizeEntries.filter(e => e.size.trim()).map((entry, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-3 py-1 text-[12px] font-medium ${entry.stock === 0
                          ? "bg-red-50 text-red-500 line-through"
                          : "bg-[var(--color-primary-light)] text-[#7A187C]"
                          }`}
                      >
                        {entry.size} ({entry.stock > 0 ? `${entry.stock} pcs` : "Out"})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-dark/80">
              What's Included
              <span className="ml-1.5 text-[11px] font-normal text-dark/50">— one item per line</span>
            </label>
            <textarea
              rows={4}
              value={formWhatsIncluded}
              onChange={(e) => setFormWhatsIncluded(e.target.value)}
              placeholder={`1 Cape\n1 Mask\n1 Belt\n1 Headband`}
              className="w-full rounded-xl border border-border p-4 text-[14px] leading-relaxed outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-dark/80">
              Care Instructions
              <span className="ml-1.5 text-[11px] font-normal text-dark/50">— preserves your formatting</span>
            </label>
            <textarea
              rows={4}
              value={formCareInstructions}
              onChange={(e) => setFormCareInstructions(e.target.value)}
              placeholder={`Hand wash only\nDo not bleach\nIron on low heat\nDry in shade`}
              className="w-full rounded-xl border border-border p-4 text-[14px] leading-relaxed outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Product Description</label>
            <textarea rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded-xl border border-border p-4 text-[14px] outline-none focus:border-primary/50" />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-dark/80">Material</label>
            <input 
              type="text" 
              value={formMaterial} 
              onChange={(e) => setFormMaterial(e.target.value)} 
              placeholder="e.g. 100% Cotton, Polyester" 
              className="h-12 w-full rounded-xl border border-border px-4 text-[14px] outline-none focus:border-primary/50" 
            />
          </div>

          {/* Image Upload Section */}
          <div className="rounded-2xl border border-dashed border-primary/50 bg-surface/50 p-6 space-y-6">
            <p className="text-[13px] font-semibold text-dark/80 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Product Images (Max 500KB each)</p>


            {/* Legacy Detailed Images (only shown when no colors) */}
            {!hasColors && (
              <div>
                <label className="mb-2 block text-[13px] font-medium text-dark/70">Detailed / Gallery Images</label>
                <input
                  ref={legacyDetailInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    legacyDetailedPreviews.forEach(url => URL.revokeObjectURL(url));
                    setLegacyDetailedFiles(files);
                    setLegacyDetailedPreviews(files.map(f => URL.createObjectURL(f)));
                  }}
                />
                <div className="flex flex-wrap gap-3">
                  {legacyDetailedPreviews.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={src}
                        alt={`Detail ${idx + 1}`}
                        className="h-24 w-24 rounded-xl object-cover border border-primary/50 shadow-sm"
                      />
                      <div className="mt-1 text-center">
                        <span className="text-[10px] text-[#9A8A9D]">{((legacyDetailedFiles[idx]?.size || 0) / 1024).toFixed(0)} KB</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(src);
                          const newFiles = legacyDetailedFiles.filter((_, i) => i !== idx);
                          const newPreviews = legacyDetailedPreviews.filter((_, i) => i !== idx);
                          setLegacyDetailedFiles(newFiles);
                          setLegacyDetailedPreviews(newPreviews);
                          if (legacyDetailInputRef.current) legacyDetailInputRef.current.value = "";
                        }}
                        className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => legacyDetailInputRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary/50 bg-white text-dark/50 transition hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-[11px] font-medium">Add More</span>
                  </button>
                </div>
                {legacyDetailedPreviews.length > 0 && (
                  <p className="mt-2 text-[11.5px] text-dark/50">{legacyDetailedPreviews.length} image{legacyDetailedPreviews.length > 1 ? 's' : ''} selected</p>
                )}
              </div>
            )}

            {hasColors && (
              <p className="text-[12px] text-dark/50 italic">
                ℹ️ Gallery images are managed per color in the Color Variants section above.
              </p>
            )}
          </div>



          <div className="pt-6 border-t border-border">
            <button disabled={submitting} type="submit" className="w-full sm:w-auto rounded-full bg-primary px-8 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#7A187C] disabled:opacity-50">
              {submitting ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
