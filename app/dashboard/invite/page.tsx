'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://xales.id'

interface Invite {
  id: string; code: string; usedAt: string | null; createdAt: string
  invitedUser: { username: string; name?: string | null; profilePic?: string | null; createdAt: string } | null
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InvitePage() {
  const [invites,  setInvites]  = useState<Invite[]>([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied,   setCopied]   = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/invite')
    const data = await res.json()
    setInvites(data.invites ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createInvite = async () => {
    setCreating(true)
    const res  = await fetch('/api/invite', { method: 'POST' })
    const data = await res.json()
    if (res.ok) setInvites(prev => [data.invite, ...prev])
    setCreating(false)
  }

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${BASE}/invite/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const used    = invites.filter(i => i.usedAt)
  const pending = invites.filter(i => !i.usedAt)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Undang Teman</h1>
          <p style={{ fontSize: '0.8125rem', color: '#9c9690', marginTop: '0.25rem' }}>Bagikan link undangan — ajak teman bergabung ke Tweak</p>
        </div>
        <button onClick={createInvite} disabled={creating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '10px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
          {creating ? '...' : '+ Buat Link Undangan'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Undangan', value: invites.length, icon: '✉️', color: '#6366f1' },
          { label: 'Sudah Bergabung', value: used.length, icon: '✅', color: '#10b981' },
          { label: 'Belum Dipakai', value: pending.length, icon: '⏳', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>{s.icon}</span>{s.label}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9c9690' }}>Memuat...</div>
      ) : invites.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3d3a36', marginBottom: '0.5rem' }}>Belum ada undangan</div>
          <div style={{ fontSize: '0.875rem', color: '#9c9690', marginBottom: '1.5rem' }}>Buat link undangan dan bagikan ke teman-temanmu</div>
          <button onClick={createInvite} style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Buat Link Undangan Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {invites.map(invite => (
            <div key={invite.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.125rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

              {/* Code */}
              <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.1em', background: '#f7f5f2', padding: '0.375rem 0.75rem', borderRadius: '8px', flexShrink: 0 }}>
                {invite.code}
              </div>

              {/* Status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {invite.invitedUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#6e6a65' }}>
                      {invite.invitedUser.profilePic
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={invite.invitedUser.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (invite.invitedUser.name?.[0] ?? invite.invitedUser.username[0]).toUpperCase()
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
                        <Link href={`/@${invite.invitedUser.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {invite.invitedUser.name ?? `@${invite.invitedUser.username}`}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>Bergabung {fmtDate(invite.invitedUser.createdAt)}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#9c9690' }}>Belum digunakan</div>
                    <div style={{ fontSize: '0.7rem', color: '#b0aca6' }}>Dibuat {fmtDate(invite.createdAt)}</div>
                  </div>
                )}
              </div>

              {/* Badge */}
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', flexShrink: 0,
                background: invite.usedAt ? '#dcfce7' : '#fef9c3',
                color: invite.usedAt ? '#166534' : '#854d0e' }}>
                {invite.usedAt ? '✓ Terpakai' : '○ Menunggu'}
              </span>

              {/* Actions */}
              {!invite.usedAt && (
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button onClick={() => copyLink(invite.code)} style={{ background: copied === invite.code ? '#dcfce7' : '#f0ede8', color: copied === invite.code ? '#166534' : '#3d3a36', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                    {copied === invite.code ? '✓ Tersalin' : '📋 Salin Link'}
                  </button>
                  <Link href={`/invite/${invite.code}`} target="_blank" style={{ background: '#f0ede8', color: '#3d3a36', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}>
                    ↗ Preview
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.625rem' }}>💡 Cara kerja undangan</div>
        <div style={{ fontSize: '0.8125rem', color: '#3b82f6', lineHeight: 1.7 }}>
          1. Buat link undangan → salin dan bagikan ke teman<br/>
          2. Teman buka link → halaman sambutan dengan profilmu<br/>
          3. Teman daftar → kode otomatis ter-isi di form registrasi<br/>
          4. Setelah daftar, link kode tersebut tidak bisa dipakai lagi
        </div>
      </div>
    </div>
  )
}
