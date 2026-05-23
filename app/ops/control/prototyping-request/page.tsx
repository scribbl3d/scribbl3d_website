"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    ArrowLeft,
    Building2,
    ClipboardList,
    Download,
    Eye,
    FileText,
    Layers,
    Mail,
    MapPin,
    Package,
    Palette,
    Phone,
    Search,
    Settings,
    Trash2,
    User,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarkViewed } from "@/hooks/use-mark-viewed";

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
    address: string | null;
    createdAt: string;
    updatedAt: string;
}

const getFileNameFromUrl = (url: string): string => {
    if (!url) return "";
    try {
        const parts = url.split("/");
        return parts[parts.length - 1];
    } catch {
        return url;
    }
};

export default function PrototypingRequestsPage() {
    const [requests, setRequests] = useState<PrototypingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResponse, setSelectedResponse] =
        useState<PrototypingRequest | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useMarkViewed("prototyping-requests");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/prototyping-request");
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            } else {
                setError("Failed to fetch prototyping requests");
            }
        } catch {
            setError("Error fetching prototyping requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/prototyping-request/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");
            setRequests((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const renderValue = (v: any) => {
        if (v === null || v === undefined || v === "")
            return <span className="text-gray-400 italic">Not Provided</span>;
        if (Array.isArray(v)) return v.join(", ");
        return String(v);
    };

    const filteredRequests = requests.filter((r) => {
        const term = searchTerm.toLowerCase();
        return (
            (r.fullName || "").toLowerCase().includes(term) ||
            (r.email || "").toLowerCase().includes(term)
        );
    });

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="p-20 text-center animate-pulse font-bold text-gray-400">
                    Loading Prototyping Requests...
                </div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold">Prototyping Requests</h1>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <Card className="rounded-[24px] border-none ring-1 ring-gray-200 shadow-2xl bg-white overflow-y-hidden">
                <CardHeader className="bg-white border-b px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-2xl font-black tracking-tight">
                            Prototyping & Production
                        </CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm || ""}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-xl border-gray-200 h-11 shadow-sm"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-auto max-h-[650px]">
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Client
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Project Type
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Technology
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Material
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Files
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Submitted
                                    </TableHead>
                                    <TableHead className="text-right px-8">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow
                                        key={request.id}
                                        className="hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                                    >
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {renderValue(request.fullName)}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {request.projectType}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {request.technology}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {request.materialSubtype
                                                ? `${request.material} (${request.materialSubtype})`
                                                : request.material}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {request.designFiles?.length || 0}{" "}
                                            file(s)
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {format(
                                                new Date(request.createdAt),
                                                "PPp",
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg font-bold border-gray-300 hover:bg-black hover:text-white transition-all shadow-sm"
                                                    onClick={() =>
                                                        setSelectedResponse(request)
                                                    }
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg font-bold border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => handleDelete(request.id)}
                                                    disabled={deletingId === request.id}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    {deletingId === request.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={!!selectedResponse}
                onOpenChange={() => setSelectedResponse(null)}
            >
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-black text-white relative">
                        <button
                            onClick={() => setSelectedResponse(null)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div>
                            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                                <ClipboardList className="h-6 w-6 text-gray-400" />
                                Prototyping Request Details
                            </DialogTitle>
                            <p className="text-gray-400 text-xs mt-2 font-mono uppercase tracking-widest">
                                {selectedResponse?.createdAt &&
                                    format(
                                        new Date(selectedResponse.createdAt),
                                        "PPP",
                                    )}
                            </p>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="max-h-[75vh] p-4 sm:p-10 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                            {/* SECTION: CLIENT INFO */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Client Information
                                </h3>
                                <div className="grid gap-6">
                                    <DetailItem
                                        label="Full Name"
                                        value={selectedResponse?.fullName}
                                        icon={User}
                                    />
                                    <DetailItem
                                        label="Email Address"
                                        value={selectedResponse?.email}
                                        icon={Mail}
                                    />
                                    <DetailItem
                                        label="Phone Number"
                                        value={selectedResponse?.phone}
                                        icon={Phone}
                                    />
                                    <DetailItem
                                        label="Company"
                                        value={selectedResponse?.company}
                                        icon={Building2}
                                    />
                                    <DetailItem
                                        label="Shipping Address"
                                        value={selectedResponse?.address}
                                        icon={MapPin}
                                        fullWidth
                                    />
                                </div>
                            </div>

                            {/* SECTION: TECHNICAL SPECS */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Technical Specifications
                                </h3>
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem
                                            label="Technology"
                                            value={selectedResponse?.technology}
                                            icon={Settings}
                                        />
                                        <DetailItem
                                            label="Project Type"
                                            value={
                                                selectedResponse?.projectType
                                            }
                                            icon={Package}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem
                                            label="Base Material"
                                            value={selectedResponse?.material}
                                            icon={Layers}
                                        />
                                        <DetailItem
                                            label="Subtype"
                                            value={
                                                selectedResponse?.materialSubtype
                                            }
                                            icon={Layers}
                                        />
                                    </div>
                                    <DetailItem
                                        label="Colors"
                                        value={renderValue(
                                            selectedResponse?.colors,
                                        )}
                                        icon={Palette}
                                    />
                                    <DetailItem
                                        label="Quantity"
                                        value={
                                            selectedResponse?.quantityType ===
                                            "single"
                                                ? "1 Unit"
                                                : selectedResponse?.quantityNumber
                                        }
                                        icon={Package}
                                    />
                                </div>
                            </div>

                            {/* SECTION: FILES & NOTES */}
                            <div className="col-span-1 md:col-span-2 space-y-6 pt-4">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Files & Requirements
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">
                                        Engineering Files
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedResponse?.designFiles?.map(
                                            (url: string, i: number) => (
                                                <a
                                                    key={i}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-xl hover:border-black transition-all group shadow-sm"
                                                >
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-800 truncate max-w-[200px]">
                                                            {getFileNameFromUrl(url)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            Download Raw
                                                        </span>
                                                    </div>
                                                    <Download className="h-4 w-4 ml-4 text-gray-300 group-hover:text-black" />
                                                </a>
                                            ),
                                        )}
                                    </div>
                                    <div className="mt-8">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                                            Special Requirements / Notes
                                        </p>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm leading-relaxed text-gray-700 min-h-[80px]">
                                            {selectedResponse?.specialRequirements ||
                                                "No additional requirements provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailItem({ label, value, icon: Icon, fullWidth = false }: any) {
    return (
        <div className={cn("flex flex-col gap-1.5", fullWidth && "col-span-2")}>
            <div className="flex items-center gap-2 text-gray-400">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="text-sm font-bold text-gray-900 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100/50">
                {value || (
                    <span className="text-gray-300 italic font-medium">
                        N/A
                    </span>
                )}
            </div>
        </div>
    );
}
