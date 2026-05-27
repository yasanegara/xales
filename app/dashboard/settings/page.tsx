'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState({ name: '', bio: '', profilePic: '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch(`/api/users/${session.user.username}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({ name: d.name ?? '', bio: d.bio ?? '', profilePic: d.profilePic ?? '' })
      })
  }, [session])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setProfileMsg('')

    const res = await fetch('/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      await update({ name: form.name })
      setProfileMsg('Profile disimpan!')
    } else {
      setProfileMsg('Gagal menyimpan.')
    }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMsg('')

    if (passwords.next !== passwords.confirm) {
      setPasswordMsg('Password baru tidak cocok')
      return
    }
    if (passwords.next.length < 8) {
      setPasswordMsg('Password minimal 8 karakter')
      return
    }

    setLoading(true)
    const res = await fetch('/api/dashboard/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: passwords.current, next: passwords.next }),
    })

    const data = await res.json()
    setLoading(false)
    setPasswordMsg(res.ok ? 'Password berhasil diubah!' : data.error)
    if (res.ok) setPasswords({ current: '', next: '', confirm: '' })
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

  const labelStyle = { display: 'block' as const, fontSize: '0.8125rem', color: '#888888', marginBottom: '0.375rem' }

  const cardStyle = {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '12px',
    padding: '1.75rem',
    marginBottom: '1.5rem',
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.75rem' }}>
        Settings
      </h1>

      {/* Profile */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#ededed', marginBottom: '1.25rem' }}>
          Profile
        </h2>
        <form onSubmit={saveProfile}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nama</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              placeholder="Nama lengkapmu"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>URL Foto Profil</label>
            <input
              type="url"
              value={form.profilePic}
              onChange={(e) => setForm({ ...form, profilePic: e.target.value })}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>

          {profileMsg && (
            <p
              style={{
                color: profileMsg.includes('!') ? '#00c853' : '#ff4444',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {profileMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Simpan Profile
          </button>
        </form>
      </div>

      {/* Password */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#ededed', marginBottom: '1.25rem' }}>
          Ganti Password
        </h2>
        <form onSubmit={changePassword}>
          {[
            { key: 'current', label: 'Password Sekarang', placeholder: '••••••••' },
            { key: 'next', label: 'Password Baru', placeholder: '••••••••' },
            { key: 'confirm', label: 'Konfirmasi Password Baru', placeholder: '••••••••' },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type="password"
                value={passwords[f.key as keyof typeof passwords]}
                onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                required
                style={inputStyle}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {passwordMsg && (
            <p
              style={{
                color: passwordMsg.includes('berhasil') ? '#00c853' : '#ff4444',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            >
              {passwordMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#1a1a1a',
              border: '1px solid #333333',
              color: '#ededed',
              borderRadius: '8px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Ganti Password
          </button>
        </form>
      </div>
    </div>
  )
}
