"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";
import toast from "react-hot-toast";
import { Upload, X, Plus } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    createClient().from("categories").select("*").then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
  }, []);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles((prev) => [...prev, ...files].slice(0, 6));
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews].slice(0, 6));
  };

  const removeImage = (i: number) => {
    setImageFiles((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
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
      const slug = slugify(form.name) + "-" + Date.now().toString(36);
      const specsObj = Object.fromEntries(
        specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
      );

      // 1. Insert product
      const { data: product, error: pErr } = await supabase
        .from("products")
        .insert({
          name: form.name,
          slug,
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
        .select()
        .single();

      if (pErr) throw pErr;

      // 2. Upload images
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split(".").pop();
        const path = `${product.id}/${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
        if (uploadErr) { console.error("Image upload error:", uploadErr); continue; }

        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("product_images").insert({
          product_id: product.id,
          url: urlData.publicUrl,
          is_primary: i === 0,
          display_order: i,
        });
      }

      toast.success("Product added!");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const f = (key: keyof typeof form, label: string, type = "text", placeholder = "", required = true) => (
    <div>
      <label className="block text-sm font-medium text-brand mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        required={required}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-brand">Product Information</h2>
          {f("name", "Product Name", "text", "e.g. HP Laptop 15 Core i5")}
          <div>
            <label className="block text-sm font-medium text-brand mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Describe the product — key features, what's included, condition details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {f("price", "Selling Price (KES)", "number", "25000")}
            {f("original_price", "Original Price (KES, optional)", "number", "35000", false)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Condition <span className="text-red-400">*</span></label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="new">New</option>
                <option value="refurbished">Refurbished</option>
                <option value="second-hand">Second Hand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {f("stock", "Stock Quantity", "number", "1")}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-accent w-4 h-4"
              />
              <span>Feature on homepage</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-accent w-4 h-4"
              />
              <span>Make live immediately</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="font-semibold text-brand mb-4">Product Images</h2>
          <p className="text-xs text-muted mb-3">First image will be the main display image. Max 6 images.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-accent transition-colors">
            <Upload size={24} className="text-muted mb-2" />
            <span className="text-sm text-muted">Click to upload images</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</span>
            <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
          </label>
          {imagePreviews.length > 0 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0.5 left-0.5 bg-accent text-white text-[9px] font-bold px-1 rounded">MAIN</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand">Specifications (optional)</h2>
            <button type="button" onClick={addSpec} className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add row
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={s.key}
                  onChange={(e) => updateSpec(i, "key", e.target.value)}
                  placeholder="e.g. RAM"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                  placeholder="e.g. 8GB"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button type="button" onClick={() => removeSpec(i)} className="text-muted hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Saving..." : "Add Product"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
