import { useEffect, useState } from "react";

export const useAutoImageLoader = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const startTime = Date.now();
        const minimumTime = 1500; // Force loader for 1.5s so users actually see it

        const checkImages = () => {
            const imgs = Array.from(document.querySelectorAll("img"));

            // Wait until at least some images are found (e.g., your logo or banner)
            if (imgs.length === 0) return false;

            const allDone = imgs.every((img) => img.complete);

            if (allDone) {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, minimumTime - elapsed);

                // Hide after the remaining minimum time
                setTimeout(() => setIsLoading(false), remaining);
                return true;
            }
            return false;
        };

        const interval = setInterval(() => {
            if (checkImages()) clearInterval(interval);
        }, 100);

        const timeout = setTimeout(() => {
            setIsLoading(false);
            clearInterval(interval);
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return isLoading;
};
