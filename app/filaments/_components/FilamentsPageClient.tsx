"use client";

import Loader from "@/components/Loader";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import Hero from "../components/hero";
import Nav from "../components/prodcatnavbar";

export default function FilamentsPageClient() {
    // This will scan Hero and Nav for all <img> tags automatically
    const isLoading = useAutoImageLoader();

    return (
        <main className="w-full">
            {/* 1. Show the loader overlay while images are fetching */}
            {isLoading && <Loader />}

            {/* 2. Control visibility of the page content */}
            <div
                className="pt-[80px]"
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.8s ease-in-out",
                    visibility: isLoading ? "hidden" : "visible",
                }}
            >
                <div className="w-full">
                    <Hero />
                    <Nav />
                </div>
            </div>
        </main>
    );
}
