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
import { Product } from "@prisma/client";
import { Edit, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";

// reusable search + sort component
import Pagination from "@/app/admin/_components/Pagination"; // ⬅️ add import here
import SearchSortControl from "@/app/admin/_components/SearchSortControl";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Search & Sort states
    const [searchTerm, setSearchTerm] = useState("");
    const [searchField, setSearchField] = useState("name");
    const [sortOption, setSortOption] = useState("");

    // Pagination states
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10; // default page size

    const { toast } = useToast();

    const fetchProducts = async () => {
        setIsLoading(true);

        const url = new URL(`/api/products`, window.location.origin);
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
        const data = await response.json();

        setProducts(data.products); // ARRAY, not whole response
        setTotalPages(data.totalPages); // meta from API
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [toast, page, searchTerm, searchField, sortOption]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setIsDeleting(true);
        setDeleteId(id);

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast({ title: "Success", description: "Product deleted." });
                fetchProducts();
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete product",
                    variant: "destructive",
                });
            }
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="relative space-y-6">
            {/* Search + Filter + Sort UI */}
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
                    { label: "Color", value: "color" },
                    { label: "Tile Type", value: "tileType" },
                ]}
                sortOptions={[
                    { label: "Name (A → Z)", value: "name-asc" },
                    { label: "Name (Z → A)", value: "name-desc" },
                    { label: "Price (Low → High)", value: "price-asc" },
                    { label: "Price (High → Low)", value: "price-desc" },
                    // enable also:
                    // { label: "Newest First", value: "date-desc" }
                    // { label: "Oldest First", value: "date-asc" }
                ]}
            />

            {/* Product Table */}
            <div className="rounded-md border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Tile Type</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center h-24"
                                >
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-gray-500 h-24"
                                >
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow
                                    key={product.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell>
                                        {product.images?.length > 0 ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                width={64}
                                                height={64}
                                                unoptimized
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        ₹{product.price.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.color}</TableCell>
                                    <TableCell>{product.tileType}</TableCell>

                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                                variant="destructive"
                                                size="sm"
                                                disabled={
                                                    isDeleting &&
                                                    deleteId === product.id
                                                }
                                            >
                                                {isDeleting &&
                                                deleteId === product.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination UI */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
            />

            <ProductForm
                product={editingProduct}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSave={fetchProducts}
            />
        </div>
    );
}
