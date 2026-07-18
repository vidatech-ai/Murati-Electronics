"use client";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatKES, getProductImage, conditionBadge } from "@/lib/utils";
import type { Product } from "@/types";
import toast from "react-hot-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const badge = conditionBadge(product.condition);
  const image = getProductImage(product);
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock < 1) return;
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const badgeClass =
    product.condition === "new" ? "badge-new"
    : product.condition === "refurbished" ? "badge-refurbished"
    : "badge-secondhand";

  const badgeLabel =
    product.condition === "new" ? "NEW"
    : product.condition === "refurbished" ? "MURATIS VERIFIED"
    : "PRE-OWNED";

  return (
    <Link href={`/products/${product.slug}`} className="card block group" style={{ borderRadius: 8 }}>
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", borderRadius: "8px 8px 0 0", background: "#F8FAFC" }}>
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          <span className={badgeClass}>{badgeLabel}</span>
          {discount && discount > 0 && (
            <span style={{ background: "#EF4444", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 6px", borderRadius: 2, fontFamily: "'Space Grotesk',sans-serif" }}>
              -{discount}%
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px 8px 0 0" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem", background: "rgba(0,0,0,0.6)", padding: "4px 12px", borderRadius: 20, fontFamily: "'Space Grotesk',sans-serif" }}>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        {product.categories?.name && (
          <p style={{ color: "#64748B", fontSize: "0.7rem", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{product.categories.name}</p>
        )}
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#111827", lineHeight: 1.3, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>

        {/* Specs preview */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div style={{ marginBottom: 10 }}>
            {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#64748B", padding: "1px 0" }}>
                <span>{k.toUpperCase()}</span>
                <span style={{ color: "#374151" }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#006BFF" }}>{formatKES(product.price)}</p>
            {product.original_price && (
              <p style={{ color: "#94A3B8", fontSize: "0.7rem", textDecoration: "line-through", fontFamily: "'Inter',sans-serif" }}>{formatKES(product.original_price)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{
              background: "#006BFF",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s",
              opacity: product.stock === 0 ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLElement).style.background = "#0058d6"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#006BFF"; }}
            title="Add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
}