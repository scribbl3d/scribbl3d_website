import {
    Droplets,
    Layers,
    PackageCheck,
    Printer,
    ShieldCheck,
    Workflow,
} from "lucide-react";

export const ECOSYSTEM_CARDS = [
    {
        title: "Industrial 3D Printers",
        tag: "Equipment",
        desc: "High-performance FDM, SLA, and SLS machines from globally trusted brands — built for precision, speed, and reliability.",
        icon: <Printer />,
    },
    {
        title: "Premium Resins",
        tag: "Consumables",
        desc: "Engineered UV resins for dental, jewelry, and engineering applications — delivering exceptional detail and surface finish.",
        icon: <Droplets />,
    },
    {
        title: "High-Grade Filaments",
        tag: "Consumables",
        desc: "Advanced materials including Carbon Fiber, Nylon, and ESD-safe filaments — designed for strong, functional parts.",
        icon: <Layers />,
    },
    {
        title: "Pre-built Products",
        tag: "Ready-to-Use",
        desc: "Fully assembled and tested 3D printed products — ready for immediate deployment and real-world use.",
        icon: <PackageCheck />,
    },
    {
        title: "Additive Services",
        tag: "Support",
        desc: "On-demand manufacturing, rapid prototyping, and expert design support — from concept to production.",
        icon: <Workflow />,
    },
    {
        title: "Maintenance & Parts",
        tag: "Lifecycle",
        desc: "Genuine spare parts and PAN-India technical support — ensuring maximum uptime and long-term performance.",
        icon: <ShieldCheck />,
    },
];
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
        title: "Precision First",
        desc: "In 3D printing, accuracy isn’t optional. We ensure every printer, material, and output meets strict industrial standards — delivering consistent, high-quality results.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
            </svg>
        ),
    },
    {
        title: "Reliability",
        desc: "Production depends on uptime. With strong after-sales support and readily available parts, we keep your operations running without interruption.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
        ),
    },
    {
        title: "Innovation",
        desc: "We continuously bring in advanced technologies and materials — enabling faster, stronger, and more efficient manufacturing.",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"></path>
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
            </svg>
        ),
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
