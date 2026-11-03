import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PROVINCES, INITIAL_MOTIFS } from '@/data/batik-database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/provinces/${slug}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to local dataset');
    }
  }

  const province = INITIAL_PROVINCES.find((p) => p.slug === slug);
  if (!province) {
    return NextResponse.json({ error: 'Provinsi tidak ditemukan' }, { status: 404 });
  }

  const motifs = INITIAL_MOTIFS.filter((m) => m.provinceId === province.id);

  return NextResponse.json({
    ...province,
    motifs,
  });
}

