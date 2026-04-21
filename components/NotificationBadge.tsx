import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
    count: number;
    className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
    if (count === 0) return null;

    return (
        <div
            className={cn(
                "absolute top-2 left-2 flex items-center justify-center",
                "min-w-6 h-6 px-1.5",
                "bg-red-500 text-white text-xs font-bold rounded-full",
                "shadow-lg border-2 border-white",
                "animate-pulse",
                "z-10",
                className
            )}
        >
            {count > 99 ? '99+' : count}
        </div>
    );
}
