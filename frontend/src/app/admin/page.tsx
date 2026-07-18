"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatKES } from "@/lib/utils";
import { Package, ShoppingBag, DollarSign, Users } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("products").select("id", { count: "exact" }).eq("is_active", true),
      supabase.from("orders").select("id, total, status", { count: "exact" }),
      supabase.from("orders").select("id, order_number, total, status, created_at, delivery_name").order("created_at", { ascending: false }).limit(5),
    ]).then(([products, orders, recent]) => {
      const paid = (orders.data ?? []).filter((o) => o.status !== "cancelled");
      const revenue = paid.reduce((sum: number, o: any) => sum + Number(o.total), 0);
      const pending = (orders.data ?? []).filter((o) => o.status === "pending").length;
      setStats({
        totalProducts: products.count ?? 0,
        totalOrders: orders.count ?? 0,
        totalRevenue: revenue,
        pendingOrders: pending,
      });
      setRecentOrders(recent.data ?? []);
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    { label: "Active Products", value: stats.totalProducts.toString(), icon: Package, color: "text-blue-500" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "text-purple-500" },
    { label: "Revenue", value: formatKES(stats.totalRevenue), icon: DollarSign, color: "text-accent" },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Users, color: "text-yellow-500" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-brand">Dashboard</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted">{label}</p>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-brand">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-brand">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-muted text-sm py-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-muted font-medium">Order</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Customer</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Total</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-muted font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-surface">
                    <td className="py-2.5 px-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-accent font-medium hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-brand">{order.delivery_name}</td>
                    <td className="py-2.5 px-3 font-medium">{formatKES(order.total)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                        ${order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-KE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
