import type { Metadata } from "next";
import Link from "next/link";
import PolicyLayout, { type PolicySection } from "@/components/PolicyLayout";

const description = "How SCRIBBL3D collects, uses, shares and protects personal information, and how to contact us about your privacy rights.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: "Privacy Policy | Scribbl3D",
    description,
    url: "/privacy-policy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Scribbl3D",
    description,
  },
};

function PrivacyContactDetails({ grievance = false }: { grievance?: boolean }) {
  const details = [
    ...(grievance ? [
      { label: "Name", value: "Mr. Sparsh Jain" },
      { label: "Designation", value: "Founder" },
    ] : []),
    { label: "Company", value: "SCRIBBL3D" },
    { label: "Address", value: "Plot No. 685, Saini Mohalla, Nangloi, New Delhi – 110041" },
    { label: "Email", value: <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a> },
    { label: "Phone", value: <a href="tel:+919599523434">+91 9599523434</a> },
    ...(grievance
      ? [{ label: "Availability", value: "Monday–Saturday, 9:00 AM–6:00 PM" }]
      : [{ label: "Website", value: <a href="https://www.scribbl3d.com/">www.scribbl3d.com</a> }]),
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
    id: "information-we-collect",
    title: "Information We Collect",
    content: <>
      <p>We collect information that is necessary to provide and improve our Products and Services.</p>
      <p>Depending on how you use the Website, this may include:</p>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Information you provide to us</h3>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Billing and shipping address</li>
          <li>Account login information</li>
          <li>Order and transaction details</li>
          <li>Information provided when contacting customer support</li>
          <li>Information provided for customised Products or Services</li>
          <li>CAD files, STL files, images, drawings, specifications and other files submitted for custom manufacturing or prototyping</li>
          <li>Any other information you voluntarily provide to us</li>
        </ul>
      </div>
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-semibold text-slate-900">Payment information</h3>
        <p>Payments may be processed through third-party payment providers. Where payment is processed by a third-party payment provider, SCRIBBL3D may receive transaction-related information necessary to confirm and manage the payment.</p>
        <p><strong>We do not ask you to provide passwords, PINs, OTPs or other confidential payment credentials</strong> through email, phone or customer support.</p>
      </div>
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-semibold text-slate-900">Information collected automatically</h3>
        <p>When you use our Website, certain technical information may be collected automatically, such as:</p>
        <ul>
          <li>IP address;</li>
          <li>browser and device information;</li>
          <li>operating system;</li>
          <li>pages visited;</li>
          <li>approximate usage information;</li>
          <li>referring website; and</li>
          <li>information collected through cookies and similar technologies.</li>
        </ul>
      </div>
    </>,
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    content: <>
      <p>We may use your information to:</p>
      <ul>
        <li>create and manage your account;</li>
        <li>process and fulfil orders;</li>
        <li>provide Products and Services;</li>
        <li>process payments;</li>
        <li>arrange delivery;</li>
        <li>provide customer support;</li>
        <li>process returns, replacements and refunds;</li>
        <li>provide warranty and after-sales support;</li>
        <li>provide customised manufacturing and prototyping services;</li>
        <li>process Customer Materials such as CAD and STL files;</li>
        <li>communicate with you regarding your orders and account;</li>
        <li>improve our Website, Products and Services;</li>
        <li>detect and prevent fraud, abuse and security issues;</li>
        <li>comply with applicable legal obligations;</li>
        <li>send promotional or marketing communications where permitted; and</li>
        <li>perform other purposes communicated to you at the time information is collected.</li>
      </ul>
      <p>Where applicable, you may <strong>opt out of promotional communications</strong>.</p>
    </>,
  },
  {
    id: "cookies-and-similar-technologies",
    title: "Cookies and Similar Technologies",
    content: <>
      <p>We may use cookies and similar technologies to:</p>
      <ul>
        <li>keep you signed in;</li>
        <li>maintain your shopping experience;</li>
        <li>understand how the Website is used;</li>
        <li>remember preferences;</li>
        <li>improve Website performance; and</li>
        <li>support analytics and marketing activities where applicable.</li>
      </ul>
      <p>You may be able to <strong>control cookies through your browser settings</strong>. Disabling certain cookies may affect some Website functionality.</p>
    </>,
  },
  {
    id: "how-we-share-your-information",
    title: "How We Share Your Information",
    content: <>
      <p>We may share information with trusted third parties where reasonably necessary to operate our business and provide our Products and Services.</p>
      <p>These may include:</p>
      <ul>
        <li>payment processors;</li>
        <li>courier and logistics partners;</li>
        <li>technology and hosting providers;</li>
        <li>website analytics and infrastructure providers;</li>
        <li>customer-support providers;</li>
        <li>manufacturing or service partners where necessary to fulfil an order;</li>
        <li>professional advisers; and</li>
        <li>government, regulatory or law-enforcement authorities where required or permitted by law.</li>
      </ul>
      <p><strong>We do not sell your personal information</strong> to third parties for their independent commercial use.</p>
      <p>Where third-party service providers process information on our behalf, we expect them to handle that information appropriately and in accordance with applicable requirements.</p>
    </>,
  },
  {
    id: "customer-submitted-files-and-custom-manufacturing",
    title: "Customer-Submitted Files and Custom Manufacturing",
    content: <>
      <p>If you submit CAD files, STL files, images, designs, drawings or other materials for custom manufacturing or prototyping, we may access, store and process those materials to provide the requested Service.</p>
      <p>We will use such materials primarily for purposes connected with your order or Service, including:</p>
      <ul>
        <li>file preparation;</li>
        <li>manufacturing;</li>
        <li>quality control;</li>
        <li>customer support;</li>
        <li>reprints or replacements; and</li>
        <li>related technical processing.</li>
      </ul>
      <p>Intellectual-property ownership of Customer Materials is governed by our <Link href="/terms-conditions">Terms & Conditions</Link>.</p>
      <p>Where required to fulfil your order, Customer Materials may be accessed by relevant employees, contractors, manufacturing partners or service providers.</p>
    </>,
  },
  {
    id: "data-security",
    title: "Data Security",
    content: <>
      <p>We use reasonable technical and organisational measures designed to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.</p>
      <p>However, no method of transmitting or storing information over the internet can be guaranteed to be completely secure.</p>
      <p>You are responsible for <strong>maintaining the confidentiality of your account credentials</strong> and should notify us if you believe your account has been compromised.</p>
    </>,
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: <>
      <p>We retain personal information for <strong>as long as reasonably necessary</strong> to:</p>
      <ul>
        <li>provide our Products and Services;</li>
        <li>maintain your account;</li>
        <li>fulfil contractual and business obligations;</li>
        <li>resolve disputes;</li>
        <li>maintain transaction and accounting records;</li>
        <li>prevent fraud and abuse; and</li>
        <li>comply with applicable legal requirements.</li>
      </ul>
      <p>When information is no longer required, we may delete, anonymise or securely dispose of it in accordance with our practices and applicable law.</p>
      <p>Certain information may need to be retained for longer periods where required by law or necessary to establish, exercise or defend legal claims.</p>
    </>,
  },
  {
    id: "your-rights-and-requests",
    title: "Your Rights and Requests",
    content: <>
      <p>Subject to applicable law, you may request to:</p>
      <ul>
        <li>access personal information we hold about you;</li>
        <li>correct or update inaccurate information;</li>
        <li>request deletion of personal information where applicable;</li>
        <li>withdraw consent where processing is based on consent; and</li>
        <li>exercise other rights available to you under applicable law.</li>
      </ul>
      <p>To make a request, contact us using the details provided below.</p>
      <p>We may need to <strong>verify your identity</strong> before processing certain requests.</p>
      <p>Please note that some information may need to be retained where required by law or where there is a legitimate reason to do so.</p>
    </>,
  },
  {
    id: "marketing-communications",
    title: "Marketing Communications",
    content: <>
      <p>We may send you information about Products, Services, offers and other updates where permitted by applicable law.</p>
      <p>You may opt out of promotional communications by:</p>
      <ul>
        <li>using the <strong>unsubscribe option</strong> provided in the communication; or</li>
        <li>contacting us at <a href="mailto:supplychain@scribbl3d.com">supplychain@scribbl3d.com</a>.</li>
      </ul>
      <p>Transactional and service-related communications, such as order confirmations, shipping updates and important account notifications, may continue where necessary.</p>
    </>,
  },
  {
    id: "third-party-websites",
    title: "Third-Party Websites",
    content: <>
      <p>Our Website may contain links to third-party websites or services.</p>
      <p>This Privacy Policy does not apply to third-party websites. Their collection and use of information is governed by their respective privacy policies.</p>
      <p>We recommend reviewing the privacy policy of any third-party service before providing personal information.</p>
    </>,
  },
  {
    id: "childrens-information",
    title: "Children’s Information",
    content: <>
      <p>Our Website is intended for use by individuals who are legally capable of entering into applicable transactions.</p>
      <p>We do not knowingly collect personal information from children in circumstances where such collection is prohibited by applicable law.</p>
      <p>If you believe that a child has provided personal information to us inappropriately, please contact us using the details below.</p>
    </>,
  },
  {
    id: "changes-to-this-privacy-policy",
    title: "Changes to This Privacy Policy",
    content: <>
      <p>We may update this Privacy Policy from time to time to reflect changes in our business, technology, legal requirements or information practices.</p>
      <p>The updated version will be published on the Website together with the revised “Last Updated” date.</p>
      <p>Where required by applicable law, we will provide additional notice of material changes.</p>
    </>,
  },
  {
    id: "grievance-officer",
    title: "Grievance Officer",
    content: <>
      <p>For privacy-related concerns, requests or grievances, you may contact:</p>
      <PrivacyContactDetails grievance />
    </>,
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: <>
      <p>For questions regarding this Privacy Policy or our handling of personal information:</p>
      <PrivacyContactDetails />
    </>,
  },
];

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      description={description}
      effectiveDate="19 September 2026"
      lastUpdated="19 September 2026"
      dateTime="2026-09-19"
      sections={sections}
    >
      <p>This Privacy Policy explains how SCRIBBL3D, operating under the brand name SCRIBBL3D (“SCRIBBL3D”, “we”, “us”, or “our”), collects, uses, stores and protects personal information when you use <a href="https://www.scribbl3d.com/">www.scribbl3d.com</a> (“Website”) or interact with our Products and Services.</p>
      <p>By using the Website or providing your information to us, you acknowledge that you have read and understood this Privacy Policy.</p>
    </PolicyLayout>
  );
}
