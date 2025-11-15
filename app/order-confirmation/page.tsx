import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
        <p className="mb-6">
          Thank you for your purchase. Your order has been successfully
          processed.
        </p>
        <Link href="/">
          <Button className="w-full">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
