"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  //   Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams()!;

  useEffect(() => {
    const txnId = searchParams.get("txnId");
    const amount = searchParams.get("amount");

    if (!txnId || !amount) {
      console.error("Missing txnId or amount in success page");
      router.replace("/");
    }
  }, [router, searchParams]);

  const txnId = searchParams?.get("txnId") || "N/A";
  const amount = searchParams?.get("amount") || "0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">
            Your payment of {formatPrice(Number(amount))} has been successfully
            processed.
          </p>
          <p className="text-center text-sm text-gray-500">
            Transaction ID: {txnId}
          </p>
          <div className="flex justify-center">
            {/* <Button onClick={() => router.push("/")}>Return to Home</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
