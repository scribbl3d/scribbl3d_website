"use client";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    color?: "white" | "blue" | "gray" | "orange";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-4",
};

const colorClasses = {
    white: "border-white/30 border-t-white",
    blue: "border-gray-200 border-t-blue-600",
    gray: "border-gray-200 border-t-gray-900",
    orange: "border-orange-200 border-t-orange-500",
};

export function LoadingSpinner({
    size = "md",
    color = "gray",
    className = "",
}: LoadingSpinnerProps) {
    return (
        <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
        />
    );
}

interface LoadingOverlayProps {
    message?: string;
    submessage?: string;
}

export function LoadingOverlay({
    message = "Loading...",
    submessage,
}: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg px-8 py-6 w-[360px] text-center">
                <div className="flex justify-center mb-4">
                    <LoadingSpinner size="lg" color="blue" />
                </div>
                <h2 className="text-lg font-semibold mb-2">{message}</h2>
                {submessage && (
                    <p className="text-sm text-gray-600">{submessage}</p>
                )}
            </div>
        </div>
    );
}
