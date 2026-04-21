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
    Eye,
    ListChecks,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Sparkles,
    User,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarkViewed } from "@/hooks/use-mark-viewed";

interface PersonaliseFormResponse {
    id: string;
    isAware: string;
    categories: string[];
    statueDetails: string;
    wantMore: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function PersonaliseResponsesPage() {
    const [responses, setResponses] = useState<PersonaliseFormResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResponse, setSelectedResponse] =
        useState<PersonaliseFormResponse | null>(null);

    useMarkViewed("personalise-responses");

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const response = await fetch("/api/personalise-form");
            if (response.ok) {
                const data = await response.json();
                setResponses(data);
            } else {
                setError("Failed to fetch personalise form responses");
            }
        } catch {
            setError("Error fetching personalise form responses");
        } finally {
            setIsLoading(false);
        }
    };

    const renderValue = (v: any) => {
        if (v === null || v === undefined || v === "")
            return <span className="text-gray-400 italic">Not Provided</span>;
        if (Array.isArray(v)) return v.join(", ");
        return String(v);
    };

    const filteredResponses = responses.filter((r) =>
        Object.values(r).some((v) =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="p-20 text-center animate-pulse font-bold text-gray-400">
                    Loading Personalise Form Responses...
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
                    <h1 className="text-2xl font-bold">
                        Personalise Product Requests
                    </h1>
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
                            Personalise Product Survey
                        </CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search responses..."
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
                                        Name
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Email
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Awareness
                                    </TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-gray-500 py-5 px-8">
                                        Interested Categories
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
                                {filteredResponses.map((response) => (
                                    <TableRow
                                        key={response.id}
                                        className="hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                                    >
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {renderValue(response.name)}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {renderValue(response.email)}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {renderValue(response.isAware)}
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            <span className="line-clamp-1">
                                                {renderValue(
                                                    response.categories,
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5 px-8 text-sm font-medium text-gray-700">
                                            {format(
                                                new Date(response.createdAt),
                                                "PPp",
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg font-bold border-gray-300 hover:bg-black hover:text-white transition-all shadow-sm"
                                                onClick={() =>
                                                    setSelectedResponse(response)
                                                }
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-2" />
                                                View Details
                                            </Button>
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
                                <Sparkles className="h-6 w-6 text-yellow-400" />
                                Personalise Product Response
                            </DialogTitle>
                            <p className="text-gray-400 text-xs mt-2 font-mono uppercase tracking-widest">
                                ID: {selectedResponse?.id} •{" "}
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
                            {/* SECTION: CONTACT INFO */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Contact Information
                                </h3>
                                <div className="grid gap-6">
                                    <DetailItem
                                        label="Name"
                                        value={selectedResponse?.name}
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
                                        label="User ID"
                                        value={selectedResponse?.userId}
                                        icon={Building2}
                                    />
                                </div>
                            </div>

                            {/* SECTION: SURVEY RESPONSES */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Survey Responses
                                </h3>
                                <div className="grid gap-6">
                                    <DetailItem
                                        label="Aware of Personalized Products"
                                        value={selectedResponse?.isAware}
                                        icon={ClipboardList}
                                    />
                                    <DetailItem
                                        label="Interested Categories"
                                        value={
                                            selectedResponse?.categories &&
                                            selectedResponse.categories
                                                .length > 0
                                                ? selectedResponse.categories.join(
                                                      ", ",
                                                  )
                                                : null
                                        }
                                        icon={ListChecks}
                                        fullWidth
                                    />
                                    <DetailItem
                                        label="Want More Products"
                                        value={selectedResponse?.wantMore}
                                        icon={MessageSquare}
                                    />
                                </div>
                            </div>

                            {/* SECTION: STATUE DETAILS */}
                            <div className="col-span-1 md:col-span-2 space-y-6 pt-4">
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-b pb-2">
                                    Custom Requirements
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">
                                        Statue / Product Details
                                    </p>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm leading-relaxed text-gray-700 min-h-[120px]">
                                        {selectedResponse?.statueDetails ||
                                            "No details provided."}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: METADATA */}
                            <div className="col-span-1 md:col-span-2 border-t pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                                    <div>
                                        <span className="font-bold">
                                            Submitted:
                                        </span>{" "}
                                        {selectedResponse?.createdAt &&
                                            format(
                                                new Date(
                                                    selectedResponse.createdAt,
                                                ),
                                                "PPpp",
                                            )}
                                    </div>
                                    <div>
                                        <span className="font-bold">
                                            Last Updated:
                                        </span>{" "}
                                        {selectedResponse?.updatedAt &&
                                            format(
                                                new Date(
                                                    selectedResponse.updatedAt,
                                                ),
                                                "PPpp",
                                            )}
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
