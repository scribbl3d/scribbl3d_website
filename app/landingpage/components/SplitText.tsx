"use client";

import { motion } from "framer-motion";

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

const wordVariant = {
    hidden: { y: 50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            damping: 15,
            stiffness: 100,
        },
    },
};

const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

interface SplitTextProps {
    children: string;
    className?: string;
    as?: "h1" | "h2" | "h3" | "p";
    animate?: boolean; // when false, stays hidden until set to true (for loader gating)
}

interface AnimatedSubtextProps {
    children: string;
    className?: string;
    animate?: boolean;
}

export function SplitText({
    children,
    className = "",
    as: Tag = "h2",
    animate = true,
}: SplitTextProps) {
    // Extract justify classes to pass to inner flex wrapper
    const justifyMatch = className.match(/justify-\w+/);
    const justifyClass = justifyMatch ? justifyMatch[0] : "";

    return (
        <Tag className={className}>
            <motion.span
                className={`flex flex-wrap w-full ${justifyClass}`}
                initial="hidden"
                {...(animate
                    ? { whileInView: "visible", viewport: { margin: "-50px" } }
                    : {})}
                variants={staggerContainer}
            >
                {children.split(" ").map((word, i) => (
                    <span
                        key={i}
                        className="overflow-hidden pb-[0.15em]"
                        style={{ lineHeight: "inherit" }}
                    >
                        <motion.span
                            className="inline-block mr-[0.25em]"
                            variants={wordVariant}
                        >
                            {word}
                        </motion.span>
                    </span>
                ))}
            </motion.span>
        </Tag>
    );
}

export function AnimatedSubtext({
    children,
    className = "",
}: AnimatedSubtextProps) {
    return (
        <motion.p
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-50px" }}
            variants={fadeUp}
        >
            {children}
        </motion.p>
    );
}
