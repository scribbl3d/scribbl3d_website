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
import AnnouncementBanner from "./landingpage/AnnouncementBanner";

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
                    <AnnouncementBanner />
                    <Navbar />
                    <div style={{ paddingTop: "var(--announcement-height, 0px)" }}>{children}</div>
                    <Footer />
                    <Toaster />
                    <Analytics />
                </CheckoutProvider>
            </CartProvider>
        </SessionProvider>
    );
}
