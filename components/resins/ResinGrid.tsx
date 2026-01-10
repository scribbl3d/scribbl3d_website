"use client";

import { useEffect, useState } from "react";
import ResinCard from "./ResinCard";

export default function ResinGrid() {
    const [resins, setResins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadResins() {
            const res = await fetch("/api/resins");
            const data = await res.json();
            setResins(data);
            setLoading(false);
        }

        loadResins();
    }, []);

    if (loading) return <div>Loading resins...</div>;

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resins.map((resin) => (
                <ResinCard key={resin.id} resin={resin} />
            ))}
        </div>
    );
}
