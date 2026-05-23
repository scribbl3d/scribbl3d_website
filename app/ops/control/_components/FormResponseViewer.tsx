"use client";

import { format } from "date-fns";
import {
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
} from "lucide-react"; // All icons imported here
import { useState } from "react";

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

interface FormResponseViewerProps<T> {
    title: string;
    responses: T[];
    columns: {
        key: keyof T;
        label: string;
        render?: (value: any, item: T) => React.ReactNode;
    }[];
    detailsColumns: {
        key: keyof T;
        label: string;
        render?: (value: any, item: T) => React.ReactNode;
    }[];
    isLoading?: boolean;
    error?: string;
    onDelete?: (id: string) => Promise<void>;
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

export function FormResponseViewer<
    T extends { id: string; createdAt: string },
>({ title, responses, columns, isLoading, error, onDelete }: FormResponseViewerProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!onDelete) return;
        if (!confirm("Are you sure you want to delete this request? This action cannot be undone.")) return;
        setDeletingId(id);
        try {
            await onDelete(id);
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

    const filtered = responses.filter((r: any) => {
        const term = searchTerm.toLowerCase();
        const name = (r.fullName || r.firstName || "").toLowerCase();
        const lastName = (r.lastName || "").toLowerCase();
        const email = (r.email || "").toLowerCase();
        return name.includes(term) || lastName.includes(term) || email.includes(term);
    });

    if (isLoading)
        return (
            <div className="p-20 text-center animate-pulse font-bold text-gray-400">
                Loading Engineering Data...
            </div>
        );

    return (
        <Card className="rounded-[24px] border-none ring-1 ring-gray-200 shadow-2xl bg-white overflow-y-hidden">
            <CardHeader className="bg-white border-b px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-2xl font-black tracking-tight">
                        {title}
                    </CardTitle>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            // FIXED: value={searchTerm || ""} prevents the "uncontrolled to controlled" error
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
                                {columns.map((c: any) => (
                                    <TableHead
                                        key={c.key}
                                        className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8"
                                    >
                                        {c.label}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right px-8">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((r: any) => (
                                <TableRow
                                    key={r.id}
                                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                                >
                                    {columns.map((c: any) => (
                                        <TableCell
                                            key={c.key}
                                            className="py-5 px-8 text-sm font-medium text-gray-700"
                                        >
                                            {c.render
                                                ? c.render(r[c.key], r)
                                                : renderValue(r[c.key])}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right px-8">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg font-bold border-gray-300 hover:bg-black hover:text-white transition-all shadow-sm"
                                                onClick={() =>
                                                    setSelectedResponse(r)
                                                }
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-2" />
                                                View Details
                                            </Button>
                                            {onDelete && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg font-bold border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => handleDelete(r.id)}
                                                    disabled={deletingId === r.id}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    {deletingId === r.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

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
                                Detailed Project Brief
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </Card>
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
