"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
}

interface NavbarClientProps {
  navItems: NavItem[];
}

export function NavbarClient({ navItems }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 active:scale-95 transition-all"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6 text-white" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed inset-x-0 top-[80px] -mt-[1px] min-h-[calc(100vh-80px)] bg-gradient-to-r from-black to-[#3D5EFF] z-50 animate-in slide-in-from-right"
        >
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative block px-4 py-3 text-[18px] rounded-lg transition-colors duration-200 font-manrope active:scale-95 ${
                  pathname === item.href
                    ? "text-[#E0D7A8] font-800"
                    : "text-white"
                } hover:bg-white/10`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#E0D7A8] rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
