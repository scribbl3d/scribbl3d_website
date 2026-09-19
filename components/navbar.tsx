"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExpandableSearch } from "./expandable-search";
import { NavbarClient } from "./navbar-client";

const navItems = [
    { name: "Personalise", href: "/personalise" },
    { name: "Products", href: "/prebuilt-products" },
    { name: "Filaments", href: "/filament" },
    { name: "Printers", href: "/printers" },
    { name: "Resins", href: "/resins" },
    { name: "Services", href: "/services" },
    { name: "Blogs", href: "/blog" },
];

const SEARCH_ANIM_MS = 250; // matches CSS animation duration

export default function Navbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchNavigating, setIsSearchNavigating] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isSearchClosing, setIsSearchClosing] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { cart } = useCart();
    const profileRef = useRef<HTMLDivElement>(null);

    const closeSearch = useCallback(() => {
        if (!isSearchExpanded || isSearchClosing) return;
        setIsSearchClosing(true);
        setTimeout(() => {
            setIsSearchExpanded(false);
            setIsSearchClosing(false);
        }, SEARCH_ANIM_MS);
    }, [isSearchExpanded, isSearchClosing]);

    useEffect(() => {
        // Reset loading states when pathname changes
        setIsLoading(false);
        setIsSearchNavigating(false);
        // Close search on navigation (instant, no animation needed)
        setIsSearchExpanded(false);
        setIsSearchClosing(false);
    }, [pathname]);

    const handleNavigation = (href: string) => {
        if (!session && href.includes("/profile")) {
            router.push("/login");
            return;
        }
        setIsLoading(true);
        router.push(href);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to view your wishlist.",
                variant: "destructive",
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => signIn()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Log in
                    </Button>
                ),
            });
            return;
        }
        setIsLoading(true);
        router.push("/profile?tab=wishlist");
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        // Clear any client-side cached data
        if (typeof window !== 'undefined') {
            // Force a hard refresh to clear cached pages
            window.location.href = "/login";
        } else {
            router.push("/login");
        }
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
        <>
        <nav style={{ top: "var(--announcement-height, 0px)" }} className="fixed top-0 left-0 right-0 z-50 w-full h-[80px] bg-gradient-to-r from-black to-[#3D5EFF]">
            <div className="w-full h-full px-2 sm:px-3 lg:px-4">
                <div className="max-w-screen mx-auto flex items-center justify-between h-full">
                    {/* Logo */}
                    <div className="flex-shrink-0 w-[170px] sm:w-[170px]">
                        <Link
                            href="/"
                            className="flex items-center"
                            onClick={() => setIsLoading(true)}
                        >
                            <Image
                                src="/logo.webp"
                                alt="scribb13d Logo"
                                width={170}
                                height={85}
                                className="w-auto h-[125px] sm:h-[145px]"
                                priority
                                unoptimized={true}
                            />
                        </Link>
                    </div>

                    {/* Center area: Search bar (expanded) OR Nav items */}
                    {isSearchExpanded ? (
                        <div
                            className={`flex-1 mx-3 lg:mx-6 max-w-2xl ${
                                isSearchClosing
                                    ? "animate-[searchCollapse_0.25s_ease-in_forwards]"
                                    : "animate-[searchExpand_0.3s_ease-out_forwards]"
                            }`}
                        >
                            <ExpandableSearch
                                onClose={closeSearch}
                                isClosing={isSearchClosing}
                                onNavigate={(href) => {
                                    setIsSearchNavigating(true);
                                    setIsSearchExpanded(false);
                                    setIsSearchClosing(false);
                                    router.push(href);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center justify-center flex-1 animate-[navFadeIn_0.3s_ease-out]">
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
                    )}

                    {/* Right side icons and mobile menu */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {/* Search icon (desktop only, when search is collapsed) */}
                        {!isSearchExpanded && (
                            <button
                                onClick={() => setIsSearchExpanded(true)}
                                className="hidden lg:flex items-center justify-center h-10 w-10 hover:bg-white/10 rounded-full active:scale-95 transition-all"
                                aria-label="Open search"
                            >
                                <Search className="h-5 w-5 text-white" />
                            </button>
                        )}
                        {/* Cart icon (desktop only - mobile has it in drawer) */}
                        <button
                            onClick={() => handleNavigation("/cart")}
                            className="hidden lg:flex relative items-center justify-center h-10 w-10 hover:bg-white/10 rounded-full active:scale-95 transition-all"
                        >
                            <ShoppingCart
                                className="h-6 w-6 text-white"
                                aria-label="Shopping Cart"
                            />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    {cart.reduce(
                                        (total, item) => total + item.quantity,
                                        0,
                                    )}
                                </span>
                            )}
                        </button>
                        {/* Wishlist icon: only show on lg and up */}
                        <button
                            onClick={handleWishlistClick}
                            className="hidden lg:flex items-center justify-center h-10 w-10 hover:bg-white/10 rounded-full active:scale-95 transition-all"
                            aria-label="Wishlist"
                        >
                            <Heart className="h-6 w-6 text-white" />
                        </button>
                        {/* Profile dropdown (desktop only) */}
                        <div className="relative hidden lg:block" ref={profileRef}>
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
                        {/* Mobile: Hamburger menu (includes search icon) */}
                        <div className="flex lg:hidden items-center space-x-1">
                            <NavbarClient
                                navItems={navItems}
                                onSearchNavigate={(href) => {
                                    setIsSearchNavigating(true);
                                    router.push(href);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Loading indicators for regular nav links */}
            {isLoading && (
                <>
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 overflow-hidden">
                        <div className="h-full w-1/2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-[loading_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-[custom-spin_0.8s_linear_infinite]" />
                    </div>
                </>
            )}
            {/* Loading bar for search navigation */}
            {isSearchNavigating && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 overflow-hidden">
                    <div className="h-full w-1/2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-[loading_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
                </div>
            )}
        </nav>
        {/* Full-page loading overlay (search navigation only) */}
        {isSearchNavigating && (
            <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex items-center justify-center pt-[var(--site-header-height)] animate-[fadeIn_0.15s_ease-out]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#2563EB] rounded-full animate-[custom-spin_0.8s_linear_infinite]" />
                    <p className="text-sm font-medium text-gray-500">Loading...</p>
                </div>
            </div>
        )}
        </>
    );
}
