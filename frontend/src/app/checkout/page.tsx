"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/hooks/useCart";
import { formatKES, getProductImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

type PaymentMethod = "mpesa" | "cash_on_delivery";

export default function CheckoutPage() {
  const { items, total, clearCart, loaded } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    email: "",
    notes: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("mpesa");
  const [loading, setLoading] = useState(false);
  const DELIVERY_FEE = 300;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email! });
        setForm((f) => ({ ...f, email: data.user.email! }));
        supabase.from("profiles").select("*").eq("id", data.user.id).single().then(({ data: profile }) => {
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
      }
    });
  }, []);

  useEffect(() => {
    if (loaded && items.length === 0) router.push("/cart");
  }, [items, loaded]);

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: "#111827" }}>{label} <span style={{ color: "#EF4444" }}>*</span></label>
      <input
        type={type}
        required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: "0.875rem", outline: "none", fontFamily: "'Inter',sans-serif" }}
        placeholder={placeholder}
        onFocus={e => (e.currentTarget.style.borderColor = "#006BFF")}
        onBlur={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userId = user?.id ?? null;

      // If not logged in, create a guest order without user_id
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "pending",
          payment_method: payment,
          payment_status: "unpaid",
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
          toast("Order placed. M-Pesa prompt could not be sent — please contact us.", { icon: "⚠️" });
        } else {
          toast.success("M-Pesa prompt sent! Enter your PIN to complete payment.");
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
    <div style={{ background: "#F1F5F9", minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#081A2B" }}>
            Checkout
          </h1>
          {!user && (
            <p style={{ color: "#64748B", fontSize: "0.875rem", marginTop: 6, fontFamily: "'Inter',sans-serif" }}>
              Already have an account?{" "}
              <Link href="/auth/login?redirect=/checkout" style={{ color: "#006BFF", fontWeight: 600 }}>Sign in</Link>
              {" "}to auto-fill your details.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left */}
            <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Delivery */}
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, border: "1.5px solid #E2E8F0" }}>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#081A2B", marginBottom: 20 }}>
                  📦 Delivery Information
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {field("full_name", "Full Name", "text", "Your full name")}
                  {field("phone", "Phone Number", "tel", "07XX XXX XXX")}
                  {field("email", "Email Address", "email", "your@email.com")}
                  {field("city", "Town / City", "text", "e.g. Kakamega")}
                </div>
                <div style={{ marginTop: 16 }}>
                  {field("address", "Delivery Address", "text", "Street, estate or landmark")}
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#111827", marginBottom: 6 }}>Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: "0.875rem", fontFamily: "'Inter',sans-serif", resize: "none", outline: "none" }}
                    rows={3}
                    placeholder="Any special instructions?"
                  />
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 24, border: "1.5px solid #E2E8F0" }}>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#081A2B", marginBottom: 20 }}>
                  💳 Payment Method
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {([
                    { method: "mpesa" as PaymentMethod, icon: "📱", label: "M-Pesa", sub: "📦 Delivered to your door within 72 hours" },
                    { method: "cash_on_delivery" as PaymentMethod, icon: "💵", label: "Cash on Delivery", sub: "🏢 Pick up & pay at our Kakamega offices" },
                  ]).map(({ method, icon, label, sub }) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayment(method)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: 16, borderRadius: 10, textAlign: "left",
                        border: payment === method ? "2px solid #006BFF" : "2px solid #E2E8F0",
                        background: payment === method ? "rgba(0,107,255,0.04)" : "#FFFFFF",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                      <div>
                        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>{label}</p>
                        <p style={{ color: "#64748B", fontSize: "0.75rem", fontFamily: "'Inter',sans-serif" }}>{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div>
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, border: "1.5px solid #E2E8F0", position: "sticky", top: 100 }}>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#081A2B", marginBottom: 16 }}>
                  Order Summary
                </h2>
                <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0, background: "#F8FAFC", borderRadius: 8, overflow: "hidden" }}>
                        <Image src={getProductImage(product)} alt={product.name} fill style={{ objectFit: "contain", padding: 4 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111827", fontFamily: "'Space Grotesk',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
                        <p style={{ fontSize: "0.7rem", color: "#64748B" }}>× {quantity}</p>
                      </div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", flexShrink: 0 }}>{formatKES(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748B" }}>
                    <span>Subtotal</span><span>{formatKES(total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748B" }}>
                    <span>Delivery</span><span>{formatKES(DELIVERY_FEE)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#081A2B", borderTop: "1px solid #E2E8F0", paddingTop: 10, marginTop: 4 }}>
                    <span>Total</span>
                    <span style={{ color: "#006BFF" }}>{formatKES(total + DELIVERY_FEE)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                  style={{ marginTop: 16, width: "100%", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Placing order..." : payment === "mpesa" ? "Pay with M-Pesa" : "Place Order"}
                </button>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  <p style={{ fontSize: "0.7rem", color: "#64748B", textAlign: "center" }}>✅ M-Pesa &nbsp;|&nbsp; 🚚 Cash on Delivery &nbsp;|&nbsp; 🔒 Secure</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}