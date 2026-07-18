"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/useCart";
import { formatKES, getProductImage } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";

type PaymentMethod = "mpesa" | "cash_on_delivery";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("mpesa");
  const [loading, setLoading] = useState(false);
  const DELIVERY_FEE = 300;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login?redirect=/checkout");
        return;
      }
      setUser({ id: data.user.id, email: data.user.email! });
      // Pre-fill from profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setForm((f) => ({
              ...f,
              full_name: profile.full_name ?? "",
              phone: profile.phone ?? "",
              address: profile.address ?? "",
              city: profile.city ?? "",
            }));
          }
        });
    });
  }, []);

  useEffect(() => {
    if (items.length === 0) router.push("/cart");
  }, [items]);

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-brand mb-1">{label}</label>
      <input
        type={type}
        required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder={placeholder}
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          payment_method: payment,
          payment_status: payment === "cash_on_delivery" ? "unpaid" : "unpaid",
          subtotal: total,
          delivery_fee: DELIVERY_FEE,
          total: total + DELIVERY_FEE,
          delivery_name: form.full_name,
          delivery_phone: form.phone,
          delivery_address: form.address,
          delivery_city: form.city,
          notes: form.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: getProductImage(item.product),
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. If M-Pesa: trigger STK push
      if (payment === "mpesa") {
        const phone = form.phone.replace(/^0/, "254").replace(/^\+/, "");
        const resp = await fetch("/api/mpesa/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            amount: total + DELIVERY_FEE,
            order_id: order.id,
            order_number: order.order_number,
          }),
        });
        if (!resp.ok) {
          toast("Order placed. M-Pesa prompt could not be sent — please contact us with your order number.", { icon: "⚠️" });
        } else {
          toast.success("M-Pesa prompt sent to your phone. Enter your PIN to complete payment.");
        }
      } else {
        toast.success("Order placed! Pay cash on delivery.");
      }

      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Delivery + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery */}
            <div className="card p-6">
              <h2 className="font-bold text-brand mb-4">Delivery Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("full_name", "Full Name", "text", "Your full name")}
                {field("phone", "Phone (M-Pesa)", "tel", "07XX XXX XXX")}
                {field("address", "Delivery Address", "text", "Street, estate or landmark")}
                {field("city", "Town / City", "text", "e.g. Kakamega")}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-brand mb-1">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                  placeholder="Any special instructions?"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-bold text-brand mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["mpesa", "cash_on_delivery"] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayment(method)}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-colors ${
                      payment === method ? "border-accent bg-accent/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{method === "mpesa" ? "📱" : "💵"}</span>
                    <div>
                      <p className="font-semibold text-sm text-brand">
                        {method === "mpesa" ? "M-Pesa" : "Cash on Delivery"}
                      </p>
                      <p className="text-xs text-muted">
                        {method === "mpesa" ? "STK push to your phone" : "Pay when item arrives"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <div className="card p-5 sticky top-20">
              <h2 className="font-bold text-brand mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                      <Image src={getProductImage(product)} alt={product.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted">× {quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-brand flex-shrink-0">{formatKES(product.price * quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatKES(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span>{formatKES(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold text-brand border-t pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-accent">{formatKES(total + DELIVERY_FEE)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                {loading ? "Placing order..." : payment === "mpesa" ? "Pay with M-Pesa" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
