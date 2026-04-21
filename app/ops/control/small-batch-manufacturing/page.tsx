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
import { format } from "date-fns";
import {
    ArrowLeft,
    Building2,
    ClipboardList,
    Download,
    Eye,
    Layers,
    Mail,
    MapPin,
    Phone,
    Search,
    Settings,
    User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarkViewed } from "@/hooks/use-mark-viewed";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

interface SmallBatchProduct {
    id: string;
    designFile: string;
    quantity: number;
    notes: string | null;
    technology: string;
    material: string;
    materialSubtype: string | null;
    colorMode: string;
    colors: string[];
}

interface SmallBatchRequest {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    company: string | null;
    createdAt: string;
    products: SmallBatchProduct[];
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

export default function SmallBatchManufacturingPage() {
    const [requests, setRequests] = useState<SmallBatchRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResponse, setSelectedResponse] =
        useState<SmallBatchRequest | null>(null);

    useMarkViewed("small-batch-manufacturing");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch("/api/small-batch-manufacturing");
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRequests = requests.filter((r) =>
        [r.fullName, r.email, r.company].some((v) =>
            v?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    if (isLoading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/ops/control">
                        <Button
                            variant="ghost"
                            className="p-0 hover:bg-transparent"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                        Manufacturing Manifests
                    </h1>
                </div>
            </div>

            <Card className="rounded-[32px] border-none shadow-2xl ring-1 ring-gray-100 overflow-hidden bg-white">
                <CardHeader className="bg-white border-b px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-lg font-black">
                            Production Queue
                        </CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm || ""}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-xl border-gray-200 h-11"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <Table>
                            <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                                <TableRow>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Client
                                    </TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Parts
                                    </TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Total Qty
                                    </TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Submitted
                                    </TableHead>
                                    <TableHead className="text-right px-8">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((r) => (
                                    <TableRow
                                        key={r.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <TableCell className="py-5 px-8 font-bold text-sm">
                                            {r.fullName}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-xs font-medium text-gray-500">
                                            {r.products?.length || 0} Part(s)
                                        </TableCell>
                                        <TableCell className="py-5 px-8 font-black text-sm text-blue-600">
                                            {r.products?.reduce(
                                                (acc, p) =>
                                                    acc + (p.quantity || 0),
                                                0,
                                            )}{" "}
                                            Units
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-xs font-medium text-gray-500">
                                            {format(
                                                new Date(r.createdAt),
                                                "PPp",
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg font-black text-[10px] uppercase tracking-widest border-gray-300 hover:bg-black hover:text-white"
                                                onClick={() =>
                                                    setSelectedResponse(r)
                                                }
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-2" />{" "}
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog
                open={!!selectedResponse}
                onOpenChange={() => setSelectedResponse(null)}
            >
                <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[40px] border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-black text-white relative">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
                            <ClipboardList className="h-6 w-6 text-gray-400" />{" "}
                            Manufacturing Brief
                        </DialogTitle>
                        <p className="text-gray-400 text-[10px] mt-2 font-mono uppercase tracking-[0.3em]">
                            REF: {selectedResponse?.id} •{" "}
                            {selectedResponse?.createdAt &&
                                format(
                                    new Date(selectedResponse.createdAt),
                                    "PPP",
                                )}
                        </p>
                    </DialogHeader>

                    <ScrollArea className="max-h-[75vh] p-10 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            {/* CLIENT & SHIPPING SECTION */}
                            <div className="md:col-span-4 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                        Client Profile
                                    </h3>
                                    <div className="space-y-3">
                                        <DetailItem
                                            label="Full Name"
                                            value={selectedResponse?.fullName}
                                            icon={User}
                                        />
                                        <DetailItem
                                            label="Email"
                                            value={selectedResponse?.email}
                                            icon={Mail}
                                        />
                                        <DetailItem
                                            label="Phone"
                                            value={selectedResponse?.phone}
                                            icon={Phone}
                                        />
                                        <DetailItem
                                            label="Company"
                                            value={selectedResponse?.company}
                                            icon={Building2}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                        Logistics
                                    </h3>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="flex gap-2 text-gray-400 mb-2">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                Ship To
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed">
                                            {selectedResponse?.address}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PRODUCT MANIFEST SECTION */}
                            <div className="md:col-span-8 space-y-4">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Product Manifest
                                </h3>
                                <div className="grid gap-4">
                                    {selectedResponse?.products?.map((p, i) => (
                                        <div
                                            key={p.id}
                                            className="p-6 border rounded-[28px] bg-white ring-1 ring-gray-100 shadow-sm space-y-4"
                                        >
                                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                                    Part #{i + 1}
                                                </span>
                                                <span className="bg-black text-white px-3 py-1 rounded-lg font-black text-xs">
                                                    {p.quantity} Units
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                            Technical Specs
                                                        </p>
                                                        <p className="text-xs font-black flex items-center gap-2">
                                                            <Settings className="h-3 w-3" />{" "}
                                                            {p.technology}
                                                            <Layers className="h-3 w-3 ml-2" />{" "}
                                                            {p.material}{" "}
                                                            {p.materialSubtype &&
                                                                `(${p.materialSubtype})`}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                            Color Configuration
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-700">
                                                            {p.colors.join(
                                                                ", ",
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                        Engineering File
                                                    </p>
                                                    <a
                                                        href={p.designFile}
                                                        target="_blank"
                                                        className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-xl hover:border-black transition-all group"
                                                    >
                                                        <Download className="h-4 w-4 text-blue-500 group-hover:text-black" />
                                                        <span className="text-[10px] font-black text-gray-600 truncate">
                                                            {getFileNameFromUrl(
                                                                p.designFile,
                                                            )}
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                            {p.notes && (
                                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-1">
                                                        Production Notes
                                                    </p>
                                                    <p className="text-[11px] font-bold text-amber-900 italic leading-relaxed">
                                                        {p.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailItem({ label, value, icon: Icon }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
                <Icon className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <p className="text-sm font-bold text-gray-900 px-1">
                {value || "N/A"}
            </p>
        </div>
    );
}
