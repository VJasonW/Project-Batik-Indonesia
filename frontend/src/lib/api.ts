/**
 * Base URL resolution for Vercel Services & Local Development:
 * - On the server (SSR / Server Component / Route Handler), reads the bound BACKEND_URL service variable.
 * - In the browser, uses relative URL "" so requests to /api/* and /uploads/* are routed to the backend service via top-level rewrites.
 * - Falls back to NEXT_PUBLIC_API_URL or http://localhost:3001 for local development.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    if (process.env.BACKEND_URL) {
      return process.env.BACKEND_URL.replace(/\/$/, '');
    }
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:3001';
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

// ============ Types ============

export interface Province {
  id: number;
  slug: string;
  name: string;
  capital: string | null;
  region: string | null;
  geoId: string;
  shortDescription: string | null;
  accentColor: string;
  motifCount: number;
}

export interface BatikMotif {
  id: number;
  provinceId: number;
  name: string;
  imageUrl: string | null;
  shortSummary: string | null;
  history: string | null;
  meaning: string | null;
  originCity: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProvinceDetail {
  id: number;
  slug: string;
  name: string;
  capital: string | null;
  region: string | null;
  geoId: string;
  shortDescription: string | null;
  accentColor: string;
  motifs: BatikMotif[];
}

export interface MotifSummary {
  provinceName: string;
  slug: string;
  accentColor: string;
  motifs: { id: number; name: string }[];
  totalMotifs: number;
}

// ============ Public API ============

export async function fetchProvinces(): Promise<Province[]> {
  const res = await fetch(buildApiUrl('/api/provinces'));
  if (!res.ok) throw new Error('Failed to fetch provinces');
  return res.json();
}

export async function fetchProvinceBySlug(slug: string): Promise<ProvinceDetail> {
  const res = await fetch(buildApiUrl(`/api/provinces/${slug}`));
  if (!res.ok) throw new Error('Province not found');
  return res.json();
}

export async function fetchMotifSummary(slug: string): Promise<MotifSummary> {
  const res = await fetch(buildApiUrl(`/api/provinces/${slug}/motifs/summary`));
  if (!res.ok) throw new Error('Failed to fetch motif summary');
  return res.json();
}

export async function fetchMotifDetail(id: number): Promise<BatikMotif & { province: { id: number; slug: string; name: string } }> {
  const res = await fetch(buildApiUrl(`/api/motifs/${id}`));
  if (!res.ok) throw new Error('Motif not found');
  return res.json();
}

// ============ Admin API ============

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; admin: { id: number; email: string } }> {
  const res = await fetch(buildApiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function createMotif(token: string, data: {
  name: string;
  provinceId: number;
  shortSummary?: string;
  history?: string;
  meaning?: string;
  originCity?: string;
  imageUrl?: string;
}): Promise<BatikMotif> {
  const res = await fetch(buildApiUrl('/api/motifs'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create motif');
  }
  return res.json();
}

export async function updateMotif(token: string, id: number, data: Partial<BatikMotif>): Promise<BatikMotif> {
  const res = await fetch(buildApiUrl(`/api/motifs/${id}`), {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update motif');
  }
  return res.json();
}

export async function deleteMotif(token: string, id: number): Promise<void> {
  const res = await fetch(buildApiUrl(`/api/motifs/${id}`), {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete motif');
  }
}

export async function uploadImage(token: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(buildApiUrl('/api/upload'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to upload image');
  }
  return res.json();
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-batik.svg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return buildApiUrl(path);
}

export async function updateAccentColor(token: string, slug: string, accentColor: string): Promise<ProvinceDetail> {
  const res = await fetch(buildApiUrl(`/api/provinces/${slug}/accent-color`), {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ accentColor }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update accent color');
  }
  return res.json();
}

export async function updateProvince(
  token: string,
  slug: string,
  data: { shortDescription?: string; accentColor?: string }
): Promise<ProvinceDetail> {
  const res = await fetch(buildApiUrl(`/api/provinces/${slug}`), {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update province data');
  }
  return res.json();
}
