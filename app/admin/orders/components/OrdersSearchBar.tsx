"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    search: string;
    onSearchChange(value: string): void;
    filterBy: "customer" | "amount";
    onFilterChange(value: "customer" | "amount"): void;
}

export function OrdersSearchBar({
    search,
    onSearchChange,
    filterBy,
    onFilterChange,
}: Props) {
    return (
        <div
            className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4
                rounded-lg "
        >
            <div className="flex gap-2 w-full sm:w-auto ">
                <Select value={filterBy} onValueChange={onFilterChange}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="customer">Customer Name</SelectItem>
                        <SelectItem value="amount">Total Amount</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder={`Search by ${
                        filterBy === "customer" ? "customer name" : "amount"
                    }`}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full sm:w-[260px]"
                />
            </div>
        </div>
    );
}
