import { NextFont } from "next/dist/compiled/@next/font";

declare module "next/font/google" {
  export function Big_Shoulders_Display(options: {
    subsets: string[];
    variable: string;
    weight: string[];
  }): NextFont;

  export function Manrope(options: {
    subsets: string[];
    variable: string;
    weight: string[];
  }): NextFont;

  export function M_PLUS_1(options: {
    subsets: string[];
    variable: string;
    weight: string[];
  }): NextFont;

  export function Lato(options: {
    subsets: string[];
    variable: string;
    weight: string[];
  }): NextFont;
}

declare module "next/font/local" {
  export default function localFont(options: {
    src: string;
    variable: string;
    weight: string;
  }): NextFont;
}
