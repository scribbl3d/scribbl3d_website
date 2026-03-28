export const BRAND = {
    blue: "#2563EB",
    blueLight: "#3B82F6",
    dark: "#0F172A",
    darkCard: "#1E293B",
    darkBorder: "#334155",
    muted: "#94A3B8",
    light: "#F8FAFC",
    white: "#FFFFFF",
};

export const STATS = [
    {
        icon: (
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
        ),
        value: 500,
        suffix: "+",
        label: "Printers Installed",
    },
    {
        icon: (
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        value: 12,
        suffix: "+",
        label: "Years Experience",
    },
    {
        icon: (
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
            </svg>
        ),
        value: 150,
        suffix: "+",
        label: "Cities Served",
    },
    {
        icon: (
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        value: 99,
        suffix: "%",
        label: "Client Satisfaction",
    },
];

export const INDUSTRIES = [
    {
        name: "MedTech Labs",
        sub: "Healthcare Innovation",
        image: "/about/lab.jpg",
    },
    {
        name: "Global Manufacturing",
        sub: "Industrial Manufacturing",
        image: "/about/manufacturing.jpg",
    },
    {
        name: "Innovation Research Lab",
        sub: "R&D Innovation",
        image: "/about/research.jpg",
    },
    {
        name: "Automotive Design Studio",
        sub: "Automotive Engineering",
        image: "/about/studio.jpg",
    },
    {
        name: "Enterprise Solutions",
        sub: "Corporate Solutions",
        image: "/about/enterprise.jpg",
    },
    {
        name: "Modern Workspace",
        sub: "Product Development",
        image: "/about/work.jpg",
    },
];

export const VALUES = [
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.33"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
        ),
        title: "Precision First",
        desc: "In industrial 3D printing, microns matter. We ensure every printer and resin meets rigorous industrial standards.",
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.33"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Reliability",
        desc: "Our B2B partners depend on uptime. We provide the support and spare parts ecosystem to keep production running.",
    },
    {
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.33"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
        ),
        title: "Innovation",
        desc: "We constantly update our catalog with next-gen materials and technologies like SLS and high-speed FDM.",
    },
];

export const MARKETPLACES = [
    {
        name: "Amazon",
        sub: "Global Fulfillment",
        logo: "amazon",
        bg: "#FF9900",
    },
    {
        name: "Flipkart",
        sub: "Pan-India Reach",
        logo: "flipkart",
        bg: "#2874F0",
    },
    {
        name: "IndiaMart",
        sub: "B2B Wholesale",
        logo: "indiamart",
        bg: "#C0392B",
    },
    { name: "Etsy", sub: "Artisan Designs", logo: "etsy", bg: "#F56400" },
];
export const ECOSYSTEM_CARDS = [
    {
        tag: "Equipment",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
        ),
        title: "Industrial 3D Printers",
        desc: "A curated selection of high-speed FDM, SLA, and SLS machines from world-leading brands.",
    },
    {
        tag: "Consumables",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
            </svg>
        ),
        title: "Premium Resins",
        desc: "Specialized UV resins for dental, jewelry, and engineering applications with 8K precision.",
    },
    {
        tag: "Consumables",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        title: "High-Grade Filaments",
        desc: "Industrial filaments including Carbon Fiber, Nylon, and ESD-safe materials for functional parts.",
    },
    {
        tag: "Ready-to-Use",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        ),
        title: "Pre-built Products",
        desc: "Fully assembled, tested, and optimized 3D printed products ready for immediate deployment.",
    },
    {
        tag: "Support",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: "Additive Services",
        desc: "On-demand manufacturing, rapid prototyping, and industrial design consultation services.",
    },
    {
        tag: "Lifecycle",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Maintenance & Parts",
        desc: "Official spare parts and PAN-India technical support to ensure zero downtime for your operations.",
    },
];
