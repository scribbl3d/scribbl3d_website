"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getColorOrTexture } from "@/lib/color-mappings";
import { Product as PrismaProduct } from "@prisma/client";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Example fixed options for category and tileType
const CATEGORY_OPTIONS = ["PLAplus", "ABS", "PETG", "NYLON", "TPU"];
const TILE_TYPE_OPTIONS = ["A", "B"];

// Add this constant for finish types
const FINISH_TYPES = [
    "Matte",
    "Gloss",
    "Silk",
    "Special Grade",
    "ABS",
    "PETG",
    "NYLON",
    "TPU",
];

interface Product extends PrismaProduct {
    description: string | null;
    features: string[];
    productDetails: string[];
    productdesc: string | null;
    sizeData: any;
}

interface ProductFormProps {
    product: Product | null;
    onSave?: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ColorData {
    name: string;
    hexCode: string;
    category: string;
}

export default function ProductForm({
    product,
    onSave,
    open,
    onOpenChange,
}: ProductFormProps) {
    const [formData, setFormData] = useState<{
        name: string;
        price: string;
        originalPrice: string;
        color: string;
        category: string;
        tileType: string;
        length: string;
        breadth: string;
        height: string;
        weight: string;
        description: string;
        features: string[];
        productDetails: string[];
        productdesc: string;
    }>({
        name: "",
        price: "",
        originalPrice: "",
        color: "",
        category: "",
        tileType: "",
        length: "",
        breadth: "",
        height: "",
        weight: "",
        description: "",
        features: [],
        productDetails: [],
        productdesc: "",
    });
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newFeature, setNewFeature] = useState("");
    const [newDetail, setNewDetail] = useState("");
    const { toast } = useToast();

    const [colorData, setColorData] = useState<ColorData>({
        name: "",
        hexCode: "#000000",
        category: "",
    });
    const [availableColors, setAvailableColors] = useState<
        Record<string, string[]>
    >({});
    const [isLoadingColors, setIsLoadingColors] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price.toString(),
                originalPrice: product.originalPrice.toString(),
                color: product.color,
                category: product.category,
                tileType: product.tileType,
                length: product.length?.toString() || "",
                breadth: product.breadth?.toString() || "",
                height: product.height?.toString() || "",
                weight: product.weight?.toString() || "",
                description: product.description || "",
                features: Array.isArray(product.features)
                    ? product.features
                    : [],
                productDetails: Array.isArray(product.productDetails)
                    ? product.productDetails
                    : [],
                productdesc: product.productdesc || "",
            });
            // Only use valid URLs for preview after save
            setPreviewUrls(
                Array.isArray(product.images)
                    ? product.images.filter(
                          (img) =>
                              typeof img === "string" && img.startsWith("/")
                      )
                    : []
            );
            setImages([]); // Clear local images after save
        } else {
            setFormData({
                name: "",
                price: "",
                originalPrice: "",
                color: "",
                category: "",
                tileType: "",
                length: "",
                breadth: "",
                height: "",
                weight: "",
                description: "",
                features: [],
                productDetails: [],
                productdesc: "",
            });
            setImages([]);
            setPreviewUrls([]);
        }
    }, [product]);

    useEffect(() => {
        const fetchAvailableColors = async () => {
            if (formData.category) {
                setIsLoadingColors(true);
                try {
                    const response = await fetch(
                        `/api/available-colors?category=${formData.category}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setAvailableColors(data.colors);
                    }
                } catch (error) {
                    console.error("Error fetching available colors:", error);
                } finally {
                    setIsLoadingColors(false);
                }
            }
        };

        fetchAvailableColors();
    }, [formData.category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (
                !formData.name ||
                !formData.price ||
                !formData.originalPrice ||
                !formData.color ||
                !formData.category ||
                !formData.tileType
            ) {
                toast({
                    title: "Error",
                    description: "Please fill all required fields.",
                    variant: "destructive",
                });
                return;
            }

            if (
                Number(formData.price) < 1 ||
                Number(formData.originalPrice) < 1
            ) {
                toast({
                    title: "Error",
                    description:
                        "Price and Original Price must be greater than 0.",
                    variant: "destructive",
                });
                return;
            }

            if (Number(formData.price) > Number(formData.originalPrice)) {
                toast({
                    title: "Error",
                    description: "Price cannot be greater than Original Price.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            const formDataToSend = new FormData();
            formDataToSend.append(
                "productData",
                JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    originalPrice: Number(formData.originalPrice),
                    length: formData.length
                        ? Number(formData.length)
                        : undefined,
                    breadth: formData.breadth
                        ? Number(formData.breadth)
                        : undefined,
                    height: formData.height
                        ? Number(formData.height)
                        : undefined,
                    weight: formData.weight
                        ? Number(formData.weight)
                        : undefined,
                    features: formData.features,
                    productDetails: formData.productDetails,
                    productdesc: formData.productdesc,
                })
            );
            images.forEach((image) => {
                formDataToSend.append("images", image);
            });
            if (product && Array.isArray(product.images)) {
                formDataToSend.append(
                    "keepImages",
                    JSON.stringify(product.images)
                );
            }

            // Use env variable for API base URL if available
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
            const url = product
                ? `${API_BASE}/api/products/${product.id}`
                : `${API_BASE}/api/products`;
            const method = product ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error("Failed to save product");
            }

            toast({
                title: "Success",
                description: `Product ${product ? "updated" : "added"} successfully.`,
            });

            if (onSave) onSave();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save product:", error);
            toast({
                title: "Error",
                description: "Failed to save product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImages((prev) => [...prev, ...files]);

        // Create preview URLs
        const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    };

    const handleImageDelete = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const calculateDiscount = () => {
        if (!formData.price || !formData.originalPrice) return 0;
        const price = Number(formData.price);
        const originalPrice = Number(formData.originalPrice);
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const handleAddColor = async () => {
        if (!colorData.name || !colorData.hexCode || !colorData.category) {
            toast({
                title: "Error",
                description: "Please fill all color fields",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch("/api/available-colors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category: formData.category, // product category
                    colorName: colorData.name,
                    hexCode: colorData.hexCode,
                    finishType: colorData.category, // pass finish type
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add color");
            }

            // Refresh available colors
            const updatedResponse = await fetch(
                `/api/available-colors?category=${formData.category}`
            );
            if (updatedResponse.ok) {
                const data = await updatedResponse.json();
                setAvailableColors(data.colors);
            }

            toast({
                title: "Success",
                description: "Color added successfully",
            });

            // Reset color form
            setColorData({
                name: "",
                hexCode: "#000000",
                category: colorData.category,
            });
        } catch (error) {
            console.error("Error adding color:", error);
            toast({
                title: "Error",
                description: "Failed to add color",
                variant: "destructive",
            });
        }
    };

    const handleRemoveColor = async (category: string, colorName: string) => {
        try {
            const response = await fetch("/api/available-colors", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category,
                    colorName,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to remove color");
            }

            // Refresh available colors
            const updatedResponse = await fetch(
                `/api/available-colors?category=${category}`
            );
            if (updatedResponse.ok) {
                const data = await updatedResponse.json();
                setAvailableColors(data.colors);
            }

            toast({
                title: "Success",
                description: "Color removed successfully",
            });
        } catch (error) {
            console.error("Error removing color:", error);
            toast({
                title: "Error",
                description: "Failed to remove color",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold mb-2">
                        {product
                            ? "Edit Filament Product"
                            : "Add New Filament Product"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Product Information */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Basic Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-base">
                                        Product Name
                                    </Label>
                                    <Input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter product name"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label
                                            htmlFor="price"
                                            className="text-base"
                                        >
                                            Price (₹)
                                        </Label>
                                        <Input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            required
                                            min={1}
                                            placeholder="Enter price"
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="originalPrice"
                                            className="text-base"
                                        >
                                            Original Price (₹)
                                        </Label>
                                        <Input
                                            type="number"
                                            id="originalPrice"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            required
                                            min={1}
                                            placeholder="Enter original price"
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Discount</Label>
                                    <Input
                                        type="text"
                                        value={`${calculateDiscount()}%`}
                                        readOnly
                                        className="mt-1.5 bg-muted"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Product Images
                            </h3>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                                    <Input
                                        type="file"
                                        id="images"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="cursor-pointer"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Upload product images (drag and drop
                                        supported)
                                    </p>
                                </div>
                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group flex flex-col items-center"
                                            >
                                                <Image
                                                    src={url}
                                                    unoptimized={true} // Key prop
                                                    alt={`Preview ${index + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "/placeholder.png";
                                                    }}
                                                />
                                                {index === 0 && (
                                                    <span className="absolute top-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                                                        Main
                                                    </span>
                                                )}
                                                <div className="flex gap-1 mt-2">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            if (index > 0) {
                                                                setPreviewUrls(
                                                                    (prev) => {
                                                                        const imgs =
                                                                            [
                                                                                ...prev,
                                                                            ];
                                                                        [
                                                                            imgs[
                                                                                index -
                                                                                    1
                                                                            ],
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                        ] = [
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                            imgs[
                                                                                index -
                                                                                    1
                                                                            ],
                                                                        ];
                                                                        return imgs;
                                                                    }
                                                                );
                                                                setImages(
                                                                    (prev) => {
                                                                        const imgs =
                                                                            [
                                                                                ...prev,
                                                                            ];
                                                                        [
                                                                            imgs[
                                                                                index -
                                                                                    1
                                                                            ],
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                        ] = [
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                            imgs[
                                                                                index -
                                                                                    1
                                                                            ],
                                                                        ];
                                                                        return imgs;
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                        disabled={index === 0}
                                                    >
                                                        ↑
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            if (
                                                                index <
                                                                previewUrls.length -
                                                                    1
                                                            ) {
                                                                setPreviewUrls(
                                                                    (prev) => {
                                                                        const imgs =
                                                                            [
                                                                                ...prev,
                                                                            ];
                                                                        [
                                                                            imgs[
                                                                                index +
                                                                                    1
                                                                            ],
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                        ] = [
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                            imgs[
                                                                                index +
                                                                                    1
                                                                            ],
                                                                        ];
                                                                        return imgs;
                                                                    }
                                                                );
                                                                setImages(
                                                                    (prev) => {
                                                                        const imgs =
                                                                            [
                                                                                ...prev,
                                                                            ];
                                                                        [
                                                                            imgs[
                                                                                index +
                                                                                    1
                                                                            ],
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                        ] = [
                                                                            imgs[
                                                                                index
                                                                            ],
                                                                            imgs[
                                                                                index +
                                                                                    1
                                                                            ],
                                                                        ];
                                                                        return imgs;
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            index ===
                                                            previewUrls.length -
                                                                1
                                                        }
                                                    >
                                                        ↓
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() =>
                                                            handleImageDelete(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Product Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="description"
                                        className="text-base"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Enter product description"
                                        className="min-h-[100px] mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="color"
                                        className="text-base"
                                    >
                                        Color
                                    </Label>
                                    <Input
                                        type="text"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter color"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="category"
                                        className="text-base"
                                    >
                                        Category
                                    </Label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1.5"
                                    >
                                        <option value="">
                                            Select category
                                        </option>
                                        {CATEGORY_OPTIONS.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="tileType"
                                        className="text-base"
                                    >
                                        Tile Type
                                    </Label>
                                    <select
                                        id="tileType"
                                        name="tileType"
                                        value={formData.tileType}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1.5"
                                    >
                                        <option value="">
                                            Select tile type
                                        </option>
                                        {TILE_TYPE_OPTIONS.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Product Dimensions */}
                        {/* Removed dimensions input section as per requirements */}
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                        <Label className="text-base">Features</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add a feature"
                            />
                            <Button
                                type="button"
                                onClick={() => {
                                    if (newFeature.trim()) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            features: [
                                                ...prev.features,
                                                newFeature.trim(),
                                            ],
                                        }));
                                        setNewFeature("");
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                        <ul className="list-disc pl-5">
                            {formData.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    {f}
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                features: prev.features.filter(
                                                    (_, idx) => idx !== i
                                                ),
                                            }))
                                        }
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-2">
                        <Label className="text-base">Product Details</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={newDetail}
                                onChange={(e) => setNewDetail(e.target.value)}
                                placeholder="Add a product detail"
                            />
                            <Button
                                type="button"
                                onClick={() => {
                                    if (newDetail.trim()) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            productDetails: [
                                                ...prev.productDetails,
                                                newDetail.trim(),
                                            ],
                                        }));
                                        setNewDetail("");
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                        <ul className="list-disc pl-5">
                            {formData.productDetails.map((d, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    {d}
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                productDetails:
                                                    prev.productDetails.filter(
                                                        (_, idx) => idx !== i
                                                    ),
                                            }))
                                        }
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product Description (Long) */}
                    <div className="space-y-2">
                        <Label className="text-base">
                            Material/Product Description
                        </Label>
                        <Textarea
                            value={formData.productdesc}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    productdesc: e.target.value,
                                }))
                            }
                            placeholder="Enter material or product description"
                            className="min-h-[60px]"
                        />
                    </div>

                    {/* Color Management Section */}
                    <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">
                            Color Management
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label
                                        htmlFor="colorName"
                                        className="text-base"
                                    >
                                        Color Name
                                    </Label>
                                    <Input
                                        type="text"
                                        id="colorName"
                                        value={colorData.name}
                                        onChange={(e) =>
                                            setColorData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter color name"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="hexCode"
                                        className="text-base"
                                    >
                                        Hex Code
                                    </Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            type="color"
                                            id="hexCode"
                                            value={colorData.hexCode}
                                            onChange={(e) =>
                                                setColorData((prev) => ({
                                                    ...prev,
                                                    hexCode: e.target.value,
                                                }))
                                            }
                                            className="w-12 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={colorData.hexCode}
                                            onChange={(e) =>
                                                setColorData((prev) => ({
                                                    ...prev,
                                                    hexCode: e.target.value,
                                                }))
                                            }
                                            placeholder="#000000"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="colorCategory"
                                        className="text-base"
                                    >
                                        Color Category
                                    </Label>
                                    <select
                                        id="colorCategory"
                                        value={colorData.category}
                                        onChange={(e) =>
                                            setColorData((prev) => ({
                                                ...prev,
                                                category: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1.5"
                                    >
                                        <option value="">
                                            Select category
                                        </option>
                                        {FINISH_TYPES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddColor}
                                disabled={isLoadingColors}
                                className="w-full"
                            >
                                {isLoadingColors && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Add Color
                            </Button>

                            {/* Display Available Colors */}
                            {Object.entries(availableColors).map(
                                ([category, colors]) => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="font-medium">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-6 gap-2">
                                            {colors.map((color) => (
                                                <div
                                                    key={color}
                                                    className="flex items-center gap-2 p-2 border rounded-md"
                                                >
                                                    <div
                                                        className="w-6 h-6 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                (() => {
                                                                    const {
                                                                        type,
                                                                        value,
                                                                    } =
                                                                        getColorOrTexture(
                                                                            color
                                                                        );
                                                                    return type ===
                                                                        "texture"
                                                                        ? "transparent"
                                                                        : value;
                                                                })(),
                                                        }}
                                                    />
                                                    <span className="flex-1 text-sm truncate">
                                                        {color}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveColor(
                                                                category,
                                                                color
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="px-8"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8"
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {product ? "Update Product" : "Add Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
