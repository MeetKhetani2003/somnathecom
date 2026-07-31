"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Tag } from "lucide-react";
import { fireToast } from "@/context/ToastContext";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", fullPath: "", group: "", isHidden: false });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories?admin=true");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        fireToast("Failed to fetch categories");
      }
    } catch (err) {
      console.error(err);
      fireToast("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingId(category._id);
      setFormData({ name: category.name, fullPath: category.fullPath, group: category.group, isHidden: category.isHidden });
    } else {
      setEditingId(null);
      setFormData({ name: "", fullPath: "", group: "", isHidden: false });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const body = JSON.stringify({ ...formData, id: editingId });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body
      });
      const data = await res.json();

      if (data.success) {
        fireToast(editingId ? "Category updated successfully" : "Category created successfully");
        fetchCategories();
        handleCloseModal();
      } else {
        fireToast(data.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      fireToast("An error occurred");
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      const category = categories.find(c => c._id === id);
      if (!category) return;
      
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...category, isHidden: !currentHidden })
      });
      const data = await res.json();
      
      if (data.success) {
        fireToast(`Category ${!currentHidden ? 'hidden' : 'visible'} successfully`);
        fetchCategories();
      } else {
        fireToast(data.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        fireToast("Category deleted successfully");
        fetchCategories();
      } else {
        fireToast(data.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-dark flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Category Management
        </h2>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#7A187C]">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>
      
      {loading ? (
        <div className="py-8 text-center text-[14px] text-dark/50">Loading categories...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-border text-left text-dark/50 font-medium">
                <th className="pb-3 pr-4">Group</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Full Path (Used in filtering)</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className={`border-b border-border last:border-0 hover:bg-surface/30 ${c.isHidden ? 'opacity-60' : ''}`}>
                  <td className="py-3.5 pr-4 font-medium text-dark">{c.group}</td>
                  <td className="py-3.5 pr-4 font-bold text-primary">{c.name}</td>
                  <td className="py-3.5 pr-4 text-dark/70 text-[12px]">{c.fullPath}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold ${c.isHidden ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                      {c.isHidden ? "Hidden" : "Visible"}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleToggleHide(c._id, c.isHidden)} className={`text-[12px] font-semibold ${c.isHidden ? 'text-green-600' : 'text-orange-500'} hover:underline`}>
                        {c.isHidden ? "Show" : "Hide"}
                      </button>
                      <button onClick={() => handleOpenModal(c)} className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-primary">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-dark/50 italic">No categories found. Add some to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-dark">{editingId ? "Edit Category" : "Add New Category"}</h3>
              <button onClick={handleCloseModal} className="grid h-8 w-8 place-items-center rounded-full bg-surface text-dark/50 hover:bg-dark hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dark/70">Group Name</label>
                <input 
                  type="text" 
                  value={formData.group} 
                  onChange={e => setFormData({...formData, group: e.target.value})} 
                  placeholder="e.g. Ladies Collection"
                  className="w-full rounded-xl border border-border bg-surface/30 px-4 py-2.5 text-[14px] outline-none transition focus:border-primary/50"
                  required 
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dark/70">Display Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Ladies Full Night Suit"
                  className="w-full rounded-xl border border-border bg-surface/30 px-4 py-2.5 text-[14px] outline-none transition focus:border-primary/50"
                  required 
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-dark/70">Full Path (Must match product category exactly)</label>
                <input 
                  type="text" 
                  value={formData.fullPath} 
                  onChange={e => setFormData({...formData, fullPath: e.target.value})} 
                  placeholder="e.g. Ladies Collection > Night Suits > Ladies Full Night Suit"
                  className="w-full rounded-xl border border-border bg-surface/30 px-4 py-2.5 text-[14px] outline-none transition focus:border-primary/50"
                  required 
                />
                <p className="text-[11px] text-dark/50 mt-1">This is how the products are tagged in the database.</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isHidden" 
                  checked={formData.isHidden} 
                  onChange={e => setFormData({...formData, isHidden: e.target.checked})} 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isHidden" className="text-[13.5px] font-medium text-dark/70 cursor-pointer">Hide category from storefront</label>
              </div>
              
              <button type="submit" className="mt-4 w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-white transition hover:bg-[#7A187C]">
                {editingId ? "Update Category" : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
