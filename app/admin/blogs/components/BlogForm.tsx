"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor"; // add this at top

interface BlogFormProps {
    blogId?: string;
}

export default function BlogForm({ blogId }: BlogFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        description: "",
        keywords: "",
        thumbnailImage: "",
        heroImage: "",
    });
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
    const [heroPreview, setHeroPreview] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (blogId) {
            setIsLoading(true);
            fetch(`/api/admin/blogs/${blogId}`)
                .then((res) => res.json())
                .then((data) => {
                    setFormData({
                        title: data.title,
                        content: data.content,
                        description: data.description,
                        keywords: data.keywords,
                        thumbnailImage: data.thumbnailImage, // New: set thumbnail image
                        heroImage: data.heroImage, // New: set hero image
                    });
                    setThumbnailPreview(data.thumbnailImage); // Set thumbnail preview
                    setHeroPreview(data.heroImage); // Set hero preview
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Failed to fetch blog post:", error);
                    setIsLoading(false);
                });
        }
    }, [blogId]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length > 255) {
            newErrors.title = "Title must be less than 255 characters";
        }

        if (!formData.content.trim()) {
            newErrors.content = "Content is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Short description is required";
        } else if (formData.description.length > 500) {
            newErrors.description =
                "Short description must be less than 500 characters";
        }

        if (!formData.keywords.trim()) {
            newErrors.keywords = "Keywords are required";
        } else if (formData.keywords.length > 255) {
            newErrors.keywords = "Keywords must be less than 255 characters";
        }

        // Only check that an image was uploaded, not that it's a valid URL
        if (!formData.thumbnailImage) {
            newErrors.thumbnailImage = "Thumbnail image is required";
        }
        if (!formData.heroImage) {
            newErrors.heroImage = "Hero image is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "thumbnail" | "hero"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const blogTitle = formData.title || "blog";
        const form = new FormData();
        form.append("file", file);
        form.append("type", type);
        form.append("blogTitle", blogTitle);
        const res = await fetch("/api/admin/blogs/upload-image", {
            method: "POST",
            body: form,
        });
        const data = await res.json();
        if (res.ok) {
            if (type === "thumbnail") {
                setFormData((prev) => ({
                    ...prev,
                    thumbnailImage: data.imageUrl,
                }));
                setThumbnailPreview(URL.createObjectURL(file));
            } else {
                setFormData((prev) => ({ ...prev, heroImage: data.imageUrl }));
                setHeroPreview(URL.createObjectURL(file));
            }
        } else {
            alert(data.error || "Failed to upload image");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            const url = blogId
                ? `/api/admin/blogs/${blogId}`
                : "/api/admin/blogs";
            const method = blogId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to save blog post");
            }

            router.push("/admin/blogs");
            router.refresh();
        } catch (err) {
            console.error("Error saving blog:", err);
            setErrors({
                form: err instanceof Error ? err.message : "An error occurred",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
                <Alert variant="destructive">
                    <AlertDescription>{errors.form}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={errors.description ? "border-red-500" : ""}
                    maxLength={500}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>

                <RichTextEditor
                    value={formData.content}
                    onChange={(html) => {
                        setFormData((prev) => ({ ...prev, content: html }));
                    }}
                />

                {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className={errors.keywords ? "border-red-500" : ""}
                />
                {errors.keywords && (
                    <p className="text-sm text-red-500">{errors.keywords}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="thumbnailImage">Thumbnail Image</Label>
                <Input
                    id="thumbnailImage"
                    name="thumbnailImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "thumbnail")}
                />
                {thumbnailPreview && (
                    <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-32 h-32 object-cover rounded mt-2"
                    />
                )}
                {errors.thumbnailImage && (
                    <p className="text-sm text-red-500">
                        {errors.thumbnailImage}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="heroImage">Hero Image</Label>
                <Input
                    id="heroImage"
                    name="heroImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "hero")}
                />
                {heroPreview && (
                    <img
                        src={heroPreview}
                        alt="Hero Preview"
                        className="w-full max-w-xl h-40 object-cover rounded mt-2"
                    />
                )}
                {errors.heroImage && (
                    <p className="text-sm text-red-500">{errors.heroImage}</p>
                )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                    ? "Saving..."
                    : blogId
                      ? "Update Blog Post"
                      : "Create Blog Post"}
            </Button>
        </form>
    );
}
