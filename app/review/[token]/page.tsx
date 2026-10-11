import type { Metadata } from "next";
import { loadReviewLink } from "@/lib/reviews/reviewableItems";
import { ReviewForm } from "./_components/ReviewForm";
import { ReviewThankYou } from "./_components/ReviewThankYou";

export const dynamic = "force-dynamic";

// Review links are private: keep them out of search and out of Referer headers
export const metadata: Metadata = {
    title: "Review your order",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
};

type Props = {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ rating?: string | string[] }>;
};

export default async function ReviewPage({ params, searchParams }: Props) {
    const { token } = await params;
    // Star clicked in the delivered email (?rating=1–5) pre-selects the overall rating
    const rawRating = Number((await searchParams).rating);
    const initialRating = Number.isInteger(rawRating) && rawRating >= 1 && rawRating <= 5 ? rawRating : 0;
    const context = await loadReviewLink(token);

    return (
        <main className="min-h-screen bg-[#f4f6fb] bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.08),transparent_55%)] pt-28 pb-16 px-4">
            <div className="mx-auto w-full max-w-4xl">
                {context.state === "open" ? (
                    <ReviewForm
                        token={token}
                        orderNumber={context.orderNumber}
                        orderReviewed={context.orderReviewed}
                        initialRating={context.orderReviewed ? 0 : initialRating}
                        items={context.items.map(({ productId: _productId, ...item }) => item)}
                    />
                ) : (
                    <ReviewThankYou />
                )}
            </div>
        </main>
    );
}
