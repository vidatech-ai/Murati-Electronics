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

  return (
    <Link href={`/products/${product.slug}`} className="card block group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`${badge.color} text-xs font-bold px-2 py-0.5 rounded-full`}>{badge.label}</span>
          {discount && discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted mb-1">{product.categories?.name}</p>
        <h3 className="font-semibold text-sm text-brand line-clamp-2 mb-2 leading-snug">{product.name}</h3>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-accent font-bold text-base">{formatKES(product.price)}</p>
            {product.original_price && (
              <p className="text-muted text-xs line-through">{formatKES(product.original_price)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="bg-brand hover:bg-brand-light text-white p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
