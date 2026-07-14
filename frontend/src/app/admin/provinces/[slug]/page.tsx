'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchProvinceBySlug,
  createMotif,
  updateMotif,
  deleteMotif,
  uploadImage,
  getImageUrl,
  updateAccentColor,
  updateProvince,
  type ProvinceDetail,
  type BatikMotif,
} from '@/lib/api';
import {
  IconPalette, IconChart, IconMap, IconBuilding, IconLogout,
  IconPlus, IconEdit, IconTrash, IconX, IconMenu, IconSpinner, IconUpload,
} from '@/components/Icons';

interface MotifFormData {
  name: string;
  shortSummary: string;
  history: string;
  meaning: string;
  originCity: string;
  imageUrl: string;
}

const emptyForm: MotifFormData = {
  name: '', shortSummary: '', history: '', meaning: '', originCity: '', imageUrl: '',
};

export default function AdminProvinceMotifs() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [province, setProvince] = useState<ProvinceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden');
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MotifFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [accentColor, setAccentColor] = useState('#7F8C8D');
  const [shortDescription, setShortDescription] = useState('');
  const [savingProvince, setSavingProvince] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
      }
      router.push('/admin/login');
      return;
    }

    loadProvince();
  }, [slug, token, router]);

  async function loadProvince() {
    try {
      setLoading(true);
      const data = await fetchProvinceBySlug(slug);
      setProvince(data);
      setAccentColor(data.accentColor || '#7F8C8D');
      setShortDescription(data.shortDescription || '');
    } catch { setMessage({ type: 'error', text: 'Gagal memuat data provinsi' }); }
    finally { setLoading(false); }
  }

  async function handleSaveProvinceSettings() {
    if (!token || !province) return;
    setSavingProvince(true);
    setMessage(null);
    try {
      await updateProvince(token, slug, { shortDescription, accentColor });
      setMessage({ type: 'success', text: 'Pengaturan provinsi berhasil diperbarui!' });
      setProvince(prev => prev ? { ...prev, shortDescription, accentColor } : null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui pengaturan provinsi' });
    } finally {
      setSavingProvince(false);
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditId(null);
    setImagePreview(null);
    setFormMode('create');
    setMessage(null);
  }

  function openEdit(motif: BatikMotif) {
    setForm({
      name: motif.name,
      shortSummary: motif.shortSummary || '',
      history: motif.history || '',
      meaning: motif.meaning || '',
      originCity: motif.originCity || '',
      imageUrl: motif.imageUrl || '',
    });
    setEditId(motif.id);
    setImagePreview(motif.imageUrl ? getImageUrl(motif.imageUrl) : null);
    setFormMode('edit');
    setMessage(null);
  }

  function closeForm() {
    setFormMode('hidden');
    setForm(emptyForm);
    setEditId(null);
    setImagePreview(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      const result = await uploadImage(token, file);
      setForm(prev => ({ ...prev, imageUrl: result.url }));
      setImagePreview(getImageUrl(result.url));
      setMessage({ type: 'success', text: 'Gambar berhasil diupload' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal upload gambar' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !province) return;

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Nama motif wajib diisi' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      if (formMode === 'create') {
        await createMotif(token, {
          name: form.name,
          provinceId: province.id,
          shortSummary: form.shortSummary || undefined,
          history: form.history || undefined,
          meaning: form.meaning || undefined,
          originCity: form.originCity || undefined,
          imageUrl: form.imageUrl || undefined,
        });
        setMessage({ type: 'success', text: 'Motif batik berhasil ditambahkan!' });
      } else if (formMode === 'edit' && editId) {
        await updateMotif(token, editId, {
          name: form.name,
          shortSummary: form.shortSummary || null,
          history: form.history || null,
          meaning: form.meaning || null,
          originCity: form.originCity || null,
          imageUrl: form.imageUrl || null,
        });
        setMessage({ type: 'success', text: 'Motif batik berhasil diupdate!' });
      }
      closeForm();
      await loadProvince();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(motifId: number, motifName: string) {
    if (!token) return;
    if (!confirm(`Yakin ingin menghapus motif "${motifName}"?`)) return;

    try {
      await deleteMotif(token, motifId);
      setMessage({ type: 'success', text: `Motif "${motifName}" berhasil dihapus` });
      await loadProvince();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus motif' });
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="map-loading" role="status" aria-label="Memuat data provinsi">
        <div className="loading-spinner" />
        <p>Memuat data provinsi...</p>
      </div>
    );
  }

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
        <Link href="/admin/dashboard" className="admin-sidebar-link" onClick={() => setSidebarOpen(false)}>
          <IconChart size={18} />
          Dashboard
        </Link>
        <Link href={`/admin/provinces/${slug}`} className="admin-sidebar-link active" onClick={() => setSidebarOpen(false)}>
          <IconBuilding size={18} />
          {province?.name}
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
        <div className="admin-page-header">
          <div>
            <Link href="/admin/dashboard" className="admin-breadcrumb">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="admin-title">
              Motif Batik — {province?.name}
            </h1>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus size={18} />
            Tambah Motif
          </button>
        </div>

        {message && (
          <div
            className={message.type === 'success' ? 'success-message' : 'error-message'}
            role={message.type === 'error' ? 'alert' : 'status'}
          >
            {message.text}
          </div>
        )}

        {/* Province Settings Section */}
        <div className="form-card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className="form-card-title">
            <IconPalette size={18} />
            Pengaturan Informasi Provinsi
          </h3>
          <p className="admin-description" style={{ marginBottom: 'var(--space-4)' }}>
            Sesuaikan deskripsi budaya batik dan warna aksen peta untuk provinsi ini.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
              <label className="form-label" htmlFor="province-desc-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Deskripsi Budaya Batik Provinsi
              </label>
              <textarea
                id="province-desc-input"
                className="form-input"
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Masukkan deskripsi singkat batik khas provinsi..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Warna Aksen Peta (Highlight)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{
                    width: '50px',
                    height: '44px',
                    padding: '2px',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                  id="accent-color-input"
                  aria-label="Pilih Warna Aksen"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('#') && val.length <= 7) {
                      setAccentColor(val);
                    } else if (!val.startsWith('#') && val.length <= 6) {
                      setAccentColor('#' + val);
                    }
                  }}
                  className="form-input"
                  style={{ width: '100px', textTransform: 'uppercase' }}
                  aria-label="Kode Hex Warna Aksen"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <button
                onClick={handleSaveProvinceSettings}
                className="btn btn-primary"
                disabled={savingProvince || !accentColor || !shortDescription}
                aria-busy={savingProvince}
              >
                {savingProvince ? (
                  <>
                    <IconSpinner size={18} className="icon-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Pengaturan'
                )}
              </button>
              {province && (accentColor !== province.accentColor || shortDescription !== (province.shortDescription || '')) && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  (Perubahan belum disimpan)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Motif Form */}
        {formMode !== 'hidden' && (
          <div className="form-card">
            <h3 className="form-card-title">
              {formMode === 'create' ? (
                <><IconPlus size={18} /> Tambah Motif Baru</>
              ) : (
                <><IconEdit size={18} /> Edit Motif</>
              )}
            </h3>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="motif-name">Nama Motif *</label>
                  <input
                    id="motif-name"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Batik Parang"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="motif-origin">Kota/Kabupaten Asal</label>
                  <input
                    id="motif-origin"
                    className="form-input"
                    value={form.originCity}
                    onChange={(e) => setForm(prev => ({ ...prev, originCity: e.target.value }))}
                    placeholder="Contoh: Yogyakarta"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="motif-summary">Ringkasan Singkat</label>
                <input
                  id="motif-summary"
                  className="form-input"
                  value={form.shortSummary}
                  onChange={(e) => setForm(prev => ({ ...prev, shortSummary: e.target.value }))}
                  placeholder="Deskripsi singkat untuk tooltip peta"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="motif-history">Sejarah</label>
                <textarea
                  id="motif-history"
                  className="form-textarea"
                  value={form.history}
                  onChange={(e) => setForm(prev => ({ ...prev, history: e.target.value }))}
                  placeholder="Sejarah motif batik ini..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="motif-meaning">Makna &amp; Filosofi</label>
                <textarea
                  id="motif-meaning"
                  className="form-textarea"
                  value={form.meaning}
                  onChange={(e) => setForm(prev => ({ ...prev, meaning: e.target.value }))}
                  placeholder="Makna dan filosofi motif ini..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="motif-image">Gambar Motif</label>
                <div className="upload-area">
                  <div className="upload-area-input">
                    <input
                      id="motif-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="form-input"
                      disabled={uploading}
                    />
                    <p className="upload-help">
                      {uploading ? 'Mengupload gambar...' : 'Format: JPG, PNG, WebP. Maks: 5MB'}
                    </p>
                  </div>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview gambar motif"
                      className="image-preview"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-batik.svg'; }}
                    />
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || uploading}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <>
                      <IconSpinner size={18} />
                      Menyimpan...
                    </>
                  ) : formMode === 'create' ? (
                    <>
                      <IconPlus size={18} />
                      Tambah Motif
                    </>
                  ) : (
                    'Update Motif'
                  )}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeForm}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Motif Table */}
        {province && province.motifs.length > 0 ? (
          <table className="admin-table" aria-label={`Daftar motif batik ${province.name}`}>
            <thead>
              <tr>
                <th scope="col" style={{ width: 60 }}>Gambar</th>
                <th scope="col">Nama Motif</th>
                <th scope="col">Asal</th>
                <th scope="col">Ringkasan</th>
                <th scope="col" style={{ width: 160 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {province.motifs.map((motif) => (
                <tr key={motif.id}>
                  <td>
                    <img
                      src={getImageUrl(motif.imageUrl)}
                      alt={`Gambar motif ${motif.name}`}
                      className="table-cell-image"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-batik.svg'; }}
                    />
                  </td>
                  <td className="table-cell-name">{motif.name}</td>
                  <td>{motif.originCity || '-'}</td>
                  <td className="table-cell-truncate">
                    {motif.shortSummary || '-'}
                  </td>
                  <td>
                    <div className="table-cell-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(motif)}
                        aria-label={`Edit motif ${motif.name}`}
                      >
                        <IconEdit size={14} />
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(motif.id, motif.name)}
                        aria-label={`Hapus motif ${motif.name}`}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconPalette size={48} />
            </div>
            <p className="empty-state-text">Belum ada motif batik untuk provinsi ini</p>
            <button className="btn btn-primary" onClick={openCreate}>
              <IconPlus size={18} />
              Tambah Motif Pertama
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
