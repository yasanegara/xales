'use client'

import { useState, useEffect } from 'react'

interface Fees {
  service_fee_article: number
  service_fee_app: number
  transaction_fee: number
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function AdminFeesPage() {
  const [fees, setFees] = useState<Fees | null>(null)
  const [form, setForm] = useState<Fees | null>(null)
  const [tweakWa, setTweakWa] = useState('')
  const [tweakWaInput, setTweakWaInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => r.json())
      .then(d => {
        setFees(d.fees)
        setForm(d.fees)
        setTweakWa(d.tweakWa ?? '')
        setTweakWaInput(d.tweakWa ?? '')
      })
  }, [])

  const save = async () => {
    if (!form) return
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tweakWa: tweakWaInput }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg(data.error ?? 'Gagal menyimpan'); return }
    setFees(data.fees)
    setForm(data.fees)
    setTweakWa(data.tweakWa ?? '')
    setTweakWaInput(data.tweakWa ?? '')
    setMsg('✓ Tersimpan')
    setTimeout(() => setMsg(''), 3000)
  }

  const inputStyle = {
    width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
    borderRadius: '8px', padding: '0.625rem 0.875rem 0.625rem 2.75rem',
    fontSize: '1rem', color: '#1a1a1a', outline: 'none',
    fontVariantNumeric: 'tabular-nums' as const,
  }

  const FeeRow = ({
    label, desc, fieldKey,
  }: {
    label: string
    desc: string
    fieldKey: keyof Fees
  }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1.5rem', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid #f0ede8' }}>
      <div>
        <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.9375rem' }}>{label}</div>
        <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '0.2rem' }}>{desc}</div>
        {fees && fees[fieldKey] !== form?.[fieldKey] && (
          <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem' }}>
            Saat ini: Rp {formatIDR(fees[fieldKey])}
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem', pointerEvents: 'none' }}>Rp</span>
        <input
          type="number"
          min={0}
          value={form?.[fieldKey] ?? ''}
          onChange={e => form && setForm({ ...form, [fieldKey]: parseInt(e.target.value) || 0 })}
          style={inputStyle}
        />
      </div>
    </div>
  )

  if (!form) return <div style={{ padding: '3rem', color: '#6e6a65', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Manajemen Fee</h1>
        <p style={{ color: '#6e6a65', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Ubah biaya layanan & transaksi platform. Berlaku untuk transaksi berikutnya (cache 5 menit).
        </p>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '0 1.5rem' }}>
        <FeeRow
          label="Biaya Layanan — Artikel"
          desc="Dibebankan ke pembeli saat beli artikel (markdown). Tampil di breakdown pembayaran."
          fieldKey="service_fee_article"
        />
        <FeeRow
          label="Biaya Layanan — App"
          desc="Dibebankan ke pembeli saat beli app (HTML)."
          fieldKey="service_fee_app"
        />
        <FeeRow
          label="Biaya Transaksi Withdraw"
          desc="Dipotong dari saldo kreator per transaksi saat pengajuan penarikan dana."
          fieldKey="transaction_fee"
        />
      </div>

      {/* Impact preview */}
      <div style={{ background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1rem 1.25rem', marginTop: '1rem', fontSize: '0.8125rem', color: '#6e6a65' }}>
        <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>Preview pembayaran (harga konten Rp 50.000)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Harga artikel</span><span>Rp 50.000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Biaya layanan artikel</span><span>Rp {formatIDR(form.service_fee_article)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1a1a1a', paddingTop: '0.25rem', borderTop: '1px solid #e5e0d8', marginTop: '0.125rem' }}>
            <span>Total dibayar pembeli</span><span>Rp {formatIDR(50000 + form.service_fee_article)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#9c9690' }}>
            <span>Kreator terima (setelah withdraw fee)</span>
            <span>Rp {formatIDR(50000 - form.transaction_fee)}</span>
          </div>
        </div>
      </div>

      {/* Kontak Resmi */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>Kontak Resmi Tweak</h2>
        <p style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '1rem' }}>
          Nomor WA ini dipakai admin untuk menghubungi kreator terkait pencairan atau masalah akun.
        </p>
        <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '12px', padding: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#6e6a65', marginBottom: '0.5rem' }}>Nomor WhatsApp Tweak</label>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.875rem', pointerEvents: 'none' }}>+62</span>
            <input
              type="text"
              value={tweakWaInput.replace(/^(0|62)/, '')}
              onChange={e => setTweakWaInput(e.target.value.replace(/\D/g, ''))}
              placeholder="81234567890"
              style={{ width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem 0.625rem 2.75rem', fontSize: '0.9375rem', color: '#1a1a1a', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
          </div>
          {tweakWa && tweakWaInput !== tweakWa && (
            <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.375rem' }}>Saat ini: {tweakWa}</div>
          )}
          {tweakWa && (
            <a
              href={`https://wa.me/62${tweakWa.replace(/^0/, '').replace(/^62/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#059669', textDecoration: 'none' }}
            >
              ↗ Cek di WhatsApp
            </a>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
        <button onClick={save} disabled={saving} style={{
          background: saving ? '#6e6a65' : '#1a1a1a', color: '#f7f5f2',
          border: 'none', borderRadius: '8px', padding: '0.625rem 1.75rem',
          fontSize: '0.9375rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
        }}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        {msg && (
          <span style={{ fontSize: '0.875rem', color: msg.startsWith('✓') ? '#059669' : '#dc2626', fontWeight: 500 }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}
