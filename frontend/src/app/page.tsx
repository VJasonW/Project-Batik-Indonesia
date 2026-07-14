'use client';

import dynamic from 'next/dynamic';

const IndonesiaMap2D = dynamic(() => import('@/components/Map2D/IndonesiaMap2D'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="loading-spinner"></div>
      <p>Memuat peta 2D Indonesia...</p>
    </div>
  ),
});

export default function HomePage() {
  return <IndonesiaMap2D />;
}
