"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/providers/CartProvider";
import { CheckoutProvider } from "@/providers/CheckoutProvider";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Session } from "next-auth";
import React from "react"; // Added import for React

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
