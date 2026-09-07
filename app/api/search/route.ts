import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------- pg_trgm availability cache ----------
let _trigramReady: boolean | null = null;

async function ensureTrigram(): Promise<boolean> {
    if (_trigramReady !== null) return _trigramReady;
    try {
        await prisma.$executeRawUnsafe(
            "CREATE EXTENSION IF NOT EXISTS pg_trgm",
        );
        _trigramReady = true;
    } catch {
        console.warn("[Search] pg_trgm not available — using ILIKE fallback");
        _trigramReady = false;
    }
    return _trigramReady;
}

// ---------- Types ----------
interface ScoredResult {
    id: string;
    name: string;
    type: "prebuilt" | "resin" | "printer" | "filament";
    price: number | null;
    image: string | null;
    subtitle: string | null;
    href: string;
    score: number;
}

// ---------- Helpers ----------
function escapeLike(s: string): string {
    return s.replace(/[%_\\]/g, "\\$&");
}

const THRESHOLD = 0.3;
const TYPE_KW_THRESHOLD = 0.4; // for type-keyword matching (e.g. "filment" → "filament")
const PER_TABLE = 5;

// ---------- Fuzzy search (pg_trgm) ----------

async function fuzzyPrebuilt(q: string, like: string, starts: string) {
    const rows = await prisma.$queryRaw<
        {
            id: string;
            name: string;
            slug: string | null;
            subtitle: string | null;
            image: string | null;
            price: number | null;
            score: number;
        }[]
    >`
    SELECT
      p.id, p.name, p.slug,
      p.category AS subtitle,
      (SELECT pi.url FROM "PrebuiltImages" pi
       WHERE pi."prebuildProductId" = p.id AND pi."isMain" = true LIMIT 1) AS image,
      (SELECT pv.price FROM "PrebuiltVariants" pv
       WHERE pv."prebuildProductId" = p.id AND pv."isActive" = true
       ORDER BY pv.price ASC LIMIT 1) AS price,
      GREATEST(
        word_similarity(${q}, LOWER(p.name)),
        word_similarity(${q}, LOWER(COALESCE(p.category, ''))),
        CASE WHEN LOWER(p.name) LIKE ${starts} THEN 0.8 ELSE 0 END,
        CASE WHEN LOWER(p.name) LIKE ${like} THEN 0.5 ELSE 0 END
      )::float8 AS score
    FROM "PrebuiltProducts" p
    WHERE
      word_similarity(${q}, LOWER(p.name)) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(p.category, ''))) > ${THRESHOLD}
      OR LOWER(p.name) LIKE ${like}
      OR LOWER(COALESCE(p.category, '')) LIKE ${like}
      OR LOWER(COALESCE(p."shortDescription", '')) LIKE ${like}
    ORDER BY score DESC
    LIMIT ${PER_TABLE}
  `;

    return rows.map((r) => ({
        ...r,
        type: "prebuilt" as const,
        href: `/prebuilt-products/${r.slug || r.id}`,
    }));
}

async function fuzzyResins(q: string, like: string, starts: string) {
    const rows = await prisma.$queryRaw<
        {
            id: string;
            name: string;
            slug: string;
            brand: string | null;
            technology: string | null;
            image: string | null;
            price: number | null;
            score: number;
        }[]
    >`
    SELECT
      r.id, r.name, r.slug, r.brand, r.technology,
      r."cardImageUrl" AS image,
      (SELECT rw.price FROM "ResinWeight" rw
       WHERE rw."resinId" = r.id ORDER BY rw.price ASC LIMIT 1) AS price,
      GREATEST(
        word_similarity(${q}, LOWER(r.name)),
        word_similarity(${q}, LOWER(COALESCE(r.brand, ''))),
        word_similarity(${q}, LOWER(COALESCE(r.technology, ''))),
        CASE WHEN word_similarity(${q}, ${"resin"}) > ${TYPE_KW_THRESHOLD}
             THEN word_similarity(${q}, ${"resin"}) ELSE 0 END,
        CASE WHEN LOWER(r.name) LIKE ${starts} THEN 0.8 ELSE 0 END,
        CASE WHEN LOWER(r.name) LIKE ${like} THEN 0.5 ELSE 0 END
      )::float8 AS score
    FROM "Resin" r
    WHERE
      word_similarity(${q}, LOWER(r.name)) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(r.brand, ''))) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(r.technology, ''))) > ${THRESHOLD}
      OR word_similarity(${q}, ${"resin"}) > ${TYPE_KW_THRESHOLD}
      OR LOWER(r.name) LIKE ${like}
      OR LOWER(COALESCE(r."shortDescription", '')) LIKE ${like}
    ORDER BY score DESC
    LIMIT ${PER_TABLE}
  `;

    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: "resin" as const,
        price: r.price,
        image: r.image,
        subtitle: [r.brand, r.technology].filter(Boolean).join(" · "),
        href: `/resins/${r.slug}`,
        score: r.score,
    }));
}

async function fuzzyPrinters(q: string, like: string, starts: string) {
    const rows = await prisma.$queryRaw<
        {
            id: string;
            name: string;
            slug: string;
            brand: string | null;
            technology: string | null;
            price: number | null;
            image: string | null;
            score: number;
        }[]
    >`
    SELECT
      p.id, p.name, p.slug, p.brand, p.technology, p.price,
      (SELECT pi.url FROM "PrinterImage" pi
       WHERE pi."printerId" = p.id AND pi."isMain" = true LIMIT 1) AS image,
      GREATEST(
        word_similarity(${q}, LOWER(p.name)),
        word_similarity(${q}, LOWER(COALESCE(p.brand, ''))),
        word_similarity(${q}, LOWER(COALESCE(p.technology, ''))),
        CASE WHEN word_similarity(${q}, ${"printer"}) > ${TYPE_KW_THRESHOLD}
             THEN word_similarity(${q}, ${"printer"}) ELSE 0 END,
        CASE WHEN LOWER(p.name) LIKE ${starts} THEN 0.8 ELSE 0 END,
        CASE WHEN LOWER(p.name) LIKE ${like} THEN 0.5 ELSE 0 END
      )::float8 AS score
    FROM "Printer" p
    WHERE
      word_similarity(${q}, LOWER(p.name)) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(p.brand, ''))) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(p.technology, ''))) > ${THRESHOLD}
      OR word_similarity(${q}, ${"printer"}) > ${TYPE_KW_THRESHOLD}
      OR LOWER(p.name) LIKE ${like}
      OR LOWER(COALESCE(p."shortDescription", '')) LIKE ${like}
    ORDER BY score DESC
    LIMIT ${PER_TABLE}
  `;

    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: "printer" as const,
        price: r.price,
        image: r.image,
        subtitle: [r.brand, r.technology].filter(Boolean).join(" · "),
        href: `/printers/${r.slug}`,
        score: r.score,
    }));
}

async function fuzzyFilaments(q: string, like: string, starts: string) {
    const rows = await prisma.$queryRaw<
        {
            id: string;
            name: string;
            slug: string | null;
            brand: string | null;
            material: string | null;
            colorName: string | null;
            image: string | null;
            price: number | null;
            score: number;
        }[]
    >`
    SELECT
      f.id, f.name, f.slug, f.brand, f.material, f."colorName",
      f.images[1] AS image,
      (SELECT fv.price FROM "FilamentVariant" fv
       WHERE fv."filamentId" = f.id ORDER BY fv.price ASC LIMIT 1) AS price,
      GREATEST(
        word_similarity(${q}, LOWER(f.name)),
        word_similarity(${q}, LOWER(COALESCE(f.brand, ''))),
        word_similarity(${q}, LOWER(COALESCE(f.material, ''))),
        word_similarity(${q}, LOWER(COALESCE(f."colorName", ''))),
        CASE WHEN word_similarity(${q}, ${"filament"}) > ${TYPE_KW_THRESHOLD}
             THEN word_similarity(${q}, ${"filament"}) ELSE 0 END,
        CASE WHEN LOWER(f.name) LIKE ${starts} THEN 0.8 ELSE 0 END,
        CASE WHEN LOWER(f.name) LIKE ${like} THEN 0.5 ELSE 0 END
      )::float8 AS score
    FROM "Filament" f
    WHERE
      word_similarity(${q}, LOWER(f.name)) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(f.brand, ''))) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(f.material, ''))) > ${THRESHOLD}
      OR word_similarity(${q}, LOWER(COALESCE(f."colorName", ''))) > ${THRESHOLD}
      OR word_similarity(${q}, ${"filament"}) > ${TYPE_KW_THRESHOLD}
      OR LOWER(f.name) LIKE ${like}
      OR LOWER(COALESCE(f."shortDescription", '')) LIKE ${like}
    ORDER BY score DESC
    LIMIT ${PER_TABLE}
  `;

    return rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: "filament" as const,
        price: r.price,
        image: r.image,
        subtitle: [r.brand, r.material, r.colorName]
            .filter(Boolean)
            .join(" · "),
        href: `/filament/${r.slug || r.id}`,
        score: r.score,
    }));
}

// ---------- ILIKE fallback (no pg_trgm) ----------

async function fallbackSearch(q: string): Promise<ScoredResult[]> {
    const [prebuiltProducts, resins, printers, filaments] = await Promise.all([
        prisma.prebuiltProducts.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { category: { contains: q, mode: "insensitive" } },
                    {
                        shortDescription: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                images: {
                    where: { isMain: true },
                    select: { url: true },
                    take: 1,
                },
                variants: {
                    where: { isActive: true },
                    select: { price: true },
                    take: 1,
                    orderBy: { price: "asc" },
                },
            },
            take: PER_TABLE,
        }),
        prisma.resin.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { brand: { contains: q, mode: "insensitive" } },
                    { technology: { contains: q, mode: "insensitive" } },
                    {
                        shortDescription: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                technology: true,
                cardImageUrl: true,
                weights: {
                    select: { price: true },
                    take: 1,
                    orderBy: { price: "asc" },
                },
            },
            take: PER_TABLE,
        }),
        prisma.printer.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { brand: { contains: q, mode: "insensitive" } },
                    { technology: { contains: q, mode: "insensitive" } },
                    {
                        shortDescription: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                price: true,
                technology: true,
                images: {
                    where: { isMain: true },
                    select: { url: true },
                    take: 1,
                },
            },
            take: PER_TABLE,
        }),
        prisma.filament.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { brand: { contains: q, mode: "insensitive" } },
                    { material: { contains: q, mode: "insensitive" } },
                    { colorName: { contains: q, mode: "insensitive" } },
                    {
                        shortDescription: {
                            contains: q,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                material: true,
                colorName: true,
                images: true,
                variants: {
                    select: { price: true },
                    take: 1,
                    orderBy: { price: "asc" },
                },
            },
            take: PER_TABLE,
        }),
    ]);

    const ql = q.toLowerCase();
    const scoreMatch = (text: string | null | undefined): number => {
        if (!text) return 0;
        const t = text.toLowerCase();
        if (t.startsWith(ql)) return 0.9;
        if (t.includes(ql)) return 0.6;
        return 0;
    };

    return [
        ...prebuiltProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.variants[0]?.price ?? null,
            image: p.images[0]?.url || null,
            subtitle: p.category,
            href: `/prebuilt-products/${p.slug || p.id}`,
            type: "prebuilt" as const,
            score: Math.max(
                scoreMatch(p.name),
                scoreMatch(p.category),
            ),
        })),
        ...resins.map((r) => ({
            id: r.id,
            name: r.name,
            price: r.weights[0]?.price ?? null,
            image: r.cardImageUrl || null,
            subtitle: [r.brand, r.technology].filter(Boolean).join(" · "),
            href: `/resins/${r.slug}`,
            type: "resin" as const,
            score: Math.max(
                scoreMatch(r.name),
                scoreMatch(r.brand),
                scoreMatch(r.technology),
            ),
        })),
        ...printers.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images[0]?.url || null,
            subtitle: [p.brand, p.technology].filter(Boolean).join(" · "),
            href: `/printers/${p.slug}`,
            type: "printer" as const,
            score: Math.max(
                scoreMatch(p.name),
                scoreMatch(p.brand),
                scoreMatch(p.technology),
            ),
        })),
        ...filaments.map((f) => ({
            id: f.id,
            name: f.name,
            price: f.variants[0]?.price ?? null,
            image: f.images?.[0] || null,
            subtitle: [f.brand, f.material, f.colorName]
                .filter(Boolean)
                .join(" · "),
            href: `/filament/${f.slug || f.id}`,
            type: "filament" as const,
            score: Math.max(
                scoreMatch(f.name),
                scoreMatch(f.brand),
                scoreMatch(f.material),
                scoreMatch(f.colorName),
            ),
        })),
    ];
}

// ---------- Short-query search (ILIKE only, no fuzzy, no description) ----------

async function shortQuerySearch(q: string): Promise<ScoredResult[]> {
    const like = `%${escapeLike(q)}%`;
    const starts = `${escapeLike(q)}%`;

    const [prebuilt, resins, printers, filaments] = await Promise.all([
        prisma.$queryRaw<{ id: string; name: string; slug: string | null; subtitle: string | null; image: string | null; price: number | null; score: number }[]>`
          SELECT p.id, p.name, p.slug, p.category AS subtitle,
            (SELECT pi.url FROM "PrebuiltImages" pi WHERE pi."prebuildProductId" = p.id AND pi."isMain" = true LIMIT 1) AS image,
            (SELECT pv.price FROM "PrebuiltVariants" pv WHERE pv."prebuildProductId" = p.id AND pv."isActive" = true ORDER BY pv.price ASC LIMIT 1) AS price,
            CASE WHEN LOWER(p.name) LIKE ${starts} THEN 0.9
                 WHEN LOWER(p.name) LIKE ${like} THEN 0.7
                 WHEN LOWER(COALESCE(p.category, '')) LIKE ${like} THEN 0.5
                 ELSE 0.3 END::float8 AS score
          FROM "PrebuiltProducts" p
          WHERE LOWER(p.name) LIKE ${like}
             OR LOWER(COALESCE(p.category, '')) LIKE ${like}
          ORDER BY score DESC LIMIT ${PER_TABLE}`,
        prisma.$queryRaw<{ id: string; name: string; slug: string; brand: string | null; technology: string | null; image: string | null; price: number | null; score: number }[]>`
          SELECT r.id, r.name, r.slug, r.brand, r.technology,
            r."cardImageUrl" AS image,
            (SELECT rw.price FROM "ResinWeight" rw WHERE rw."resinId" = r.id ORDER BY rw.price ASC LIMIT 1) AS price,
            CASE WHEN LOWER(r.name) LIKE ${starts} THEN 0.9
                 WHEN LOWER(r.name) LIKE ${like} THEN 0.7
                 WHEN LOWER(COALESCE(r.brand, '')) LIKE ${like} THEN 0.5
                 ELSE 0.3 END::float8 AS score
          FROM "Resin" r
          WHERE LOWER(r.name) LIKE ${like}
             OR LOWER(COALESCE(r.brand, '')) LIKE ${like}
             OR LOWER(COALESCE(r.technology, '')) LIKE ${like}
          ORDER BY score DESC LIMIT ${PER_TABLE}`,
        prisma.$queryRaw<{ id: string; name: string; slug: string; brand: string | null; technology: string | null; price: number | null; image: string | null; score: number }[]>`
          SELECT p.id, p.name, p.slug, p.brand, p.technology, p.price,
            (SELECT pi.url FROM "PrinterImage" pi WHERE pi."printerId" = p.id AND pi."isMain" = true LIMIT 1) AS image,
            CASE WHEN LOWER(p.name) LIKE ${starts} THEN 0.9
                 WHEN LOWER(p.name) LIKE ${like} THEN 0.7
                 WHEN LOWER(COALESCE(p.brand, '')) LIKE ${like} THEN 0.5
                 ELSE 0.3 END::float8 AS score
          FROM "Printer" p
          WHERE LOWER(p.name) LIKE ${like}
             OR LOWER(COALESCE(p.brand, '')) LIKE ${like}
             OR LOWER(COALESCE(p.technology, '')) LIKE ${like}
          ORDER BY score DESC LIMIT ${PER_TABLE}`,
        prisma.$queryRaw<{ id: string; name: string; slug: string | null; brand: string | null; material: string | null; colorName: string | null; image: string | null; price: number | null; score: number }[]>`
          SELECT f.id, f.name, f.slug, f.brand, f.material, f."colorName",
            f.images[1] AS image,
            (SELECT fv.price FROM "FilamentVariant" fv WHERE fv."filamentId" = f.id ORDER BY fv.price ASC LIMIT 1) AS price,
            CASE WHEN LOWER(f.name) LIKE ${starts} THEN 0.9
                 WHEN LOWER(f.name) LIKE ${like} THEN 0.7
                 WHEN LOWER(COALESCE(f.material, '')) LIKE ${like} THEN 0.5
                 WHEN LOWER(COALESCE(f."colorName", '')) LIKE ${like} THEN 0.5
                 ELSE 0.3 END::float8 AS score
          FROM "Filament" f
          WHERE LOWER(f.name) LIKE ${like}
             OR LOWER(COALESCE(f.brand, '')) LIKE ${like}
             OR LOWER(COALESCE(f.material, '')) LIKE ${like}
             OR LOWER(COALESCE(f."colorName", '')) LIKE ${like}
          ORDER BY score DESC LIMIT ${PER_TABLE}`,
    ]);

    return [
        ...prebuilt.map((r) => ({ ...r, type: "prebuilt" as const, href: `/prebuilt-products/${r.slug || r.id}` })),
        ...resins.map((r) => ({ id: r.id, name: r.name, type: "resin" as const, price: r.price, image: r.image, subtitle: [r.brand, r.technology].filter(Boolean).join(" · "), href: `/resins/${r.slug}`, score: r.score })),
        ...printers.map((r) => ({ id: r.id, name: r.name, type: "printer" as const, price: r.price, image: r.image, subtitle: [r.brand, r.technology].filter(Boolean).join(" · "), href: `/printers/${r.slug}`, score: r.score })),
        ...filaments.map((r) => ({ id: r.id, name: r.name, type: "filament" as const, price: r.price, image: r.image, subtitle: [r.brand, r.material, r.colorName].filter(Boolean).join(" · "), href: `/filament/${r.slug || r.id}`, score: r.score })),
    ];
}

// ---------- Route handler ----------

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const raw = searchParams.get("q")?.trim();

        if (!raw || raw.length < 2) {
            return NextResponse.json({ results: [], count: 0 });
        }

        const q = raw.toLowerCase();
        const escaped = escapeLike(q);
        const like = `%${escaped}%`;
        const starts = `${escaped}%`;

        let results: ScoredResult[];

        // Short queries (2-3 chars): ILIKE only on name/category/brand — no fuzzy, no description
        if (q.length < 4) {
            results = await shortQuerySearch(q);
        } else {
            const useFuzzy = await ensureTrigram();
            if (useFuzzy) {
                const [prebuilt, resins, printers, filaments] = await Promise.all([
                    fuzzyPrebuilt(q, like, starts),
                    fuzzyResins(q, like, starts),
                    fuzzyPrinters(q, like, starts),
                    fuzzyFilaments(q, like, starts),
                ]);
                results = [...prebuilt, ...resins, ...printers, ...filaments];
            } else {
                results = await fallbackSearch(q);
            }
        }

        // Sort by score descending, take top 15
        results.sort((a, b) => b.score - a.score);
        const top = results.slice(0, 15);

        return NextResponse.json({
            results: top.map(({ score: _score, ...r }) => r),
            count: top.length,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[Search] Error:", msg);
        return NextResponse.json(
            { error: true, message: "Failed to perform search", details: msg },
            { status: 500 },
        );
    }
}
