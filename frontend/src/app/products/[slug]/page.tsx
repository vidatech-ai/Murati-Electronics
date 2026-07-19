"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/useCart";
import { formatKES, conditionBadge } from "@/lib/utils";
import type { Product } from "@/types";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, categories(*), product_images(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        setProduct(data as Product);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-xl font-bold text-brand">Product not found</p>
      <button onClick={() => router.push("/products")} className="btn-primary">Back to Shop</button>
    </div>
  );

  const images = product.product_images ?? [];
  const currentImage = images[selectedImage]?.url ?? "/placeholder-product.png";
  const badge = conditionBadge(product.condition);
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    router.push("/cart");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ background: "rgba(255,255,255,0.93)", borderRadius: 16, marginTop: 16, marginBottom: 16 }}>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted hover:text-brand mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10" style={{ background: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 24 }}>
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            <Image src={currentImage} alt={product.name} fill className="object-contain p-6" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-accent" : "border-gray-100"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted">{product.categories?.name}</span>
            <span className={`${badge.color} text-xs font-bold px-2 py-0.5 rounded-full`}>{badge.label}</span>
          </div>

          <h1 className="text-2xl font-bold text-brand mb-3 leading-snug">{product.name}</h1>

          <div className="flex items-end gap-3 mb-4">
            <p className="text-3xl font-extrabold text-accent">{formatKES(product.price)}</p>
            {product.original_price && (
              <p className="text-muted line-through text-sm">{formatKES(product.original_price)}</p>
            )}
            {discount && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Save {discount}%</span>}
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{product.description}</p>
          )}

          {/* Specs */}
          {Object.keys(product.specs ?? {}).length > 0 && (
            <div className="bg-surface rounded-xl p-4 mb-5">
              <h3 className="font-semibold text-brand text-sm mb-3">Specifications</h3>
              <dl className="space-y-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium text-brand">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Stock */}
          <p className={`text-sm font-medium mb-5 flex items-center gap-1.5 ${product.stock > 0 ? "text-accent" : "text-red-500"}`}>
            <CheckCircle size={14} />
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Qty & CTA */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-brand">Qty:</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors font-bold"
                  >−</button>
                  <span className="px-4 py-2 text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors font-bold"
                  >+</button>
                </div>
              </div>
              <button onClick={handleAddToCart} className="btn-secondary w-full flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-primary w-full">
                Buy Now
              </button>
            </div>
          )}

          {/* Payment info */}
          <div className="mt-5 p-4 bg-surface rounded-xl text-xs text-muted space-y-1">
            <p>✅ M-Pesa STK Push at checkout</p>
            <p>🚚 Cash on Delivery available</p>
            <p>📍 Delivery across Kenya</p>
          </div>
        </div>
      </div>
    </div>
  );
}
