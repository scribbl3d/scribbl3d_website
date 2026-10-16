import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createReviewToken } from "@/lib/reviews/link";
import { resolveReviewShortCode } from "@/lib/reviews/shortLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
    referrer: "no-referrer",
};

type Props = {
    params: Promise<{ code: string }>;
    searchParams: Promise<{ rating?: string | string[] }>;
};

/** Short review link: /r/<code> → /review/<signed token> */
export default async function ShortReviewLinkPage({ params, searchParams }: Props) {
    const { code } = await params;
    const orderId = await resolveReviewShortCode(code);
    if (!orderId) notFound();

    const rating = Number((await searchParams).rating);
    const query = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? `?rating=${rating}` : "";
    redirect(`/review/${createReviewToken(orderId)}${query}`);
}
