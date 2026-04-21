import { useEffect } from "react";

export function useMarkViewed(section: string) {
    useEffect(() => {
        const markAsViewed = async () => {
            try {
                await fetch("/api/admin/mark-viewed", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ section })
                });
            } catch (error) {
                console.error("Failed to mark section as viewed:", error);
            }
        };

        markAsViewed();
    }, [section]);
}
