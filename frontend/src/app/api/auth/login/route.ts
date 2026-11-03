import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL;

  if (backendUrl) {
    try {
      const body = await request.json();
      const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (e) {
      console.warn('Backend unavailable');
    }
  }

  try {
    const { email, password } = await request.json();
    if (email === 'admin@batik.id' && password === 'admin123') {
      return NextResponse.json({
        token: 'local-demo-jwt-token-batik-2026',
        admin: { id: 1, email: 'admin@batik.id' },
      });
    }
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

