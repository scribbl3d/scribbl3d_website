import { prisma } from '@/lib/prisma';

// Plain-text catalogue index for LLM crawlers, generated from live catalogue data.
// Printer prices are omitted; the printer product page is authoritative for them.
export const revalidate = 3600;

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

function clean(text: string | null | undefined, max = 300): string {
  const plain = (text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  const cut = plain.lastIndexOf(' ', max);
  return `${plain.slice(0, cut > 0 ? cut : max)}…`;
}

// Keep product names from breaking markdown link syntax
const linkText = (name: string) => name.trim().replace(/[[\]]/g, '');

function priceRange(prices: (number | null | undefined)[]): string {
  const valid = prices.filter((p): p is number => typeof p === 'number' && p > 0);
  if (valid.length === 0) return '';
  const low = Math.min(...valid);
  const high = Math.max(...valid);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  return low === high ? fmt(low) : `${fmt(low)} – ${fmt(high)}`;
}

function entry(name: string, url: string, details: (string | false | null | undefined)[], description?: string | null) {
  const meta = details.filter(Boolean).join(' · ');
  const summary = clean(description);
  return `- [${linkText(name)}](${url})${meta ? `: ${meta}` : ''}${summary ? `\n  ${summary}` : ''}`;
}

export async function GET() {
  try {
    return await buildIndex();
  } catch (error) {
    console.error('Error generating llms-full.txt:', error);
    return new Response(
      `# Scribbl3D — Full Catalogue Index\n\n> The catalogue index is temporarily unavailable. See ${baseUrl}/llms.txt and ${baseUrl}/sitemap.xml.\n`,
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '600' } },
    );
  }
}

async function buildIndex() {
  const [printers, filaments, resins, prebuilt, blogs] = await Promise.all([
    prisma.printer.findMany({
      select: { name: true, slug: true, brand: true, technology: true, inStock: true, shortDescription: true },
      orderBy: { name: 'asc' },
    }),
    prisma.filament.findMany({
      select: {
        id: true, name: true, slug: true, brand: true, material: true, colorName: true, finishType: true,
        inStock: true, shortDescription: true,
        variants: { select: { price: true, diameter: true, spoolWeight: true, inStock: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.resin.findMany({
      select: {
        name: true, slug: true, brand: true, technology: true, inStock: true, shortDescription: true,
        weights: { select: { price: true, weightInGrams: true, inStock: true } },
        colours: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.prebuiltProducts.findMany({
      where: { slug: { not: null } },
      select: {
        name: true, slug: true, category: true, inStock: true, shortDescription: true,
        variants: { where: { isActive: true }, select: { price: true, inStock: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.blog.findMany({
      where: { published: true },
      select: { id: true, slug: true, title: true, description: true },
      orderBy: { publishedAt: 'desc' },
    }),
  ]);

  const stock = (inStock: boolean) => (inStock ? 'In stock' : 'Out of stock');
  const unique = (values: (string | null | undefined)[]) => Array.from(new Set(values.filter(Boolean))).join(', ');

  const sections = [
    `# Scribbl3D — Full Catalogue Index`,
    `> Live index of Scribbl3D products and guides, generated from the store catalogue. Prices are in Indian rupees (INR) and can change; the linked product page is authoritative for current price and stock. Store policies and contact details: ${baseUrl}/llms.txt`,
    `## 3D Printers\n\n${printers
      .map((p) => entry(p.name, `${baseUrl}/printers/${p.slug}`, [p.brand, p.technology, stock(p.inStock)], p.shortDescription))
      .join('\n')}`,
    `## 3D Printer Filaments\n\n${filaments
      .map((f) =>
        entry(
          f.name,
          `${baseUrl}/filament/${f.slug || f.id}`,
          [
            f.brand,
            f.material,
            f.colorName && `Colour: ${f.colorName}`,
            f.finishType && `Finish: ${f.finishType}`,
            unique(f.variants.map((v) => v.diameter)) && `Diameter: ${unique(f.variants.map((v) => v.diameter))}`,
            unique(f.variants.map((v) => v.spoolWeight)) && `Spool: ${unique(f.variants.map((v) => v.spoolWeight))}`,
            priceRange(f.variants.map((v) => v.price)),
            stock(f.inStock && f.variants.some((v) => v.inStock)),
          ],
          f.shortDescription,
        ),
      )
      .join('\n')}`,
    `## 3D Printer Resins\n\n${resins
      .map((r) =>
        entry(
          r.name,
          `${baseUrl}/resins/${r.slug}`,
          [
            r.brand,
            r.technology,
            r.colours.length > 0 && `Colours: ${unique(r.colours.map((c) => c.name))}`,
            r.weights.length > 0 && `Sizes: ${r.weights.map((w) => `${w.weightInGrams}g`).join(', ')}`,
            priceRange(r.weights.map((w) => w.price)),
            stock(r.inStock && r.weights.some((w) => w.inStock)),
          ],
          r.shortDescription,
        ),
      )
      .join('\n')}`,
    `## Prebuilt 3D Printed Products\n\n${prebuilt
      .map((p) =>
        entry(
          p.name,
          `${baseUrl}/prebuilt-products/${p.slug}`,
          [p.category, priceRange(p.variants.map((v) => v.price)), stock(p.inStock && p.variants.some((v) => v.inStock))],
          p.shortDescription,
        ),
      )
      .join('\n')}`,
    `## Guides and Articles\n\n${blogs
      .map((b) => entry(b.title, `${baseUrl}/blog/${b.slug || b.id}`, [], b.description))
      .join('\n')}`,
  ];

  return new Response(`${sections.join('\n\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
