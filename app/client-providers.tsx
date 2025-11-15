"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/providers/CartProvider";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Session } from "next-auth";

export default function ClientProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <Navbar />
        {children}
        <Footer />
      </CartProvider>
    </SessionProvider>
  );
}
