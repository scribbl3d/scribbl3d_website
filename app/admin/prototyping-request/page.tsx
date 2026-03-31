"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Download, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormResponseViewer } from "../_components/FormResponseViewer";

interface PrototypingRequest {
    id: string;
    projectType: string;
    technology: string;
    material: string;
    materialSubtype: string | null;
    colors: string[];
    designFiles: string[];
    specialRequirements: string | null;
    quantityType: string;
    quantityNumber: number | null;
    fullName: string;
    phone: string;
    email: string;
    company: string | null;
    address: string;
    createdAt: string;
}

export default function PrototypingRequestsPage() {
    const [requests, setRequests] = useState<PrototypingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/prototyping-request");
            if (res.ok) setRequests(await res.json());
            else setError("Failed to fetch");
        } catch {
            setError("Error fetching data");
        } finally {
            setIsLoading(false);
        }
    };

    const columns: any[] = [
        { key: "fullName", label: "Client" },
        { key: "technology", label: "Tech" },
        {
            key: "material",
            label: "Material",
            render: (v: any, item: any) =>
                item.materialSubtype ? `${v} (${item.materialSubtype})` : v,
        },
        {
            key: "designFiles",
            label: "Files",
            render: (v: string[]) => v?.length || 0,
        },
        {
            key: "createdAt",
            label: "Submitted",
            render: (v: string) => format(new Date(v), "PPp"),
        },
    ];

    const detailsColumns: any[] = [
        { key: "fullName", label: "Name" },
        { key: "email", label: "Email" },
        {
            key: "address",
            label: "Shipping",
            render: (v: string) => (
                <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                    <MapPin className="h-4 w-4 mt-1" />
                    {v}
                </div>
            ),
        },
        {
            key: "colors",
            label: "Colors",
            render: (v: string[]) => v?.join(", "),
        },
        {
            key: "designFiles",
            label: "Files",
            render: (v: string[]) =>
                v?.map((url, i) => (
                    <a
                        key={i}
                        href={url}
                        target="_blank"
                        className="flex items-center gap-2 text-blue-600 underline text-xs mt-1"
                    >
                        <Download className="h-3 w-3" /> File {i + 1}
                    </a>
                )),
        },
        { key: "specialRequirements", label: "Notes" },
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/ops/control">
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Prototyping Requests</h1>
            </div>
            <FormResponseViewer
                title="Prototyping"
                responses={requests}
                columns={columns}
                detailsColumns={detailsColumns}
                isLoading={isLoading}
                error={error || undefined}
            />
        </div>
    );
}
