"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ABSCategory from "./abs-category";
import PLAPlusCategory from "./pla-plus-category";
import PETGCategory from "./petg-category";
import TPUCategory from "./tpu-category";
import NylonCategory from "./nylon-category";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const sections = ["PLA+", "ABS", "PETG", "TPU", "Nylon"];

export default function FilamentsPage() {
  const [activeSection, setActiveSection] = useState("PLA+");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({ field: "name", order: "asc" });
  const [manualOverride, setManualOverride] = useState(false);

  React.useEffect(() => {
    if (!manualOverride) {
      const handleScroll = () => {
        let found = false;
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            // If the top of the section is at or above the navbar (80px offset for sticky header)
            if (rect.top <= 81) {
              setActiveSection(section);
              found = true;
            }
          }
        }
        // If scrolled above all sections, highlight the first
        if (!found) setActiveSection(sections[0]);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [manualOverride]);

  // Release manual override after scroll animation
  React.useEffect(() => {
    if (manualOverride) {
      const timeout = setTimeout(() => setManualOverride(false), 1000); // 600ms for smooth scroll
      return () => clearTimeout(timeout);
    }
  }, [manualOverride]);

  const handleClick = (section: string) => {
    setActiveSection(section);
    setManualOverride(true);
    const element = document.getElementById(section);
    if (element) {
      const yOffset = -80; // Adjusted for mobile header height
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <nav
        className="sticky top-[75px] bg-[#1a1a1a] text-white z-10"
        style={{ position: "sticky", top: "75px" }}
      >
        {/* Mobile Navigation */}
        <div className="flex items-center justify-between p-4 sm:hidden">
          {/* Removed search button for mobile */}
          <div className="flex-1 px-4 overflow-auto">
            <div className="flex gap-4 justify-center">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => handleClick(section)}
                  className={cn(
                    "whitespace-nowrap text-xl font-medium",
                    activeSection === section
                      ? "text-white"
                      : "text-white/30 hover:text-white/50"
                  )}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-full">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-[#1a1a1a] text-white"
            >
              <SheetHeader>
                <SheetTitle className="text-white">Sort & Filter</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Sort By
                  </label>
                  <Select
                    value={
                      sortBy.field === "price"
                        ? sortBy.order === "asc"
                          ? "price_low_high"
                          : "price_high_low"
                        : sortBy.field === "discount"
                          ? sortBy.order === "asc"
                            ? "discount_min_max"
                            : "discount_max_min"
                          : "name"
                    }
                    onValueChange={(value) => {
                      if (value === "price_low_high") {
                        setSortBy({ field: "price", order: "asc" });
                      } else if (value === "price_high_low") {
                        setSortBy({ field: "price", order: "desc" });
                      } else if (value === "discount_min_max") {
                        setSortBy({ field: "discount", order: "asc" });
                      } else if (value === "discount_max_min") {
                        setSortBy({ field: "discount", order: "desc" });
                      } else {
                        setSortBy({ field: "name", order: "asc" });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-white/10 text-white border-none focus:ring-1 focus:ring-white/30 transition-all duration-200">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#232323] text-white border-none transition-all duration-200">
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price_low_high">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price_high_low">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="discount_max_min">
                        Discount: Max to Min
                      </SelectItem>
                      <SelectItem value="discount_min_max">
                        Discount: Min to Max
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Categories
                  </label>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section}
                        onClick={() => handleClick(section)}
                        className={cn(
                          "w-full p-2 text-left rounded transition-colors",
                          activeSection === section
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        )}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Removed search overlay for mobile */}

        {/* Desktop Navigation */}
        <div className="hidden sm:grid grid-cols-[300px_1fr_300px] items-center h-[71px] px-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search filaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/50"
            />
          </div>
          <div className="flex justify-center gap-8">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleClick(section)}
                className={cn(
                  "text-3xl font-medium transition-colors",
                  activeSection === section
                    ? "text-white"
                    : "text-white/30 hover:text-white/50"
                )}
              >
                {section}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Select
              value={
                sortBy.field === "price"
                  ? sortBy.order === "asc"
                    ? "price_low_high"
                    : "price_high_low"
                  : sortBy.field === "discount"
                    ? sortBy.order === "asc"
                      ? "discount_min_max"
                      : "discount_max_min"
                    : "name"
              }
              onValueChange={(value) => {
                if (value === "price_low_high") {
                  setSortBy({ field: "price", order: "asc" });
                } else if (value === "price_high_low") {
                  setSortBy({ field: "price", order: "desc" });
                } else if (value === "discount_min_max") {
                  setSortBy({ field: "discount", order: "asc" });
                } else if (value === "discount_max_min") {
                  setSortBy({ field: "discount", order: "desc" });
                } else {
                  setSortBy({ field: "name", order: "asc" });
                }
              }}
            >
              <SelectTrigger className="bg-white/10 text-white border-none focus:ring-1 focus:ring-white/30 transition-all duration-200">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#232323] text-white border-none transition-all duration-200">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price_low_high">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price_high_low">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="discount_max_min">
                  Discount: Max to Min
                </SelectItem>
                <SelectItem value="discount_min_max">
                  Discount: Min to Max
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <PLAPlusCategory searchTerm={searchTerm} sortBy={sortBy} />
        <ABSCategory searchTerm={searchTerm} sortBy={sortBy} />
        <PETGCategory searchTerm={searchTerm} sortBy={sortBy} />
        <TPUCategory searchTerm={searchTerm} sortBy={sortBy} />
        <NylonCategory searchTerm={searchTerm} sortBy={sortBy} />
      </div>
    </div>
  );
}
