'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin } from '@/lib/api';
import { IconPalette, IconArrowLeft, IconSpinner } from '@/components/Icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : false;
        if (!isExpired) {
          router.push('/admin/dashboard');
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_email');
        }
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAdmin(email, password);
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_email', result.admin.email);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <IconPalette size={40} />
        </div>
        <h1 className="login-title">Admin Panel</h1>
        <p className="login-subtitle">Peta Interaktif Batik Indonesia</p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@batik.id"
              required
              autoComplete="email"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <IconSpinner size={18} />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <Link href="/" className="login-back" aria-label="Kembali ke peta utama">
          <IconArrowLeft size={14} />
          Kembali ke Peta
        </Link>
      </div>
    </div>
  );
}
