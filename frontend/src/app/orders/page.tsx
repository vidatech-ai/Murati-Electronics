"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatKES } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login?redirect=/orders"); return; }
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .then(({ data: rows }) => {
          setOrders((rows as Order[]) ?? []);
          setLoading(false);
        });
    });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="font-semibold text-brand text-lg">No orders yet</p>
          <Link href="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="card block p-5 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-brand">{order.order_number}</p>
                  <p className="text-xs text-muted mt-0.5">{new Date(order.created_at).toLocaleDateString("en-KE", { dateStyle: "medium" })}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="font-bold text-accent">{formatKES(order.total)}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted">
                {order.order_items?.length} item(s) · {order.payment_method === "mpesa" ? "M-Pesa" : "Cash on Delivery"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
