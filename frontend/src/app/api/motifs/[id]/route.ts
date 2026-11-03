import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PROVINCES, INITIAL_MOTIFS } from '@/data/batik-database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const motifId = parseInt(id, 10);
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/motifs/${id}`, {
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

  const motif = INITIAL_MOTIFS.find((m) => m.id === motifId);
  if (!motif) {
    return NextResponse.json({ error: 'Motif batik tidak ditemukan' }, { status: 404 });
  }

  const province = INITIAL_PROVINCES.find((p) => p.id === motif.provinceId);

  return NextResponse.json({
    ...motif,
    province: province
      ? { id: province.id, slug: province.slug, name: province.name }
      : { id: motif.provinceId, slug: '', name: 'Unknown' },
  });
}

