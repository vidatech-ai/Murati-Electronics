"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatKES } from "@/lib/utils";
import type { Order } from "@/types";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];
const STEP_ICONS = [Clock, CheckCircle, Package, Truck, CheckCircle];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single()
        .then(({ data: row }) => {
          setOrder(row as Order);
          setLoading(false);
        });
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="font-bold text-brand text-lg">Order not found</p>
      <Link href="/orders" className="btn-primary mt-4 inline-block">My Orders</Link>
    </div>
  );

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand">Order {order.order_number}</h1>
        <Link href="/orders" className="text-sm text-accent hover:underline">← All Orders</Link>
      </div>

      {/* Progress */}
      {order.status !== "cancelled" && (
        <div className="card p-5 mb-6">
          <div className="flex justify-between">
            {STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const done = i <= currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? "bg-accent text-white" : "bg-gray-100 text-gray-400"}`}>
                    <Icon size={14} />
                  </div>
                  <span className={`text-xs text-center capitalize ${done ? "text-brand font-medium" : "text-muted"}`}>
                    {step}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-full mt-1 ${i < currentStep ? "bg-accent" : "bg-gray-100"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-bold text-brand mb-4">Items</h2>
        <div className="space-y-4">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              {item.product_image && (
                <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.product_image} alt={item.product_name} fill className="object-contain p-1" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-brand">{item.product_name}</p>
                <p className="text-xs text-muted">× {item.quantity} · {formatKES(item.unit_price)} each</p>
              </div>
              <p className="font-bold text-brand text-sm">{formatKES(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-5 mb-5">
        <h2 className="font-bold text-brand mb-4">Payment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatKES(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{formatKES(order.delivery_fee)}</span></div>
          <div className="flex justify-between font-bold text-brand border-t pt-2 mt-2">
            <span>Total</span><span className="text-accent">{formatKES(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-muted">Method</span>
            <span className="font-medium">{order.payment_method === "mpesa" ? "M-Pesa" : "Cash on Delivery"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Payment Status</span>
            <span className={`font-semibold ${order.payment_status === "paid" ? "text-accent" : "text-yellow-600"}`}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="card p-5">
        <h2 className="font-bold text-brand mb-3">Delivery Address</h2>
        <p className="text-sm text-brand font-medium">{order.delivery_name}</p>
        <p className="text-sm text-muted">{order.delivery_phone}</p>
        <p className="text-sm text-muted">{order.delivery_address}, {order.delivery_city}</p>
        {order.notes && <p className="text-sm text-muted mt-2 italic">Note: {order.notes}</p>}
      </div>
    </div>
  );
}
