import { useEffect, useState } from "react";

export function useCountUp(
    end: number,
    duration: number = 2000,
    active: boolean = true,
) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!active) {
            setCount(0); // 👈 reset when out of view
            return;
        }

        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // easeOutExpo
            const easeOut =
                progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, active]);

    return count;
}
