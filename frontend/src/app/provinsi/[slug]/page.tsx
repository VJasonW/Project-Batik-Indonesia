'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchProvinceBySlug, type ProvinceDetail, type BatikMotif, getImageUrl } from '@/lib/api';
import { IconArrowLeft, IconX, IconPin, IconBuilding, IconMap, IconPalette, IconAlertCircle } from '@/components/Icons';

function MotifDetailModal({ motif, onClose }: { motif: BatikMotif; onClose: () => void }) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-motif-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title" id="modal-motif-title">{motif.name}</h2>
            {motif.originCity && (
              <p className="modal-origin">
                <IconPin size={14} />
                {motif.originCity}
              </p>
            )}
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Tutup detail motif"
          >
            <IconX size={18} />
          </button>
        </div>

        <img
          src={getImageUrl(motif.imageUrl)}
          alt={`Motif batik ${motif.name}`}
          className="modal-image"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-batik.svg'; }}
        />

        <div className="modal-body">
          {motif.shortSummary && (
            <div className="modal-section">
              <h3 className="modal-section-title">Ringkasan</h3>
              <p className="modal-section-text">{motif.shortSummary}</p>
            </div>
          )}

          {motif.history && (
            <div className="modal-section">
              <h3 className="modal-section-title">Sejarah</h3>
              <p className="modal-section-text">{motif.history}</p>
            </div>
          )}

          {motif.meaning && (
            <div className="modal-section">
              <h3 className="modal-section-title">Makna &amp; Filosofi</h3>
              <p className="modal-section-text">{motif.meaning}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProvinceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [province, setProvince] = useState<ProvinceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<BatikMotif | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProvinceBySlug(slug)
      .then((data) => {
        setProvince(data);
        setError(null);
      })
      .catch(() => setError('Provinsi tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCloseModal = useCallback(() => setSelectedMotif(null), []);

  if (loading) {
    return (
      <div className="map-loading" role="status" aria-label="Memuat data provinsi">
        <div className="loading-spinner" />
        <p>Memuat data provinsi...</p>
      </div>
    );
  }

  if (error || !province) {
    return (
      <div className="error-state" role="alert">
        <IconAlertCircle size={48} />
        <p>{error || 'Provinsi tidak ditemukan'}</p>
        <Link href="/" className="btn btn-outline">
          <IconArrowLeft size={16} />
          Kembali ke Peta
        </Link>
      </div>
    );
  }

  return (
    <div className="province-page">
      {/* Hero Section */}
      <div className="province-hero">
        <Link href="/" className="back-button" aria-label="Kembali ke peta utama">
          <IconArrowLeft size={16} />
          Kembali ke Peta
        </Link>
        <h1 className="province-name">{province.name}</h1>
        <div className="province-meta">
          {province.capital && (
            <span className="province-meta-item">
              <IconBuilding size={16} />
              {province.capital}
            </span>
          )}
          {province.region && (
            <span className="province-meta-item">
              <IconMap size={16} />
              {province.region}
            </span>
          )}
          <span className="province-meta-item">
            <IconPalette size={16} />
            {province.motifs.length} motif batik
          </span>
        </div>
        {province.shortDescription && (
          <p className="province-description">{province.shortDescription}</p>
        )}
      </div>

      {/* Motifs Grid */}
      <section className="motifs-section" aria-label="Daftar motif batik">
        <h2 className="motifs-section-title">
          <IconPalette size={24} />
          Motif Batik {province.name}
        </h2>

        {province.motifs.length > 0 ? (
          <div className="motifs-grid">
            {province.motifs.map((motif) => (
              <div
                key={motif.id}
                className="motif-card"
                onClick={() => setSelectedMotif(motif)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMotif(motif); } }}
                tabIndex={0}
                role="button"
                aria-label={`Lihat detail motif ${motif.name}`}
              >
                <img
                  src={getImageUrl(motif.imageUrl)}
                  alt={`Motif batik ${motif.name}`}
                  className="motif-card-image"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-batik.svg'; }}
                />
                <div className="motif-card-body">
                  <h3 className="motif-card-name">{motif.name}</h3>
                  {motif.originCity && (
                    <p className="motif-card-origin">
                      <IconPin size={14} />
                      {motif.originCity}
                    </p>
                  )}
                  {motif.shortSummary && (
                    <p className="motif-card-summary">{motif.shortSummary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconPalette size={48} />
            </div>
            <p className="empty-state-text">Belum ada data motif batik untuk provinsi ini</p>
            <p className="empty-state-hint">
              Data dapat ditambahkan melalui admin panel
            </p>
          </div>
        )}
      </section>

      {/* Motif Detail Modal */}
      {selectedMotif && (
        <MotifDetailModal
          motif={selectedMotif}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
