"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category, Product } from "@/types";
import toast from "react-hot-toast";
import { Upload, X, Plus } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; is_primary: boolean }[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    condition: "new",
    category_id: "",
    stock: "1",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("products").select("*, product_images(*)").eq("id", id).single(),
    ]).then(([{ data: cats }, { data: product }]) => {
      setCategories((cats as Category[]) ?? []);
      if (product) {
        const p = product as Product & { product_images: { id: string; url: string; is_primary: boolean }[] };
        setForm({
          name: p.name,
          description: p.description ?? "",
          price: String(p.price),
          original_price: p.original_price ? String(p.original_price) : "",
          condition: p.condition,
          category_id: p.category_id ?? "",
          stock: String(p.stock),
          is_featured: p.is_featured,
          is_active: p.is_active,
        });
        if (p.specs) {
          const entries = Object.entries(p.specs);
          setSpecs(entries.length > 0 ? entries.map(([key, value]) => ({ key, value: String(value) })) : [{ key: "", value: "" }]);
        }
        setExistingImages(p.product_images ?? []);
      }
      setFetching(false);
    });
  }, [id]);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles((prev) => [...prev, ...files].slice(0, 6));
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 6));
  };

  const removeNewImage = (i: number) => {
    setImageFiles((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = async (imgId: string) => {
    const supabase = createClient();
    await supabase.from("product_images").delete().eq("id", imgId);
    setExistingImages((p) => p.filter((img) => img.id !== imgId));
    toast.success("Image removed");
  };

  const addSpec = () => setSpecs((p) => [...p, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs((p) => p.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    setSpecs((p) => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      const specsObj = Object.fromEntries(
        specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
      );

      const { error: pErr } = await supabase
        .from("products")
        .update({
          name: form.name,
          slug: slugify(form.name) + "-" + id.slice(0, 6),
          description: form.description,
          price: parseFloat(form.price),
          original_price: form.original_price ? parseFloat(form.original_price) : null,
          condition: form.condition,
          category_id: form.category_id || null,
          stock: parseInt(form.stock),
          is_featured: form.is_featured,
          is_active: form.is_active,
          specs: specsObj,
        })
        .eq("id", id);

      if (pErr) throw pErr;

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split(".").pop();
        const path = `${id}/${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
        if (uploadErr) { console.error("Image upload error:", uploadErr); continue; }
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("product_images").insert({
          product_id: id,
          url: urlData.publicUrl,
          is_primary: existingImages.length === 0 && i === 0,
          display_order: existingImages.length + i,
        });
      }

      toast.success("Product updated!");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-brand">Product Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Product Name <span className="text-red-400">*</span></label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Selling Price (KES) <span className="text-red-400">*</span></label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Original Price (optional)</label>
              <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Condition <span className="text-red-400">*</span></label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="new">New</option>
                <option value="refurbished">Refurbished</option>
                <option value="second-hand">Second Hand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand mb-1">Stock Quantity</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-accent w-4 h-4" />
              <span>Feature on homepage</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-accent w-4 h-4" />
              <span>Make live immediately</span>
            </label>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-brand mb-4">Current Images</h2>
            <div className="flex gap-3 flex-wrap">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
                  <button type="button" onClick={() => removeExistingImage(img.id)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    <X size={10} />
                  </button>
                  {img.is_primary && (
                    <span className="absolute bottom-0.5 left-0.5 bg-accent text-white text-[9px] font-bold px-1 rounded">MAIN</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div className="card p-6">
          <h2 className="font-semibold text-brand mb-4">Add More Images</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-accent transition-colors">
            <Upload size={24} className="text-muted mb-2" />
            <span className="text-sm text-muted">Click to upload images</span>
            <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
          </label>
          {imagePreviews.length > 0 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-contain p-1" />
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand">Specifications</h2>
            <button type="button" onClick={addSpec} className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add row
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={s.key} onChange={(e) => updateSpec(i, "key", e.target.value)}
                  placeholder="e.g. RAM" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <input type="text" value={s.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                  placeholder="e.g. 8GB" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <button type="button" onClick={() => removeSpec(i)} className="text-muted hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}