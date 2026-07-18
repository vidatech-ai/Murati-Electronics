"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatKES } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    const supabase = createClient();
    let q = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    q.then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast.success(`Order updated to ${status}`);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-6">Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
              filter === s ? "bg-brand text-white" : "bg-white border border-gray-200 text-muted hover:border-brand"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-surface">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted">Order</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-surface">
                  <td className="py-3 px-4">
                    <p className="font-medium text-accent">{order.order_number}</p>
                    <p className="text-xs text-muted">{order.order_items?.length} item(s)</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-brand">{order.delivery_name}</p>
                    <p className="text-xs text-muted">{order.delivery_city}</p>
                  </td>
                  <td className="py-3 px-4 text-muted">{order.delivery_phone}</td>
                  <td className="py-3 px-4 font-semibold">{formatKES(order.total)}</td>
                  <td className="py-3 px-4">
                    <p className="text-xs">{order.payment_method === "mpesa" ? "M-Pesa" : "Cash"}</p>
                    <span className={`text-xs font-semibold ${order.payment_status === "paid" ? "text-accent" : "text-yellow-600"}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-KE")}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center py-12 text-muted">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
