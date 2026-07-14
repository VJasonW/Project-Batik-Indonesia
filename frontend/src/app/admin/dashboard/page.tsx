'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProvinces, type Province } from '@/lib/api';
import { IconPalette, IconChart, IconMap, IconLogout, IconGlobe, IconMenu, IconX } from '@/components/Icons';

export default function AdminDashboard() {
  const router = useRouter();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    let isValid = false;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : false;
        if (!isExpired) {
          isValid = true;
        }
      } catch {
        isValid = false;
      }
    }

    if (!isValid) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
      router.push('/admin/login');
      return;
    }

    fetchProvinces()
      .then(setProvinces)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="map-loading" role="status" aria-label="Memuat dashboard">
        <div className="loading-spinner" />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  const jawaProvinces = provinces.filter(p => p.region === 'Jawa');
  const otherProvinces = provinces.filter(p => p.region !== 'Jawa');
  const totalMotifs = provinces.reduce((a, b) => a + b.motifCount, 0);

  return (
    <div className="admin-layout">
      {/* Mobile hamburger */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <IconX size={20} /> : <IconMenu size={20} />}
      </button>

      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Menu admin">
        <h2 className="admin-sidebar-title">
          <IconPalette size={20} />
          Admin Panel
        </h2>
        <Link href="/admin/dashboard" className="admin-sidebar-link active" onClick={() => setSidebarOpen(false)}>
          <IconChart size={18} />
          Dashboard
        </Link>
        <Link href="/" className="admin-sidebar-link" onClick={() => setSidebarOpen(false)}>
          <IconMap size={18} />
          Lihat Peta
        </Link>
        <button
          onClick={handleLogout}
          className="admin-sidebar-link danger"
          aria-label="Logout dari admin panel"
        >
          <IconLogout size={18} />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <h1 className="admin-title">Dashboard — Kelola Data Batik</h1>

        <p className="admin-description">
          Pilih provinsi untuk mengelola data motif batik. Total: {provinces.length} provinsi, {totalMotifs} motif batik.
        </p>

        {/* Jawa Section */}
        <h2 className="admin-section-heading">
          <IconGlobe size={18} />
          Pulau Jawa
        </h2>
        <table className="admin-table" aria-label="Daftar provinsi Pulau Jawa">
          <thead>
            <tr>
              <th scope="col">Provinsi</th>
              <th scope="col">Ibu Kota</th>
              <th scope="col">Jumlah Motif</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jawaProvinces.map((province) => (
              <tr key={province.id}>
                <td className="table-cell-name">{province.name}</td>
                <td>{province.capital || '-'}</td>
                <td>
                  <span className={`badge ${province.motifCount > 0 ? 'badge-success' : 'badge-muted'}`}>
                    {province.motifCount} motif
                  </span>
                </td>
                <td>
                  <Link href={`/admin/provinces/${province.slug}`} className="btn btn-outline btn-sm">
                    Kelola →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Other Regions */}
        <h2 className="admin-section-heading">
          <IconMap size={18} />
          Provinsi Lainnya
        </h2>
        <table className="admin-table" aria-label="Daftar provinsi lainnya">
          <thead>
            <tr>
              <th scope="col">Provinsi</th>
              <th scope="col">Wilayah</th>
              <th scope="col">Jumlah Motif</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {otherProvinces.map((province) => (
              <tr key={province.id}>
                <td className="table-cell-name">{province.name}</td>
                <td>{province.region || '-'}</td>
                <td>
                  <span className={`badge ${province.motifCount > 0 ? 'badge-success' : 'badge-muted'}`}>
                    {province.motifCount} motif
                  </span>
                </td>
                <td>
                  <Link href={`/admin/provinces/${province.slug}`} className="btn btn-outline btn-sm">
                    Kelola →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
