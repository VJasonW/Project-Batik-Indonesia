'use client';

import React from 'react';

interface ProvinceTooltipProps {
  name: string | null;
  motifs: { name: string }[];
  totalMotifs: number;
  position: { x: number; y: number };
}

export default function ProvinceTooltip({ name, motifs, totalMotifs, position }: ProvinceTooltipProps) {
  if (!name) return null;

  // Clamp tooltip position to stay within viewport
  const tooltipWidth = 280;
  const tooltipHeight = 200; // approximate max height
  const offset = 16;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

  let left = position.x + offset;
  let top = position.y - 10;

  // Prevent right overflow
  if (left + tooltipWidth > viewportWidth - offset) {
    left = position.x - tooltipWidth - offset;
  }

  // Prevent bottom overflow
  if (top + tooltipHeight > viewportHeight - offset) {
    top = viewportHeight - tooltipHeight - offset;
  }

  // Prevent top overflow
  if (top < offset) {
    top = offset;
  }

  // Prevent left overflow
  if (left < offset) {
    left = offset;
  }

  return (
    <div
      className="tooltip-container"
      role="tooltip"
      aria-label={`Provinsi ${name}`}
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div className="tooltip-card">
        <h3 className="tooltip-title">{name}</h3>
        {motifs.length > 0 ? (
          <>
            <ul className="tooltip-list" aria-label="Daftar motif batik">
              {motifs.slice(0, 5).map((m, i) => (
                <li key={i}>{m.name}</li>
              ))}
            </ul>
            {totalMotifs > 5 && (
              <p className="tooltip-more">+{totalMotifs - 5} motif lainnya</p>
            )}
          </>
        ) : (
          <p className="tooltip-empty">Belum ada data batik</p>
        )}
        <p className="tooltip-cta">Klik untuk lihat semua →</p>
      </div>
    </div>
  );
}
