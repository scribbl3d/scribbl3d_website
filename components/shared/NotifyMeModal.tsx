"use client";

import { Modal, ModalBody, ModalHeader } from "@/components/ui/modal";
import { FormInput } from "@/components/ui/form-input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/components/ui/use-toast";
import { Bell, Check, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface NotifyMeModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    productType: "resin" | "printer" | "prebuilt";
    variantId?: string;
    variantLabel?: string;
}

export function NotifyMeModal({
    isOpen,
    onClose,
    productId,
    productName,
    productType,
    variantId,
    variantLabel,
}: NotifyMeModalProps) {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [email, setEmail] = useState((session?.user?.email as string) ?? "");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !phone.trim()) {
            toast({
                title: "Email and phone are required",
                variant: "destructive",
            });
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/stock-notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    productName,
                    productType,
                    variantId: variantId ?? null,
                    variantLabel: variantLabel ?? null,
                    email: email.trim(),
                    phone: phone.trim(),
                    name: name.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast({
                    title: data.error || "Something went wrong",
                    variant: "destructive",
                });
                return;
            }
            setDone(true);
        } catch {
            toast({ title: "Request failed", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showClose={false}>
            <ModalHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                            <Bell size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Notify Me When Back
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {productName}
                                {variantLabel ? ` — ${variantLabel}` : ""}
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
            </ModalHeader>

            <ModalBody>
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
                            as soon as this item is back in stock.
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
                            {variantLabel
                                ? `${variantLabel} is currently out of stock. Leave your details and we'll notify you the moment it's available.`
                                : "This item is currently out of stock. Leave your details and we'll let you know the moment it's available."}
                        </p>
                        <FormInput
                            label="Name"
                            value={name}
                            onChange={setName}
                            placeholder="Your name"
                            optional
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="you@example.com"
                            required
                        />
                        <FormInput
                            label="Phone Number"
                            type="tel"
                            value={phone}
                            onChange={setPhone}
                            placeholder="10-digit mobile number"
                            maxLength={15}
                            required
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full h-11 bg-[#2563EB] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                        >
                            {submitting ? (
                                <LoadingSpinner size="sm" color="white" />
                            ) : (
                                <>
                                    <Bell size={14} /> Notify Me
                                </>
                            )}
                        </button>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
}
