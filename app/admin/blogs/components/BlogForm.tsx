"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    FileText,
    Globe,
    Loader2,
    RefreshCw,
    Sparkles,
    Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";

interface BlogFormProps {
    blogId?: string;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 255);
}

export default function BlogForm({ blogId }: BlogFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        description: "",
        keywords: "",
        slug: "",
        thumbnailImage: "", // Stores existing URL if editing
        heroImage: "", // Stores existing URL if editing
        published: false,
        featured: false,
    });

    // States to hold the actual files selected by the user before upload
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
    const [heroPreview, setHeroPreview] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isEdit = !!blogId;

    // Auto-generate slug from title unless user has manually edited it
    useEffect(() => {
        if (!slugManuallyEdited && formData.title) {
            setFormData((prev) => ({ ...prev, slug: slugify(formData.title) }));
        }
    }, [formData.title, slugManuallyEdited]);

    useEffect(() => {
        if (blogId) {
            setIsLoading(true);
            fetch(`/api/admin/blogs/${blogId}`)
                .then((res) => res.json())
                .then((data) => {
                    setFormData({
                        title: data.title ?? "",
                        content: data.content ?? "",
                        description: data.description ?? "",
                        keywords: data.keywords ?? "",
                        slug: data.slug ?? "",
                        thumbnailImage: data.thumbnailImage ?? "",
                        heroImage: data.heroImage ?? "",
                        published: data.published ?? false,
                        featured: data.featured ?? false,
                    });
                    if (data.slug) setSlugManuallyEdited(true);
                    setThumbnailPreview(data.thumbnailImage ?? "");
                    setHeroPreview(data.heroImage ?? "");
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

        if (!formData.slug.trim()) {
            newErrors.slug = "Slug is required";
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug =
                "Only lowercase letters, numbers, and hyphens allowed";
        }

        if (!formData.content.trim()) {
            newErrors.content = "Content is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Short description is required";
        } else if (formData.description.length > 500) {
            newErrors.description = "Must be less than 500 characters";
        }

        if (!formData.keywords.trim()) {
            newErrors.keywords = "Keywords are required";
        } else if (formData.keywords.length > 255) {
            newErrors.keywords = "Must be less than 255 characters";
        }

        // Validate that either a new file is selected OR an existing URL is present (for edits)
        if (!thumbnailFile && !formData.thumbnailImage)
            newErrors.thumbnailImage = "Thumbnail image is required";
        if (!heroFile && !formData.heroImage)
            newErrors.heroImage = "Hero image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugManuallyEdited(true);
        const cleaned = e.target.value
            .toLowerCase()
            .replace(/[^\w-]/g, "-")
            .replace(/-+/g, "-");
        setFormData((prev) => ({ ...prev, slug: cleaned }));
        if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
    };

    const regenerateSlug = () => {
        setSlugManuallyEdited(false);
        setFormData((prev) => ({ ...prev, slug: slugify(formData.title) }));
    };

    const handleToggle = (field: "published" | "featured") => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleImageSelection = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "thumbnail" | "hero",
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Save file to state and create a local preview URL instantly
        if (type === "thumbnail") {
            if (thumbnailPreview && thumbnailPreview.startsWith("blob:"))
                URL.revokeObjectURL(thumbnailPreview);
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
            if (errors.thumbnailImage)
                setErrors((prev) => ({ ...prev, thumbnailImage: "" }));
        } else {
            if (heroPreview && heroPreview.startsWith("blob:"))
                URL.revokeObjectURL(heroPreview);
            setHeroFile(file);
            setHeroPreview(URL.createObjectURL(file));
            if (errors.heroImage)
                setErrors((prev) => ({ ...prev, heroImage: "" }));
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

            // Construct FormData instead of JSON payload
            const submitData = new FormData();
            submitData.append("title", formData.title);
            submitData.append("content", formData.content);
            submitData.append("description", formData.description);
            submitData.append("keywords", formData.keywords);
            submitData.append("slug", formData.slug);
            submitData.append("published", String(formData.published));
            submitData.append("featured", String(formData.featured));

            if (formData.published) {
                submitData.append("publishedAt", new Date().toISOString());
            }

            // Append images. If a new file exists, send the File object.
            // Otherwise, send the existing URL string so the backend doesn't overwrite it.
            if (thumbnailFile) {
                submitData.append("thumbnailImage", thumbnailFile);
            } else if (formData.thumbnailImage) {
                submitData.append("thumbnailImage", formData.thumbnailImage);
            }

            if (heroFile) {
                submitData.append("heroImage", heroFile);
            } else if (formData.heroImage) {
                submitData.append("heroImage", formData.heroImage);
            }

            // fetch automatically sets the correct multipart/form-data boundary when passing FormData
            const response = await fetch(url, {
                method,
                body: submitData,
            });

            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Failed to save blog post");

            router.push("/ops/control/blogs");
            router.refresh();
        } catch (err) {
            setErrors({
                form: err instanceof Error ? err.message : "An error occurred",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px 0",
                    gap: 12,
                    color: "#aaa",
                    fontFamily: "'Lato', sans-serif",
                }}
            >
                <Loader2 className="animate-spin" size={18} />
                <span style={{ fontSize: 14 }}>Loading post…</span>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                fontFamily: "'Lato', sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}
        >
            {/* ── Submitting overlay ── */}
            <Dialog open={isSubmitting}>
                <DialogContent
                    className="sm:max-w-md"
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <VisuallyHidden>
                        <DialogTitle>
                            {isEdit
                                ? "Updating Blog Post"
                                : "Creating Blog Post"}
                        </DialogTitle>
                    </VisuallyHidden>
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                        <Loader2
                            className="animate-spin"
                            size={40}
                            style={{ color: "#F5A524" }}
                        />
                        <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                            {isEdit ? "Updating Post…" : "Creating Post…"}
                        </h2>
                        <p style={{ fontSize: 14, color: "#888" }}>
                            Please do not close this window.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Global error ── */}
            {errors.form && (
                <div
                    style={{
                        background: "#fef2f2",
                        border: "1.5px solid #fca5a5",
                        borderRadius: 12,
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#dc2626",
                    }}
                >
                    {errors.form}
                </div>
            )}

            {/* ════════ SECTION: Basic Info ════════ */}
            <FormSection
                title="Basic Information"
                icon={<FileText size={14} />}
            >
                <FormField
                    label="Title"
                    required
                    error={errors.title}
                    counter={{ current: formData.title.length, max: 255 }}
                >
                    <StyledInput
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter a compelling blog title…"
                        hasError={!!errors.title}
                    />
                </FormField>

                <FormField
                    label="URL Slug"
                    required
                    error={errors.slug}
                    hint={
                        <span
                            style={{
                                fontFamily: "monospace",
                                fontSize: 11,
                                color: "#aaa",
                            }}
                        >
                            /blog/
                            <strong style={{ color: "#F5A524" }}>
                                {formData.slug || "your-slug"}
                            </strong>
                        </span>
                    }
                >
                    <div style={{ position: "relative" }}>
                        <input
                            value={formData.slug}
                            onChange={handleSlugChange}
                            placeholder="auto-generated-from-title"
                            style={{
                                width: "100%",
                                padding: "11px 44px 11px 14px",
                                border: `1.5px solid ${errors.slug ? "#ef4444" : "#E8E3D9"}`,
                                borderRadius: 12,
                                fontSize: 13,
                                color: "#111",
                                background: "#fff",
                                outline: "none",
                                fontFamily: "monospace",
                            }}
                        />
                        <button
                            type="button"
                            onClick={regenerateSlug}
                            title="Re-generate from title"
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#F5A524",
                                display: "flex",
                                padding: 4,
                            }}
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </FormField>

                <FormField
                    label="Short Description"
                    required
                    error={errors.description}
                    counter={{ current: formData.description.length, max: 500 }}
                >
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="A brief summary shown on the blog listing page…"
                        rows={3}
                        maxLength={500}
                        style={{
                            width: "100%",
                            padding: "11px 14px",
                            border: `1.5px solid ${errors.description ? "#ef4444" : "#E8E3D9"}`,
                            borderRadius: 12,
                            fontSize: 14,
                            color: "#111",
                            background: "#fff",
                            outline: "none",
                            resize: "vertical",
                            fontFamily: "'Lato', sans-serif",
                            lineHeight: 1.6,
                        }}
                    />
                </FormField>

                <FormField
                    label="Keywords"
                    required
                    error={errors.keywords}
                    hint="Comma-separated"
                >
                    <StyledInput
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        placeholder="technology, design, nextjs…"
                        hasError={!!errors.keywords}
                    />
                    {/* Live keyword chips */}
                    {formData.keywords.trim() && (
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                marginTop: 8,
                            }}
                        >
                            {formData.keywords
                                .split(",")
                                .map((k) => k.trim())
                                .filter(Boolean)
                                .map((kw) => (
                                    <span
                                        key={kw}
                                        style={{
                                            background: "#FFFDF7",
                                            border: "1px solid #F5A524",
                                            color: "#7F7F7F",
                                            borderRadius: 6,
                                            padding: "3px 10px",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            fontStyle: "italic",
                                        }}
                                    >
                                        {kw}
                                    </span>
                                ))}
                        </div>
                    )}
                </FormField>
            </FormSection>

            {/* ════════ SECTION: Content ════════ */}
            <FormSection title="Content" icon={<Sparkles size={14} />}>
                <FormField label="Body Content" required error={errors.content}>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(html) =>
                            setFormData((prev) => ({ ...prev, content: html }))
                        }
                    />
                </FormField>
            </FormSection>

            {/* ════════ SECTION: Images ════════ */}
            <FormSection title="Images" icon={<Globe size={14} />}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                    }}
                >
                    <FormField
                        label="Thumbnail Image"
                        required
                        error={errors.thumbnailImage}
                        hint="Used in blog list cards (square)"
                    >
                        <ImageDropZone
                            preview={thumbnailPreview}
                            height={164}
                            hasError={!!errors.thumbnailImage}
                            onChange={(e) =>
                                handleImageSelection(e, "thumbnail")
                            }
                        />
                    </FormField>
                    <FormField
                        label="Hero Image"
                        required
                        error={errors.heroImage}
                        hint="Full-width banner on post page (16:9)"
                    >
                        <ImageDropZone
                            preview={heroPreview}
                            height={164}
                            hasError={!!errors.heroImage}
                            onChange={(e) => handleImageSelection(e, "hero")}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* ════════ SECTION: Publishing ════════ */}
            <FormSection title="Publishing" icon={<Star size={14} />}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                    }}
                >
                    <ToggleCard
                        label="Published"
                        description="Visible to the public on your blog"
                        icon="🌐"
                        active={formData.published}
                        activeColor="#22c55e"
                        onToggle={() => handleToggle("published")}
                    />
                    <ToggleCard
                        label="Featured"
                        description="Pinned to the hero slot on the blog page"
                        icon="⭐"
                        active={formData.featured}
                        activeColor="#F5A524"
                        onToggle={() => handleToggle("featured")}
                    />
                </div>

                {formData.published && (
                    <div
                        style={{
                            marginTop: 4,
                            padding: "10px 14px",
                            background: "#f0fdf4",
                            border: "1.5px solid #bbf7d0",
                            borderRadius: 10,
                            fontSize: 13,
                            color: "#15803d",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <span>✓</span>
                        <span>
                            Publicly accessible at{" "}
                            <code
                                style={{
                                    fontSize: 12,
                                    background: "#dcfce7",
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                }}
                            >
                                /blog/{formData.slug || "…"}
                            </code>
                        </span>
                    </div>
                )}
            </FormSection>

            {/* ════════ ACTIONS ════════ */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        background: isSubmitting ? "#ccc" : "#111",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        padding: "13px 30px",
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "background .2s",
                    }}
                >
                    {isSubmitting && (
                        <Loader2 size={15} className="animate-spin" />
                    )}
                    {isSubmitting
                        ? "Saving…"
                        : isEdit
                          ? "Update Post"
                          : "Create Post"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/ops/control/blogs")}
                    style={{
                        background: "transparent",
                        color: "#888",
                        border: "1.5px solid #E8E3D9",
                        borderRadius: 12,
                        padding: "13px 22px",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

/* ─── Reusable sub-components ───────────────────────── */

function FormSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1.5px solid #E8E3D9",
                borderRadius: 20,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "14px 22px",
                    borderBottom: "1.5px solid #F0EDE8",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <span style={{ color: "#F5A524" }}>{icon}</span>
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#111",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                    }}
                >
                    {title}
                </span>
            </div>
            <div
                style={{
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                }}
            >
                {children}
            </div>
        </div>
    );
}

function FormField({
    label,
    required,
    error,
    hint,
    counter,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: React.ReactNode;
    counter?: { current: number; max: number };
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <label style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>
                    {label}
                    {required && (
                        <span style={{ color: "#F5A524", marginLeft: 3 }}>
                            *
                        </span>
                    )}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {hint && (
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                            {hint}
                        </span>
                    )}
                    {counter && (
                        <span
                            style={{
                                fontSize: 11,
                                color:
                                    counter.current > counter.max * 0.9
                                        ? "#ef4444"
                                        : "#bbb",
                            }}
                        >
                            {counter.current}/{counter.max}
                        </span>
                    )}
                </div>
            </div>
            {children}
            {error && (
                <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>
                    {error}
                </p>
            )}
        </div>
    );
}

function StyledInput({
    name,
    value,
    onChange,
    placeholder,
    hasError,
}: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    hasError?: boolean;
}) {
    return (
        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                width: "100%",
                padding: "11px 14px",
                border: `1.5px solid ${hasError ? "#ef4444" : "#E8E3D9"}`,
                borderRadius: 12,
                fontSize: 14,
                color: "#111",
                background: "#fff",
                outline: "none",
                fontFamily: "'Lato', sans-serif",
            }}
        />
    );
}

function ImageDropZone({
    preview,
    height,
    hasError,
    onChange,
}: {
    preview: string;
    height: number;
    hasError: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <label
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "block",
                height,
                position: "relative",
                border: `2px dashed ${hasError ? "#ef4444" : hovered ? "#F5A524" : "#E8E3D9"}`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                background: "#FAFAF7",
                transition: "border-color .2s",
            }}
        >
            {preview ? (
                <>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                    {hovered && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.45)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span
                                style={{
                                    background: "#fff",
                                    color: "#111",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    padding: "6px 16px",
                                    borderRadius: 8,
                                }}
                            >
                                Replace Image
                            </span>
                        </div>
                    )}
                </>
            ) : (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        color: "#ccc",
                    }}
                >
                    <span style={{ fontSize: 32 }}>🖼</span>
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: hovered ? "#F5A524" : "#bbb",
                        }}
                    >
                        Click to upload
                    </span>
                    <span style={{ fontSize: 11, color: "#ccc" }}>
                        PNG, JPG, WEBP
                    </span>
                </div>
            )}
            <input
                type="file"
                accept="image/*"
                onChange={onChange}
                style={{ display: "none" }}
            />
        </label>
    );
}

function ToggleCard({
    label,
    description,
    icon,
    active,
    activeColor,
    onToggle,
}: {
    label: string;
    description: string;
    icon: string;
    active: boolean;
    activeColor: string;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            style={{
                textAlign: "left",
                background: active ? `${activeColor}12` : "#FAFAF7",
                border: `1.5px solid ${active ? activeColor : "#E8E3D9"}`,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all .2s",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: active ? activeColor : "#333",
                        }}
                    >
                        {label}
                    </span>
                </div>
                {/* Pill toggle */}
                <div
                    style={{
                        width: 38,
                        height: 20,
                        borderRadius: 99,
                        background: active ? activeColor : "#D1D5DB",
                        position: "relative",
                        transition: "background .2s",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 2,
                            left: active ? 19 : 2,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#fff",
                            transition: "left .18s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                        }}
                    />
                </div>
            </div>
            <p
                style={{
                    fontSize: 12,
                    color: "#888",
                    lineHeight: 1.45,
                    margin: 0,
                }}
            >
                {description}
            </p>
        </button>
    );
}
