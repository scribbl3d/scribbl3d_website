"use client";

export function DiscountInput({
    onApply,
}: {
    onApply: (code: string) => void;
}) {
    return (
        <div className="flex gap-2">
            <input id="code" placeholder="Discount code" />
            <button
                onClick={() =>
                    onApply(
                        (document.getElementById("code") as HTMLInputElement)
                            .value,
                    )
                }
            >
                Apply
            </button>
        </div>
    );
}
