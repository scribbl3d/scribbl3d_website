import PolicyLayout from "@/components/PolicyLayout";

export default function RefundPolicy() {
  return (
    <PolicyLayout
      title="Refund and Cancellation Policy"
      lastUpdated="January 9, 2025"
    >
      <p className="mb-6">
        This refund and cancellation policy outlines how you can cancel or seek
        a refund for a product / service that you have purchased through the
        Platform. Under this policy:
      </p>
      <ol className="list-decimal space-y-6 pl-6">
        <li>
          <p>
            Cancellations will only be considered if the request is made within
            2 days of placing the order. However, cancellation requests may not
            be entertained if the orders have been communicated to such sellers
            / merchant(s) listed on the Platform and they have initiated the
            process of shipping them, or the product is out for delivery. In
            such an event, you may choose to reject the product at the doorstep.
          </p>
        </li>
        <li>
          <p>
            In case of receipt of damaged or defective items, please report to
            our customer service team. The request would be entertained once the
            seller/ merchant listed on the Platform, has checked and determined
            the same at its own end. This should be reported within 5 days of
            receipt of products. In case you feel that the product received is
            not as shown on the site or as per your expectations, you must bring
            it to the notice of our customer service within 2 days of receiving
            the product. The customer service team after looking into your
            complaint will take an appropriate decision.
          </p>
        </li>
        <li>
          <p>
            In case of complaints regarding the products that come with a
            warranty from the manufacturers, please refer the issue to them.
          </p>
        </li>
        <li>
          <p>
            In case of any refunds approved by SCRIBBL3D, it will take 5-7
            business days for the refund to be credited to the original payment
            method to you.
          </p>
        </li>
        <li>
          <p>
            In the case of any cancellations requests, if the product has
            already been shipped, then the shipping charges may not be refunded.
          </p>
        </li>
      </ol>
    </PolicyLayout>
  );
}
