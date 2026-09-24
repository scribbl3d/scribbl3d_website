import { ChevronDown } from "lucide-react";

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqSectionProps {
    title?: string;
    faqs: FaqItem[];
    className?: string;
}

// Server-rendered FAQ list. Native <details> keeps every answer in the HTML
// (matching FAQPage structured data) and is keyboard accessible without JS.
export default function FaqSection({ title = "Frequently Asked Questions", faqs, className = "" }: FaqSectionProps) {
    if (faqs.length === 0) return null;

    return (
        <section aria-labelledby="faq-heading" className={`container mx-auto px-4 py-12 ${className}`}>
            <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {title}
            </h2>
            <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                {faqs.map((faq) => (
                    <details key={faq.question} className="group px-4 md:px-6">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-gray-900 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                            <h3 className="text-base md:text-lg">{faq.question}</h3>
                            <ChevronDown
                                aria-hidden="true"
                                className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
                            />
                        </summary>
                        <p className="pb-4 text-sm md:text-base leading-relaxed text-gray-600">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
