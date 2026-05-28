'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function safeFrom(raw: string | null): string {
  if (!raw) return '/dashboard'
  try {
    const decoded = decodeURIComponent(raw)
    // Only allow relative paths, block login/register loops
    if (!decoded.startsWith('/')) return '/dashboard'
    if (decoded.startsWith('/login') || decoded.startsWith('/register')) return '/dashboard'
    return decoded
  } catch {
    return '/dashboard'
  }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = safeFrom(searchParams.get('from'))
  const fromParam = searchParams.get('from') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: from })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Email atau password salah')
    } else {
      router.push(from)
      router.refresh()
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#fafaf8',
    border: '1px solid #e5e0d8',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#1a1a1a',
    fontSize: '0.9375rem',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            XALES
          </Link>
          <p style={{ color: '#6e6a65', marginTop: '0.5rem', fontSize: '0.9375rem' }}>Masuk ke akunmu</p>
          {from !== '/dashboard' && (
            <p style={{ color: '#9c9690', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
              Masuk untuk melanjutkan
            </p>
          )}
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              background: '#f7f5f2', color: '#1a1a1a', border: '1px solid #e5e0d8', borderRadius: '8px',
              padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 500,
              cursor: googleLoading ? 'not-allowed' : 'pointer', opacity: googleLoading ? 0.7 : 1, marginBottom: '1.25rem',
            }}
          >
            <GoogleIcon />
            {googleLoading ? 'Mengarahkan...' : 'Masuk dengan Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e0d8' }} />
            <span style={{ color: '#9c9690', fontSize: '0.8125rem' }}>atau</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e5e0d8' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="kamu@contoh.com" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#6e6a65', marginBottom: '0.5rem' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Masuk...' : 'Masuk dengan Email'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6e6a65', fontSize: '0.875rem' }}>
          Belum punya akun?{' '}
          <Link href={`/register${fromParam ? `?from=${fromParam}` : ''}`} style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 500 }}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
