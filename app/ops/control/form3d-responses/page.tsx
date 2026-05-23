"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FormResponseViewer } from "../_components/FormResponseViewer";
import { useMarkViewed } from "@/hooks/use-mark-viewed";

interface Form3DResponse {
    id: string;
    fileReference: string | null;
    additionalFile: string | null;
    requirement: string;
    fileExtension: string;
    productionType: string | null;
    quantity: number | null;
    printingTechnology: string | null;
    materialFamily: string | null;
    material: string | null;
    color: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string | null;
    company: string | null;
    createdAt: string;
    updatedAt: string;
}

type Column = {
    key: keyof Form3DResponse;
    label: string;
    render?: (value: any, item?: Form3DResponse) => React.ReactNode;
};

// Helper function to extract filename from Cloudinary URL
const getFileNameFromUrl = (url: string): string => {
    if (!url) return "";
    try {
        const parts = url.split("/");
        return parts[parts.length - 1];
    } catch {
        return url;
    }
};

export default function Form3DResponsesPage() {
    const [responses, setResponses] = useState<Form3DResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useMarkViewed("form3d-responses");

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const res = await fetch("/api/admin/form3d-responses");
            if (res.ok) {
                const data = await res.json();
                setResponses(data);
            } else {
                setError("Failed to fetch Form3D responses");
            }
        } catch {
            setError("Error fetching Form3D responses");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/admin/form3d-responses/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        setResponses((prev) => prev.filter((r) => r.id !== id));
    };

    const columns: Column[] = [
        {
            key: "firstName",
            label: "Name",
            render: (value: string, item?: Form3DResponse) =>
                item ? `${value} ${item.lastName}` : value,
        },
        { key: "email", label: "Email" },
        { 
            key: "productionType", 
            label: "Production Type",
            render: (value: string | null) => value || "Not Specified"
        },
        { 
            key: "printingTechnology", 
            label: "Technology",
            render: (value: string | null) => value || "N/A"
        },
        {
            key: "fileReference",
            label: "Reference File",
            render: (value: string | null) =>
                value ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        <Download className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                            {getFileNameFromUrl(value)}
                        </span>
                    </a>
                ) : (
                    <span className="text-gray-400">No file</span>
                ),
        },
        {
            key: "createdAt",
            label: "Submitted",
            render: (value: string) => format(new Date(value), "PPp"),
        },
    ];

    const detailsColumns: Column[] = [
        { key: "requirement", label: "Requirements" },
        {
            key: "fileReference",
            label: "Reference File",
            render: (value: string | null) =>
                value ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {getFileNameFromUrl(value)}
                    </a>
                ) : (
                    <span className="text-gray-400">No file uploaded</span>
                ),
        },
        { key: "fileExtension", label: "File Extension" },
        {
            key: "additionalFile",
            label: "Additional File",
            render: (value: string | null) =>
                value ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {getFileNameFromUrl(value)}
                    </a>
                ) : (
                    <span className="text-gray-400">No file uploaded</span>
                ),
        },
        { 
            key: "productionType", 
            label: "Production Type",
            render: (value: string | null) => value || "Not Specified"
        },
        { 
            key: "quantity", 
            label: "Quantity",
            render: (value: number | null) => value !== null ? value : "N/A"
        },
        { 
            key: "printingTechnology", 
            label: "Printing Technology",
            render: (value: string | null) => value || "N/A"
        },
        { 
            key: "materialFamily", 
            label: "Material Family",
            render: (value: string | null) => value || "N/A"
        },
        { 
            key: "material", 
            label: "Material Subtype",
            render: (value: string | null) => value || "N/A"
        },
        { 
            key: "color", 
            label: "Color",
            render: (value: string | null) => value || "N/A"
        },
        { key: "firstName", label: "First Name" },
        { key: "lastName", label: "Last Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { 
            key: "address", 
            label: "Address",
            render: (value: string | null) => value || "Not Provided"
        },
        { 
            key: "company", 
            label: "Company",
            render: (value: string | null) => value || "Not Provided"
        },
        {
            key: "createdAt",
            label: "Submitted At",
            render: (value: string) => format(new Date(value), "PPpp"),
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/ops/control">
                        <Button variant="ghost" className="p-0">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        3D Printing Service Requests
                    </h1>
                </div>
            </div>

            <FormResponseViewer
                title="3D Printing Service Requests"
                responses={responses}
                columns={columns}
                detailsColumns={detailsColumns}
                isLoading={isLoading}
                error={error || undefined}
                onDelete={handleDelete}
            />
        </div>
    );
}
