"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentFailure() {
    const router = useRouter();
    const searchParams = useSearchParams()!;
    const txnId = searchParams?.get("txnId") || "N/A";
    // const error = searchParams?.get("error") || null;

    useEffect(() => {
        const txnId = searchParams.get("txnId");

        if (!txnId) {
            router.replace("/");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <XCircle className="h-16 w-16 text-red-500" />
                    </div>
                    <CardTitle className="text-center text-2xl">
                        Payment Failed
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center">
                        We are sorry, but your payment could not be processed.
                    </p>
                    {txnId && (
                        <p className="text-center text-sm text-gray-500">
                            Transaction ID: {txnId}
                        </p>
                    )}
                    <div className="flex justify-center space-x-4">
                        <Button onClick={() => router.push("/cart")}>
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                        >
                            Return to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
