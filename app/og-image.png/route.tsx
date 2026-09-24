import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

// Site-wide social sharing image (1200×630), served at the /og-image.png URL
// that page metadata already references. Replaces a placeholder text file.
export const dynamic = 'force-static';

export async function GET() {
  const logo = await readFile(path.join(process.cwd(), 'public', 'logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '80px',
          gap: '64px',
          background: 'linear-gradient(135deg, #372AAC 0%, #1D4ED8 55%, #3B82F6 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            height: 320,
            borderRadius: 40,
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={300} height={300} alt="" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 660 }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>Scribbl3D</div>
          <div style={{ fontSize: 38, lineHeight: 1.3, opacity: 0.92 }}>
            3D Printers, Filaments, Resins &amp; 3D Printing Services in India
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    },
  );
}
