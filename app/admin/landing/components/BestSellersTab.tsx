"use client";

import {
    Crown,
    Eye,
    EyeOff,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Star,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BestSeller {
    id: string;
    name: string;
    price: string;
    image: string;
    href: string;
    isHero: boolean;
    variant: string | null;
    description: string | null;
    specs: { label: string; value: string }[] | null;
    sortOrder: number;
    isActive: boolean;
}

interface HeroForm {
    name: string;
    price: string;
    href: string;
    description: string;
    spec1Label: string;
    spec1Value: string;
    spec2Label: string;
    spec2Value: string;
    isActive: boolean;
}

interface CardForm {
    name: string;
    price: string;
    href: string;
    variant: string;
    sortOrder: number;
    isActive: boolean;
}

const EMPTY_HERO: HeroForm = {
    name: "",
    price: "",
    href: "",
    description: "",
    spec1Label: "",
    spec1Value: "",
    spec2Label: "",
    spec2Value: "",
    isActive: true,
};
const EMPTY_CARD: CardForm = {
    name: "",
    price: "",
    href: "",
    variant: "",
    sortOrder: 0,
    isActive: true,
};

export default function BestSellersTab() {
    const [items, setItems] = useState<BestSeller[]>([]);
    const [loading, setLoading] = useState(true);

    // Hero state
    const [heroModal, setHeroModal] = useState<"create" | "edit" | null>(null);
    const [heroForm, setHeroForm] = useState<HeroForm>(EMPTY_HERO);
    const [heroEditId, setHeroEditId] = useState<string | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [heroExistingImg, setHeroExistingImg] = useState<string | null>(null);
    const heroFileRef = useRef<HTMLInputElement>(null);

    // Card state
    const [cardModal, setCardModal] = useState<"create" | "edit" | null>(null);
    const [cardForm, setCardForm] = useState<CardForm>(EMPTY_CARD);
    const [cardEditId, setCardEditId] = useState<string | null>(null);
    const [cardFile, setCardFile] = useState<File | null>(null);
    const [cardPreview, setCardPreview] = useState<string | null>(null);
    const [cardExistingImg, setCardExistingImg] = useState<string | null>(null);
    const cardFileRef = useRef<HTMLInputElement>(null);

    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<BestSeller | null>(null);

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/landingPage/best-sellers");
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const hero = items.find((i) => i.isHero);
    const cards = items
        .filter((i) => !i.isHero)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    // ── File helpers ──
    const handleFile = (
        file: File,
        setFile: any,
        setPreview: any,
        prevPreview: string | null,
    ) => {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image.");
            return;
        }
        setFile(file);
        if (prevPreview) URL.revokeObjectURL(prevPreview);
        setPreview(URL.createObjectURL(file));
    };

    // ── Hero save ──
    const saveHero = async () => {
        if (!heroForm.name || !heroForm.price || !heroForm.href) {
            alert("Name, Price, Link required.");
            return;
        }
        if (!heroEditId && !heroFile) {
            alert("Image required.");
            return;
        }
        setSaving(true);
        try {
            const body = new FormData();
            body.append("name", heroForm.name);
            body.append("price", heroForm.price);
            body.append("href", heroForm.href);
            body.append("description", heroForm.description);
            body.append("isHero", "true");
            body.append("isActive", String(heroForm.isActive));
            body.append("sortOrder", "0");
            const specs: any[] = [];
            if (heroForm.spec1Label && heroForm.spec1Value)
                specs.push({
                    label: heroForm.spec1Label,
                    value: heroForm.spec1Value,
                });
            if (heroForm.spec2Label && heroForm.spec2Value)
                specs.push({
                    label: heroForm.spec2Label,
                    value: heroForm.spec2Value,
                });
            if (specs.length) body.append("specs", JSON.stringify(specs));
            if (heroFile) body.append("file", heroFile);
            const url = heroEditId
                ? `/api/admin/landingPage/best-sellers/${heroEditId}`
                : "/api/admin/landingPage/best-sellers";
            const res = await fetch(url, {
                method: heroEditId ? "PUT" : "POST",
                body,
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed");
            closeHeroModal();
            fetchItems();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Card save ──
    const saveCard = async () => {
        if (!cardForm.name || !cardForm.price || !cardForm.href) {
            alert("Name, Price, Link required.");
            return;
        }
        if (!cardEditId && !cardFile) {
            alert("Image required.");
            return;
        }
        setSaving(true);
        try {
            const body = new FormData();
            body.append("name", cardForm.name);
            body.append("price", cardForm.price);
            body.append("href", cardForm.href);
            body.append("variant", cardForm.variant);
            body.append("isHero", "false");
            body.append("isActive", String(cardForm.isActive));
            body.append("sortOrder", String(cardForm.sortOrder));
            if (cardFile) body.append("file", cardFile);
            const url = cardEditId
                ? `/api/admin/landingPage/best-sellers/${cardEditId}`
                : "/api/admin/landingPage/best-sellers";
            const res = await fetch(url, {
                method: cardEditId ? "PUT" : "POST",
                body,
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed");
            closeCardModal();
            fetchItems();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(`/api/admin/landingPage/best-sellers/${deleteTarget.id}`, {
            method: "DELETE",
        });
        setDeleteTarget(null);
        fetchItems();
    };

    const toggleActive = async (item: BestSeller) => {
        const body = new FormData();
        body.append("name", item.name);
        body.append("price", item.price);
        body.append("href", item.href);
        body.append("isHero", String(item.isHero));
        body.append("isActive", String(!item.isActive));
        body.append("sortOrder", String(item.sortOrder));
        if (item.variant) body.append("variant", item.variant);
        if (item.description) body.append("description", item.description);
        if (item.specs) body.append("specs", JSON.stringify(item.specs));
        await fetch(`/api/admin/landingPage/best-sellers/${item.id}`, {
            method: "PUT",
            body,
        });
        fetchItems();
    };

    const closeHeroModal = () => {
        setHeroModal(null);
        setHeroEditId(null);
        setHeroForm(EMPTY_HERO);
        setHeroFile(null);
        if (heroPreview) URL.revokeObjectURL(heroPreview);
        setHeroPreview(null);
        setHeroExistingImg(null);
    };
    const closeCardModal = () => {
        setCardModal(null);
        setCardEditId(null);
        setCardForm(EMPTY_CARD);
        setCardFile(null);
        if (cardPreview) URL.revokeObjectURL(cardPreview);
        setCardPreview(null);
        setCardExistingImg(null);
    };

    const openEditHero = (item: BestSeller) => {
        const s = (item.specs as any[]) || [];
        setHeroEditId(item.id);
        setHeroForm({
            name: item.name,
            price: item.price,
            href: item.href,
            description: item.description || "",
            spec1Label: s[0]?.label || "",
            spec1Value: s[0]?.value || "",
            spec2Label: s[1]?.label || "",
            spec2Value: s[1]?.value || "",
            isActive: item.isActive,
        });
        setHeroExistingImg(item.image);
        setHeroModal("edit");
    };

    const openEditCard = (item: BestSeller) => {
        setCardEditId(item.id);
        setCardForm({
            name: item.name,
            price: item.price,
            href: item.href,
            variant: item.variant || "",
            sortOrder: item.sortOrder,
            isActive: item.isActive,
        });
        setCardExistingImg(item.image);
        setCardModal("edit");
    };

    if (loading)
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-20 bg-gray-200 rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );

    return (
        <>
            {/* ═══════════ SECTION 1: HERO CARD ═══════════ */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" /> Hero
                            Card{" "}
                            <span className="text-[10px] font-normal text-gray-400">
                                #1 BEST SELLER badge auto-applied
                            </span>
                        </h3>
                    </div>
                    {!hero && (
                        <button
                            onClick={() => {
                                setHeroForm(EMPTY_HERO);
                                setHeroModal("create");
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca]"
                        >
                            <Plus className="w-3.5 h-3.5" /> Set Hero
                        </button>
                    )}
                </div>

                {hero ? (
                    <div
                        className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${hero.isActive ? "border-amber-200 bg-amber-50/30" : "border-gray-200 opacity-60"}`}
                    >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                                src={hero.image}
                                alt={hero.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#4f46e5] rounded">
                                    #1 BEST SELLER
                                </span>
                                <h4 className="text-sm font-bold text-gray-900 truncate">
                                    {hero.name}
                                </h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {hero.description || "No description"}
                            </p>
                            <div className="flex gap-3 mt-1">
                                <span className="text-xs font-bold text-[#4f46e5]">
                                    ₹{hero.price}
                                </span>
                                {(hero.specs as any[])?.map(
                                    (s: any, i: number) => (
                                        <span
                                            key={i}
                                            className="text-[10px] text-gray-400"
                                        >
                                            {s.label}:{" "}
                                            <span className="font-mono font-bold text-gray-600">
                                                {s.value}
                                            </span>
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                onClick={() => toggleActive(hero)}
                                className={`p-2 rounded-lg ${hero.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                            >
                                {hero.isActive ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <EyeOff className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => openEditHero(hero)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDeleteTarget(hero)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                        <Crown className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="mt-2 text-xs text-gray-400">
                            No hero card set
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════════ SECTION 2: REGULAR CARDS ═══════════ */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">
                        Product Cards (Add only 4) {") "}
                        <span className="text-xs font-normal text-gray-400">
                            ({cards.length})
                        </span>
                    </h3>
                    <button
                        onClick={() => {
                            setCardForm({
                                ...EMPTY_CARD,
                                sortOrder: cards.length + 1,
                            });
                            setCardModal("create");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca]"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Product
                    </button>
                </div>

                {cards.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                        <Star className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="mt-2 text-xs text-gray-400">
                            No products yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {cards.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 bg-white rounded-xl border ${item.isActive ? "border-gray-100" : "border-gray-200 opacity-60"}`}
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {item.name}
                                    </h4>
                                    <p className="text-[11px] text-gray-400">
                                        {item.variant || "—"} · ₹{item.price} ·
                                        Order: {item.sortOrder}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => toggleActive(item)}
                                        className={`p-1.5 rounded-lg ${item.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                                    >
                                        {item.isActive ? (
                                            <Eye className="w-3.5 h-3.5" />
                                        ) : (
                                            <EyeOff className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openEditCard(item)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(item)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════ HERO MODAL ═══════════ */}
            {heroModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {heroModal === "create"
                                    ? "Set Hero Card"
                                    : "Edit Hero Card"}
                            </h2>
                            <button
                                onClick={closeHeroModal}
                                className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <Crown className="w-3.5 h-3.5 text-amber-500 inline mr-1" />{" "}
                                Badge "#1 BEST SELLER" is automatically shown on
                                the hero card.
                            </p>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Image *
                                </label>
                                {heroPreview || heroExistingImg ? (
                                    <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100">
                                        <img
                                            src={
                                                heroPreview || heroExistingImg!
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                heroFileRef.current?.click()
                                            }
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() =>
                                            heroFileRef.current?.click()
                                        }
                                        className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#4f46e5]"
                                    >
                                        <Upload className="w-7 h-7 text-gray-400" />
                                        <p className="mt-1.5 text-sm text-gray-500">
                                            <span className="font-medium text-[#4f46e5]">
                                                Upload image
                                            </span>
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={heroFileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f)
                                            handleFile(
                                                f,
                                                setHeroFile,
                                                setHeroPreview,
                                                heroPreview,
                                            );
                                    }}
                                />
                            </div>

                            {/* Name + Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        value={heroForm.name}
                                        onChange={(e) =>
                                            setHeroForm((p) => ({
                                                ...p,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Prism Ultra X1 Pro"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        value={heroForm.price}
                                        onChange={(e) =>
                                            setHeroForm((p) => ({
                                                ...p,
                                                price: e.target.value,
                                            }))
                                        }
                                        placeholder="1299"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Link *
                                </label>
                                <input
                                    value={heroForm.href}
                                    onChange={(e) =>
                                        setHeroForm((p) => ({
                                            ...p,
                                            href: e.target.value,
                                        }))
                                    }
                                    placeholder="/printers/prism-ultra-x1-pro"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={heroForm.description}
                                    onChange={(e) =>
                                        setHeroForm((p) => ({
                                            ...p,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="The gold standard for industrial-grade..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Specs — 2 key-value pairs */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Specs{" "}
                                    <span className="text-gray-400 font-normal">
                                        (up to 2 key-value pairs)
                                    </span>
                                </label>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            value={heroForm.spec1Label}
                                            onChange={(e) =>
                                                setHeroForm((p) => ({
                                                    ...p,
                                                    spec1Label: e.target.value,
                                                }))
                                            }
                                            placeholder="Label e.g. PRINT SPEED"
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                        />
                                        <input
                                            value={heroForm.spec1Value}
                                            onChange={(e) =>
                                                setHeroForm((p) => ({
                                                    ...p,
                                                    spec1Value: e.target.value,
                                                }))
                                            }
                                            placeholder="Value e.g. 500mm/s"
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            value={heroForm.spec2Label}
                                            onChange={(e) =>
                                                setHeroForm((p) => ({
                                                    ...p,
                                                    spec2Label: e.target.value,
                                                }))
                                            }
                                            placeholder="Label e.g. PRECISION"
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                        />
                                        <input
                                            value={heroForm.spec2Value}
                                            onChange={(e) =>
                                                setHeroForm((p) => ({
                                                    ...p,
                                                    spec2Value: e.target.value,
                                                }))
                                            }
                                            placeholder="Value e.g. ±0.01mm"
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                            <button
                                onClick={closeHeroModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveHero}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {saving
                                    ? "Saving..."
                                    : heroEditId
                                      ? "Update"
                                      : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ CARD MODAL ═══════════ */}
            {cardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {cardModal === "create"
                                    ? "Add Product"
                                    : "Edit Product"}
                            </h2>
                            <button
                                onClick={closeCardModal}
                                className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Image *
                                </label>
                                {cardPreview || cardExistingImg ? (
                                    <div className="relative rounded-xl overflow-hidden h-36 bg-gray-100">
                                        <img
                                            src={
                                                cardPreview || cardExistingImg!
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cardFileRef.current?.click()
                                            }
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() =>
                                            cardFileRef.current?.click()
                                        }
                                        className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#4f46e5]"
                                    >
                                        <Upload className="w-7 h-7 text-gray-400" />
                                        <p className="mt-1.5 text-sm text-gray-500">
                                            <span className="font-medium text-[#4f46e5]">
                                                Upload image
                                            </span>
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={cardFileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f)
                                            handleFile(
                                                f,
                                                setCardFile,
                                                setCardPreview,
                                                cardPreview,
                                            );
                                    }}
                                />
                            </div>
                            {/* Name + Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        value={cardForm.name}
                                        onChange={(e) =>
                                            setCardForm((p) => ({
                                                ...p,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Elite Matte PLA"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        value={cardForm.price}
                                        onChange={(e) =>
                                            setCardForm((p) => ({
                                                ...p,
                                                price: e.target.value,
                                            }))
                                        }
                                        placeholder="2499"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            {/* Link + Variant */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Link *
                                    </label>
                                    <input
                                        value={cardForm.href}
                                        onChange={(e) =>
                                            setCardForm((p) => ({
                                                ...p,
                                                href: e.target.value,
                                            }))
                                        }
                                        placeholder="/filaments/elite-matte-pla"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Variant{" "}
                                        <span className="text-gray-400 font-normal">
                                            (opt)
                                        </span>
                                    </label>
                                    <input
                                        value={cardForm.variant}
                                        onChange={(e) =>
                                            setCardForm((p) => ({
                                                ...p,
                                                variant: e.target.value,
                                            }))
                                        }
                                        placeholder="SHADOW BLACK"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            {/* Sort Order */}
                            <div className="w-24">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={cardForm.sortOrder}
                                    onChange={(e) =>
                                        setCardForm((p) => ({
                                            ...p,
                                            sortOrder:
                                                parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                            <button
                                onClick={closeCardModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCard}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] disabled:opacity-50"
                            >
                                {saving && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {saving
                                    ? "Saving..."
                                    : cardEditId
                                      ? "Update"
                                      : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ DELETE CONFIRM ═══════════ */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            Delete?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Remove &quot;{deleteTarget.name}&quot; permanently?
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
