import PolicyLayout from "@/components/PolicyLayout";

export default function ReturnAndShippingPolicy() {
  return (
    <PolicyLayout
      title="Return and Shipping Policy"
      lastUpdated="January 9, 2025"
    >
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Return Policy</h2>
        <p>
          We offer refund / exchange within first 10 days from the date of your
          purchase. If 10 days have passed since your purchase, you will not be
          offered a return, exchange or refund of any kind. To become eligible
          for a return or an exchange:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            The purchased item should be unused and in the same condition as you
            received it
          </li>
          <li>The item must have original packaging</li>
          <li>
            If the item that you purchased on a sale, then the item may not be
            eligible for a return / exchange
          </li>
        </ul>
        <p>
          Further, only such items are replaced by us (based on an exchange
          request), if such items are found defective or damaged.
        </p>
        <p>
          You agree that there may be a certain category of products / items
          that are exempted from returns or refunds. Such categories of the
          products would be identified to you at the item of purchase. For
          exchange / return accepted request(s) (as applicable), once your
          returned product / item is received and inspected by us, we will send
          you an email to notify you about receipt of the returned / exchanged
          product. Further. If the same has been approved after the quality
          check at our end, your request (i.e. return / exchange) will be
          processed in accordance with our policies.
        </p>

        <h2 className="text-2xl font-semibold mt-8">Shipping Policy</h2>
        <p>
          The orders for the user are shipped through registered domestic
          courier companies and/or speed post only. Orders are delivered within
          5 days from the date of the order and/or payment or as per the
          delivery date agreed at the time of order confirmation and delivering
          of the shipment, subject to courier company / post office norms.
          Platform Owner shall not be liable for any delay in delivery by the
          courier company / postal authority.
        </p>
        <p>
          Delivery of all orders will be made to the address provided by the
          buyer at the time of purchase. Delivery of our services will be
          confirmed on your email ID as specified at the time of registration.
          If there are any shipping cost(s) levied by the seller or the Platform
          Owner (as the case be), the same is not refundable.
        </p>
      </section>
    </PolicyLayout>
  );
}
