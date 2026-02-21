"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionButton({ className, ...props }: ButtonProps) {
    return (
        <Button
            {...props}
            className={cn(
                "w-[160px] h-[40px] justify-center text-sm",
                className,
            )}
        />
    );
}
