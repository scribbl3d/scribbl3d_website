/**
 * Shimmer loading effect component
 * Used for skeleton loading states across the application
 */
export function Shimmer({ className = "" }: { className?: string }) {
    return (
        <div
            className={`relative overflow-hidden rounded-lg ${className}`}
            style={{
                background:
                    "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
            }}
        />
    );
}
