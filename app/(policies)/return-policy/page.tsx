import type { Metadata } from "next";
import Link from "next/link";
import PolicyLayout, { type PolicySection } from "@/components/PolicyLayout";

const description = "Return and exchange eligibility, product-specific conditions, and how to request a return with SCRIBBL3D.";

export const metadata: Metadata = {
  title: "Returns Policy",
  description,
  alternates: { canonical: "/return-policy" },
  openGraph: {
    title: "Returns Policy | Scribbl3D",
    description,
    url: "/return-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Returns Policy | Scribbl3D",
    description,
  },
};

const sections: PolicySection[] = [
  {
    id: "return-period",
    title: "Return Period",
    content: <>
      <p>Eligible Products may be returned or exchanged <strong>within 10 days from the date of delivery</strong>.</p>
      <p>Once 10 days have passed from delivery, the Product will generally not be eligible for return or exchange, except where required under applicable law or where the Product is covered by an applicable warranty.</p>
    </>,
  },
  {
    id: "return-eligibility",
    title: "Return Eligibility",
    content: <>
      <p>To be eligible for a return or exchange:</p>
      <ul>
        <li>the Product <strong>must be unused</strong>;</li>
        <li>the Product must be in the same condition in which it was received;</li>
        <li>the <strong>original packaging</strong> should be retained;</li>
        <li>all applicable accessories, manuals and components should be included; and</li>
        <li>proof of purchase may be required.</li>
      </ul>
      <p>Products that show signs of use, damage, modification or misuse may not be eligible for return or exchange.</p>
    </>,
  },
  {
    id: "sale-and-discounted-products",
    title: "Sale and Discounted Products",
    content: <p>Products purchased during a sale or promotional offer are eligible for return or exchange subject to the <strong>same conditions applicable to other eligible Products</strong>.</p>,
  },
  {
    id: "defective-damaged-or-incorrect-products",
    title: "Defective, Damaged or Incorrect Products",
    content: <>
      <p>If a Product is received damaged, defective or different from the Product ordered, please contact us at <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> as soon as possible.</p>
      <p>Where the issue is verified, SCRIBBL3D will provide a replacement subject to availability.</p>
      <p>If a replacement cannot reasonably be provided, the matter will be handled in accordance with our <Link href="/refund-policy">Refund Policy</Link>.</p>
    </>,
  },
  {
    id: "customised-and-personalised-products",
    title: "Customised and Personalised Products",
    content: <>
      <p>Customised, personalised or made-to-order Products are not eligible for return or exchange unless they are:</p>
      <ul>
        <li>defective;</li>
        <li>damaged during delivery;</li>
        <li>incorrectly manufactured; or</li>
        <li>different from the Product ordered.</li>
      </ul>
    </>,
  },
  {
    id: "filaments-resins-and-other-consumables",
    title: "Filaments, Resins and Other Consumables",
    content: <>
      <p><strong>Sealed and unopened</strong> consumable Products may be eligible for return subject to the conditions above.</p>
      <p>Opened or used consumables are generally not eligible for return or exchange, <strong>except where the Product is defective or damaged</strong>.</p>
      <p>This includes Products such as filaments, resins and other consumable materials.</p>
    </>,
  },
  {
    id: "3d-printers-and-electronics",
    title: "3D Printers and Electronics",
    content: <>
      <p>3D printers and other applicable electronic Products are <strong>not eligible for return or exchange after delivery</strong>.</p>
      <p>Any manufacturing defect or functional issue will be handled through the <strong>applicable warranty or service process</strong>.</p>
    </>,
  },
  {
    id: "return-process",
    title: "Return Process",
    content: <>
      <p>To request a return or exchange, contact us at <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> with:</p>
      <ul>
        <li><strong>Order number</strong>;</li>
        <li>Product details;</li>
        <li>Reason for the request; and</li>
        <li>Photographs or videos where relevant.</li>
      </ul>
      <p>We may request additional information to assess the Product.</p>
      <p>Once the returned Product is received and inspected, we will notify you whether the return or exchange has been approved.</p>
      <p>Approved returns and refunds will be processed in accordance with our applicable policies.</p>
    </>,
  },
  {
    id: "important",
    title: "Important",
    content: <>
      <p>Nothing in this Returns Policy is intended to exclude or restrict any rights or remedies that cannot legally be excluded or restricted under applicable law.</p>
      <p>For refund-related information, please refer to our <Link href="/refund-policy">Refund Policy</Link>.</p>
      <p>For shipping-related information, please refer to our <Link href="/shipping-policy">Shipping Policy</Link>.</p>
    </>,
  },
];

export default function ReturnsPolicy() {
  return (
    <PolicyLayout
      title="Returns Policy"
      description={description}
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      dateTime="2026-09-19"
      sections={sections}
    >
      <p>At SCRIBBL3D, we want you to receive your Products in proper condition. This Returns Policy explains when a Product may be returned or exchanged.</p>
    </PolicyLayout>
  );
}
