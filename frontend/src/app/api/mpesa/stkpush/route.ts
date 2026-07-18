import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// M-Pesa Daraja STK Push
// Fill in MPESA_* env vars to activate.
// Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
// ─────────────────────────────────────────────────────────────

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  MPESA_CALLBACK_URL,
  MPESA_ENV,
} = process.env;

const BASE_URL =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  // If credentials not yet configured, return graceful response
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE || !MPESA_PASSKEY) {
    return NextResponse.json(
      { error: "M-Pesa not yet configured. Your order has been placed — we will contact you." },
      { status: 503 }
    );
  }

  try {
    const { phone, amount, order_id, order_number } = await req.json();

    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: order_number,
      TransactionDesc: `Muratis Electronics Order ${order_number}`,
    };

    const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.ResponseCode === "0") {
      return NextResponse.json({ success: true, checkoutRequestId: data.CheckoutRequestID });
    }
    return NextResponse.json({ error: data.errorMessage ?? "STK push failed" }, { status: 400 });
  } catch (err) {
    console.error("M-Pesa error:", err);
    return NextResponse.json({ error: "M-Pesa request failed" }, { status: 500 });
  }
}
