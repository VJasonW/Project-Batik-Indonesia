'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { geoJsonToShapes, getProvinceColor, PROVINCE_NAME_MAP, PROVINCE_KODE_TO_SLUG, warpGeometryToSphere } from '@/lib/geo-utils';

interface ProvinceFeature {
  properties: {
    Propinsi: string;
    kode: number;
    ID: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][][] | number[][][];
  };
}

interface ProvinceMeshProps {
  feature: ProvinceFeature;
  index: number;
  onHover: (name: string | null, slug: string | null, position: THREE.Vector3 | null) => void;
  provinceMotifs: Record<string, { motifs: { name: string }[]; total: number }>;
}

const EXTRUDE_SETTINGS = {
  depth: 0.6, // Rise slightly more on the globe
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.05,
  bevelSegments: 2,
};

export default function ProvinceMesh({ feature, index, onHover, provinceMotifs }: ProvinceMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const geoName = feature.properties.Propinsi;
  const displayName = PROVINCE_NAME_MAP[geoName] || geoName;
  const kode = String(feature.properties.kode);
  const slug = PROVINCE_KODE_TO_SLUG[kode] || '';

  const baseColor = useMemo(() => getProvinceColor(index), [index]);
  const hoverColor = '#FFD700';

  const shapes = useMemo(() => {
    try {
      return geoJsonToShapes(feature.geometry);
    } catch {
      return [];
    }
  }, [feature.geometry]);

  // Create warped geometries for the sphere of radius 24
  const geometries = useMemo(() => {
    return shapes.map(shape => {
      const geometry = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
      warpGeometryToSphere(geometry, 24); // Globe radius is 24
      return geometry;
    });
  }, [shapes]);

  // Clean up geometries on unmount
  React.useEffect(() => {
    return () => {
      geometries.forEach(geo => geo.dispose());
    };
  }, [geometries]);

  const handlePointerOver = useCallback((e: THREE.Event) => {
    (e as any).stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';

    // Get world position for tooltip
    if (meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const center = box.getCenter(new THREE.Vector3());
      onHover(displayName, slug, center);
    }
  }, [displayName, slug, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
    onHover(null, null, null);
  }, [onHover]);

  const handleClick = useCallback((e: THREE.Event) => {
    (e as any).stopPropagation();
    if (slug) {
      router.push(`/provinsi/${slug}`);
    }
  }, [slug, router]);

  if (shapes.length === 0) return null;

  return (
    <group
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      // Scale from center of globe to make it pop up
      scale={hovered ? 1.015 : 1.0}
    >
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={hovered ? hoverColor : baseColor}
            roughness={0.5}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
