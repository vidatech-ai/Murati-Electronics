"use client";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/useCart";
import { formatKES, getProductImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag } from "lucide-react";
function CheckoutButton() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const supabase = createClient();

  const handleCheckout = async () => {
    setChecking(true);
    const { data } = await supabase.auth.getUser();
    setChecking(false);
    if (data.user) {
      router.push("/checkout");
    } else {
      router.push("/auth/login?redirect=/checkout");
    }
  };

  return (
    <button onClick={handleCheckout} disabled={checking} className="btn-primary w-full">
      {checking ? "Checking..." : "Proceed to Checkout"}
    </button>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQty, total, count } = useCart();
  const router = useRouter();

  if (count === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <ShoppingBag size={64} className="text-gray-200" />
      <h2 className="text-xl font-bold text-brand">Your cart is empty</h2>
      <p className="text-muted text-sm">Browse our products and add something you like.</p>
      <Link href="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand mb-8">Your Cart ({count} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image src={getProductImage(product)} alt={product.name} fill className="object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="font-semibold text-sm text-brand hover:text-accent line-clamp-2">
                  {product.name}
                </Link>
                <p className="text-accent font-bold mt-1">{formatKES(product.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >−</button>
                    <span className="px-3 py-1 font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, Math.min(product.stock, quantity + 1))}
                      className="px-2 py-1 hover:bg-gray-100"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-brand">{formatKES(product.price * quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-brand mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatKES(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className="text-accent font-medium">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6 flex justify-between font-bold text-brand">
              <span>Total</span>
              <span className="text-accent text-lg">{formatKES(total)}</span>
            </div>
            <CheckoutButton />
            <Link href="/products" className="block text-center text-sm text-muted hover:text-brand mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
