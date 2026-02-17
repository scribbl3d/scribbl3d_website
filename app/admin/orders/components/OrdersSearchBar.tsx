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
    filterBy: "customer" | "amount" | "transaction" | "orderId";
    onFilterChange(
        value: "customer" | "amount" | "transaction" | "orderId",
    ): void;
}

export function OrdersSearchBar({
    search,
    onSearchChange,
    filterBy,
    onFilterChange,
}: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4 border rounded-lg p-3 bg-background">
            <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="sm:max-w-sm"
            />

            <Select value={filterBy} onValueChange={onFilterChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="transaction">Transaction ID</SelectItem>
                    <SelectItem value="orderId">Order ID</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
