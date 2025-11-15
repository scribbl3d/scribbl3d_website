import type { Metadata } from "next";
import localFont from "next/font/local";
import type { NextFontWithVariable } from "next/dist/compiled/@next/font";
import {
  Big_Shoulders_Display,
  Manrope,
  M_PLUS_1,
  Lato,
  Aboreto,
} from "next/font/google";
import { gilroy } from "./fonts";
import "./globals.css";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";

import { Providers } from "./providers";
import type React from "react"; // Import React

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
}) as NextFontWithVariable;

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
}) as NextFontWithVariable;

const bigShouldersDisplay = Big_Shoulders_Display({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
}) as NextFontWithVariable;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
}) as NextFontWithVariable;

const mplus1 = M_PLUS_1({
  subsets: ["latin"],
  variable: "--font-mplus1",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
}) as NextFontWithVariable;

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["100", "300", "400", "700", "900"],
}) as NextFontWithVariable;

const aboreto = Aboreto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-aboreto",
}) as NextFontWithVariable;

export const metadata: Metadata = {
  title: "SCRIBBL3D",
  description: "Your 3D printing solution",
};

async function getSession() {
  const session: Session | null = await getServerSession(authOptions);
  return session;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="en">
      <body
        className={`bg-background text-foreground ${geistSans.variable} ${geistMono.variable} ${gilroy.variable} ${bigShouldersDisplay.variable} ${manrope.variable} ${mplus1.variable} ${lato.variable} ${aboreto.variable} antialiased`}
      >
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
