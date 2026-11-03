import { NextResponse } from 'next/server';
import { INITIAL_PROVINCES, INITIAL_MOTIFS } from '@/data/batik-database';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/provinces`, {
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

  // Count motifs per province
  const motifCounts: Record<number, number> = {};
  for (const motif of INITIAL_MOTIFS) {
    motifCounts[motif.provinceId] = (motifCounts[motif.provinceId] || 0) + 1;
  }

  const result = INITIAL_PROVINCES.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    capital: p.capital,
    region: p.region,
    geoId: p.geoId,
    shortDescription: p.shortDescription,
    accentColor: p.accentColor,
    motifCount: motifCounts[p.id] || 0,
  }));

  return NextResponse.json(result);
}

