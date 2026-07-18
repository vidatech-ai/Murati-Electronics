"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatKES, getProductImage, conditionBadge } from "@/lib/utils";
import type { Product } from "@/types";
import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, categories(*), product_images(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (product: Product) => {
    const supabase = createClient();
    await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id);
    toast.success(product.is_active ? "Product hidden" : "Product visible");
    load();
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-surface">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted">Product</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Price</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Condition</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const badge = conditionBadge(p.condition);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-surface">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={getProductImage(p)} alt={p.name} fill className="object-contain p-1" />
                        </div>
                        <div>
                          <p className="font-medium text-brand line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted">{(p.categories as any)?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-accent">{formatKES(p.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`${badge.color} text-xs font-bold px-2 py-0.5 rounded-full`}>{badge.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={p.stock === 0 ? "text-red-500 font-semibold" : "text-brand"}>{p.stock}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(p)} className="flex items-center gap-1 text-xs font-medium">
                        {p.is_active
                          ? <><ToggleRight size={18} className="text-accent" /><span className="text-accent">Live</span></>
                          : <><ToggleLeft size={18} className="text-muted" /><span className="text-muted">Hidden</span></>
                        }
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-muted hover:text-brand transition-colors">
                          <Pencil size={15} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id, p.name)} className="text-muted hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-muted">No products yet. <Link href="/admin/products/new" className="text-accent">Add one.</Link></div>
          )}
        </div>
      </div>
    </div>
  );
}
