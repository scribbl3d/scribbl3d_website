import {
  Big_Shoulders_Display,
  Manrope,
  M_PLUS_1,
  Lato,
  Aboreto,
} from "next/font/google";
import localFont from "next/font/local";

export const aboreto = Aboreto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-aboreto",
});

export const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const gilroy = localFont({
  src: "./fonts/Gilroy-Medium.woff",
  variable: "--font-gilroy",
  display: "swap",
});

export const gilroy2 = localFont({
  src: [
    {
      path: "./fonts/gilroy-medium.ttf", // Note: Using relative path from this file
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

export const bigShouldersDisplay = Big_Shoulders_Display({
  subsets: ["latin"],
  variable: "--font-big-shoulders",
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const mplus1 = M_PLUS_1({
  subsets: ["latin"],
  variable: "--font-mplus1",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["100", "300", "400", "700", "900"],
});
