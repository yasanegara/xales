'use client'

import { useRef, useState } from 'react'
import PostEditor from './PostEditor'
import PostFileUpload from './PostFileUpload'
import type { AttachedFile } from './PostFileUpload'

export interface PostFormData {
  title: string
  description: string
  type: 'markdown' | 'html'
  content: string
  category: string
  tags: string
  isPrivate: boolean
  isPremium: boolean
  price: string
  discount: string          // % off article price
  affiliateEnabled: boolean
  affiliateRate: string     // % commission for affiliates
  coverImage: string
  files: AttachedFile[]
  deletedFileIds: string[]
}

interface Props {
  form: PostFormData
  onChange: (form: PostFormData) => void
  error?: string
  loading?: boolean
  isEdit?: boolean
  onSaveDraft: () => void
  onPublish: () => void
}

export function formatIDR(value: string) {
  const num = parseInt(value.replace(/\D/g, ''))
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

export default function PostFormFields({ form, onChange, error, loading, isEdit, onSaveDraft, onPublish }: Props) {
  const set = (patch: Partial<PostFormData>) => onChange({ ...form, ...patch })
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const handleCoverFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('Cover maks 10MB'); return }
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX_W = 1280, MAX_H = 720
      const scale = Math.min(1, MAX_W / img.width, MAX_H / img.height)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      set({ coverImage: canvas.toDataURL('image/jpeg', 0.82) })
    }
    img.src = objectUrl
  }

  const applyCoverUrl = () => {
    if (urlInput.trim()) { set({ coverImage: urlInput.trim() }); setUrlInput(''); setUrlMode(false) }
  }

  const inputStyle = {
    width: '100%', background: '#fafaf8', border: '1px solid #e5e0d8',
    borderRadius: '8px', padding: '0.75rem 1rem', color: '#1a1a1a',
    fontSize: '0.9375rem', outline: 'none',
  }
  const labelStyle = { display: 'block' as const, fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem' }
  const card = { background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1.75rem' }}>
        {isEdit ? 'Edit Post' : 'New Post'}
      </h1>

      {/* Type */}
      {!isEdit && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {(['markdown', 'html'] as const).map((t) => (
              <button key={t} type="button" onClick={() => set({ type: t })}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                  border: `1px solid ${form.type === t ? '#1a1a1a' : '#e5e0d8'}`,
                  background: form.type === t ? '#1a1a1a' : '#ffffff',
                  color: form.type === t ? '#f7f5f2' : '#6e6a65',
                  fontSize: '0.875rem', fontWeight: 500,
                }}
              >
                {t === 'markdown' ? '📝 Artikel (Markdown)' : '🛠 Web App (HTML)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cover image */}
      <div style={card}>
        <label style={labelStyle}>Cover Image</label>
        {form.coverImage ? (
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.coverImage}
              alt="Cover"
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.375rem' }}>
              <button type="button" onClick={() => coverInputRef.current?.click()}
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '6px', padding: '0.375rem 0.625rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                Ganti
              </button>
              <button type="button" onClick={() => set({ coverImage: '' })}
                style={{ background: 'rgba(220,38,38,0.75)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '6px', padding: '0.375rem 0.625rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => coverInputRef.current?.click()}
            style={{ border: '2px dashed #d0c9b8', borderRadius: '8px', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', background: '#fafaf8', marginBottom: '0.75rem' }}
          >
            <span style={{ fontSize: '1.75rem' }}>🖼</span>
            <span style={{ fontSize: '0.875rem', color: '#9c9690' }}>Klik untuk upload cover</span>
            <span style={{ fontSize: '0.75rem', color: '#b0a898' }}>JPG, PNG · maks 5MB · rasio 16:9 ideal</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!form.coverImage && (
            <button type="button" onClick={() => setUrlMode(v => !v)}
              style={{ fontSize: '0.8125rem', color: urlMode ? '#1a1a1a' : '#6e6a65', background: urlMode ? '#f0ede8' : 'transparent', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer' }}>
              🔗 Pakai URL
            </button>
          )}
        </div>

        {urlMode && !form.coverImage && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
            <input
              type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyCoverUrl()}
              placeholder="https://images.unsplash.com/..."
              style={{ flex: 1, background: '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none' }}
            />
            <button type="button" onClick={applyCoverUrl} disabled={!urlInput.trim()}
              style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: urlInput.trim() ? 'pointer' : 'not-allowed', opacity: urlInput.trim() ? 1 : 0.4 }}>
              Terapkan
            </button>
          </div>
        )}

        <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); e.target.value = '' }} />
      </div>

      {/* Basic info */}
      <div style={card}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Judul *</label>
          <input type="text" value={form.title} onChange={(e) => set({ title: e.target.value })}
            style={{ ...inputStyle, fontSize: '1.125rem', fontWeight: 600 }} placeholder="Judul yang menarik..." />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Deskripsi</label>
          <input type="text" value={form.description} onChange={(e) => set({ description: e.target.value })}
            style={inputStyle} placeholder="Ringkasan singkat (tampil di feed & link preview)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Kategori</label>
            <input type="text" value={form.category} onChange={(e) => set({ category: e.target.value })}
              style={inputStyle} placeholder="Tech, Tutorial, Finance..." />
          </div>
          <div>
            <label style={labelStyle}>Tags (pisah koma)</label>
            <input type="text" value={form.tags} onChange={(e) => set({ tags: e.target.value })}
              style={inputStyle} placeholder="javascript, webdev, tips" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ ...card, padding: '1.25rem' }}>
        <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Konten *</label>
        <PostEditor type={form.type} value={form.content} onChange={(v) => set({ content: v })} />
      </div>

      {/* Visibility — Private toggle */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>Catatan Pribadi</div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '2px' }}>
              Tidak muncul di feed publik — hanya bisa diakses oleh kamu
            </div>
          </div>
          <button type="button"
            onClick={() => set({ isPrivate: !form.isPrivate, isPremium: false, price: '', discount: '' })}
            style={{ flexShrink: 0, width: '44px', height: '24px', borderRadius: '12px', background: form.isPrivate ? '#6366f1' : '#d1cdc7', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: '3px', left: form.isPrivate ? '22px' : '3px', width: '18px', height: '18px', background: '#ffffff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
        {form.isPrivate && (
          <div style={{ marginTop: '0.75rem', background: '#eef2ff', borderRadius: '6px', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: '#4338ca' }}>
            Artikel ini hanya tersimpan untuk kamu pribadi. Tidak bisa dijual atau dibagikan.
          </div>
        )}
      </div>

      {/* Monetization — only shown when not private */}
      {!form.isPrivate && <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.isPremium ? '1rem' : '0' }}>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a' }}>Konten Premium</div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', marginTop: '2px' }}>
              Pembaca perlu membeli untuk membaca artikel lengkap
            </div>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => set({ isPremium: !form.isPremium, price: form.isPremium ? '' : form.price })}
            style={{
              flexShrink: 0, width: '44px', height: '24px', borderRadius: '12px',
              background: form.isPremium ? '#1a1a1a' : '#d1cdc7',
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: '3px', left: form.isPremium ? '22px' : '3px',
              width: '18px', height: '18px', background: '#ffffff', borderRadius: '50%',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {form.isPremium && (
          <div>
            {/* Price + Discount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Harga (IDR) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6e6a65', fontSize: '0.9375rem', fontWeight: 500 }}>Rp</span>
                  <input type="text" value={form.price}
                    onChange={(e) => set({ price: e.target.value.replace(/\D/g, '') })}
                    style={{ ...inputStyle, paddingLeft: '2.75rem' }} placeholder="25000" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Diskon %</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min={0} max={99} value={form.discount}
                    onChange={(e) => set({ discount: e.target.value })}
                    style={{ ...inputStyle, paddingRight: '1.75rem' }} placeholder="0" />
                  <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9c9690', fontSize: '0.875rem' }}>%</span>
                </div>
              </div>
            </div>
            {form.price && (
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                {form.discount && parseInt(form.discount) > 0 ? (
                  <>
                    <span style={{ color: '#9c9690', textDecoration: 'line-through', marginRight: '0.375rem' }}>
                      Rp {new Intl.NumberFormat('id-ID').format(parseInt(form.price))}
                    </span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>
                      Rp {new Intl.NumberFormat('id-ID').format(Math.round(parseInt(form.price) * (1 - parseInt(form.discount) / 100)))}
                    </span>
                    <span style={{ color: '#9c9690', marginLeft: '0.375rem' }}>
                      (hemat {form.discount}%)
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#059669' }}>= Rp {new Intl.NumberFormat('id-ID').format(parseInt(form.price))}</span>
                )}
              </p>
            )}

            {/* Affiliate divider */}
            <div style={{ borderTop: '1px solid #f0ede8', margin: '1rem 0' }} />

            {/* Affiliate toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a' }}>Program Afiliasi</div>
                <div style={{ fontSize: '0.8rem', color: '#6e6a65', marginTop: '2px' }}>
                  Beri komisi kepada siapa pun yang membawa pembeli
                </div>
              </div>
              <button type="button"
                onClick={() => set({ affiliateEnabled: !form.affiliateEnabled, affiliateRate: form.affiliateEnabled ? '' : (form.affiliateRate || '20') })}
                style={{ flexShrink: 0, width: '44px', height: '24px', borderRadius: '12px', background: form.affiliateEnabled ? '#059669' : '#d1cdc7', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: '3px', left: form.affiliateEnabled ? '22px' : '3px', width: '18px', height: '18px', background: '#ffffff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {form.affiliateEnabled && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ width: '140px' }}>
                  <label style={labelStyle}>Komisi %</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min={1} max={80} value={form.affiliateRate}
                      onChange={(e) => set({ affiliateRate: e.target.value })}
                      style={{ ...inputStyle, paddingRight: '1.75rem' }} placeholder="20" />
                    <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9c9690', fontSize: '0.875rem' }}>%</span>
                  </div>
                </div>
                {form.price && form.affiliateRate && (
                  <p style={{ fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.75rem' }}>
                    Afiliasi dapat{' '}
                    <strong style={{ color: '#059669' }}>
                      Rp {new Intl.NumberFormat('id-ID').format(Math.round(parseInt(form.price) * parseInt(form.affiliateRate) / 100))}
                    </strong>
                    {' '}per penjualan
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>}

      {/* File attachments — only when not private */}
      {!form.isPrivate && <div style={card}>
        <PostFileUpload
          files={form.files}
          onChange={(files, removedId) => set({
            files,
            deletedFileIds: removedId
              ? [...(form.deletedFileIds ?? []), removedId]
              : form.deletedFileIds,
          })}
          isPremium={form.isPremium}
        />
      </div>}

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" onClick={onSaveDraft} disabled={loading}
          style={{ background: '#ffffff', border: '1px solid #e5e0d8', color: '#1a1a1a', padding: '0.625rem 1.5rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '...' : 'Save Draft'}
        </button>
        <button type="button" onClick={onPublish} disabled={loading}
          style={{ background: '#1a1a1a', border: 'none', color: '#f7f5f2', padding: '0.625rem 1.5rem', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
