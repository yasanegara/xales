'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      setError('Username hanya boleh huruf, angka, dan underscore')
      return
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }

    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    // Auto login after register
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.ok) {
      router.push('/dashboard')
    } else {
      router.push('/login')
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
            Buat akunmu
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
            {[
              { key: 'name', label: 'Nama', type: 'text', placeholder: 'Nama lengkapmu', required: false },
              { key: 'username', label: 'Username', type: 'text', placeholder: 'username_kamu', required: true },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'kamu@contoh.com', required: true },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '1rem' }}>
                <label
                  style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '0.5rem' }}
                >
                  {field.label} {field.required && <span style={{ color: '#ff4444' }}>*</span>}
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  required={field.required}
                  style={inputStyle}
                  placeholder={field.placeholder}
                />
              </div>
            ))}

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
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888888', fontSize: '0.875rem' }}>
          Sudah punya akun?{' '}
          <Link href="/login" style={{ color: '#0070f3', textDecoration: 'none' }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
