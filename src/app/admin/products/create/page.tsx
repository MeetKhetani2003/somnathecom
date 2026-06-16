"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Plus, Trash2, X, ImageIcon } from "lucide-react";
import CreatableSelect from "react-select/creatable";

const DEFAULT_MATERIALS = [
  { value: "100% Cotton", label: "100% Cotton" },
  { value: "Polyester", label: "Polyester" },
  { value: "Silk", label: "Silk" },
  { value: "Velvet", label: "Velvet" },
  { value: "Felt", label: "Felt" },
  { value: "Satin", label: "Satin" },
];

interface SizeEntry {
  size: string;
  stock: number;
}

export default function CreateProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Animal Product");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formNetPrice, setFormNetPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formWhatsIncluded, setFormWhatsIncluded] = useState("");
  const [formCareInstructions, setFormCareInstructions] = useState("");
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [detailedImagesFiles, setDetailedImagesFiles] = useState<File[]>([]);
  const [detailedPreviews, setDetailedPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formFeatured, setFormFeatured] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState(DEFAULT_MATERIALS);
  
  useEffect(() => {
    const saved = localStorage.getItem("customMaterials");
    if (saved) {
      try {
        setMaterials([...DEFAULT_MATERIALS, ...JSON.parse(saved)]);
      } catch (e) {}
    }
  }, []);

  const selectedMaterials = formMaterial ? formMaterial.split(',').map(s => s.trim()).filter(Boolean) : [];

  const handleCreateMaterial = (inputValue: string) => {
    const newOption = { value: inputValue, label: inputValue };
    setMaterials((prev) => [...prev, newOption]);
    
    // Auto-add it to selection
    if (!selectedMaterials.includes(inputValue)) {
      setFormMaterial([...selectedMaterials, inputValue].join(', '));
    }
    
    const saved = localStorage.getItem("customMaterials");
    const parsed = saved ? JSON.parse(saved) : [];
    localStorage.setItem("customMaterials", JSON.stringify([...parsed, newOption]));
  };

  const handleAddMaterial = (newValue: any) => {
    if (!newValue) return;
    const val = newValue.value;
    if (!selectedMaterials.includes(val)) {
      setFormMaterial([...selectedMaterials, val].join(', '));
    }
  };

  const handleRemoveMaterial = (matToRemove: string) => {
    const newMats = selectedMaterials.filter(m => m !== matToRemove);
    setFormMaterial(newMats.join(', '));
  };

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      detailedPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Size-stock pairs
  const [sizeEntries, setSizeEntries] = useState<SizeEntry[]>([
    { size: "", stock: 0 },
  ]);

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

  const addSizeRow = () => {
    setSizeEntries((prev) => [...prev, { size: "", stock: 0 }]);
  };

  const removeSizeRow = (idx: number) => {
    setSizeEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSizeRow = (idx: number, field: keyof SizeEntry, value: string | number) => {
    setSizeEntries((prev) =>
      prev.map((entry, i) =>
        i === idx ? { ...entry, [field]: field === "stock" ? Number(value) : value } : entry
      )
    );
  };

  const totalStock = sizeEntries.reduce((sum, e) => sum + (Number(e.stock) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate file sizes
    const MAX_SIZE = 500 * 1024; // 500KB
    if (mainImageFile && mainImageFile.size > MAX_SIZE) {
      alert("Main image exceeds 500KB limit.");
      setSubmitting(false);
      return;
    }
    for (const file of detailedImagesFiles) {
      if (file.size > MAX_SIZE) {
        alert(`Image ${file.name} exceeds 500KB limit.`);
        setSubmitting(false);
        return;
      }
    }

    // Validate size entries
    const validSizes = sizeEntries.filter((e) => e.size.trim());
    if (validSizes.length === 0) {
      alert("Please add at least one size with stock quantity.");
      setSubmitting(false);
      return;
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
    formData.append("sizes", JSON.stringify(validSizes));
    formData.append("whatsIncluded", formWhatsIncluded);
    formData.append("careInstructions", formCareInstructions);
    formData.append("featured", formFeatured ? "true" : "false");

    if (mainImageFile) {
      formData.append("image", mainImageFile);
    }
    detailedImagesFiles.forEach((f) => {
      formData.append("images", f);
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Product created successfully! SKU: " + data.product.sku);
        router.push("/admin");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

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
                <option value="Animal Product">Animal Product</option>
                <option value="Birds Product">Birds Product</option>
                <option value="Indian State Product">Indian State Product</option>
                <option value="Fruit Product">Fruit Product</option>
                <option value="Vegetable Product">Vegetable Product</option>
                <option value="Water Animals Product">Water Animals Product</option>
                <option value="Hair Wigs">Hair Wigs</option>
                <option value="Super Heroes">Super Heroes</option>
                <option value="Insect Product">Insect Product</option>
                <option value="Our Helpers">Our Helpers</option>
                <option value="Flower Product">Flower Product</option>
                <option value="Cartoon Characters Product">Cartoon Characters Product</option>
                <option value="Community Helpers">Community Helpers</option>
                <option value="Indian Mythology Product">Indian Mythology Product</option>
                <option value="Republic Day / Independence Day">Republic Day / Independence Day</option>
                <option value="Indian Dance Product">Indian Dance Product</option>
                <option value="Caps / Hats / Safa / Pagdi">Caps / Hats / Safa / Pagdi</option>
                <option value="Face Masks">Face Masks</option>
                <option value="Halloween Products">Halloween Products</option>
                <option value="National Heroes">National Heroes</option>
                <option value="Silver / Golden Jewellery">Silver / Golden Jewellery</option>
                <option value="Offer Products">Offer Products</option>
                <option value="Umbrella / Fans">Umbrella / Fans</option>
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



          {/* Size & Stock Management */}
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
                onClick={addSizeRow}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Size
              </button>
            </div>

            {/* Header row */}
            <div className="mb-2 grid grid-cols-[1fr_120px_40px] gap-3 px-1">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-dark/50">Size / Age Group</span>
              <span className="text-[12px] font-semibold uppercase tracking-wide text-dark/50 text-center">Stock (Qty)</span>
              <span></span>
            </div>

            <div className="space-y-2.5">
              {sizeEntries.map((entry, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_120px_40px] items-center gap-3">
                  <input
                    type="text"
                    value={entry.size}
                    onChange={(e) => updateSizeRow(idx, "size", e.target.value)}
                    placeholder="e.g. 3-4 Yrs, Size 26"
                    className="h-11 rounded-xl border border-border bg-white px-4 text-[13.5px] outline-none focus:border-primary"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={entry.stock}
                      onChange={(e) => updateSizeRow(idx, "stock", e.target.value)}
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
                    onClick={() => removeSizeRow(idx)}
                    disabled={sizeEntries.length === 1}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-border text-dark/50 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {sizeEntries.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {sizeEntries.filter(e => e.size.trim()).map((entry, idx) => (
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
            <CreatableSelect
              isClearable
              controlShouldRenderValue={false}
              options={materials.filter(m => !selectedMaterials.includes(m.value))}
              value={null}
              onChange={handleAddMaterial}
              onCreateOption={handleCreateMaterial}
              placeholder="Select or type to add material..."
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '48px',
                  borderRadius: '12px',
                  borderColor: state.isFocused ? '#E1BFE6' : '#EEDDF0',
                  boxShadow: state.isFocused ? '0 0 0 1px #E1BFE6' : 'none',
                  fontSize: '14px',
                  '&:hover': {
                    borderColor: '#E1BFE6'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  fontSize: '14px',
                  backgroundColor: state.isSelected ? 'var(--color-primary)' : state.isFocused ? 'var(--color-primary-light)' : 'white',
                  color: state.isSelected ? 'white' : '#1A0F1C',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }
                })
              }}
            />
            {selectedMaterials.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMaterials.map((mat) => (
                  <span key={mat} className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-[12px] font-medium text-[#7A187C]">
                    {mat}
                    <button type="button" onClick={() => handleRemoveMaterial(mat)} className="text-primary hover:text-red-500 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="rounded-2xl border border-dashed border-primary/50 bg-surface/50 p-6 space-y-6">
            <p className="text-[13px] font-semibold text-dark/80 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Product Images (Max 500KB each)</p>

            {/* Main Image */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-dark/70">Main Image <span className="text-red-500">*</span></label>
              <input
                ref={mainInputRef}
                required
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setMainImageFile(file);
                  if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
                  setMainImagePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {mainImagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={mainImagePreview}
                    alt="Main preview"
                    className="h-36 w-36 rounded-xl object-cover border-2 border-primary shadow-md"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[11px] text-dark/70 truncate max-w-[130px]">{mainImageFile?.name}</span>
                    <span className="text-[10px] text-[#9A8A9D]">({((mainImageFile?.size || 0) / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(mainImagePreview);
                      setMainImagePreview(null);
                      setMainImageFile(null);
                      if (mainInputRef.current) mainInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainInputRef.current?.click()}
                  className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/50 bg-white text-dark/50 transition hover:border-primary hover:text-primary"
                >
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-[12px] font-medium">Click to upload</span>
                </button>
              )}
            </div>

            {/* Detailed Images */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-dark/70">Detailed / Gallery Images</label>
              <input
                ref={detailInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  detailedPreviews.forEach(url => URL.revokeObjectURL(url));
                  setDetailedImagesFiles(files);
                  setDetailedPreviews(files.map(f => URL.createObjectURL(f)));
                }}
              />
              <div className="flex flex-wrap gap-3">
                {detailedPreviews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt={`Detail ${idx + 1}`}
                      className="h-24 w-24 rounded-xl object-cover border border-primary/50 shadow-sm"
                    />
                    <div className="mt-1 text-center">
                      <span className="text-[10px] text-[#9A8A9D]">{((detailedImagesFiles[idx]?.size || 0) / 1024).toFixed(0)} KB</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(src);
                        const newFiles = detailedImagesFiles.filter((_, i) => i !== idx);
                        const newPreviews = detailedPreviews.filter((_, i) => i !== idx);
                        setDetailedImagesFiles(newFiles);
                        setDetailedPreviews(newPreviews);
                        if (detailInputRef.current) detailInputRef.current.value = "";
                      }}
                      className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => detailInputRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary/50 bg-white text-dark/50 transition hover:border-primary hover:text-primary"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-[11px] font-medium">Add More</span>
                </button>
              </div>
              {detailedPreviews.length > 0 && (
                <p className="mt-2 text-[11.5px] text-dark/50">{detailedPreviews.length} image{detailedPreviews.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface/60 p-5">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-border bg-white checked:border-primary checked:bg-primary transition"
              />
              <svg className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <label htmlFor="featuredCheck" className="cursor-pointer flex-1">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-dark">
                ⭐ Featured Product
                {formFeatured && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Active</span>}
              </span>
              <p className="mt-0.5 text-[12px] text-dark/50">When checked, this product will appear in the <strong className="text-primary">"Featured This Week"</strong> section on the home page.</p>
            </label>
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
