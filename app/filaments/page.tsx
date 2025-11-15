"use client";

import Hero from "./components/hero";
import Nav from "./components/prodcatnavbar";

export default function PersonalisePage() {
  return (
    <div className="pt-[80px]">
      <div className="w-full">
        <Hero />
        <Nav />
      </div>
    </div>
  );
}
