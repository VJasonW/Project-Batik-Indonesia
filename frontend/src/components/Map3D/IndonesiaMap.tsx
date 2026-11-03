'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import ProvinceMesh from './ProvinceMesh';
import ProvinceTooltip from './ProvinceTooltip';
import { fetchProvinces, fetchMotifSummary, type Province } from '@/lib/api';
import { PROVINCE_KODE_TO_SLUG } from '@/lib/geo-utils';
import { IconGlobe, IconUser, IconMove, IconZoomIn, IconPointer, IconAlertCircle } from '@/components/Icons';

// Import GeoJSON data
import geoJsonData from '@/data/indonesia-provinces.json';

interface HoverInfo {
  name: string | null;
  slug: string | null;
  position: THREE.Vector3 | null;
}

function MapScene({ onHover, provinceMotifs }: {
  onHover: (name: string | null, slug: string | null, pos: THREE.Vector3 | null) => void;
  provinceMotifs: Record<string, { motifs: { name: string }[]; total: number }>;
}) {
  const features = (geoJsonData as any).features || [];

  // Center Indonesia (lon: 118, lat: -2) facing the camera
  const globeRotation: [number, number, number] = useMemo(() => [
    (2 * Math.PI) / 180,
    -(118 * Math.PI) / 180,
    0
  ], []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 9, 48]} fov={45} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={27}
        maxDistance={90}
        target={[0, 0, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[60, 60, 50]} intensity={1.5} castShadow />
      <directionalLight position={[-60, 30, -50]} intensity={0.5} color="#457b9d" />
      <pointLight position={[0, 0, 70]} intensity={0.5} />

      {/* Globe Group */}
      <group rotation={globeRotation}>
        {/* Ocean Globe Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[23.8, 64, 64]} />
          <meshStandardMaterial
            color="#081426"
            roughness={0.3}
            metalness={0.8}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* High-tech Globe Grid overlay */}
        <mesh>
          <sphereGeometry args={[23.9, 36, 18]} />
          <meshBasicMaterial
            color="#3a5a8c"
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>

        {/* Province meshes on the sphere surface */}
        {features.map((feature: any, index: number) => (
          <ProvinceMesh
            key={index}
            feature={feature}
            index={index}
            onHover={onHover}
            provinceMotifs={provinceMotifs}
          />
        ))}
      </group>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="map-loading" role="status" aria-label="Memuat peta 3D Indonesia">
      <div className="loading-spinner" />
      <p>Memuat peta 3D Indonesia...</p>
    </div>
  );
}

/** Check if the browser supports WebGL */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="alert">
      <IconAlertCircle size={48} />
      <h2>Browser Tidak Mendukung Tampilan 3D</h2>
      <p>
        Browser atau perangkat Anda tidak mendukung WebGL yang diperlukan untuk
        menampilkan peta 3D. Silakan coba browser terbaru seperti Chrome, Firefox, atau Edge.
      </p>
      <a href="/admin/dashboard" className="btn btn-outline" style={{ marginTop: 8 }}>
        Buka Admin Panel
      </a>
    </div>
  );
}

export default function IndonesiaMap() {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({ name: null, slug: null, position: null });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provinceMotifs, setProvinceMotifs] = useState<Record<string, { motifs: { name: string }[]; total: number }>>({});
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  // Fetch provinces data for tooltip
  useEffect(() => {
    fetchProvinces().then((data) => {
      setProvinces(data);
    }).catch(console.error);
  }, []);

  // Build motifs lookup when provinces are fetched
  useEffect(() => {
    const lookup: Record<string, { motifs: { name: string }[]; total: number }> = {};
    for (const p of provinces) {
      lookup[p.slug] = { motifs: [], total: p.motifCount };
    }
    setProvinceMotifs(lookup);
  }, [provinces]);

  // Track mouse/touch position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Handle hover - fetch motif summary lazily
  const handleHover = useCallback(async (name: string | null, slug: string | null, pos: THREE.Vector3 | null) => {
    setHoverInfo({ name, slug, position: pos });

    if (slug && provinceMotifs[slug] && provinceMotifs[slug].motifs.length === 0 && provinceMotifs[slug].total > 0) {
      try {
        const data = await fetchMotifSummary(slug);
        setProvinceMotifs(prev => ({
          ...prev,
          [slug]: { motifs: data.motifs || [], total: data.totalMotifs || 0 },
        }));
      } catch {
        // Silently fail - tooltip will show basic info
      }
    }
  }, [provinceMotifs]);

  const currentMotifs = hoverInfo.slug && provinceMotifs[hoverInfo.slug]
    ? provinceMotifs[hoverInfo.slug]
    : { motifs: [], total: 0 };

  if (!webglSupported) {
    return <WebGLFallback />;
  }

  return (
    <div className="map-container" role="application" aria-label="Peta 3D interaktif Indonesia">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1b33 50%, #0a1628 100%)' }}
        >
          <MapScene onHover={handleHover} provinceMotifs={provinceMotifs} />
        </Canvas>
      </Suspense>

      <ProvinceTooltip
        name={hoverInfo.name}
        motifs={currentMotifs.motifs}
        totalMotifs={currentMotifs.total}
        position={mousePos}
      />

      {/* Header overlay */}
      <div className="map-header">
        <h1 className="map-title">
          <IconGlobe size={24} />
          Peta Interaktif Batik Indonesia
        </h1>
        <p className="map-subtitle">Jelajahi kekayaan motif batik dari seluruh Nusantara</p>
      </div>

      {/* Controls */}
      <div className="map-controls">
        <a href="/admin/login" className="admin-link" aria-label="Buka panel admin">
          <IconUser size={16} />
          <span>Admin</span>
        </a>
      </div>

      {/* Instructions */}
      <div className="map-instructions" role="note" aria-label="Instruksi kontrol peta">
        <span><IconMove size={16} /> Drag untuk memutar</span>
        <span><IconZoomIn size={16} /> Scroll untuk zoom</span>
        <span><IconPointer size={16} /> Klik provinsi untuk detail</span>
      </div>
    </div>
  );
}
