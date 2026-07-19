"use client";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  current: { q?: string; category?: string; condition?: string; featured?: string };
}

export function ProductFilters({ categories, current }: Props) {
  const router = useRouter();

  const navigate = (params: Record<string, string | undefined>) => {
    const merged = { ...current, ...params };
    const sp = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v); });
    router.push(`/products?${sp.toString()}`);
  };

  const clear = () => router.push("/products");

  const hasFilters = current.category || current.condition || current.featured;

  return (
    <div className="space-y-6">
      {hasFilters && (
        <button onClick={clear} className="text-sm text-accent hover:underline font-medium">
          ✕ Clear filters
        </button>
      )}

      {/* Condition */}
      <div>
        <h3 className="font-semibold text-brand text-sm mb-3">Condition</h3>
        <div className="space-y-2">
          {[
            { label: "All", value: undefined },
            { label: "New", value: "new" },
            { label: "Refurbished", value: "refurbished" },
            { label: "Second Hand", value: "second-hand" },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => navigate({ condition: opt.value, category: current.category })}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                current.condition === opt.value || (!current.condition && !opt.value)
                  ? "bg-accent text-white font-semibold"
                  : "text-brand font-medium"
              }`}
              style={
                current.condition === opt.value || (!current.condition && !opt.value)
                  ? {}
                  : { background: "#FFFFFF", border: "1.5px solid #E2E8F0" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-brand text-sm mb-3">Category</h3>
        <div className="space-y-1">
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate({ category: cat.slug, condition: current.condition })}
              className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                current.category === cat.slug
                  ? "bg-brand text-white font-semibold"
                  : "hover:bg-gray-100 text-brand"
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
