'use client'

import { useState } from 'react'
import Link from 'next/link'

function fmt(n: number) { return new Intl.NumberFormat('id-ID').format(n) }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

type CollectionRef = { itemType: string; itemId: string }

interface Collection {
  id: string; name: string; emoji: string; count: number
  itemIds: CollectionRef[]
}

interface Props {
  articlePurchases: { id: string; amount: number; createdAt: string; post: { slug: string; title: string; description?: string | null; type: string; author: { username: string; name?: string | null } } }[]
  filePurchases:    { id: string; amount: number; createdAt: string; file: { id: string; name: string; url?: string | null; mimeType?: string | null; post: { slug: string; title: string; author: { username: string; name?: string | null } } } }[]
  bundlePurchases:  { id: string; amount: number; createdAt: string; bundle: { slug: string; title: string; description?: string | null; author: { username: string; name?: string | null } } }[]
  savedPosts:       { id: string; savedAt: string; post: { id: string; slug: string; title: string; description?: string | null; type: string; viewCount: number; likeCount: number; author: { username: string; name?: string | null } } }[]
  collections:      Collection[]
}

const EMOJIS = ['📁','📚','🎯','💡','🔖','⭐','🧠','💼','🎨','🔬','📝','🚀','💰','🎓','🌟']

export default function LibraryClient({ articlePurchases, filePurchases, bundlePurchases, savedPosts, collections: initialCollections }: Props) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [activeFolder, setActiveFolder] = useState<string | null>(null) // null = semua
  const [activeTab, setActiveTab]   = useState<'pembelian' | 'tersimpan'>('pembelian')
  const [showNew, setShowNew]       = useState(false)
  const [newName, setNewName]       = useState('')
  const [newEmoji, setNewEmoji]     = useState('📁')
  const [saving, setSaving]         = useState(false)
  const [editId, setEditId]         = useState<string | null>(null)
  const [editName, setEditName]     = useState('')
  const [folderPicker, setFolderPicker] = useState<{ itemType: string; itemId: string } | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)

  // --- Folder CRUD ---
  const createFolder = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const res = await fetch('/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim(), emoji: newEmoji }) })
    const data = await res.json()
    if (res.ok) { setCollections(prev => [...prev, { ...data.collection, itemIds: [] }]); setShowNew(false); setNewName(''); setNewEmoji('📁') }
    setSaving(false)
  }

  const renameFolder = async (id: string) => {
    if (!editName.trim()) return
    const res = await fetch(`/api/collections/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName.trim() }) })
    if (res.ok) {
      setCollections(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c))
      setEditId(null)
    }
  }

  const deleteFolder = async (id: string) => {
    setDeleting(id)
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id))
      if (activeFolder === id) setActiveFolder(null)
    }
    setDeleting(null)
  }

  const toggleItem = async (colId: string, itemType: string, itemId: string) => {
    const col = collections.find(c => c.id === colId)!
    const inFolder = col.itemIds.some(i => i.itemType === itemType && i.itemId === itemId)
    if (inFolder) {
      const res = await fetch(`/api/collections/${colId}/items`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemType, itemId }) })
      if (res.ok) setCollections(prev => prev.map(c => c.id === colId ? { ...c, count: c.count - 1, itemIds: c.itemIds.filter(i => !(i.itemType === itemType && i.itemId === itemId)) } : c))
    } else {
      const res = await fetch(`/api/collections/${colId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemType, itemId }) })
      if (res.ok) setCollections(prev => prev.map(c => c.id === colId ? { ...c, count: c.count + 1, itemIds: [...c.itemIds, { itemType, itemId }] } : c))
    }
  }

  // --- Filter items by active folder ---
  const inFolder = (itemType: string, itemId: string) => {
    if (!activeFolder) return true
    const col = collections.find(c => c.id === activeFolder)
    return col?.itemIds.some(i => i.itemType === itemType && i.itemId === itemId) ?? false
  }

  const filteredArticles = articlePurchases.filter(p => inFolder('article', p.id))
  const filteredFiles    = filePurchases.filter(p => inFolder('file', p.id))
  const filteredBundles  = bundlePurchases.filter(p => inFolder('bundle', p.id))
  const filteredSaved    = savedPosts.filter(p => inFolder('saved', p.id))

  const totalPembelian = filteredArticles.length + filteredFiles.length + filteredBundles.length
  const totalTersimpan = filteredSaved.length

  const card = { background: '#fff', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Library</h1>
          <p style={{ fontSize: '0.8125rem', color: '#9c9690', marginTop: '0.2rem' }}>
            {articlePurchases.length + filePurchases.length + bundlePurchases.length} pembelian · {savedPosts.length} tersimpan
          </p>
        </div>
        <button onClick={() => { setShowNew(true); setActiveFolder(null) }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '10px', padding: '0.5rem 1.125rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          + Folder Baru
        </button>
      </div>

      {/* New folder form */}
      {showNew && (
        <div style={{ ...card, marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Emoji picker */}
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '200px' }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setNewEmoji(e)} style={{ border: `2px solid ${newEmoji === e ? '#1a1a1a' : 'transparent'}`, background: newEmoji === e ? '#f0ede8' : 'none', borderRadius: '6px', padding: '2px 5px', cursor: 'pointer', fontSize: '1rem' }}>{e}</button>
            ))}
          </div>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNew(false) }}
            placeholder="Nama folder..."
            style={{ flex: 1, minWidth: '160px', background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.9375rem', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={createFolder} disabled={saving || !newName.trim()} style={{ background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? '...' : 'Buat'}
            </button>
            <button onClick={() => setShowNew(false)} style={{ background: '#f0ede8', color: '#6e6a65', border: 'none', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Folders row */}
      {collections.length > 0 && (
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {/* All */}
          <button onClick={() => setActiveFolder(null)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '20px', border: 'none',
            background: activeFolder === null ? '#1a1a1a' : '#f0ede8',
            color: activeFolder === null ? '#f7f5f2' : '#6e6a65',
            fontSize: '0.8125rem', fontWeight: activeFolder === null ? 700 : 500, cursor: 'pointer',
          }}>
            🗂 Semua <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>{articlePurchases.length + filePurchases.length + bundlePurchases.length + savedPosts.length}</span>
          </button>

          {collections.map(col => (
            <div key={col.id} style={{ position: 'relative' }}>
              {editId === col.id ? (
                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                  <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') renameFolder(col.id); if (e.key === 'Escape') setEditId(null) }}
                    style={{ background: '#f7f5f2', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '0.375rem 0.625rem', fontSize: '0.8125rem', outline: 'none', width: '120px' }}
                  />
                  <button onClick={() => renameFolder(col.id)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.375rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer' }}>✓</button>
                  <button onClick={() => setEditId(null)} style={{ background: '#f0ede8', color: '#6e6a65', border: 'none', borderRadius: '6px', padding: '0.375rem 0.625rem', fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                  <button onClick={() => setActiveFolder(col.id === activeFolder ? null : col.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 0.875rem', borderRadius: '20px 0 0 20px', border: 'none',
                    background: activeFolder === col.id ? '#1a1a1a' : '#f0ede8',
                    color: activeFolder === col.id ? '#f7f5f2' : '#3d3a36',
                    fontSize: '0.8125rem', fontWeight: activeFolder === col.id ? 700 : 500, cursor: 'pointer',
                  }}>
                    {col.emoji} {col.name}
                    <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>{col.count}</span>
                  </button>
                  {/* Edit/delete controls */}
                  <div style={{ display: 'flex', background: activeFolder === col.id ? '#333' : '#e5e0d8', borderRadius: '0 20px 20px 0', overflow: 'hidden' }}>
                    <button onClick={() => { setEditId(col.id); setEditName(col.name) }} title="Rename" style={{ background: 'none', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem', color: activeFolder === col.id ? '#ccc' : '#6e6a65' }}>✎</button>
                    <button onClick={() => deleteFolder(col.id)} disabled={deleting === col.id} title="Hapus folder" style={{ background: 'none', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem', color: '#dc2626' }}>
                      {deleting === col.id ? '…' : '✕'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '1px solid #e5e0d8' }}>
        {([['pembelian', `Pembelian (${totalPembelian})`], ['tersimpan', `Tersimpan (${totalTersimpan})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem 1.25rem 0.875rem', marginBottom: '-1px',
            fontSize: '0.9375rem', fontWeight: activeTab === key ? 700 : 500,
            color: activeTab === key ? '#1a1a1a' : '#6e6a65',
            borderBottom: activeTab === key ? '2px solid #1a1a1a' : '2px solid transparent',
          }}>{label}</button>
        ))}
      </div>

      {/* Folder picker modal */}
      {folderPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setFolderPicker(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="modal-box" style={{ maxWidth: '340px' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#1a1a1a' }}>Tambah ke Folder</div>
            {collections.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9c9690', padding: '1.5rem 0', fontSize: '0.875rem' }}>
                Belum ada folder. Buat folder dulu dari tombol "+ Folder Baru".
              </div>
            ) : collections.map(col => {
              const inThis = col.itemIds.some(i => i.itemType === folderPicker.itemType && i.itemId === folderPicker.itemId)
              return (
                <button key={col.id} onClick={() => toggleItem(col.id, folderPicker.itemType, folderPicker.itemId)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: inThis ? '#f0ede8' : '#fafaf8',
                  border: `1px solid ${inThis ? '#1a1a1a' : '#e5e0d8'}`,
                  borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.5rem',
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: inThis ? 700 : 500,
                  color: '#1a1a1a',
                }}>
                  <span>{col.emoji} {col.name} <span style={{ color: '#9c9690', fontSize: '0.75rem' }}>({col.count})</span></span>
                  <span style={{ color: inThis ? '#059669' : '#9c9690' }}>{inThis ? '✓ Tersimpan' : '+ Tambah'}</span>
                </button>
              )
            })}
            <button onClick={() => setFolderPicker(null)} style={{ width: '100%', marginTop: '0.25rem', background: '#f0ede8', color: '#6e6a65', border: 'none', borderRadius: '10px', padding: '0.625rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── PEMBELIAN ───────────────────────────────────────── */}
      {activeTab === 'pembelian' && (
        <div>
          {totalPembelian === 0 ? (
            <Empty icon="🛒" title={activeFolder ? 'Folder ini kosong' : 'Belum ada pembelian'} sub={activeFolder ? 'Tambahkan item ke folder ini dari tab Semua.' : 'Beli artikel atau app untuk melihatnya di sini.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {/* Articles */}
              {filteredArticles.map(p => (
                <ItemCard
                  key={p.id}
                  badge="Artikel" badgeColor="#2563eb" badgeBg="#eff6ff"
                  title={p.post.title}
                  sub={`oleh ${p.post.author.name ?? '@' + p.post.author.username} · Rp ${fmt(p.amount)} · ${fmtDate(p.createdAt)}`}
                  href={`/@${p.post.author.username}/${p.post.slug}`}
                  cta="Baca →"
                  onFolder={() => setFolderPicker({ itemType: 'article', itemId: p.id })}
                  inFolderCount={collections.filter(c => c.itemIds.some(i => i.itemType === 'article' && i.itemId === p.id)).length}
                />
              ))}
              {/* Files/Apps */}
              {filteredFiles.map(p => (
                <ItemCard
                  key={p.id}
                  badge="App/File" badgeColor="#059669" badgeBg="#ecfdf5"
                  title={p.file.name}
                  sub={`oleh ${p.file.post.author.name ?? '@' + p.file.post.author.username} · Rp ${fmt(p.amount)} · ${fmtDate(p.createdAt)}`}
                  href={p.file.url ?? `/@${p.file.post.author.username}/${p.file.post.slug}`}
                  external={!!p.file.url}
                  cta="Buka →"
                  onFolder={() => setFolderPicker({ itemType: 'file', itemId: p.id })}
                  inFolderCount={collections.filter(c => c.itemIds.some(i => i.itemType === 'file' && i.itemId === p.id)).length}
                />
              ))}
              {/* Bundles */}
              {filteredBundles.map(p => (
                <ItemCard
                  key={p.id}
                  badge="Bundle" badgeColor="#7c3aed" badgeBg="#f5f3ff"
                  title={p.bundle.title}
                  sub={`oleh ${p.bundle.author.name ?? '@' + p.bundle.author.username} · Rp ${fmt(p.amount)} · ${fmtDate(p.createdAt)}`}
                  href={`/bundle/${p.bundle.slug}`}
                  cta="Buka →"
                  onFolder={() => setFolderPicker({ itemType: 'bundle', itemId: p.id })}
                  inFolderCount={collections.filter(c => c.itemIds.some(i => i.itemType === 'bundle' && i.itemId === p.id)).length}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TERSIMPAN ────────────────────────────────────────── */}
      {activeTab === 'tersimpan' && (
        <div>
          {totalTersimpan === 0 ? (
            <Empty icon="📚" title={activeFolder ? 'Folder ini kosong' : 'Belum ada artikel tersimpan'} sub={activeFolder ? 'Tambahkan artikel ke folder ini.' : 'Klik ☆ Simpan di artikel manapun.'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {filteredSaved.map(p => (
                <ItemCard
                  key={p.id}
                  badge={p.post.type === 'html' ? 'App' : 'Artikel'} badgeColor={p.post.type === 'html' ? '#059669' : '#2563eb'} badgeBg={p.post.type === 'html' ? '#ecfdf5' : '#eff6ff'}
                  title={p.post.title}
                  sub={`oleh ${p.post.author.name ?? '@' + p.post.author.username} · ${p.post.viewCount.toLocaleString()} views · Disimpan ${fmtDate(p.savedAt)}`}
                  href={`/@${p.post.author.username}/${p.post.slug}`}
                  cta="Baca →"
                  onFolder={() => setFolderPicker({ itemType: 'saved', itemId: p.id })}
                  inFolderCount={collections.filter(c => c.itemIds.some(i => i.itemType === 'saved' && i.itemId === p.id)).length}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────
function ItemCard({ badge, badgeColor, badgeBg, title, sub, href, external, cta, onFolder, inFolderCount }: {
  badge: string; badgeColor: string; badgeBg: string
  title: string; sub: string; href: string; external?: boolean; cta: string
  onFolder: () => void; inFolderCount: number
}) {
  return (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: badgeBg, color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{badge}</span>
          {inFolderCount > 0 && (
            <span style={{ fontSize: '0.65rem', color: '#9c9690' }}>📁 {inFolderCount} folder</span>
          )}
        </div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
        <button onClick={onFolder} title="Kelola folder" style={{ background: inFolderCount > 0 ? '#f0ede8' : '#fafaf8', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.375rem 0.625rem', fontSize: '0.8rem', cursor: 'pointer', color: '#6e6a65' }}>
          📁
        </button>
        <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} style={{ background: '#1a1a1a', color: '#f7f5f2', borderRadius: '8px', padding: '0.375rem 0.875rem', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {cta}
        </Link>
      </div>
    </div>
  )
}

function Empty({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9c9690' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>{icon}</div>
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3d3a36', marginBottom: '0.375rem' }}>{title}</div>
      <div style={{ fontSize: '0.875rem' }}>{sub}</div>
    </div>
  )
}
