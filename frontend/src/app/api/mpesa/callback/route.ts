import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase service-role client (server-side only, never expose this key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Add this key to .env.local
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;
    if (!callback) return NextResponse.json({ ok: true });

    const resultCode = callback.ResultCode;
    const orderNumber = callback.CallbackMetadata?.Item?.find(
      (i: { Name: string }) => i.Name === "AccountReference"
    )?.Value;
    const mpesaRef = callback.CallbackMetadata?.Item?.find(
      (i: { Name: string }) => i.Name === "MpesaReceiptNumber"
    )?.Value;

    if (!orderNumber) return NextResponse.json({ ok: true });

    if (resultCode === 0) {
      // Payment successful
      await supabase
        .from("orders")
        .update({ payment_status: "paid", mpesa_reference: mpesaRef, status: "confirmed" })
        .eq("order_number", orderNumber);
    } else {
      // Payment failed or cancelled
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("order_number", orderNumber);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.json({ ok: true }); // Always return 200 to Safaricom
  }
}
