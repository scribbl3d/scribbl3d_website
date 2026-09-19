import type { Metadata } from "next";
import Link from "next/link";
import PolicyLayout, { type PolicySection } from "@/components/PolicyLayout";

const description = "The terms governing your use of SCRIBBL3D’s website, products, and 3D printing, design and manufacturing services.";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description,
  alternates: { canonical: "/terms-conditions" },
  openGraph: {
    title: "Terms & Conditions | Scribbl3D",
    description,
    url: "/terms-conditions",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | Scribbl3D",
    description,
  },
};

function BusinessDetails({ contact = false }: Readonly<{ contact?: boolean }>) {
  const details = [
    { label: "Legal entity", value: "SCRIBBL3D" },
    ...(contact ? [{ label: "Brand", value: "SCRIBBL3D" }] : []),
    { label: "Registered office", value: "Plot 685, Behind MCD Primary School, Saini Mohalla, Nangloi, New Delhi 110041" },
    ...(!contact ? [{ label: "GSTIN", value: "07BVCPJ4441C1Z1" }] : []),
    { label: "Email", value: <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> },
    { label: "Phone", value: <a href="tel:+919599523434">+91 9599523434</a> },
    ...(contact ? [{ label: "Website", value: <a href="https://www.scribbl3d.com/">www.scribbl3d.com</a> }] : []),
  ];

  return (
    <dl className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm sm:p-6">
      {details.map(({ label, value }) => (
        <div key={label} className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-medium text-slate-900">{label}</dt>
          <dd className="min-w-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const sections: PolicySection[] = [
  {
    id: "about-scribbl3d",
    title: "About SCRIBBL3D",
    content: <>
      <p>SCRIBBL3D provides products and services related to 3D printing and additive manufacturing, including 3D printers, filaments, resins, accessories, pre-built products, customised products, 3D printing, prototyping, manufacturing and design services.</p>
      <BusinessDetails />
    </>,
  },
  {
    id: "account-and-website-use",
    title: "Account and Website Use",
    content: <>
      <p><strong>An account is required</strong> to place orders through the Website.</p>
      <p>You agree to provide accurate and complete information and to keep your account credentials secure. You are responsible for activity carried out through your account.</p>
      <p>You must use the Website only for lawful purposes. You must not:</p>
      <ul>
        <li>misuse or interfere with the Website;</li>
        <li>attempt unauthorised access to our systems;</li>
        <li>introduce malicious code or harmful software;</li>
        <li>copy, scrape or commercially exploit Website content without permission;</li>
        <li>use the Website for fraudulent or unlawful purposes; or</li>
        <li>infringe the rights of SCRIBBL3D or any third party.</li>
      </ul>
      <p>We may suspend or terminate access to an account where reasonably necessary due to misuse, fraud, violation of these Terms or applicable law.</p>
    </>,
  },
  {
    id: "products-and-services",
    title: "Products and Services",
    content: <>
      <p>We make reasonable efforts to ensure that product descriptions, specifications, images, prices and availability displayed on the Website are accurate.</p>
      <p>However, minor variations may occur, including variations in colour, finish, dimensions and appearance. Product specifications, availability and pricing may change without notice.</p>
      <p>Where specific specifications or requirements apply, the applicable product page, quotation, order confirmation or invoice will govern the relevant transaction.</p>
    </>,
  },
  {
    id: "orders-pricing-and-payment",
    title: "Orders, Pricing and Payment",
    content: <>
      <p>Placing an order constitutes a request to purchase the selected Products or Services. An order becomes <strong>binding upon confirmation by SCRIBBL3D</strong>.</p>
      <p>We may decline or cancel an order where, for example:</p>
      <ul>
        <li>a Product is unavailable;</li>
        <li>there is a material error in pricing or Product information;</li>
        <li>payment cannot be verified;</li>
        <li>incorrect information has been provided; or</li>
        <li>the order appears fraudulent or otherwise unlawful.</li>
      </ul>
      <p>All applicable prices, taxes and shipping charges will be displayed during the purchasing process or in the applicable quotation.</p>
      <p>Payment must be made using the payment methods made available by SCRIBBL3D.</p>
    </>,
  },
  {
    id: "cancellation",
    title: "Cancellation",
    content: <>
      <p>Orders may be cancelled in accordance with the cancellation conditions communicated at the time of purchase.</p>
      <div className="rounded-r-lg border-l-2 border-blue-700 bg-blue-50 px-5 py-4">
        <p className="text-sm font-medium text-slate-700">Cancellation period for standard Products</p>
        <p className="mt-1 font-semibold text-slate-900">Before the product is dispatched.</p>
      </div>
      <p>Customised Products and manufacturing orders <strong>may not be cancellable once production has commenced</strong>.</p>
      <p>For detailed cancellation, return and refund procedures, please refer to our:</p>
      <ul>
        <li><Link href="/return-policy">Returns Policy</Link></li>
        <li><Link href="/refund-policy">Refund Policy</Link></li>
      </ul>
    </>,
  },
  {
    id: "custom-products-and-manufacturing",
    title: "Custom Products and Manufacturing Services",
    content: <>
      <p>SCRIBBL3D may provide customised 3D-printed products, prototypes and manufacturing services based on Customer specifications.</p>
      <p>3D printing and additive manufacturing may involve reasonable variations such as layer lines, support marks, surface variations, dimensional tolerances, shrinkage, warping and minor colour variations.</p>
      <p>Where applicable, manufacturing specifications and tolerances will be specified in the relevant quotation, technical specification or order confirmation.</p>
    </>,
  },
  {
    id: "customer-supplied-designs-and-files",
    title: "Customer-Supplied Designs and Files",
    content: <>
      <p>Customers may provide CAD files, STL files, 3D models, drawings, images, specifications and other materials (“Customer Materials”) for the purpose of obtaining our Services.</p>
      <p><strong>You retain ownership</strong> of the intellectual property rights that you own in your Customer Materials.</p>
      <p>By submitting Customer Materials, you grant SCRIBBL3D a limited, non-exclusive, royalty-free licence to access, store, process, modify, reproduce and manufacture from those materials <strong>solely as reasonably necessary to provide the requested Services and fulfil your order</strong>.</p>
      <p>This may include technical processing such as file repair, conversion, slicing, scaling, orientation and support generation.</p>
      <p>You represent that you have the necessary rights and permissions to provide the Customer Materials and instruct SCRIBBL3D to use them for the requested purpose.</p>
      <p>SCRIBBL3D may refuse to process or manufacture from materials where we reasonably believe that doing so may violate applicable law or third-party rights.</p>
    </>,
  },
  {
    id: "designs-created-by-scribbl3d",
    title: "Designs Created by SCRIBBL3D",
    content: <>
      <p>Unless otherwise agreed in writing, CAD files, designs, drawings and other intellectual property created by SCRIBBL3D remain the property of SCRIBBL3D.</p>
      <p>Payment for a physical Product or manufacturing service <strong>does not automatically transfer ownership of the underlying CAD files or designs</strong>.</p>
      <p>Any different ownership or licensing arrangement will be specified in the applicable quotation, order confirmation or separate agreement.</p>
    </>,
  },
  {
    id: "use-of-customer-projects",
    title: "Use of Customer Projects",
    content: <>
      <p>SCRIBBL3D may wish to showcase completed customer projects, photographs, testimonials or project details for marketing or portfolio purposes.</p>
      <p>We will <strong>obtain the customer’s permission</strong> before publicly using identifiable customer project information or materials for such purposes.</p>
    </>,
  },
  {
    id: "scribbl3d-intellectual-property",
    title: "SCRIBBL3D Intellectual Property",
    content: <>
      <p>All intellectual property contained on the Website or belonging to SCRIBBL3D, including trademarks, logos, photographs, graphics, videos, written content, software, CAD models, 3D models, designs and documentation, is owned by SCRIBBL3D or its licensors unless otherwise stated.</p>
      <p>You may not reproduce, modify, distribute, sell, license, publish, reverse engineer or commercially exploit such content without our prior written permission, except where permitted by applicable law.</p>
    </>,
  },
  {
    id: "returns-refunds-and-shipping",
    title: "Returns, Refunds and Shipping",
    content: <>
      <p>Returns, refunds and shipping are governed by their respective policies, which form part of these Terms:</p>
      <ul>
        <li><Link href="/return-policy">Returns Policy</Link></li>
        <li><Link href="/refund-policy">Refund Policy</Link></li>
        <li><Link href="/shipping-policy">Shipping Policy</Link></li>
      </ul>
      <p>Please review these policies before placing an order.</p>
      <p>Nothing in these Terms or our policies is intended to exclude or restrict rights that cannot legally be excluded or restricted under applicable law.</p>
    </>,
  },
  {
    id: "warranty-and-disclaimer",
    title: "Warranty and Disclaimer",
    content: <>
      <p>Where applicable, Products may be covered by a manufacturer or SCRIBBL3D warranty. Applicable warranty terms will be provided on the relevant Product page, invoice or accompanying documentation.</p>
      <p>To the maximum extent permitted by applicable law, SCRIBBL3D does not guarantee that the Website will always be available, uninterrupted or error-free, or that all information will always be complete or current.</p>
      <p>Nothing in these Terms excludes or limits any warranty, right or remedy that cannot legally be excluded or limited.</p>
    </>,
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: <>
      <p>To the maximum extent permitted by applicable law, SCRIBBL3D will not be liable for indirect, incidental, special or consequential losses arising from your use of the Website or Services, including loss of profits, revenue, business opportunities, goodwill or data.</p>
      <p>Nothing in these Terms limits or excludes liability that cannot legally be limited or excluded.</p>
    </>,
  },
  {
    id: "indemnification",
    title: "Indemnification",
    content: <>
      <p>To the extent permitted by applicable law, you agree to indemnify and hold harmless SCRIBBL3D, its directors, officers, employees, agents and affiliates from claims, losses, liabilities and reasonable costs arising from:</p>
      <ul>
        <li>your breach of these Terms;</li>
        <li>your unlawful use of the Website or Services;</li>
        <li>your violation of applicable law;</li>
        <li>your infringement of third-party rights; or</li>
        <li>Customer Materials submitted by you.</li>
      </ul>
    </>,
  },
  {
    id: "privacy",
    title: "Privacy",
    content: <>
      <p>Your use of the Website is also governed by our Privacy Policy, which explains how we collect, use, store and process personal information.</p>
      <p><Link href="/privacy-policy">Privacy Policy</Link></p>
    </>,
  },
  {
    id: "changes-and-termination",
    title: "Changes and Termination",
    content: <>
      <p>SCRIBBL3D may update these Terms from time to time. The latest version will be published on the Website together with the applicable “Last Updated” date.</p>
      <p>We may suspend or terminate access to the Website or an account where reasonably necessary due to violation of these Terms, unlawful activity, fraud, abuse or other circumstances permitted by applicable law.</p>
    </>,
  },
  {
    id: "force-majeure",
    title: "Force Majeure",
    content: <p>SCRIBBL3D will not be responsible for delays or failures caused by circumstances beyond our reasonable control, including natural disasters, fire, flood, war, strikes, government restrictions, power or telecommunications failures, logistics disruptions, supplier failures or similar events.</p>,
  },
  {
    id: "governing-law-and-dispute-resolution",
    title: "Governing Law and Dispute Resolution",
    content: <>
      <p>These Terms are governed by the <strong>laws of India</strong>.</p>
      <p>Any concerns or disputes should first be communicated to SCRIBBL3D at <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> so that we may attempt to resolve the matter.</p>
      <p>Subject to applicable law, disputes that cannot be resolved through this process shall be subject to the jurisdiction of the courts in New Delhi, Delhi, India.</p>
      <p>Nothing in this section limits any statutory rights or remedies available to consumers under applicable law.</p>
    </>,
  },
  {
    id: "general",
    title: "General",
    content: <>
      <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.</p>
      <p>Failure to enforce any provision does not constitute a waiver of that provision.</p>
      <p>These Terms, together with the policies and agreements expressly incorporated into them, constitute the terms governing your use of the Website and our Products and Services.</p>
    </>,
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: <>
      <p>For questions, complaints or communications relating to these Terms:</p>
      <BusinessDetails contact />
    </>,
  },
];

export default function TermsAndConditions() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      description={description}
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      dateTime="2026-09-19"
      sections={sections}
    >
      <p>These Terms & Conditions (“Terms”) govern your access to and use of <a href="https://www.scribbl3d.com/">www.scribbl3d.com</a> (“Website”) and the products and services offered by SCRIBBL3D, operating under the brand name SCRIBBL3D (“SCRIBBL3D”, “we”, “us”, or “our”).</p>
      <p>By accessing the Website, creating an account, placing an order, or using our products or services, you agree to these Terms. If you do not agree, please do not use the Website or our services.</p>
    </PolicyLayout>
  );
}
