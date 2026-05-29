'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import AvatarUpload from '@/components/AvatarUpload'

interface Profile {
  name: string
  bio: string
  status: string
  profilePic: string
  affiliateRate: number
  bankName: string
  bankAccount: string
  bankHolder: string
  qrisImage: string
  waNumber: string
  waMessage: string
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [form, setForm] = useState<Profile>({ name: '', bio: '', status: '', profilePic: '', affiliateRate: 20, bankName: '', bankAccount: '', bankHolder: '', qrisImage: '', waNumber: '', waMessage: '' })
  const [qrisMsg, setQrisMsg] = useState('')
  const [bankMsg, setBankMsg] = useState('')
  const [waMsg, setWaMsg] = useState('')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch(`/api/users/${session.user.username}`)
      .then((r) => r.json())
      .then((d) =>
        setForm({
          name: d.name ?? '',
          bio: d.bio ?? '',
          status: d.status ?? '',
          profilePic: d.profilePic ?? '',
          affiliateRate: d.affiliateRate ?? 20,
          bankName: d.bankName ?? '',
          bankAccount: d.bankAccount ?? '',
          bankHolder: d.bankHolder ?? '',
          qrisImage: d.qrisImage ?? '',
          waNumber: d.waNumber ?? '',
          waMessage: d.waMessage ?? '',
        })
      )
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
      setProfileMsg('Profile disimpan! ✓')
    } else {
      setProfileMsg('Gagal menyimpan.')
    }
  }

  const saveBank = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setBankMsg('')
    const res = await fetch('/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankName: form.bankName, bankAccount: form.bankAccount, bankHolder: form.bankHolder }),
    })
    setLoading(false)
    setBankMsg(res.ok ? 'Rekening disimpan! ✓' : 'Gagal menyimpan.')
  }

  const saveQris = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setQrisMsg('')
    const res = await fetch('/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrisImage: form.qrisImage }),
    })
    setLoading(false)
    setQrisMsg(res.ok ? 'QRIS disimpan! ✓' : 'Gagal menyimpan.')
  }

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(f => ({ ...f, qrisImage: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const saveWA = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setWaMsg('')
    const res = await fetch('/api/dashboard/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waNumber: form.waNumber, waMessage: form.waMessage }),
    })
    setLoading(false)
    setWaMsg(res.ok ? 'WA Responder disimpan! ✓' : 'Gagal menyimpan.')
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
    setPasswordMsg(res.ok ? 'Password berhasil diubah! ✓' : data.error)
    if (res.ok) setPasswords({ current: '', next: '', confirm: '' })
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
  const labelStyle = {
    display: 'block' as const,
    fontSize: '0.8125rem',
    color: '#6e6a65',
    marginBottom: '0.375rem',
  }
  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e5e0d8',
    borderRadius: '12px',
    padding: '1.75rem',
    marginBottom: '1.5rem',
  }

  const fallback = (form.name?.[0] ?? session?.user?.username?.[0] ?? '?')

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.75rem' }}>
        Settings
      </h1>

      {/* Profile card */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '1.25rem' }}>
          Profile
        </h2>
        <form onSubmit={saveProfile}>
          {/* Avatar upload */}
          <AvatarUpload
            currentPic={form.profilePic}
            fallbackInitial={fallback}
            onUpload={(dataUrl) => setForm((f) => ({ ...f, profilePic: dataUrl }))}
          />

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
            <label style={labelStyle}>
              Status{' '}
              <span style={{ color: '#9c9690', fontWeight: 400 }}>
                ({form.status.length}/80)
              </span>
            </label>
            <input
              type="text"
              value={form.status}
              maxLength={80}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={inputStyle}
              placeholder="Contoh: Full-stack dev · Coffee addict ☕"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Komisi Affiliate{' '}
              <span style={{ color: '#9c9690', fontWeight: 400 }}>
                — berapa % yang kamu bagi ke orang yang share artikelmu
              </span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="range"
                min={5} max={50} step={5}
                value={form.affiliateRate}
                onChange={(e) => setForm({ ...form, affiliateRate: parseInt(e.target.value) })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', minWidth: '48px', textAlign: 'right' }}>
                {form.affiliateRate}%
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9c9690', marginTop: '0.375rem' }}>
              Sharer dapat {form.affiliateRate}%, kamu dapat {100 - form.affiliateRate}% dari setiap pembelian
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>

          {profileMsg && (
            <p
              style={{
                color: profileMsg.includes('✓') ? '#059669' : '#dc2626',
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
              background: '#1a1a1a',
              color: '#f7f5f2',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Profile'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '1.25rem' }}>
          Ganti Password
        </h2>
        <form onSubmit={changePassword}>
          {[
            { key: 'current', label: 'Password Sekarang' },
            { key: 'next', label: 'Password Baru' },
            { key: 'confirm', label: 'Konfirmasi Password Baru' },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type="password"
                value={passwords[f.key as keyof typeof passwords]}
                onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
          ))}
          {passwordMsg && (
            <p
              style={{
                color: passwordMsg.includes('✓') ? '#059669' : '#dc2626',
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
              background: '#ffffff',
              border: '1px solid #e5e0d8',
              color: '#1a1a1a',
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

      {/* Metode Pembayaran — Transfer Bank */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.375rem' }}>
          Metode Pembayaran — Transfer Bank
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '1.25rem' }}>
          Info rekening yang ditampilkan ke pembeli saat checkout
        </p>
        <form onSubmit={saveBank}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Nama Bank</label>
              <input type="text" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                style={inputStyle} placeholder="BCA, Mandiri, BNI, BRI..." />
            </div>
            <div>
              <label style={labelStyle}>Nomor Rekening</label>
              <input type="text" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }} placeholder="1234567890" />
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Atas Nama</label>
            <input type="text" value={form.bankHolder} onChange={(e) => setForm({ ...form, bankHolder: e.target.value })}
              style={inputStyle} placeholder="Nama pemilik rekening (sesuai KTP)" />
          </div>
          {bankMsg && <p style={{ color: bankMsg.includes('✓') ? '#059669' : '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{bankMsg}</p>}
          <button type="submit" disabled={loading}
            style={{ background: '#ffffff', border: '1px solid #e5e0d8', color: '#1a1a1a', borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
            Simpan Rekening
          </button>
        </form>
      </div>

      {/* Metode Pembayaran — QRIS */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.375rem' }}>
          Metode Pembayaran — QRIS
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '1.25rem' }}>
          Upload gambar QRIS kamu — akan ditampilkan ke pembeli saat checkout
        </p>
        <form onSubmit={saveQris}>
          <div style={{ marginBottom: '1.25rem' }}>
            {form.qrisImage ? (
              <div style={{ marginBottom: '1rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.qrisImage} alt="QRIS" style={{ width: '200px', height: '200px', objectFit: 'contain', border: '1px solid #e5e0d8', borderRadius: '8px', background: '#fafaf8' }} />
                <button type="button" onClick={() => setForm(f => ({ ...f, qrisImage: '' }))}
                  style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Hapus QRIS
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '200px', height: '200px', border: '2px dashed #e5e0d8', borderRadius: '8px', cursor: 'pointer', background: '#fafaf8', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>🖼</span>
                <span style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>Upload QRIS</span>
                <input type="file" accept="image/*" onChange={handleQrisUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          {qrisMsg && <p style={{ color: qrisMsg.includes('✓') ? '#059669' : '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{qrisMsg}</p>}
          <button type="submit" disabled={loading || !form.qrisImage}
            style={{ background: '#ffffff', border: '1px solid #e5e0d8', color: '#1a1a1a', borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: (loading || !form.qrisImage) ? 'not-allowed' : 'pointer', opacity: !form.qrisImage ? 0.5 : 1 }}>
            Simpan QRIS
          </button>
        </form>
      </div>

      {/* WA Responder card */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.375rem' }}>
          WA Responder
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '1.25rem' }}>
          Setelah seseorang membeli artikelmu, mereka akan melihat tombol WhatsApp dengan pesan otomatis
        </p>
        <form onSubmit={saveWA}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nomor WhatsApp</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem' }}>+62</span>
              <input type="text" value={form.waNumber} onChange={(e) => setForm({ ...form, waNumber: e.target.value.replace(/\D/g, '') })}
                style={{ ...inputStyle, paddingLeft: '3rem', fontFamily: 'monospace' }} placeholder="81234567890" />
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>
              Pesan Otomatis{' '}
              <span style={{ color: '#9c9690', fontWeight: 400 }}>({form.waMessage.length}/300)</span>
            </label>
            <textarea
              value={form.waMessage}
              onChange={(e) => setForm({ ...form, waMessage: e.target.value.slice(0, 300) })}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Halo! Terima kasih sudah membeli artikel ini. Bergabunglah ke grup eksklusifku di sini: https://..."
            />
            {form.waNumber && form.waMessage && (
              <a
                href={`https://wa.me/62${form.waNumber.replace(/^0/, '')}?text=${encodeURIComponent(form.waMessage)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#25d366', textDecoration: 'none', fontWeight: 500 }}
              >
                ↗ Preview link WA
              </a>
            )}
          </div>
          {waMsg && <p style={{ color: waMsg.includes('✓') ? '#059669' : '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{waMsg}</p>}
          <button type="submit" disabled={loading}
            style={{ background: '#25d366', border: 'none', color: '#ffffff', borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
            Simpan WA Responder
          </button>
        </form>
      </div>
    </div>
  )
}
