import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
      await supabase
        .from("orders")
        .update({ payment_status: "paid", mpesa_reference: mpesaRef, status: "confirmed" })
        .eq("order_number", orderNumber);
    } else {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("order_number", orderNumber);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.json({ ok: true });
  }
}