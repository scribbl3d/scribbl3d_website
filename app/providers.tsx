"use client";

import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/providers/CartProvider";
import { CheckoutProvider } from "@/providers/CheckoutProvider";
import { Analytics } from "@vercel/analytics/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

export function Providers({
    children,
    session,
}: {
    children: React.ReactNode;
    session: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            <CartProvider>
                <CheckoutProvider>
                    <Navbar />
                    {children}
                    <Footer />
                    <Toaster />
                    <Analytics />
                </CheckoutProvider>
            </CartProvider>
        </SessionProvider>
    );
}
