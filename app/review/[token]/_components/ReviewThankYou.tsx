import { Star } from "lucide-react";
import Link from "next/link";

/** Decorative sparkle dots around the star badge: [left, top, size, opacity] */
const SPARKLES: [string, string, string, string][] = [
    ["-108%", "47%", "h-1.5 w-1.5", "opacity-80"],
    ["-48%", "6%", "h-1 w-1", "opacity-60"],
    ["-43%", "90%", "h-1 w-1", "opacity-60"],
    ["141%", "6%", "h-1 w-1", "opacity-50"],
    ["197%", "47%", "h-1.5 w-1.5", "opacity-80"],
    ["137%", "94%", "h-1 w-1", "opacity-60"],
    ["-28%", "50%", "h-0.5 w-0.5", "opacity-30"],
    ["124%", "50%", "h-0.5 w-0.5", "opacity-30"],
];

/** Shown after submitting, and for expired, used or unavailable links (R5, R6) */
export function ReviewThankYou() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-8 sm:px-10 sm:py-10 text-center shadow-[0_8px_30px_rgba(79,70,229,0.06)]">
            <div className="relative mx-auto mb-5 h-14 w-14 sm:h-16 sm:w-16" aria-hidden="true">
                {SPARKLES.map(([left, top, size, opacity]) => (
                    <span
                        key={`${left}-${top}`}
                        className={`absolute rounded-full bg-indigo-900/70 ${size} ${opacity}`}
                        style={{ left, top }}
                    />
                ))}
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[#4f46e5] shadow-lg shadow-indigo-200">
                    <Star className="h-7 w-7 sm:h-8 sm:w-8 fill-white text-white" />
                </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Thank you for your review
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-slate-600">
                Your feedback helps other makers make better choices.
                <span className="hidden sm:inline">
                    {" "}
                    We really appreciate you taking the time to share your experience.
                </span>
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[#4f46e5] px-12 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#4338ca] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
            >
                Back to homepage
            </Link>
        </div>
    );
}
