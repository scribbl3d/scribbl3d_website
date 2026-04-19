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
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showClose={false} mobileFullscreen={true}>
            <ModalHeader className="sm:pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Bell size={18} className="text-blue-600 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                Notify Me When Back
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 break-all">
                                {productName}
                                {variantLabel ? ` — ${variantLabel}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0 -mr-1 sm:mr-0 p-1 sm:p-0"
                        aria-label="Close"
                    >
                        <X size={20} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                </div>
            </ModalHeader>

            <ModalBody className="pb-6 sm:pb-5">
                {done ? (
                    <div className="flex flex-col items-center py-6 sm:py-8 text-center gap-3 sm:gap-3.5">
                        <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-green-50 flex items-center justify-center">
                            <Check size={26} className="text-green-600 sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                            You're on the list!
                        </p>
                        <p className="text-sm sm:text-[13px] text-gray-600 leading-relaxed px-2">
                            We'll notify you on{" "}
                            <span className="font-semibold text-gray-900 break-all">
                                {email}
                            </span>{" "}
                            and{" "}
                            <span className="font-semibold text-gray-900">
                                {phone}
                            </span>{" "}
                            as soon as this item is back in stock.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-3 sm:mt-2 px-8 py-3 sm:py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors active:scale-[0.98]"
                        >
                            Got it
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 sm:gap-3.5">
                        <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
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
                            className="w-full h-12 sm:h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 sm:mt-1 active:scale-[0.98]"
                        >
                            {submitting ? (
                                <LoadingSpinner size="sm" color="white" />
                            ) : (
                                <>
                                    <Bell size={16} className="sm:w-3.5 sm:h-3.5" /> Notify Me
                                </>
                            )}
                        </button>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
}
