import type { Metadata } from "next";
import Link from "next/link";
import PolicyLayout, { type PolicySection } from "@/components/PolicyLayout";

const description = "Order cancellation conditions, refund eligibility, processing timelines and support for SCRIBBL3D purchases.";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description,
  alternates: { canonical: "/refund-policy" },
  openGraph: {
    title: "Refund & Cancellation Policy | Scribbl3D",
    description,
    url: "/refund-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Refund & Cancellation Policy | Scribbl3D",
    description,
  },
};

const sections: PolicySection[] = [
  {
    id: "order-cancellation",
    title: "Order Cancellation",
    content: <>
      <p>Customers may request cancellation of an order provided the order <strong>has not already been dispatched</strong>.</p>
      <p>Once an order has been dispatched or entered the delivery process, cancellation may no longer be available.</p>
      <p>For customised, personalised or made-to-order Products, <strong>cancellation may not be available once production has commenced</strong>.</p>
      <p>To request a cancellation, contact us at <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> with your <strong>Order ID</strong> and cancellation request, or navigate to your <Link href="/profile?tab=orders" prefetch={false}>orders section</Link> to cancel an eligible order.</p>
    </>,
  },
  {
    id: "refunds-for-cancelled-orders",
    title: "Refunds for Cancelled Orders",
    content: <>
      <p>Where an eligible cancellation is approved before dispatch, the amount paid for the cancelled Product will generally be refunded to the original payment method.</p>
      <p>Where an order has already been shipped, any applicable shipping or return-related charges may be deducted from the refundable amount.</p>
      <p>Refunds will be processed <strong>within 5–7 business days after approval</strong>. The time taken for the amount to appear in your account may depend on your bank, card issuer or payment provider.</p>
    </>,
  },
  {
    id: "damaged-defective-or-incorrect-products",
    title: "Damaged, Defective or Incorrect Products",
    content: <>
      <p>If you receive a Product that is damaged, defective, incorrectly supplied or materially different from the Product ordered, please contact <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> <strong>within 48 hours of delivery</strong>.</p>
      <p>Please provide:</p>
      <ul>
        <li><strong>Order ID</strong>;</li>
        <li>photographs or videos of the Product and packaging; and</li>
        <li>a description of the issue.</li>
      </ul>
      <p>After reviewing the claim, SCRIBBL3D may approve a replacement or, where a replacement cannot reasonably be provided, a refund in accordance with our applicable policies.</p>
      <p>For more information about eligibility and returns, please refer to our <Link href="/return-policy">Returns Policy</Link>.</p>
    </>,
  },
  {
    id: "3d-printers-and-warranty-products",
    title: "3D Printers and Warranty Products",
    content: <>
      <p>3D printers and other Products covered by a manufacturer or SCRIBBL3D warranty are not eligible for ordinary return or refund after delivery.</p>
      <p>Issues with such Products will generally be handled through the <strong>applicable warranty or service process</strong>.</p>
      <p>Please refer to the applicable warranty documentation provided with the Product.</p>
    </>,
  },
  {
    id: "customised-and-made-to-order-products",
    title: "Customised and Made-to-Order Products",
    content: <p>Customised, personalised and made-to-order Products are generally not eligible for cancellation or refund once production has commenced, except where the Product is defective, damaged, incorrectly manufactured or otherwise covered by applicable law.</p>,
  },
  {
    id: "failed-or-refused-deliveries",
    title: "Failed or Refused Deliveries",
    content: <>
      <p>If an order is returned to SCRIBBL3D because of an incorrect address, refusal to accept delivery, repeated failed delivery attempts or another reason attributable to the Customer, any refund or re-shipment will be considered based on the circumstances and applicable courier policy.</p>
      <p>Any applicable shipping, return or re-delivery charges <strong>may be deducted from the refundable amount</strong>.</p>
    </>,
  },
  {
    id: "refund-method",
    title: "Refund Method",
    content: <>
      <p>Approved refunds will generally be issued to the <strong>original payment method</strong> used for the transaction.</p>
      <p>If the original payment method cannot receive the refund, SCRIBBL3D may contact the Customer to arrange an appropriate alternative method.</p>
    </>,
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: <>
      <p>For cancellation or refund requests, contact:</p>
      <dl className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm sm:p-6">
        <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-medium text-slate-900">Email</dt>
          <dd className="min-w-0"><a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a></dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-medium text-slate-900">Phone</dt>
          <dd><a href="tel:+919599523434">+91 9599523434</a></dd>
        </div>
      </dl>
      <p>Please include your <strong>Order ID</strong> when contacting us.</p>
      <p>Nothing in this Policy is intended to exclude or restrict any rights or remedies that cannot legally be excluded or restricted under applicable law.</p>
    </>,
  },
];

export default function RefundPolicy() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      description={description}
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      dateTime="2026-09-19"
      sections={sections}
    >
      <p>This Refund & Cancellation Policy explains the conditions under which orders placed through <a href="https://www.scribbl3d.com/">www.scribbl3d.com</a> may be cancelled and refunds may be issued.</p>
    </PolicyLayout>
  );
}
