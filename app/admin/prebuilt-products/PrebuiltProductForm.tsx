"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { PrebuiltProduct, ProductSize } from "@prisma/client";
import { ArrowDown, ArrowUp, Loader2, Plus, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SizeData {
    name: string;
    price: number;
    originalPrice: number;
    sizeType: "standard" | "fractional" | "custom";
}

interface PrebuiltProductWithSizes extends PrebuiltProduct {
    sizes: ProductSize[];
}

interface PrebuiltProductFormProps {
    product: PrebuiltProductWithSizes | null;
    onSave?: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PrebuiltProductForm({
    product,
    onSave,
    open,
    onOpenChange,
}: PrebuiltProductFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        originalPrice: 0,
        description: "",
        isCustomizable: false,
        category: "",
        highlighted: false,
        images: [] as string[],
        features: [] as string[],
        productDetails: [] as string[],
        productdesc: "",
        length: 0,
        breadth: 0,
        height: 0,
        weight: 0,
        sizes: [] as SizeData[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newFeature, setNewFeature] = useState("");
    const [newDetail, setNewDetail] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                description: product.description,
                isCustomizable: product.isCustomizable,
                category: product.category,
                highlighted: product.highlighted,
                images: product.images,
                features: product.features,
                productDetails: product.productDetails,
                productdesc: product.productdesc || "",
                length: product.length || 0,
                breadth: product.breadth || 0,
                height: product.height || 0,
                weight: product.weight || 0,
                sizes:
                    product.sizes?.map((size) => ({
                        name: size.name,
                        price: size.price,
                        originalPrice: size.originalPrice,
                        sizeType: size.sizeType as
                            | "standard"
                            | "fractional"
                            | "custom",
                    })) || [],
            });
        } else {
            setFormData({
                name: "",
                price: 0,
                originalPrice: 0,
                description: "",
                isCustomizable: false,
                category: "",
                highlighted: false,
                images: [],
                features: [],
                productDetails: [],
                productdesc: "",
                length: 0,
                breadth: 0,
                height: 0,
                weight: 0,
                sizes: [],
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.price <= 0 || formData.originalPrice <= 0) {
            toast({
                title: "Error",
                description:
                    "Product Price and Original Price must be greater than 0.",
                variant: "destructive",
            });
            return;
        }
        const invalidSize = formData.sizes.find(
            (size) => size.price <= 0 || size.originalPrice <= 0
        );
        if (invalidSize) {
            toast({
                title: "Error",
                description:
                    "All sizes must have Price and Original Price greater than 0.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            const url = product
                ? `/api/prebuilt-products/${product.id}`
                : "/api/prebuilt-products";
            const method = product ? "PUT" : "POST";

            const { ...rest } = formData;
            const dataToSend = {
                ...rest,
                images: formData.images,
                availableSizes: formData.sizes.map((s) => s.name),
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error("Failed to save product");
            }

            if (onSave) onSave();
            onOpenChange(false);
        } catch {
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
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : type === "number"
                      ? value === ""
                          ? ""
                          : Number(value)
                      : value,
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData((prev) => ({
                ...prev,
                features: [...prev.features, newFeature.trim()],
            }));
            setNewFeature("");
        }
    };

    const removeFeature = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const addDetail = () => {
        if (newDetail.trim()) {
            setFormData((prev) => ({
                ...prev,
                productDetails: [...prev.productDetails, newDetail.trim()],
            }));
            setNewDetail("");
        }
    };

    const removeDetail = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            productDetails: prev.productDetails.filter((_, i) => i !== index),
        }));
    };

    const addSize = () => {
        setFormData((prev) => ({
            ...prev,
            sizes: [
                ...prev.sizes,
                {
                    name: "",
                    price: 0,
                    originalPrice: 0,
                    sizeType: "standard",
                },
            ],
        }));
    };

    const updateSize = (
        index: number,
        field: keyof SizeData,
        value: string | number
    ) => {
        setFormData((prev) => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === index
                    ? {
                          ...size,
                          [field]:
                              field === "sizeType"
                                  ? value
                                  : field === "name"
                                    ? String(value)
                                    : value === ""
                                      ? ""
                                      : Number(value),
                      }
                    : size
            ),
        }));
    };

    const removeSize = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index),
        }));
    };
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        toast({
            title: "Upload disabled",
            description:
                "Image upload is temporarily disabled. Please use existing images.",
            variant: "destructive",
        });
        return;
    };

    // const handleImageUpload = async (
    //     e: React.ChangeEvent<HTMLInputElement>
    // ) => {
    //     const files = e.target.files;
    //     if (!files || files.length === 0) return;

    //     const file = files[0];
    //     const uploadFormData = new FormData();
    //     uploadFormData.append("file", file);
    //     uploadFormData.append("productName", formData.name);

    //     try {
    //         const response = await fetch(
    //             "/api/prebuilt-products/upload-image",
    //             {
    //                 method: "POST",
    //                 body: uploadFormData,
    //             }
    //         );

    //         if (!response.ok) {
    //             throw new Error("Failed to upload image");
    //         }

    //         const data = await response.json();
    //         setFormData((prev) => ({
    //             ...prev,
    //             images: [...prev.images, data.imageUrl],
    //         }));
    //     } catch {
    //         toast({
    //             title: "Error",
    //             description: "Failed to upload image. Please try again.",
    //             variant: "destructive",
    //         });
    //     }
    // };

    const handleImageDelete = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold mb-2">
                        {product
                            ? "Edit Prebuilt Product"
                            : "Add New Prebuilt Product"}
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
                                        type="file"
                                        id="images"
                                        disabled
                                        accept="image/*"
                                        className="cursor-not-allowed opacity-60"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Image upload is temporarily disabled.
                                    </p>

                                    {/* <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                    className="mt-1.5"
                  /> */}
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
                                    <Label
                                        htmlFor="category"
                                        className="text-base"
                                    >
                                        Category
                                    </Label>
                                    <Input
                                        type="text"
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter category"
                                        className="mt-1.5"
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
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="cursor-pointer"
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Upload product images (drag and drop
                                        supported)
                                    </p>
                                </div>
                                {formData.images.length === 0 ? (
                                    <div className="col-span-4 text-muted-foreground text-sm p-4 text-center border rounded-lg">
                                        No images uploaded yet
                                    </div>
                                ) : (
                                    formData.images.map((image, index) => (
                                        <div
                                            key={`image-${index}`}
                                            className="relative group flex flex-col items-center"
                                        >
                                            <Image
                                                src={image}
                                                alt={`Image ${index + 1}`}
                                                width={200}
                                                height={200}
                                                unoptimized={true} // Key prop
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
                                                    <Star className="w-3 h-3" />{" "}
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
                                                            setFormData(
                                                                (prev) => {
                                                                    const imgs =
                                                                        [
                                                                            ...prev.images,
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
                                                                    return {
                                                                        ...prev,
                                                                        images: imgs,
                                                                    };
                                                                }
                                                            );
                                                        }
                                                    }}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (
                                                            index <
                                                            formData.images
                                                                .length -
                                                                1
                                                        ) {
                                                            setFormData(
                                                                (prev) => {
                                                                    const imgs =
                                                                        [
                                                                            ...prev.images,
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
                                                                    return {
                                                                        ...prev,
                                                                        images: imgs,
                                                                    };
                                                                }
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        index ===
                                                        formData.images.length -
                                                            1
                                                    }
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleImageDelete(index)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Descriptions */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Product Description
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="description"
                                        className="text-base"
                                    >
                                        Short Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter a brief product description"
                                        className="min-h-[100px] mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="productdesc"
                                        className="text-base"
                                    >
                                        Detailed Description
                                    </Label>
                                    <Textarea
                                        id="productdesc"
                                        name="productdesc"
                                        value={formData.productdesc}
                                        onChange={handleChange}
                                        placeholder="Enter detailed product description"
                                        className="min-h-[150px] mt-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Features & Details */}
                        <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">
                                Features & Details
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base mb-2 block">
                                        Features
                                    </Label>
                                    <div className="space-y-2">
                                        {formData.features.map(
                                            (feature, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 bg-background p-2 rounded-md"
                                                >
                                                    <span className="w-2 h-2 bg-primary rounded-full" />
                                                    <span className="flex-1">
                                                        {feature}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeFeature(index)
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )
                                        )}
                                        <div className="flex gap-2">
                                            <Input
                                                value={newFeature}
                                                onChange={(e) =>
                                                    setNewFeature(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Add new feature"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addFeature}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-base mb-2 block">
                                        Product Details
                                    </Label>
                                    <div className="space-y-2">
                                        {formData.productDetails.map(
                                            (detail, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 bg-background p-2 rounded-md"
                                                >
                                                    <span className="w-2 h-2 bg-primary rounded-full" />
                                                    <span className="flex-1">
                                                        {detail}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeDetail(index)
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )
                                        )}
                                        <div className="flex gap-2">
                                            <Input
                                                value={newDetail}
                                                onChange={(e) =>
                                                    setNewDetail(e.target.value)
                                                }
                                                placeholder="Add new detail"
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addDetail}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Sizes */}
                    <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">
                                Product Sizes
                            </h3>
                            <Button type="button" onClick={addSize} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Size
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {formData.sizes.map((size, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-5 gap-4 items-end bg-background p-4 rounded-lg"
                                >
                                    <div>
                                        <Label>Size Name</Label>
                                        <Input
                                            type="text"
                                            value={size.name}
                                            onChange={(e) =>
                                                updateSize(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Size name"
                                            required
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Price (₹)</Label>
                                        <Input
                                            type="number"
                                            value={size.price}
                                            onChange={(e) =>
                                                updateSize(
                                                    index,
                                                    "price",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Price"
                                            min={1}
                                            required
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Original Price (₹)</Label>
                                        <Input
                                            type="number"
                                            value={size.originalPrice}
                                            onChange={(e) =>
                                                updateSize(
                                                    index,
                                                    "originalPrice",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Original price"
                                            min={1}
                                            required
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>Size Type</Label>
                                        <select
                                            value={size.sizeType}
                                            onChange={(e) =>
                                                updateSize(
                                                    index,
                                                    "sizeType",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 mt-1.5"
                                            required
                                        >
                                            <option value="standard">
                                                Standard
                                            </option>
                                            <option value="fractional">
                                                Fractional
                                            </option>
                                            <option value="custom">
                                                Custom
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeSize(index)}
                                            className="w-full"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Settings */}
                    <div className="space-y-6 bg-muted/30 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">
                            Product Settings
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 p-4 bg-background rounded-lg">
                                <Checkbox
                                    id="isCustomizable"
                                    name="isCustomizable"
                                    checked={formData.isCustomizable}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            isCustomizable: checked as boolean,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor="isCustomizable"
                                    className="text-base cursor-pointer"
                                >
                                    Is Customizable
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-4 bg-background rounded-lg">
                                <Checkbox
                                    id="highlighted"
                                    name="highlighted"
                                    checked={formData.highlighted}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            highlighted: checked as boolean,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor="highlighted"
                                    className="text-base cursor-pointer"
                                >
                                    Highlight Product
                                </Label>
                            </div>
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
