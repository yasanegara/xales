'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email atau password salah')
    } else {
      router.push('/dashboard')
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ededed',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            href="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#ffffff',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            XALES
          </Link>
          <p style={{ color: '#888888', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
            Masuk ke akunmu
          </p>
        </div>

        <div
          style={{
            background: '#111111',
            border: '1px solid #222222',
            borderRadius: '12px',
            padding: '2rem',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '0.5rem' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="kamu@contoh.com"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '0.5rem' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                style={{
                  background: '#1a0a0a',
                  border: '1px solid #ff4444',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  color: '#ff4444',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#004499' : '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888888', fontSize: '0.875rem' }}>
          Belum punya akun?{' '}
          <Link href="/register" style={{ color: '#0070f3', textDecoration: 'none' }}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
