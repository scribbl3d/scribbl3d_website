"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type { PrebuiltProduct, ProductSize } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PrebuiltProductForm from "./PrebuiltProductForm";

// Reusable Components
import Pagination from "@/app/admin/_components/Pagination";
import SearchSortControl from "@/app/admin/_components/SearchSortControl";

interface PrebuiltProductWithSizes extends PrebuiltProduct {
    sizes: ProductSize[];
}

export default function PrebuiltProductList() {
    const [prebuiltProducts, setPrebuiltProducts] = useState<
        PrebuiltProductWithSizes[]
    >([]);
    const [editingProduct, setEditingProduct] =
        useState<PrebuiltProductWithSizes | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Search + Sort
    const [searchTerm, setSearchTerm] = useState("");
    const [searchField, setSearchField] = useState("name");
    const [sortOption, setSortOption] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    const fetchPrebuiltProducts = useCallback(async () => {
        try {
            setIsLoading(true);

            const url = new URL(
                "/api/prebuilt-products",
                window.location.origin
            );
            url.searchParams.set("page", page.toString());
            url.searchParams.set("limit", LIMIT.toString());

            if (searchTerm) url.searchParams.set("search", searchTerm);
            if (searchField) url.searchParams.set("searchField", searchField);
            if (sortOption.includes("-")) {
                const [field, order] = sortOption.split("-");
                url.searchParams.set("sortBy", field);
                url.searchParams.set("order", order);
            }

            const response = await fetch(url.toString());
            if (!response.ok)
                throw new Error("Failed to fetch prebuilt products");

            const data = await response.json();
            setPrebuiltProducts(data.products || data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load products. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm, searchField, sortOption, toast]);

    useEffect(() => {
        fetchPrebuiltProducts();
    }, [fetchPrebuiltProducts]);

    const deletePrebuiltProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this prebuilt product?"))
            return;

        try {
            const response = await fetch(`/api/prebuilt-products/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchPrebuiltProducts();
                toast({
                    title: "Success",
                    description: "Product deleted successfully",
                });
            } else {
                throw new Error("Failed to delete product");
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete product. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (product: PrebuiltProductWithSizes) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                    Prebuilt Product List
                </h2>
                <Button onClick={handleAddNew} size="lg">
                    Add New Product
                </Button>
            </div>

            {/* Reusable Search + Sort Control */}
            <SearchSortControl
                searchField={searchField}
                setSearchField={setSearchField}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOption={sortOption}
                setSortOption={setSortOption}
                searchOptions={[
                    { label: "Name", value: "name" },
                    { label: "Price", value: "price" },
                    { label: "Category", value: "category" },
                    { label: "Tag", value: "tags" },
                ]}
                sortOptions={[
                    { label: "Name (A → Z)", value: "name-asc" },
                    { label: "Name (Z → A)", value: "name-desc" },
                    { label: "Price (Low → High)", value: "price-asc" },
                    { label: "Price (High → Low)", value: "price-desc" },
                    {
                        label: "Updated (Latest First)",
                        value: "updatedAt-desc",
                    },
                    {
                        label: "Updated (Earliest First)",
                        value: "updatedAt-asc",
                    },
                ]}
            />

            {/* Product Table */}
            <div className="rounded-md border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead className="w-[100px]">Price</TableHead>
                            <TableHead className="w-[150px]">
                                Category
                            </TableHead>
                            <TableHead className="w-[100px]">
                                Customizable
                            </TableHead>
                            <TableHead className="w-[100px]">
                                Highlighted
                            </TableHead>
                            <TableHead className="w-[150px]">
                                Dimensions
                            </TableHead>

                            {/* ⭐ NEW Updated At column */}
                            <TableHead className="w-[150px]">
                                Updated At
                            </TableHead>

                            <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center"
                                >
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <span className="ml-2">
                                            Loading products...
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !isLoading && prebuiltProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No products found. Add your first product!
                                </TableCell>
                            </TableRow>
                        ) : (
                            prebuiltProducts.map((product) => (
                                <TableRow
                                    key={product.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        ₹{product.price.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>

                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                product.isCustomizable
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {product.isCustomizable
                                                ? "Yes"
                                                : "No"}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                product.highlighted
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {product.highlighted ? "Yes" : "No"}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        {product.length &&
                                        product.breadth &&
                                        product.height
                                            ? `${product.length}×${product.breadth}×${product.height} cm`
                                            : "N/A"}
                                    </TableCell>

                                    {/* ⭐ NEW Updated At value */}
                                    <TableCell>
                                        {new Date(
                                            product.updatedAt
                                        ).toLocaleString("en-IN", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                                variant="outline"
                                                size="sm"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    deletePrebuiltProduct(
                                                        product.id
                                                    )
                                                }
                                                variant="destructive"
                                                size="sm"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
            />

            <PrebuiltProductForm
                product={editingProduct}
                onSave={() => {
                    setIsFormOpen(false);
                    fetchPrebuiltProducts();
                    toast({
                        title: "Success",
                        description: editingProduct
                            ? "Product updated successfully"
                            : "Product added successfully",
                    });
                }}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
            />
        </div>
    );
}
