"use client";

import { useCart } from "@/providers/CartProvider";
import { ShoppingCart, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ExpandableSearch } from "./expandable-search";

const navItems = [
    { name: "Personalise", href: "/personalise" },
    { name: "Filaments", href: "/filaments" },
    { name: "Printers", href: "/printers" },
    { name: "Services", href: "/services" },
    { name: "Blogs", href: "/blog" },
];

export default function Navbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { cart } = useCart();
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Reset loading state when pathname changes
        setIsLoading(false);
    }, [pathname]);

    const handleNavigation = (href: string) => {
        if (!session && href.includes("/profile")) {
            router.push("/login");
            return;
        }
        setIsLoading(true);
        router.push(href);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full h-[80px] bg-gradient-to-r from-black to-[#3D5EFF]">
            <div className="w-full h-full px-2 sm:px-3 lg:px-4">
                <div className="max-w-screen mx-auto relative flex items-center justify-between h-full">
                    {/* Logo */}
                    <div className="flex-shrink-0 w-[170px] sm:w-[170px]">
                        <Link
                            href="/"
                            className="flex items-center"
                            onClick={() => setIsLoading(true)}
                        >
                            <Image
                                src="/logo.png"
                                alt="scribb13d Logo"
                                width={170}
                                height={85}
                                className="w-auto h-[125px] sm:h-[145px]"
                                priority
                                unoptimized={true} // Key prop
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item.href)}
                                className={`relative rounded-md px-4 py-2 text-[18px] font-medium transition-colors duration-200 font-manrope hover:text-[#E0D7A8] active:scale-95 ${
                                    pathname === item.href
                                        ? "text-[#E0D7A8] font-bold"
                                        : "text-white"
                                }`}
                            >
                                {item.name}
                                {pathname === item.href && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#E0D7A8] rounded-full mt-1" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right side icons and mobile menu */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center h-10">
                            <ExpandableSearch />
                        </div>
                        <button
                            onClick={() => handleNavigation("/cart")}
                            className="relative flex items-center justify-center h-10 w-10 hover:bg-white/10 rounded-full active:scale-95 transition-all"
                        >
                            <ShoppingCart
                                className="h-6 w-6 text-white"
                                aria-label="Shopping Cart"
                            />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    {cart.reduce(
                                        (total, item) => total + item.quantity,
                                        0
                                    )}
                                </span>
                            )}
                        </button>

                        <div className="relative" ref={profileRef}>
                            <button
                                className="flex items-center justify-center h-10 w-10 hover:bg-white/10 rounded-full active:scale-95 transition-all"
                                aria-label="Profile menu"
                                onMouseEnter={() => setIsProfileOpen(true)}
                            >
                                <User className="h-6 w-6 text-white" />
                            </button>

                            {isProfileOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
                                    onMouseLeave={() => setIsProfileOpen(false)}
                                >
                                    {session ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                                            >
                                                <User className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                                            >
                                                <User className="h-4 w-4" />
                                                Log In
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                                            >
                                                <User className="h-4 w-4" />
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Enhanced loading indicators */}
            {isLoading && (
                <>
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 overflow-hidden">
                        <div className="h-full w-1/2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-[loading_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite" />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-[custom-spin_0.8s_linear_infinite]" />
                    </div>
                </>
            )}
        </nav>
    );
}
