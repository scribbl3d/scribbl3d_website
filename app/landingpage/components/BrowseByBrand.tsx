"use client";

import Link from "next/link";

const BRANDS = [
    {
        name: "Anycubic",
        slug: "Anycubic",
        logo: "/landing/brands/anycubic.png",
    },
    {
        name: "Bambu Lab",
        slug: "Bambu Lab",
        logo: "/landing/brands/bambuLab.png",
    },
    {
        name: "Creality",
        slug: "Creality",
        logo: "/landing/brands/creality.png",
    },
    { name: "Elegoo", slug: "Elegoo", logo: "/landing/brands/egelo.png" },
    { name: "Phrozen", slug: "Phrozen", logo: "/landing/brands/phrozen.png" },
    { name: "Jamghe", slug: "jamghe", logo: "/landing/brands/jamghe.png" },
];

function BrandLogo({
    brand,
    mobile,
}: {
    brand: (typeof BRANDS)[0];
    mobile?: boolean;
}) {
    return (
        <Link
            href={`/printers?brand=${encodeURIComponent(brand.slug)}`}
            className="group flex-shrink-0 px-4 sm:px-5"
            title={brand.name}
        >
            <img
                src={brand.logo}
                alt={brand.name}
                className={
                    mobile
                        ? "h-16 w-auto object-contain"
                        : "h-[120px] xl:h-[150px] w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                }
            />
        </Link>
    );
}

export default function BrowseByBrand() {
    return (
        <section className="w-full bg-white border-y border-gray-100 py-5 sm:py-8 lg:py-10 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
                <p className="text-[10px] sm:text-sm lg:text-lg font-semibold tracking-[0.4em] sm:tracking-[0.5em] text-[#4f46e5] mb-1 sm:mb-2 uppercase text-center">
                    Browse by Brand
                </p>
            </div>

            {/* Desktop — static row */}
            <div className="hidden lg:flex items-center justify-between max-w-[1400px] mx-auto px-16">
                {BRANDS.map((brand) => (
                    <BrandLogo key={brand.slug} brand={brand} />
                ))}
            </div>

            {/* Mobile/Tablet — continuous marquee */}
            <div className="lg:hidden mt-2">
                <div className="flex w-max animate-brand-marquee">
                    {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
                        <BrandLogo
                            key={`${brand.slug}-${i}`}
                            brand={brand}
                            mobile
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
