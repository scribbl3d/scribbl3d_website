"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export function DownloadInvoiceButton({ orderId }: { orderId: string }) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/invoice`);
            if (!res.ok) {
                throw new Error("Failed to download invoice");
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Get filename from Content-Disposition header
            const disposition = res.headers.get("Content-Disposition");
            const match = disposition?.match(/filename="(.+)"/);
            a.download = match?.[1] || `Invoice_${orderId}.pdf`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
            {downloading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    Download Invoice
                </>
            )}
        </button>
    );
}
