import type { Metadata } from "next";
import Link from "next/link";
import PolicyLayout, { type PolicySection } from "@/components/PolicyLayout";

const description = "Delivery locations, estimated timelines, shipping charges, tracking and support for SCRIBBL3D orders.";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description,
  alternates: { canonical: "/shipping-policy" },
  openGraph: {
    title: "Shipping Policy | Scribbl3D",
    description,
    url: "/shipping-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Shipping Policy | Scribbl3D",
    description,
  },
};

const sections: PolicySection[] = [
  {
    id: "delivery-locations",
    title: "Delivery Locations",
    content: <>
      <p>We currently ship Products to locations <strong>within India</strong>.</p>
      <p>Orders are delivered to the address provided by the Customer at the time of purchase.</p>
    </>,
  },
  {
    id: "order-processing-and-delivery",
    title: "Order Processing and Delivery",
    content: <>
      <p>Orders are shipped through our logistics and courier partners.</p>
      <p>Standard orders are <strong>generally delivered within 7 days</strong> from order confirmation and/or payment, subject to product availability, location and courier service conditions.</p>
      <p>For customised Products, 3D printing, prototyping and manufacturing Services, the expected production and delivery timeline will be communicated separately in the applicable quotation, order confirmation or other communication.</p>
      <p><strong>Delivery timelines are estimates</strong> and may vary depending on the destination and circumstances affecting the shipment.</p>
    </>,
  },
  {
    id: "shipping-charges",
    title: "Shipping Charges",
    content: <>
      <p>Standard shipping charges are <strong>included in the displayed Product price</strong>, unless otherwise stated.</p>
      <p>Customers requesting faster or expedited shipping, including air shipping, <strong>may be required to pay additional shipping charges</strong>.</p>
      <p>Any applicable additional charges will be communicated before the expedited shipment is processed.</p>
    </>,
  },
  {
    id: "tracking",
    title: "Tracking",
    content: <>
      <p>Where tracking is available, shipment tracking details may be provided through the contact information associated with the order.</p>
      <p>Customers are responsible for ensuring that their <strong>delivery address and contact information are accurate</strong>.</p>
    </>,
  },
  {
    id: "failed-or-undelivered-orders",
    title: "Failed or Undelivered Orders",
    content: <>
      <p>If an order cannot be delivered because of:</p>
      <ul>
        <li>an incorrect or incomplete address;</li>
        <li>the recipient being unavailable;</li>
        <li>repeated failed delivery attempts;</li>
        <li>refusal to accept the shipment; or</li>
        <li>other circumstances attributable to the Customer,</li>
      </ul>
      <p>any refund, re-shipment or additional delivery charge will be determined based on the circumstances and the applicable courier policy.</p>
      <p>A refund will not automatically be issued for an undelivered or refused shipment unless there is a valid reason for the refund and the claim is supported by the applicable courier or logistics policy.</p>
    </>,
  },
  {
    id: "damaged-shipments",
    title: "Damaged Shipments",
    content: <>
      <p>Customers should <strong>inspect the package upon delivery</strong>.</p>
      <p>If the package appears visibly damaged or tampered with, please notify us as soon as possible and, where possible, record the condition of the package before opening it.</p>
      <p>For products damaged during transit, please contact <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> <strong>within 48 hours of delivery</strong> with:</p>
      <ul>
        <li><strong>Order number</strong>;</li>
        <li>photographs/videos of the package and Product; and</li>
        <li>details of the damage.</li>
      </ul>
      <p>We may require additional information to process a claim with our logistics partner.</p>
    </>,
  },
  {
    id: "delivery-delays",
    title: "Delivery Delays",
    content: <>
      <p>SCRIBBL3D is not responsible for delays caused by circumstances beyond our reasonable control, including courier delays, logistics disruptions, weather conditions, natural events, government restrictions, strikes, technical issues or other similar circumstances.</p>
      <p>Where a delay occurs, we will make reasonable efforts to assist the Customer and coordinate with the relevant logistics partner.</p>
    </>,
  },
  {
    id: "custom-orders",
    title: "Custom Orders",
    content: <>
      <p>Customised Products, prototypes and manufacturing orders may have production and delivery timelines different from standard Products.</p>
      <p>The applicable timeline will be communicated in the relevant quotation, order confirmation or project communication.</p>
    </>,
  },
  {
    id: "contact",
    title: "Contact",
    content: <>
      <p>For shipping-related questions or delivery issues, contact:</p>
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
      <p>For returns and exchanges, please refer to our <Link href="/return-policy">Returns Policy</Link>.</p>
      <p>For refunds, please refer to our <Link href="/refund-policy">Refund Policy</Link>.</p>
    </>,
  },
];

export default function ShippingPolicy() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      description={description}
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      dateTime="2026-09-19"
      sections={sections}
    >
      <p>This Shipping Policy explains how SCRIBBL3D processes and delivers orders placed through <a href="https://www.scribbl3d.com/">www.scribbl3d.com</a>.</p>
    </PolicyLayout>
  );
}
