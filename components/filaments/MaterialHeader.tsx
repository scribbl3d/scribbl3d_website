interface MaterialHeaderProps {
    material: string;
}

const materialDescriptions: Record<string, { title: string; description: string }> = {
    PLA: {
        title: "PLA (Polylactic Acid)",
        description: "Biodegradable and easy to print. Perfect for beginners and general-purpose printing.",
    },
    ABS: {
        title: "ABS (Acrylonitrile Butadiene Styrene)",
        description: "Strong and heat-resistant. Ideal for functional parts and mechanical applications.",
    },
    PETG: {
        title: "PETG (Polyethylene Terephthalate Glycol)",
        description: "Combines strength and flexibility. Great for durable, impact-resistant prints.",
    },
    TPU: {
        title: "TPU (Thermoplastic Polyurethane)",
        description: "Flexible and elastic. Perfect for phone cases, wearables, and soft parts.",
    },
    Nylon: {
        title: "Nylon",
        description: "Extremely strong and durable. Best for functional parts requiring high strength.",
    },
    "Wood Fill": {
        title: "Wood Fill",
        description: "PLA infused with wood particles. Creates prints with a natural wood appearance and texture.",
    },
    "Metal Fill": {
        title: "Metal Fill",
        description: "Filament with metal particles. Gives prints a metallic finish and weight.",
    },
};

export default function MaterialHeader({ material }: MaterialHeaderProps) {
    const info = materialDescriptions[material] || {
        title: material,
        description: "High-quality 3D printing filament for various applications.",
    };

    return (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h2>
            <p className="text-gray-600">{info.description}</p>
        </div>
    );
}
