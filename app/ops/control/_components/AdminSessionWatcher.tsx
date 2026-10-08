"use client";

import { ToastAction } from "@/components/ui/toast";
import { toast, useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const LOGIN_PATH = "/ops/control/login";

function requestPath(input: RequestInfo | URL): string | null {
    try {
        const raw =
            typeof input === "string"
                ? input
                : input instanceof URL
                  ? input.href
                  : input.url;
        const url = new URL(raw, window.location.origin);
        return url.origin === window.location.origin ? url.pathname : null;
    } catch {
        return null;
    }
}

/**
 * Admin sessions last one hour. When an ops API call is rejected with 401,
 * tell the admin they were signed out instead of leaving a silent failure.
 * Login opens in a new tab so unsaved work on this page is kept.
 */
export function AdminSessionWatcher() {
    const pathname = usePathname();
    const { toasts } = useToast();
    const toastsRef = useRef(toasts);
    const toastIdRef = useRef<string | null>(null);
    toastsRef.current = toasts;

    useEffect(() => {
        if (pathname === LOGIN_PATH) return;

        const originalFetch = window.fetch;

        const showExpired = () => {
            const open = toastsRef.current.some(
                (t) => t.id === toastIdRef.current && t.open !== false,
            );
            if (open) return;

            toastIdRef.current = toast({
                variant: "destructive",
                title: "Your admin session has expired",
                description:
                    "You were signed out after 1 hour, so this action was not saved. Log in again in the new tab, then come back and retry.",
                duration: Infinity,
                action: (
                    <ToastAction
                        altText="Log in again in a new tab"
                        onClick={() => window.open(LOGIN_PATH, "_blank", "noopener")}
                    >
                        Log in again
                    </ToastAction>
                ),
            }).id;
        };

        window.fetch = async (input, init) => {
            const response = await originalFetch(input, init);
            const path = requestPath(input);
            if (
                response.status === 401 &&
                path?.startsWith("/api/") &&
                path !== "/api/admin/login"
            ) {
                // Only one toast shows at a time; wait so this replaces the
                // page's own generic error toast instead of being replaced by it.
                window.setTimeout(showExpired, 500);
            }
            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [pathname]);

    return null;
}
