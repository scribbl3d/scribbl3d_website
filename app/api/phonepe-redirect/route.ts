import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        body = {};
    }

    const merchantOrderId =
        body.merchantOrderId ||
        body.merchantTransactionId ||
        body?.merchant_order_id ||
        null;
    const transactionId =
        body.transactionId || body.txn || body.transaction_id || null;

    return doRedirect(merchantOrderId, transactionId);
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const merchantOrderId =
        url.searchParams.get("merchantOrderId") ||
        url.searchParams.get("merchantTransactionId") ||
        url.searchParams.get("orderId");
    const transactionId =
        url.searchParams.get("transactionId") ||
        url.searchParams.get("txn") ||
        url.searchParams.get("transaction_id") ||
        null;
    return doRedirect(merchantOrderId, transactionId);
}

function doRedirect(
    merchantOrderId: string | null,
    transactionId: string | null
) {
    const base = (
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000"
    ).replace(/\/+$/, "");
    const targetPath = "/payment/success";
    const params = new URLSearchParams();
    if (transactionId) {
        params.set("txn", transactionId);
        params.set("txnId", transactionId); // provide both names for compatibility
    }
    if (merchantOrderId) params.set("orderId", merchantOrderId);

    const target = `${base}${targetPath}?${params.toString()}`;
    console.log("[phonepe-redirect] redirecting to:", target);
    return NextResponse.redirect(target, 302);
}
