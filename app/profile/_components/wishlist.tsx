"use client";

import { Bell, Check, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import WishlistCard from "./wishlist-card";
import WishlistCardSkeleton from "./wishlist-card-skeleton";
import WishlistModal from "./wishlist-modal";
import { WishlistGridItem } from "./wishlist.types";

/* ── Notify Me Modal ── */
function NotifyMeModal({
    item,
    onClose,
}: {
    item: WishlistGridItem;
    onClose: () => void;
}) {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [email, setEmail] = useState((session?.user?.email as string) ?? "");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const productType =
        item.itemType === "printer"
            ? "printer"
            : item.itemType === "resin"
              ? "resin"
              : "prebuilt";

    const handleSubmit = async () => {
        if (!email.trim() || !phone.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/stock-notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId:
                        item.cartPayload[
                            productType === "printer"
                                ? "printerId"
                                : productType === "resin"
                                  ? "resinId"
                                  : "prebuiltProductId"
                        ],
                    productName: item.title,
                    productType,
                    email: email.trim(),
                    phone: phone.trim(),
                    name: name.trim() || null,
                }),
            });
            if (res.ok) setDone(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                            <Bell size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Notify Me When Back
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {item.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black mt-0.5"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">
                    {done ? (
                        <div className="flex flex-col items-center py-6 text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                <Check size={22} className="text-green-600" />
                            </div>
                            <p className="text-base font-bold text-gray-900">
                                You're on the list!
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We'll notify you on{" "}
                                <span className="font-semibold text-gray-700">
                                    {email}
                                </span>{" "}
                                and{" "}
                                <span className="font-semibold text-gray-700">
                                    {phone}
                                </span>{" "}
                                as soon as it's back.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition"
                            >
                                Got it
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3.5">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This product is currently out of stock. Leave
                                your details and we'll let you know the moment
                                it's available.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Name{" "}
                                    <span className="text-gray-400 normal-case font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Email{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Phone Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    maxLength={15}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    submitting || !email.trim() || !phone.trim()
                                }
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Bell size={14} /> Notify Me
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Wishlist Page ── */
export default function Wishlist() {
    const [items, setItems] = useState<WishlistGridItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeItem, setActiveItem] = useState<WishlistGridItem | null>(null);
    const [notifyItem, setNotifyItem] = useState<WishlistGridItem | null>(null);

    useEffect(() => {
        fetch("/api/wishlist")
            .then((r) => r.json())
            .then((d) => {
                setItems(d.items || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const removeFromWishlist = async (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Wishlist</h1>
                    <p className="text-sm text-gray-500">
                        Products you've saved for later
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        {items.length} items
                    </span>
                </div>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <WishlistCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {!loading && items.length === 0 && (
                <p className="text-sm text-gray-500">Wishlist is empty.</p>
            )}

            {!loading && items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <WishlistCard
                            key={item.id}
                            item={item}
                            onRemove={removeFromWishlist}
                            onSelect={setActiveItem}
                            onNotify={setNotifyItem}
                        />
                    ))}
                </div>
            )}

            {/* Variant selection modal */}
            {activeItem && (
                <WishlistModal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                />
            )}

            {/* Notify Me modal */}
            {notifyItem && (
                <NotifyMeModal
                    item={notifyItem}
                    onClose={() => setNotifyItem(null)}
                />
            )}
        </div>
    );
}
