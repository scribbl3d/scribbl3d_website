"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm p-12 text-center ${className}`}
        >
            {icon && <div className="flex justify-center mb-4">{icon}</div>}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            {description && <p className="text-gray-600">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
