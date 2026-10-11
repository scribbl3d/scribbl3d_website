import { Star } from "lucide-react";
import Link from "next/link";

/** Shown after submitting, and for expired, used or unavailable links (R5, R6) */
export function ReviewThankYou() {
    return (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-indigo-50 px-6 py-10 sm:px-10 sm:py-14 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#4f46e5] shadow-lg shadow-indigo-200">
                <Star className="h-8 w-8 fill-white text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Thank you for your review
            </h1>
            <Link
                href="/"
                className="mt-8 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[#4f46e5] px-8 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#4338ca] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
            >
                Back to homepage
            </Link>
        </div>
    );
}
