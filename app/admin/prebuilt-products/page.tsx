// PATH: app/admin/prebuilt-products/page.tsx

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Prebuilt Products | Admin",
};

/* ─── Inline server actions ──────────────────────────────────────────────── */

async function deleteProduct(id: string) {
    "use server";
    await prisma.prebuiltProductRiya.delete({ where: { id } });
    revalidatePath("/admin/prebuilt-products");
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatPrice(paise: number) {
    return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function PrebuiltProductsPage() {
    const products = await prisma.prebuiltProductRiya.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            variants: { orderBy: { createdAt: "asc" }, take: 1 },
        },
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="max-w-screen-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <svg
                                width={20}
                                height={20}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M19 12H5M12 5l-7 7 7 7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Prebuilt Products
                            </h1>
                            <p className="text-sm text-gray-500">
                                {products.length} total products
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/prebuilt-products/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <svg
                            width={16}
                            height={16}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                        Add New Product
                    </Link>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-8 py-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* ── Toolbar ── */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900">
                            Products List
                        </h2>
                        <span className="text-sm text-gray-400">
                            {products.length} entries
                        </span>
                    </div>

                    {/* ── Table ── */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {[
                                        "Name",
                                        "Price",
                                        "Original Price",
                                        "Category",
                                        "Variants",
                                        "Customizable",
                                        "Updated At",
                                        "Actions",
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center text-gray-400 text-base"
                                        >
                                            No products yet.{" "}
                                            <Link
                                                href="/admin/prebuilt-products/new"
                                                className="text-blue-500 underline"
                                            >
                                                Add your first product
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const v = product.variants[0];
                                        return (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-gray-50/80 transition-colors"
                                            >
                                                {/* Name */}
                                                <td className="px-5 py-4 max-w-[280px]">
                                                    <p className="font-semibold text-gray-900 leading-snug">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                        {
                                                            product.shortDescription
                                                        }
                                                    </p>
                                                </td>

                                                {/* Price */}
                                                <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                                    {v?.price
                                                        ? formatPrice(v.price)
                                                        : "—"}
                                                </td>

                                                {/* Original Price */}
                                                <td className="px-5 py-4 text-gray-400 line-through whitespace-nowrap">
                                                    {v?.originalPrice
                                                        ? formatPrice(
                                                              v.originalPrice,
                                                          )
                                                        : "—"}
                                                </td>

                                                {/* Category */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                                                        {product.category}
                                                    </span>
                                                </td>

                                                {/* Variants count */}
                                                <td className="px-5 py-4 text-center font-semibold text-gray-700">
                                                    {product.variants.length}
                                                </td>

                                                {/* Customizable */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                            product.isCustomizable
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-gray-100 text-gray-400"
                                                        }`}
                                                    >
                                                        {product.isCustomizable
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </td>

                                                {/* Updated At */}
                                                <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                                                    {formatDate(
                                                        product.updatedAt,
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/prebuilt-products/${product.id}`}
                                                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg
                                                                width={14}
                                                                height={14}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                                <path
                                                                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </Link>
                                                        <form
                                                            action={deleteProduct.bind(
                                                                null,
                                                                product.id,
                                                            )}
                                                        >
                                                            <button
                                                                type="submit"
                                                                title="Delete"
                                                                className="p-2 rounded-lg border border-red-100 bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                            >
                                                                <svg
                                                                    width={14}
                                                                    height={14}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Footer ── */}
                    <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-400">
                        Showing {products.length} of {products.length} products
                    </div>
                </div>
            </div>
        </div>
    );
}
