// scripts/seedPrintersDetailed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const detailedPrintersData = [
    {
        name: "Scrible3D Pro FDM 400",
        slug: "scrible3d-pro-fdm-400",
        brand: "Scrible3D",
        price: 275000,
        originalPrice: 350000,
        discount: 17,
        technology: "FDM/FFF",
        experience: "Intermediate",

        volumeLength: 400,
        volumeWidth: 400,
        volumeHeight: 500,
        volumeMax: 500,

        description:
            "High-speed FDM printer for rapid prototyping and small-scale production using engineering-grade thermoplastics.",
        shortDescription: "Professional FDM printer with large build volume",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/fdm-400-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/fdm-400-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/fdm-400-3.jpg",
                altText: "Top view",
                sortOrder: 2,
                isMain: false,
            },
            {
                url: "/images/printers/fdm-400-4.jpg",
                altText: "Interior chamber",
                sortOrder: 3,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },
            { key: "material", value: "ABS" },
            { key: "material", value: "TPU" },
            { key: "material", value: "Nylon" },

            { key: "application", value: "Prototyping" },
            { key: "application", value: "Functional Parts" },
            { key: "application", value: "Small Batch Manufacturing" },

            { key: "connectivity", value: "Wi-Fi" },
            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Heated & Enclosed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "400 × 400 × 500 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Heated Glass Bed (up to 100°C)",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Fully Enclosed with Active Heating",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Automatic Bed Leveling (16-point mesh)",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Direct Drive Dual Extruder",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm (0.2 / 0.6 / 0.8 mm optional)",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.05 – 0.30 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 600 mm/s",
                sortOrder: 5,
            },
            {
                category: "Print Specifications",
                label: "Acceleration",
                value: "20,000 mm/s²",
                sortOrder: 6,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG, ABS, ASA, TPU, Nylon, PC",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 300°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 100°C",
                sortOrder: 3,
            },
            {
                category: "Material Compatibility",
                label: "Chamber Temperature",
                value: "Up to 60°C",
                sortOrder: 4,
            },
            {
                category: "Material Compatibility",
                label: "Filament Diameter",
                value: "1.75 mm",
                sortOrder: 5,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Wi-Fi, Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "File Transfer",
                value: "Cloud Upload, LAN, USB Drive",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ, 3MF, STEP",
                sortOrder: 3,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "ScribleSlicer, Cura, PrusaSlicer",
                sortOrder: 4,
            },
            {
                category: "Connectivity & Software",
                label: "Remote Monitoring",
                value: "Built-in HD Camera with Live Streaming",
                sortOrder: 5,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "480 × 450 × 520 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "18 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220V AC, 50/60Hz, 350W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 50 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "5-inch Color Touchscreen",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Dual extruder system for multi-material and soluble support printing",
                sortOrder: 1,
            },
            {
                title: "Active heated chamber for consistent engineering material performance",
                sortOrder: 2,
            },
            {
                title: "AI-assisted failure detection using onboard camera",
                sortOrder: 3,
            },
            {
                title: "Automatic power-loss recovery with print resume",
                sortOrder: 4,
            },
            {
                title: "Integrated HEPA and carbon air filtration",
                sortOrder: 5,
            },
            {
                title: "High-speed motion system with vibration compensation",
                sortOrder: 6,
            },
            {
                title: "Filament runout detection with auto-pause",
                sortOrder: 7,
            },
            {
                title: "Modular hotend for easy maintenance and upgrades",
                sortOrder: 8,
            },
        ],

        applications: [
            { name: "Rapid Prototyping", sortOrder: 1 },
            { name: "Functional Parts", sortOrder: 2 },
            { name: "Engineering Validation", sortOrder: 3 },
            { name: "Education", sortOrder: 4 },
            { name: "Small Batch Manufacturing", sortOrder: 5 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Complete technical specifications and features",
                downloadUrl:
                    "https://docs.scrible3d.com/pro-fdm-400-datasheet.pdf",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup, calibration, and operation guide",
                downloadUrl:
                    "https://docs.scrible3d.com/pro-fdm-400-user-manual.pdf",
                sortOrder: 2,
            },
            {
                title: "Quick Start Guide",
                description: "Get printing in under 30 minutes",
                downloadUrl:
                    "https://docs.scrible3d.com/pro-fdm-400-quickstart.pdf",
                sortOrder: 3,
            },
        ],
    },
    {
        name: "Scrible3D Start FDM 220",
        slug: "scrible3d-start-fdm-220",
        brand: "Scrible3D",
        price: 42000,
        originalPrice: 52000,
        discount: 19,
        technology: "FDM/FFF",
        experience: "Beginner",

        volumeLength: 220,
        volumeWidth: 220,
        volumeHeight: 250,
        volumeMax: 250,

        description:
            "Entry-level desktop FDM printer designed for beginners, students, and first-time users.",
        shortDescription: "Beginner-friendly desktop FDM printer",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/start-220-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/start-220-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/start-220-3.jpg",
                altText: "Top view",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },

            { key: "application", value: "Learning" },
            { key: "application", value: "Hobby Projects" },
            { key: "application", value: "Basic Prototyping" },

            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Open" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "220 × 220 × 250 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Removable Magnetic Build Plate",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Open Frame",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Manual Bed Leveling",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Bowden Extruder",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.1 – 0.3 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 180 mm/s",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 240°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 60°C",
                sortOrder: 3,
            },
            {
                category: "Material Compatibility",
                label: "Filament Diameter",
                value: "1.75 mm",
                sortOrder: 4,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ, G-code",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "Cura Compatible",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "440 × 410 × 465 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "8 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220V AC, 50/60Hz, 150W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 55 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "3.5-inch Color Screen",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Compact desktop design ideal for home and classrooms",
                sortOrder: 1,
            },
            {
                title: "Easy assembly with beginner-friendly setup process",
                sortOrder: 2,
            },
            {
                title: "Removable magnetic build plate for easy part removal",
                sortOrder: 3,
            },
            {
                title: "Silent stepper drivers for quieter operation",
                sortOrder: 4,
            },
            { title: "Upgradeable open-source ecosystem", sortOrder: 5 },
            { title: "Low power consumption for everyday use", sortOrder: 6 },
        ],

        applications: [
            { name: "Learning", sortOrder: 1 },
            { name: "Hobby Projects", sortOrder: 2 },
            { name: "Education", sortOrder: 3 },
            { name: "Basic Prototyping", sortOrder: 4 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications overview",
                downloadUrl:
                    "https://docs.scrible3d.com/start-fdm-220-datasheet.pdf",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Assembly and operation guide",
                downloadUrl:
                    "https://docs.scrible3d.com/start-fdm-220-user-manual.pdf",
                sortOrder: 2,
            },
            {
                title: "Quick Start Guide",
                description: "Start printing in under 15 minutes",
                downloadUrl:
                    "https://docs.scrible3d.com/start-fdm-220-quickstart.pdf",
                sortOrder: 3,
            },
        ],
    },
    {
        name: "Prusa MK4",
        slug: "prusa-mk4",
        brand: "Prusa Research",
        price: 165000,
        originalPrice: 185000,
        discount: 11,
        technology: "FDM/FFF",
        experience: "Beginner",

        volumeLength: 250,
        volumeWidth: 210,
        volumeHeight: 220,
        volumeMax: 250,

        description:
            "Highly reliable desktop FDM printer known for print quality, open ecosystem, and ease of use.",
        shortDescription:
            "Reliable desktop FDM printer for education and prototyping",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/prusa-mk4-front.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/prusa-mk4-side.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/prusa-mk4-bed.jpg",
                altText: "Print bed detail",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },
            { key: "material", value: "ABS" },
            { key: "material", value: "TPU" },

            { key: "application", value: "Education" },
            { key: "application", value: "Prototyping" },
            { key: "application", value: "Functional Parts" },

            { key: "connectivity", value: "USB" },
            { key: "connectivity", value: "LAN" },

            { key: "chamberType", value: "Open" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "250 × 210 × 220 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Removable Spring Steel Sheet (PEI)",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Open Frame",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Automatic Mesh Bed Leveling",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Direct Drive (Nextruder)",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm (interchangeable)",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.05 – 0.30 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 200 mm/s",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG, ABS, TPU",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 290°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 120°C",
                sortOrder: 3,
            },
            {
                category: "Material Compatibility",
                label: "Filament Diameter",
                value: "1.75 mm",
                sortOrder: 4,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "USB, Ethernet",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ, 3MF",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "PrusaSlicer",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "500 × 550 × 400 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "16 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 240W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 50 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "3.5-inch Color LCD",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Exceptional reliability and print consistency",
                sortOrder: 1,
            },
            {
                title: "Direct-drive Nextruder for precise filament control",
                sortOrder: 2,
            },
            { title: "Automatic first-layer calibration", sortOrder: 3 },
            {
                title: "Open-source hardware and software ecosystem",
                sortOrder: 4,
            },
            { title: "Removable PEI spring steel print sheets", sortOrder: 5 },
            {
                title: "Active community and long-term firmware support",
                sortOrder: 6,
            },
        ],

        applications: [
            { name: "Education", sortOrder: 1 },
            { name: "Prototyping", sortOrder: 2 },
            { name: "Functional Parts", sortOrder: 3 },
            { name: "Product Design", sortOrder: 4 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Official technical specifications",
                downloadUrl:
                    "https://www.prusa3d.com/downloads/mk4-datasheet.pdf",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Assembly and operation guide",
                downloadUrl: "https://www.prusa3d.com/downloads/mk4-manual.pdf",
                sortOrder: 2,
            },
            {
                title: "Quick Start Guide",
                description: "First print walkthrough",
                downloadUrl:
                    "https://www.prusa3d.com/downloads/mk4-quickstart.pdf",
                sortOrder: 3,
            },
        ],
    },
    {
        name: "Bambu Lab X1 Carbon",
        slug: "bambu-lab-x1-carbon",
        brand: "Bambu Lab",
        price: 228000,
        originalPrice: 255000,
        discount: 11,
        technology: "FDM/FFF",
        experience: "Intermediate",

        volumeLength: 256,
        volumeWidth: 256,
        volumeHeight: 256,
        volumeMax: 256,

        description:
            "High-speed enclosed FDM printer designed for professional prototyping and functional parts with minimal tuning.",
        shortDescription:
            "High-speed enclosed FDM printer with smart automation",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/bambu-x1c-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/bambu-x1c-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/bambu-x1c-3.jpg",
                altText: "Interior chamber",
                sortOrder: 2,
                isMain: false,
            },
            {
                url: "/images/printers/bambu-x1c-4.jpg",
                altText: "AMS system",
                sortOrder: 3,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },
            { key: "material", value: "ABS" },
            { key: "material", value: "TPU" },
            { key: "material", value: "Nylon" },

            { key: "application", value: "Rapid Prototyping" },
            { key: "application", value: "Functional Parts" },
            { key: "application", value: "Product Design" },

            { key: "connectivity", value: "Wi-Fi" },
            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Enclosed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "256 × 256 × 256 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Heated PEI Spring Steel Plate",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Fully Enclosed",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Automatic Bed Leveling with Lidar",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Direct Drive Extruder",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm (0.2 / 0.6 / 0.8 mm optional)",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.05 – 0.30 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 500 mm/s",
                sortOrder: 5,
            },
            {
                category: "Print Specifications",
                label: "Acceleration",
                value: "20,000 mm/s²",
                sortOrder: 6,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG, ABS, TPU, Nylon",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 300°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 120°C",
                sortOrder: 3,
            },
            {
                category: "Material Compatibility",
                label: "Filament Diameter",
                value: "1.75 mm",
                sortOrder: 4,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Wi-Fi, Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, 3MF, STEP",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "Bambu Studio",
                sortOrder: 3,
            },
            {
                category: "Connectivity & Software",
                label: "Remote Monitoring",
                value: "Built-in Camera with AI Failure Detection",
                sortOrder: 4,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "389 × 389 × 457 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "14.5 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 1000W peak",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 55 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "5-inch Touchscreen",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Extremely high-speed printing with minimal tuning",
                sortOrder: 1,
            },
            {
                title: "Automatic bed leveling using Lidar technology",
                sortOrder: 2,
            },
            { title: "AI-powered print failure detection", sortOrder: 3 },
            {
                title: "Fully enclosed chamber for engineering materials",
                sortOrder: 4,
            },
            {
                title: "Optional AMS system for multi-color printing",
                sortOrder: 5,
            },
            { title: "Cloud-based monitoring and control", sortOrder: 6 },
            {
                title: "CoreXY motion system for stability at high speeds",
                sortOrder: 7,
            },
        ],

        applications: [
            { name: "Rapid Prototyping", sortOrder: 1 },
            { name: "Functional Parts", sortOrder: 2 },
            { name: "Product Design", sortOrder: 3 },
            { name: "Engineering Validation", sortOrder: 4 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and performance details",
                downloadUrl:
                    "https://wiki.bambulab.com/x1-carbon-datasheet.pdf",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup and operation guide",
                downloadUrl:
                    "https://wiki.bambulab.com/x1-carbon-user-manual.pdf",
                sortOrder: 2,
            },
            {
                title: "Quick Start Guide",
                description: "Getting started with first print",
                downloadUrl:
                    "https://wiki.bambulab.com/x1-carbon-quickstart.pdf",
                sortOrder: 3,
            },
        ],
    },
    {
        name: "Creality Ender-3 V3 SE",
        slug: "creality-ender-3-v3-se",
        brand: "Creality",
        price: 28000,
        originalPrice: 35000,
        discount: 20,
        technology: "FDM/FFF",
        experience: "Beginner",

        volumeLength: 220,
        volumeWidth: 220,
        volumeHeight: 250,
        volumeMax: 250,

        description:
            "Affordable and beginner-friendly FDM printer designed for hobbyists and first-time users.",
        shortDescription: "Budget desktop FDM printer for beginners",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/ender3-v3-se-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/ender3-v3-se-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/ender3-v3-se-3.jpg",
                altText: "Print bed",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },

            { key: "application", value: "Hobby Projects" },
            { key: "application", value: "Learning" },
            { key: "application", value: "Basic Prototyping" },

            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Open" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "220 × 220 × 250 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Spring Steel Build Plate",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Open Frame",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Automatic CR-Touch Bed Leveling",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Direct Drive Extruder",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.1 – 0.35 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 250 mm/s",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 260°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 100°C",
                sortOrder: 3,
            },
            {
                category: "Material Compatibility",
                label: "Filament Diameter",
                value: "1.75 mm",
                sortOrder: 4,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ, G-code",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "Creality Print, Cura Compatible",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "440 × 410 × 465 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "7.8 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 350W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 55 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "4.3-inch Color Screen",
                sortOrder: 5,
            },
        ],

        features: [
            { title: "Excellent value for money for beginners", sortOrder: 1 },
            { title: "Automatic CR-Touch bed leveling", sortOrder: 2 },
            {
                title: "Direct drive extruder for better filament control",
                sortOrder: 3,
            },
            { title: "Compact footprint suitable for desktops", sortOrder: 4 },
            { title: "Large global community and mod support", sortOrder: 5 },
            { title: "Quick assembly and calibration", sortOrder: 6 },
        ],

        applications: [
            { name: "Hobby Projects", sortOrder: 1 },
            { name: "Learning", sortOrder: 2 },
            { name: "Basic Prototyping", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications overview",
                downloadUrl:
                    "https://www.creality.com/pages/ender-3-v3-se-datasheet",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup and operation guide",
                downloadUrl:
                    "https://www.creality.com/pages/ender-3-v3-se-manual",
                sortOrder: 2,
            },
            {
                title: "Quick Start Guide",
                description: "First print setup",
                downloadUrl:
                    "https://www.creality.com/pages/ender-3-v3-se-quickstart",
                sortOrder: 3,
            },
        ],
    },
    {
        name: "Formlabs Form 3+",
        slug: "formlabs-form-3-plus",
        brand: "Formlabs",
        price: 385000,
        originalPrice: 420000,
        discount: 8,
        technology: "SLA",
        experience: "Intermediate",

        volumeLength: 145,
        volumeWidth: 145,
        volumeHeight: 185,
        volumeMax: 185,

        description:
            "Professional SLA 3D printer designed for high-precision prototyping, dental, medical, and engineering applications.",
        shortDescription:
            "Professional SLA printer for high-detail resin prints",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/form3plus-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/form3plus-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/form3plus-3.jpg",
                altText: "Print chamber",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "Standard Resin" },
            { key: "material", value: "ABS-like Resin" },
            { key: "material", value: "Engineering Resin" },

            { key: "application", value: "Dental" },
            { key: "application", value: "Medical Models" },
            { key: "application", value: "Jewelry" },
            { key: "application", value: "Engineering Prototypes" },

            { key: "connectivity", value: "Wi-Fi" },
            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Closed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "145 × 145 × 185 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Aluminum Build Platform",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Closed Resin Chamber",
                sortOrder: 3,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Stereolithography (SLA)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Light Source",
                value: "Low Force Stereolithography (LFS)",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "25 – 300 microns",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "XY Resolution",
                value: "25 microns",
                sortOrder: 4,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "Standard, ABS-like, Engineering Resins",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Resin Cartridge System",
                value: "Automatic Resin Handling",
                sortOrder: 2,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Wi-Fi, Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "PreForm",
                sortOrder: 3,
            },
            {
                category: "Connectivity & Software",
                label: "Remote Monitoring",
                value: "Cloud Dashboard with Job Monitoring",
                sortOrder: 4,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "405 × 375 × 530 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "17.5 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 650W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 50 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "5.5-inch Color Touchscreen",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Industry-leading surface finish and dimensional accuracy",
                sortOrder: 1,
            },
            {
                title: "Low Force Stereolithography for consistent results",
                sortOrder: 2,
            },
            { title: "Automatic resin cartridge system", sortOrder: 3 },
            {
                title: "Reliable print success with minimal calibration",
                sortOrder: 4,
            },
            {
                title: "Wide ecosystem of professional-grade resins",
                sortOrder: 5,
            },
            { title: "Cloud-based printer management", sortOrder: 6 },
        ],

        applications: [
            { name: "Dental", sortOrder: 1 },
            { name: "Medical Models", sortOrder: 2 },
            { name: "Jewelry", sortOrder: 3 },
            { name: "Engineering Prototypes", sortOrder: 4 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and materials overview",
                downloadUrl:
                    "https://formlabs-media.formlabs.com/datasheets/form-3-plus-datasheet.pdf",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup, operation, and maintenance guide",
                downloadUrl:
                    "https://support.formlabs.com/s/article/Form-3-User-Manual",
                sortOrder: 2,
            },
            {
                title: "Quick Start Guide",
                description: "First print setup walkthrough",
                downloadUrl:
                    "https://support.formlabs.com/s/article/Form-3-Quick-Start",
                sortOrder: 3,
            },
        ],
    },
    {
        name: "Phrozen Sonic Mega 8K",
        slug: "phrozen-sonic-mega-8k",
        brand: "Phrozen",
        price: 285000,
        originalPrice: 325000,
        discount: 12,
        technology: "SLA",
        experience: "Intermediate",

        volumeLength: 330,
        volumeWidth: 185,
        volumeHeight: 400,
        volumeMax: 400,

        description:
            "Large-format SLA printer designed for high-detail resin printing at scale, ideal for studios and production environments.",
        shortDescription:
            "Large build-volume SLA printer for high-detail resin production",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/phrozen-mega8k-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/phrozen-mega8k-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/phrozen-mega8k-3.jpg",
                altText: "Build platform",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "Standard Resin" },
            { key: "material", value: "ABS-like Resin" },
            { key: "material", value: "Engineering Resin" },

            { key: "application", value: "Large Models" },
            { key: "application", value: "Miniature Production" },
            { key: "application", value: "Prototyping" },

            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Closed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "330 × 185 × 400 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "CNC-machined Aluminum Platform",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Closed Resin Chamber",
                sortOrder: 3,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Masked Stereolithography (MSLA)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Light Source",
                value: "Mono LCD with 8K Resolution",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "XY Resolution",
                value: "43 microns",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "10 – 300 microns",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 90 mm/hr",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "Standard, ABS-like, Engineering Resins",
                sortOrder: 1,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "ChiTuBox Compatible",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "500 × 470 × 680 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "35 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 300W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 45 dB",
                sortOrder: 4,
            },
        ],

        features: [
            {
                title: "Massive build volume for large resin parts",
                sortOrder: 1,
            },
            {
                title: "8K mono LCD for ultra-high surface detail",
                sortOrder: 2,
            },
            {
                title: "Uniform UV light engine for consistent curing",
                sortOrder: 3,
            },
            { title: "Rigid Z-axis for dimensional stability", sortOrder: 4 },
            {
                title: "Ideal for batch production of resin parts",
                sortOrder: 5,
            },
        ],

        applications: [
            { name: "Large Models", sortOrder: 1 },
            { name: "Miniature Production", sortOrder: 2 },
            { name: "Prototyping", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and performance details",
                downloadUrl: "https://phrozen3d.com/pages/sonic-mega-8k-specs",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup and operation guide",
                downloadUrl: "https://phrozen3d.com/pages/sonic-mega-8k-manual",
                sortOrder: 2,
            },
        ],
    },
    {
        name: "Formlabs Fuse 1+ 30W",
        slug: "formlabs-fuse-1-plus-30w",
        brand: "Formlabs",
        price: 1850000,
        originalPrice: 2100000,
        discount: 12,
        technology: "SLS",
        experience: "Advanced",

        volumeLength: 165,
        volumeWidth: 165,
        volumeHeight: 320,
        volumeMax: 320,

        description:
            "Industrial SLS printer designed for producing durable, end-use nylon parts with excellent mechanical properties.",
        shortDescription: "Compact industrial SLS printer for end-use parts",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/fuse1plus-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/fuse1plus-2.jpg",
                altText: "Build chamber",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/fuse1plus-3.jpg",
                altText: "Powder handling system",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "Nylon (PA12)" },
            { key: "material", value: "Nylon (PA11)" },

            { key: "application", value: "End-use Parts" },
            { key: "application", value: "Functional Prototypes" },
            { key: "application", value: "Small Batch Manufacturing" },

            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Powder Bed (Heated)" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "165 × 165 × 320 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Chamber",
                value: "Heated Powder Bed",
                sortOrder: 2,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Selective Laser Sintering (SLS)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Laser Power",
                value: "30W Fiber Laser",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Layer Thickness",
                value: "110 microns",
                sortOrder: 3,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PA12, PA11",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Refresh Rate",
                value: "Up to 80% recycled powder",
                sortOrder: 2,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "PreForm",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Job Monitoring",
                value: "Cloud-based Dashboard",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "645 × 685 × 1070 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "114 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 2 kW",
                sortOrder: 3,
            },
        ],

        features: [
            {
                title: "Industrial-grade nylon parts with isotropic strength",
                sortOrder: 1,
            },
            {
                title: "High powder refresh rate for cost efficiency",
                sortOrder: 2,
            },
            {
                title: "Compact footprint for industrial environments",
                sortOrder: 3,
            },
            { title: "Integrated powder management ecosystem", sortOrder: 4 },
            {
                title: "Reliable repeatability across production runs",
                sortOrder: 5,
            },
        ],

        applications: [
            { name: "End-use Parts", sortOrder: 1 },
            { name: "Functional Prototypes", sortOrder: 2 },
            { name: "Small Batch Manufacturing", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and materials overview",
                downloadUrl:
                    "https://formlabs-media.formlabs.com/datasheets/fuse-1-plus-datasheet.pdf",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Operation and safety guide",
                downloadUrl:
                    "https://support.formlabs.com/s/article/Fuse-1-User-Manual",
                sortOrder: 2,
            },
        ],
    },

    {
        name: "EOS P 396",
        slug: "eos-p-396",
        brand: "EOS",
        price: 9500000,
        originalPrice: 10500000,
        discount: 9,
        technology: "SLS",
        experience: "Advanced",

        volumeLength: 340,
        volumeWidth: 340,
        volumeHeight: 600,
        volumeMax: 600,

        description:
            "High-throughput industrial SLS system engineered for continuous production of end-use polymer parts.",
        shortDescription:
            "Industrial SLS production system for large-scale manufacturing",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/eos-p396-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/eos-p396-2.jpg",
                altText: "Build chamber",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/eos-p396-3.jpg",
                altText: "Powder handling system",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "Nylon (PA12)" },
            { key: "material", value: "Nylon (PA11)" },
            { key: "material", value: "Glass-Filled Nylon" },

            { key: "application", value: "End-use Parts" },
            { key: "application", value: "Series Production" },
            { key: "application", value: "Industrial Manufacturing" },

            { key: "connectivity", value: "LAN" },

            { key: "chamberType", value: "Industrial Powder Bed (Heated)" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "340 × 340 × 600 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Chamber",
                value: "Heated Industrial Powder Bed",
                sortOrder: 2,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Selective Laser Sintering (SLS)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Laser Type",
                value: "CO₂ Laser",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Laser Power",
                value: "Up to 70W",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Thickness",
                value: "100 – 150 microns",
                sortOrder: 4,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PA12, PA11, Glass-Filled PA",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Refresh Rate",
                value: "Up to 70% reused powder",
                sortOrder: 2,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Industrial Ethernet",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "EOSPRINT",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Production Monitoring",
                value: "MES Integration Ready",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "2200 × 1200 × 2200 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "1100 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "400V AC, 3-phase, up to 20 kW",
                sortOrder: 3,
            },
        ],

        features: [
            {
                title: "Designed for 24/7 industrial production environments",
                sortOrder: 1,
            },
            { title: "Large build chamber for high throughput", sortOrder: 2 },
            {
                title: "Excellent mechanical properties and isotropic strength",
                sortOrder: 3,
            },
            {
                title: "Advanced powder handling and reuse system",
                sortOrder: 4,
            },
            {
                title: "Seamless integration into factory MES systems",
                sortOrder: 5,
            },
        ],

        applications: [
            { name: "End-use Parts", sortOrder: 1 },
            { name: "Series Production", sortOrder: 2 },
            { name: "Industrial Manufacturing", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description:
                    "Industrial specifications and production capabilities",
                downloadUrl:
                    "https://www.eos.info/en/additive-manufacturing/3d-printing-systems/eos-p-396",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Operation and maintenance documentation",
                downloadUrl:
                    "https://www.eos.info/en/service-support/documentation",
                sortOrder: 2,
            },
        ],
    },
    {
        name: "Raise3D Pro3 Plus",
        slug: "raise3d-pro3-plus",
        brand: "Raise3D",
        price: 725000,
        originalPrice: 820000,
        discount: 12,
        technology: "FDM/FFF",
        experience: "Advanced",

        volumeLength: 300,
        volumeWidth: 300,
        volumeHeight: 605,
        volumeMax: 605,

        description:
            "Large-format professional FDM printer designed for producing accurate functional parts, jigs, and fixtures using engineering-grade filaments.",
        shortDescription:
            "Large-format enclosed FDM printer for industrial applications",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/raise3d-pro3plus-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/raise3d-pro3plus-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/raise3d-pro3plus-3.jpg",
                altText: "Dual extruder system",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },
            { key: "material", value: "ABS" },
            { key: "material", value: "ASA" },
            { key: "material", value: "Nylon" },
            { key: "material", value: "Carbon Fiber Nylon" },

            { key: "application", value: "Tooling" },
            { key: "application", value: "Jigs & Fixtures" },
            { key: "application", value: "Functional Parts" },
            { key: "application", value: "Small Batch Manufacturing" },

            { key: "connectivity", value: "Wi-Fi" },
            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Fully Enclosed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "300 × 300 × 605 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Flexible Steel Build Plate",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Fully Enclosed",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Automatic Bed Leveling",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Independent Dual Direct Drive Extruders",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm (0.2–1.0 mm optional)",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.05 – 0.30 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 300 mm/s",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG, ABS, ASA, Nylon, CF Nylon",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 300°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 120°C",
                sortOrder: 3,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Wi-Fi, Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "ideaMaker",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Remote Management",
                value: "RaiseCloud Integration",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "620 × 626 × 1100 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "52 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 800W",
                sortOrder: 3,
            },
        ],

        features: [
            {
                title: "Independent dual extruders for complex prints",
                sortOrder: 1,
            },
            {
                title: "Large Z-height for tall functional components",
                sortOrder: 2,
            },
            {
                title: "Fully enclosed chamber for engineering filaments",
                sortOrder: 3,
            },
            { title: "Industrial-grade motion control system", sortOrder: 4 },
            { title: "Remote fleet management via RaiseCloud", sortOrder: 5 },
        ],

        applications: [
            { name: "Tooling", sortOrder: 1 },
            { name: "Jigs & Fixtures", sortOrder: 2 },
            { name: "Functional Parts", sortOrder: 3 },
            { name: "Small Batch Manufacturing", sortOrder: 4 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description:
                    "Technical specifications and material compatibility",
                downloadUrl: "https://www.raise3d.com/products/pro3-plus/",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup, calibration, and maintenance guide",
                downloadUrl: "https://support.raise3d.com/pro3-plus-manual",
                sortOrder: 2,
            },
        ],
    },
    {
        name: "Elegoo Saturn 3 Ultra",
        slug: "elegoo-saturn-3-ultra",
        brand: "Elegoo",
        price: 78000,
        originalPrice: 92000,
        discount: 15,
        technology: "SLA",
        experience: "Beginner",

        volumeLength: 218,
        volumeWidth: 123,
        volumeHeight: 260,
        volumeMax: 260,

        description:
            "High-resolution desktop SLA printer offering excellent detail and reliability for makers, designers, and small studios.",
        shortDescription:
            "High-detail desktop SLA printer for makers and studios",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/elegoo-saturn3u-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/elegoo-saturn3u-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/elegoo-saturn3u-3.jpg",
                altText: "Build platform",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "Standard Resin" },
            { key: "material", value: "ABS-like Resin" },
            { key: "material", value: "Water-washable Resin" },

            { key: "application", value: "Miniatures" },
            { key: "application", value: "Models" },
            { key: "application", value: "Prototyping" },

            { key: "connectivity", value: "USB" },
            { key: "connectivity", value: "Wi-Fi" },

            { key: "chamberType", value: "Closed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "218 × 123 × 260 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Laser-engraved Aluminum Platform",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Closed Resin Chamber",
                sortOrder: 3,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Masked Stereolithography (MSLA)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Light Source",
                value: "10-inch 12K Mono LCD",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "XY Resolution",
                value: "19 microns",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "10 – 300 microns",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 150 mm/hr",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "Standard, ABS-like, Water-washable Resins",
                sortOrder: 1,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "USB, Wi-Fi",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "ChiTuBox, Lychee",
                sortOrder: 3,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "320 × 320 × 560 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "13 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 300W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 45 dB",
                sortOrder: 4,
            },
        ],

        features: [
            {
                title: "12K mono LCD for ultra-fine surface detail",
                sortOrder: 1,
            },
            { title: "Fast printing speeds for resin systems", sortOrder: 2 },
            { title: "Sturdy Z-axis for dimensional accuracy", sortOrder: 3 },
            {
                title: "Wi-Fi connectivity for remote job transfer",
                sortOrder: 4,
            },
            { title: "Excellent price-to-performance ratio", sortOrder: 5 },
        ],

        applications: [
            { name: "Miniatures", sortOrder: 1 },
            { name: "Models", sortOrder: 2 },
            { name: "Prototyping", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications overview",
                downloadUrl:
                    "https://www.elegoo.com/pages/saturn-3-ultra-specs",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup and operation guide",
                downloadUrl:
                    "https://www.elegoo.com/pages/saturn-3-ultra-manual",
                sortOrder: 2,
            },
        ],
    },
    {
        name: "Ultimaker S5",
        slug: "ultimaker-s5",
        brand: "Ultimaker",
        price: 595000,
        originalPrice: 660000,
        discount: 10,
        technology: "FDM/FFF",
        experience: "Intermediate",

        volumeLength: 330,
        volumeWidth: 240,
        volumeHeight: 300,
        volumeMax: 330,

        description:
            "Professional dual-extrusion FDM printer widely used in product design, engineering, and education for reliable functional prototyping.",
        shortDescription:
            "Professional dual-extrusion FDM printer for labs and studios",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/ultimaker-s5-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/ultimaker-s5-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/ultimaker-s5-3.jpg",
                altText: "Dual print cores",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },
            { key: "material", value: "ABS" },
            { key: "material", value: "Nylon" },
            { key: "material", value: "TPU" },

            { key: "application", value: "Product Design" },
            { key: "application", value: "Functional Prototyping" },
            { key: "application", value: "Education" },
            { key: "application", value: "Engineering Validation" },

            { key: "connectivity", value: "Wi-Fi" },
            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Semi-Enclosed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "330 × 240 × 300 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Heated Glass Build Plate",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Semi-Enclosed (Enclosure Optional)",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Active Automatic Bed Leveling",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Dual Print Core System",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.25 / 0.4 / 0.6 / 0.8 mm",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.06 – 0.20 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 300 mm/s",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG, ABS, Nylon, TPU",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 280°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 140°C",
                sortOrder: 3,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Wi-Fi, Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ, 3MF",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "Ultimaker Cura",
                sortOrder: 3,
            },
            {
                category: "Connectivity & Software",
                label: "Remote Management",
                value: "Digital Factory Cloud",
                sortOrder: 4,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "495 × 585 × 780 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "20.6 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 500W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 50 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "4.7-inch Color Touchscreen",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Reliable dual extrusion for soluble supports",
                sortOrder: 1,
            },
            {
                title: "Excellent ecosystem and enterprise support",
                sortOrder: 2,
            },
            {
                title: "Active bed leveling for consistent first layers",
                sortOrder: 3,
            },
            { title: "Cloud-based printer and job management", sortOrder: 4 },
            { title: "Wide range of certified materials", sortOrder: 5 },
        ],

        applications: [
            { name: "Product Design", sortOrder: 1 },
            { name: "Functional Prototyping", sortOrder: 2 },
            { name: "Education", sortOrder: 3 },
            { name: "Engineering Validation", sortOrder: 4 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and supported materials",
                downloadUrl:
                    "https://ultimaker.com/learn/ultimaker-s5-specifications",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup and operation guide",
                downloadUrl:
                    "https://support.ultimaker.com/s/article/Ultimaker-S5-User-Manual",
                sortOrder: 2,
            },
        ],
    },
    {
        name: "Sinterit Lisa Pro X",
        slug: "sinterit-lisa-pro-x",
        brand: "Sinterit",
        price: 1450000,
        originalPrice: 1650000,
        discount: 12,
        technology: "SLS",
        experience: "Advanced",

        volumeLength: 130,
        volumeWidth: 180,
        volumeHeight: 330,
        volumeMax: 330,

        description:
            "Compact industrial SLS printer designed for engineering labs and service bureaus producing durable nylon parts in-house.",
        shortDescription:
            "Compact industrial SLS printer for engineering applications",

        warrantyYears: 1,
        freeInstallation: true,

        images: [
            {
                url: "/images/printers/sinterit-lisa-prox-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/sinterit-lisa-prox-2.jpg",
                altText: "Build chamber",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/sinterit-lisa-prox-3.jpg",
                altText: "Powder handling module",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "Nylon (PA12)" },
            { key: "material", value: "Nylon (PA11)" },
            { key: "material", value: "Flexible TPU Powder" },

            { key: "application", value: "Functional Prototypes" },
            { key: "application", value: "End-use Parts" },
            { key: "application", value: "Small Batch Manufacturing" },

            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Heated Powder Bed" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "130 × 180 × 330 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Chamber",
                value: "Heated Powder Bed",
                sortOrder: 2,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Selective Laser Sintering (SLS)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Laser Type",
                value: "Diode Laser",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Layer Thickness",
                value: "75 – 175 microns",
                sortOrder: 3,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PA12, PA11, TPU Powders",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Powder Refresh Rate",
                value: "Up to 70%",
                sortOrder: 2,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "Sinterit Studio",
                sortOrder: 2,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "650 × 600 × 1200 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "140 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 3 kW",
                sortOrder: 3,
            },
        ],

        features: [
            { title: "True SLS printing in a compact footprint", sortOrder: 1 },
            {
                title: "Low powder refresh rate for reduced material cost",
                sortOrder: 2,
            },
            {
                title: "Engineering-grade nylon and TPU materials",
                sortOrder: 3,
            },
            { title: "In-house production without outsourcing", sortOrder: 4 },
            { title: "Optimized for labs and service bureaus", sortOrder: 5 },
        ],

        applications: [
            { name: "Functional Prototypes", sortOrder: 1 },
            { name: "End-use Parts", sortOrder: 2 },
            { name: "Small Batch Manufacturing", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and supported materials",
                downloadUrl: "https://sinterit.com/products/lisa-pro-x/",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Operation and maintenance guide",
                downloadUrl: "https://support.sinterit.com/lisa-pro-x-manual",
                sortOrder: 2,
            },
        ],
    },
    {
        name: "QIDI Tech X-Max 3",
        slug: "qidi-tech-x-max-3",
        brand: "QIDI Tech",
        price: 285000,
        originalPrice: 320000,
        discount: 11,
        technology: "FDM/FFF",
        experience: "Intermediate",

        volumeLength: 325,
        volumeWidth: 325,
        volumeHeight: 315,
        volumeMax: 325,

        description:
            "Fully enclosed professional desktop FDM printer designed for reliable printing with engineering-grade materials in offices and labs.",
        shortDescription:
            "Fully enclosed professional FDM printer for engineering materials",

        warrantyYears: 1,
        freeInstallation: false,

        images: [
            {
                url: "/images/printers/qidi-xmax3-1.jpg",
                altText: "Front view",
                sortOrder: 0,
                isMain: true,
            },
            {
                url: "/images/printers/qidi-xmax3-2.jpg",
                altText: "Side view",
                sortOrder: 1,
                isMain: false,
            },
            {
                url: "/images/printers/qidi-xmax3-3.jpg",
                altText: "Heated chamber interior",
                sortOrder: 2,
                isMain: false,
            },
        ],

        attributes: [
            { key: "material", value: "PLA" },
            { key: "material", value: "PETG" },
            { key: "material", value: "ABS" },
            { key: "material", value: "ASA" },
            { key: "material", value: "Nylon" },
            { key: "material", value: "Carbon Fiber Nylon" },

            { key: "application", value: "Functional Prototypes" },
            { key: "application", value: "Engineering Parts" },
            { key: "application", value: "Small Batch Manufacturing" },

            { key: "connectivity", value: "Wi-Fi" },
            { key: "connectivity", value: "LAN" },
            { key: "connectivity", value: "USB" },

            { key: "chamberType", value: "Heated Enclosed Chamber" },
        ],

        specifications: [
            // Build Specifications
            {
                category: "Build Specifications",
                label: "Build Volume",
                value: "325 × 325 × 315 mm",
                sortOrder: 1,
            },
            {
                category: "Build Specifications",
                label: "Build Platform",
                value: "Flexible PEI Spring Steel Plate",
                sortOrder: 2,
            },
            {
                category: "Build Specifications",
                label: "Chamber Type",
                value: "Fully Enclosed with Active Heating",
                sortOrder: 3,
            },
            {
                category: "Build Specifications",
                label: "Leveling System",
                value: "Automatic Bed Leveling",
                sortOrder: 4,
            },

            // Print Specifications
            {
                category: "Print Specifications",
                label: "Printing Technology",
                value: "Fused Deposition Modeling (FDM)",
                sortOrder: 1,
            },
            {
                category: "Print Specifications",
                label: "Extruder Type",
                value: "Direct Drive Extruder",
                sortOrder: 2,
            },
            {
                category: "Print Specifications",
                label: "Nozzle Diameter",
                value: "0.4 mm (0.2 / 0.6 / 0.8 mm optional)",
                sortOrder: 3,
            },
            {
                category: "Print Specifications",
                label: "Layer Resolution",
                value: "0.05 – 0.30 mm",
                sortOrder: 4,
            },
            {
                category: "Print Specifications",
                label: "Print Speed",
                value: "Up to 300 mm/s",
                sortOrder: 5,
            },

            // Material Compatibility
            {
                category: "Material Compatibility",
                label: "Supported Materials",
                value: "PLA, PETG, ABS, ASA, Nylon, CF Nylon",
                sortOrder: 1,
            },
            {
                category: "Material Compatibility",
                label: "Nozzle Temperature",
                value: "Up to 350°C",
                sortOrder: 2,
            },
            {
                category: "Material Compatibility",
                label: "Bed Temperature",
                value: "Up to 120°C",
                sortOrder: 3,
            },
            {
                category: "Material Compatibility",
                label: "Chamber Temperature",
                value: "Up to 65°C",
                sortOrder: 4,
            },

            // Connectivity & Software
            {
                category: "Connectivity & Software",
                label: "Connectivity",
                value: "Wi-Fi, Ethernet, USB",
                sortOrder: 1,
            },
            {
                category: "Connectivity & Software",
                label: "Supported File Formats",
                value: "STL, OBJ, 3MF",
                sortOrder: 2,
            },
            {
                category: "Connectivity & Software",
                label: "Slicing Software",
                value: "QIDI Slicer (Cura-based)",
                sortOrder: 3,
            },
            {
                category: "Connectivity & Software",
                label: "Remote Monitoring",
                value: "Built-in Camera",
                sortOrder: 4,
            },

            // Physical Specifications
            {
                category: "Physical Specifications",
                label: "Machine Dimensions",
                value: "553 × 553 × 601 mm",
                sortOrder: 1,
            },
            {
                category: "Physical Specifications",
                label: "Weight",
                value: "45 kg",
                sortOrder: 2,
            },
            {
                category: "Physical Specifications",
                label: "Power Requirements",
                value: "220–240V AC, 50/60Hz, 1000W",
                sortOrder: 3,
            },
            {
                category: "Physical Specifications",
                label: "Noise Level",
                value: "< 55 dB",
                sortOrder: 4,
            },
            {
                category: "Physical Specifications",
                label: "Display",
                value: "5-inch Color Touchscreen",
                sortOrder: 5,
            },
        ],

        features: [
            {
                title: "Actively heated enclosed chamber for engineering materials",
                sortOrder: 1,
            },
            { title: "High-temperature hotend up to 350°C", sortOrder: 2 },
            {
                title: "Excellent dimensional stability for nylon and CF filaments",
                sortOrder: 3,
            },
            { title: "Built-in camera for remote monitoring", sortOrder: 4 },
            {
                title: "Balanced price-to-performance for professional users",
                sortOrder: 5,
            },
        ],

        applications: [
            { name: "Functional Prototypes", sortOrder: 1 },
            { name: "Engineering Parts", sortOrder: 2 },
            { name: "Small Batch Manufacturing", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Product Datasheet",
                description: "Technical specifications and supported materials",
                downloadUrl: "https://qidi3d.com/pages/x-max-3-specifications",
                sortOrder: 1,
            },
            {
                title: "User Manual",
                description: "Setup, calibration, and maintenance guide",
                downloadUrl: "https://qidi3d.com/pages/x-max-3-user-manual",
                sortOrder: 2,
            },
        ],
    },
];

const supportContent = [
    {
        section: "Warranty Information",
        content:
            "1-year manufacturer warranty with optional extended coverage available.",
        sortOrder: 1,
    },
    {
        section: "After-Sales Support",
        content:
            "24/7 technical support via email and phone. Live chat available during business hours. Access to comprehensive online knowledge base and community forums.",
        sortOrder: 2,
    },
    {
        section: "Installation & Training",
        content:
            "Professional installation available. Includes on-site setup, calibration, and 2-hour training session for up to 3 operators.",
        sortOrder: 3,
    },
];

async function main() {
    console.log("🌱 Starting detailed seed...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.printerDownload.deleteMany();
    await prisma.printerApplication.deleteMany();
    await prisma.printerFeature.deleteMany();
    await prisma.printerSpecification.deleteMany();
    await prisma.printerAttribute.deleteMany();
    await prisma.printerImage.deleteMany();
    await prisma.printer.deleteMany();

    // Seed detailed printers
    console.log("🖨️  Seeding detailed printers...");
    for (const printerData of detailedPrintersData) {
        const {
            images,
            attributes,
            specifications,
            features,
            applications,
            downloads,
            ...printerInfo
        } = printerData;

        const printer = await prisma.printer.create({
            data: {
                ...printerInfo,
                images: { create: images },
                attributes: {
                    create: attributes.map((attr) => ({
                        attributeKey: attr.key,
                        attributeValue: attr.value,
                    })),
                },
                specifications: { create: specifications },
                features: { create: features },
                applications: { create: applications },
                downloads: { create: downloads },
            },
            include: {
                images: true,
                attributes: true,
                specifications: true,
                features: true,
                applications: true,
                downloads: true,
            },
        });

        console.log(
            `✅ Created: ${printer.name} with ${printer.specifications.length} specifications`
        );
    }

    console.log("🎉 Detailed seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
