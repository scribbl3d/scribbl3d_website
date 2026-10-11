"use client";

import { Check, Copy, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CustomerCoupon, CustomerCouponStatus } from "@/lib/reviews/customerCoupons";

const STATUS: Record<CustomerCouponStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    used: { label: "Used", className: "bg-slate-100 text-slate-600 border-slate-200" },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-500 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function valueText(c: CustomerCoupon) {
    if (c.valueType === "flat") return `₹${c.value.toLocaleString("en-IN")} off`;
    return c.maxDiscount ? `${c.value}% off, up to ₹${c.maxDiscount.toLocaleString("en-IN")}` : `${c.value}% off`;
}

function CopyCode({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch {
                    /* clipboard unavailable: the code is visible to copy manually */
                }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={copied ? `Copied ${code}` : `Copy coupon code ${code}`}
        >
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
        </button>
    );
}

export default function MyCoupons({ coupons }: { coupons: CustomerCoupon[] }) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">My coupons</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Coupons you&apos;ve earned for reviewing your orders. Each coupon works once, on your account only.
                </p>
            </div>

            {coupons.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white/70 p-8 text-center">
                    <Ticket className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                    <p className="mt-3 text-sm text-gray-600">You don&apos;t have any coupons yet.</p>
                    <p className="mt-1 text-xs text-gray-400">Review a delivered order to earn one.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {coupons.map((coupon) => {
                        const status = STATUS[coupon.status];
                        const usable = coupon.status === "active";
                        return (
                            <li
                                key={coupon.code}
                                className={`rounded-xl border bg-white p-4 sm:p-5 ${usable ? "border-blue-100" : "border-gray-100 opacity-80"}`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`font-mono text-lg font-bold tracking-wider ${usable ? "text-gray-900" : "text-gray-500 line-through decoration-gray-300"}`}
                                            >
                                                {coupon.code}
                                            </span>
                                            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-gray-700">{valueText(coupon)} on your whole cart</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {coupon.orderNumber && <>For reviewing order #{coupon.orderNumber} · </>}
                                            {coupon.expiresAt &&
                                                (coupon.status === "expired" ? "Expired " : "Expires ") + formatDate(coupon.expiresAt)}
                                        </p>
                                    </div>
                                    {usable && (
                                        <div className="flex items-center gap-2">
                                            <CopyCode code={coupon.code} />
                                            <Link
                                                href={`/cart?coupon=${encodeURIComponent(coupon.code)}`}
                                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                            >
                                                Use in cart
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
