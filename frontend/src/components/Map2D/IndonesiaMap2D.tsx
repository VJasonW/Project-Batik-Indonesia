'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProvinces, fetchProvinceBySlug, fetchMotifSummary, getImageUrl, type Province, type ProvinceDetail } from '@/lib/api';
import { PROVINCE_KODE_TO_SLUG, PROVINCE_NAME_MAP } from '@/lib/geo-utils';
import { IconGlobe, IconUser, IconZoomIn, IconX, IconSpinner, IconBuilding, IconMap, IconPalette, IconPin } from '@/components/Icons';
import geoJsonData from '@/data/indonesia-provinces.json';

export default function IndonesiaMap2D() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [leafletLib, setLeafletLib] = useState<any>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceDetail | null>(null);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [noDataProvinceName, setNoDataProvinceName] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const initializingRef = useRef(false);

  // Fetch all provinces data on mount
  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(console.error);
  }, []);

  // Initialize Leaflet Map dynamically inside useEffect to prevent any SSR or evaluation issues
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || initializingRef.current) return;

    initializingRef.current = true;

    import('leaflet').then((L) => {
      setLeafletLib(L);

      // Verify that the element is still in the DOM and doesn't already have an initialized map
      const container = mapContainerRef.current;
      if (!container) {
        initializingRef.current = false;
        return;
      }

      if ((container as any)._leaflet_id) {
        // Already initialized, skip duplicate instantiation
        initializingRef.current = false;
        return;
      }

      const map = L.map(container, {
        center: [-2.5, 118.0],
        zoom: 5,
        zoomControl: false,
        minZoom: 4,
        maxZoom: 7,
        maxBounds: [
          [-15, 90], // Southwest bounds
          [10, 145]  // Northeast bounds
        ],
        maxBoundsViscosity: 0.8
      });

      // OpenStreetMap tile layer (Free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19
      }).addTo(map);

      // Position zoom control in bottom-left
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      mapRef.current = map;
      setMapInstance(map);
      initializingRef.current = false;
    }).catch((err) => {
      console.error('Failed to load Leaflet:', err);
      initializingRef.current = false;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle click on province with data
  const handleProvinceClick = async (slug: string) => {
    setNoDataProvinceName(null);
    setLoadingProvince(true);
    try {
      const data = await fetchProvinceBySlug(slug);
      setSelectedProvince(data);
    } catch (err) {
      console.error('Error fetching province details:', err);
    } finally {
      setLoadingProvince(false);
    }
  };

  // Handle click on province with no data
  const handleProvinceNoDataClick = (name: string) => {
    setSelectedProvince(null);
    setNoDataProvinceName(name);
  };

  // Reset Map View function
  const handleResetView = () => {
    if (mapInstance) {
      mapInstance.setView([-2.5, 118.0], 5);
    }
  };

  // Draw GeoJSON layer when map, Leaflet library, and provinces data are loaded
  useEffect(() => {
    if (!mapInstance || !leafletLib || provinces.length === 0) return;

    const L = leafletLib;
    const provinceMap = new Map<string, Province>();
    provinces.forEach(p => provinceMap.set(p.slug, p));

    const geoJsonLayer = L.geoJSON(geoJsonData as any, {
      style: (feature: any) => {
        const kode = String(feature?.properties?.kode);
        const slug = PROVINCE_KODE_TO_SLUG[kode] || '';
        const prov = provinceMap.get(slug);
        const hasData = prov ? prov.motifCount > 0 : false;

        return {
          fillColor: hasData ? '#FAFAFA' : '#D5D5D5',
          fillOpacity: hasData ? 0.9 : 0.4,
          weight: 1.5,
          color: '#1A1A1A', // stroke color
          dashArray: '',
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const kode = String(feature?.properties?.kode);
        const slug = PROVINCE_KODE_TO_SLUG[kode] || '';
        const prov = provinceMap.get(slug);
        const hasData = prov ? prov.motifCount > 0 : false;
        const name = PROVINCE_NAME_MAP[feature?.properties?.Propinsi] || feature?.properties?.Propinsi;

        if (hasData && prov) {
          // Bind tooltip with sticky following cursor
          layer.bindTooltip(`
            <div class="leaflet-custom-tooltip">
              <h3 class="tooltip-title">${name}</h3>
              <p class="tooltip-loading">Memuat motif...</p>
            </div>
          `, {
            sticky: true,
            direction: 'auto',
            className: 'leaflet-tooltip-custom',
            offset: [15, 15]
          });

          // Interactive states
          layer.on({
            mouseover: (e: any) => {
              const l = e.target;
              // Only change style if not currently selected
              if (!selectedProvince || selectedProvince.slug !== slug) {
                l.setStyle({
                  fillColor: prov.accentColor || '#6B4226',
                  fillOpacity: 0.95,
                });
              }

              // Load motifs dynamically on hover
              fetchMotifSummary(slug).then(summary => {
                const motifsList = summary.motifs.slice(0, 2).map(m => `<li>${m.name}</li>`).join('');
                const moreCount = summary.totalMotifs - 2;
                const moreText = moreCount > 0 ? `<p class="tooltip-more">+${moreCount} motif lainnya</p>` : '';
                const updatedContent = `
                  <div class="leaflet-custom-tooltip">
                    <h3 class="tooltip-title">${name}</h3>
                    <ul class="tooltip-list">
                      ${motifsList || '<li>Belum ada data batik</li>'}
                    </ul>
                    ${moreText}
                    <p class="tooltip-cta">Klik untuk detail →</p>
                  </div>
                `;
                l.setTooltipContent(updatedContent);
              }).catch(() => {
                l.setTooltipContent(`
                  <div class="leaflet-custom-tooltip">
                    <h3 class="tooltip-title">${name}</h3>
                    <p class="tooltip-cta">Klik untuk detail →</p>
                  </div>
                `);
              });
            },
            mouseout: (e: any) => {
              const l = e.target;
              if (!selectedProvince || selectedProvince.slug !== slug) {
                l.setStyle({
                  fillColor: '#FAFAFA',
                  fillOpacity: 0.9,
                });
              }
            },
            click: () => {
              handleProvinceClick(slug);
            }
          });
        } else {
          // Province without data
          layer.bindTooltip(`
            <div class="leaflet-custom-tooltip">
              <h3 class="tooltip-title">${name}</h3>
              <p class="tooltip-empty">Data motif belum tersedia</p>
            </div>
          `, {
            sticky: true,
            direction: 'auto',
            className: 'leaflet-tooltip-custom',
            offset: [15, 15]
          });

          layer.on({
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.5
              });
            },
            mouseout: (e: any) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.4
              });
            },
            click: () => {
              handleProvinceNoDataClick(name);
            }
          });
        }
      }
    }).addTo(mapInstance);

    geoJsonLayerRef.current = geoJsonLayer;

    return () => {
      mapInstance.removeLayer(geoJsonLayer);
    };
  }, [mapInstance, leafletLib, provinces, selectedProvince]);

  // Keep selected province highlighted on map updates
  useEffect(() => {
    if (!geoJsonLayerRef.current || provinces.length === 0) return;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const feature = layer.feature;
      const kode = String(feature?.properties?.kode);
      const slug = PROVINCE_KODE_TO_SLUG[kode] || '';
      const prov = provinces.find(p => p.slug === slug);
      const hasData = prov ? prov.motifCount > 0 : false;
      const isSelected = selectedProvince && selectedProvince.slug === slug;

      if (isSelected && prov) {
        layer.setStyle({
          fillColor: prov.accentColor || '#6B4226',
          fillOpacity: 0.95,
          weight: 2,
          color: '#1A1A1A'
        });
      } else {
        layer.setStyle({
          fillColor: hasData ? '#FAFAFA' : '#D5D5D5',
          fillOpacity: hasData ? 0.9 : 0.4,
          weight: 1.5,
          color: '#1A1A1A'
        });
      }
    });
  }, [selectedProvince, provinces]);

  return (
    <div className="map-container" role="application" aria-label="Peta 2D interaktif Indonesia">
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="leaflet-map-element" style={{ width: '100%', height: '100%', background: '#FAFAFA' }} />

      {/* Header overlay */}
      <div className="map-header">
        <h1 className="map-title">
          <IconGlobe size={24} />
          Peta Interaktif Batik Indonesia
        </h1>
        <p className="map-subtitle">Jelajahi kekayaan motif batik dari seluruh Nusantara</p>
      </div>

      {/* Controls Overlay */}
      <div className="map-controls">
        <button onClick={handleResetView} className="btn-map-control" aria-label="Reset Tampilan Peta">
          <IconZoomIn size={16} />
          <span>Reset View</span>
        </button>
        <a href="/admin/login" className="admin-link" aria-label="Buka panel admin">
          <IconUser size={16} />
          <span>Admin</span>
        </a>
      </div>

      {/* Side Information Panel (1/3 Right Slide-In) */}
      <div className={`info-panel ${selectedProvince ? 'open' : ''}`} role="region" aria-label="Panel Informasi Provinsi">
        {selectedProvince && (
          <div className="info-panel-content">
            <button className="info-panel-close" onClick={() => setSelectedProvince(null)} aria-label="Tutup Panel">
              <IconX size={20} />
            </button>

            <div className="info-panel-header">
              <h2 className="info-panel-title" style={{ color: selectedProvince.accentColor || '#1A1A1A' }}>
                {selectedProvince.name}
              </h2>
              <div className="info-panel-meta">
                {selectedProvince.capital && (
                  <span className="info-panel-meta-item">
                    <IconBuilding size={14} />
                    Ibu kota: {selectedProvince.capital}
                  </span>
                )}
                {selectedProvince.region && (
                  <span className="info-panel-meta-item">
                    <IconMap size={14} />
                    Wilayah: {selectedProvince.region}
                  </span>
                )}
              </div>
            </div>

            <div className="info-panel-section">
              <h3 className="section-subtitle">Tentang Batik Daerah</h3>
              <p className="section-desc">{selectedProvince.shortDescription || 'Data deskripsi budaya batik belum diinput.'}</p>
            </div>

            <div className="info-panel-section">
              <h3 className="section-subtitle">Motif Batik Populer</h3>
              {selectedProvince.motifs && selectedProvince.motifs.length > 0 ? (
                <div className="info-panel-motifs-list">
                  {selectedProvince.motifs.slice(0, 3).map((motif) => (
                    <div key={motif.id} className="info-panel-motif-item">
                      <img
                        src={getImageUrl(motif.imageUrl)}
                        alt={`Motif ${motif.name}`}
                        className="motif-item-thumb"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-batik.svg'; }}
                      />
                      <div className="motif-item-info">
                        <h4 className="motif-item-name">{motif.name}</h4>
                        {motif.originCity && (
                          <span className="motif-item-city">
                            <IconPin size={10} /> {motif.originCity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedProvince.motifs.length > 3 && (
                    <p className="motifs-remaining-count">Dan {selectedProvince.motifs.length - 3} motif lainnya...</p>
                  )}
                </div>
              ) : (
                <p className="no-data-text">Belum ada data motif batik.</p>
              )}
            </div>

            <div className="info-panel-actions">
              <button
                className="btn btn-primary w-full"
                onClick={() => router.push(`/provinsi/${selectedProvince.slug}`)}
              >
                <IconPalette size={16} />
                Lihat Detail Lengkap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating alert for no data province */}
      {noDataProvinceName && (
        <div className="no-data-toast" role="alert">
          <p>Data motif batik belum tersedia untuk <strong>{noDataProvinceName}</strong>.</p>
          <button onClick={() => setNoDataProvinceName(null)} aria-label="Tutup notifikasi">
            <IconX size={14} />
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {loadingProvince && (
        <div className="map-fetch-loader" role="status" aria-label="Mengambil data...">
          <IconSpinner size={20} className="icon-spin" />
          <span>Memuat data...</span>
        </div>
      )}
    </div>
  );
}
