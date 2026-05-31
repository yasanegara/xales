'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────
interface DFolder {
  id: string; name: string; emoji: string; color: string; createdAt: string
  _count: { children: number; files: number }
}
interface DFile {
  id: string; name: string; mimeType: string; size: number
  url?: string | null; isPublic: boolean; shareToken?: string | null
  createdAt: string; updatedAt: string
}
interface Crumb { id: string; name: string }

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://xales.id'

// ── Helpers ────────────────────────────────────────────────────────────
function fmtSize(b: number) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return '🖼'
  if (mime.startsWith('video/')) return '🎬'
  if (mime.startsWith('audio/')) return '🎵'
  if (mime.includes('pdf')) return '📕'
  if (mime.includes('zip') || mime.includes('rar')) return '🗜'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('word') || mime.includes('doc')) return '📝'
  if (mime === 'url/link') return '🔗'
  return '📄'
}

const FOLDER_COLORS = ['#f59e0b','#10b981','#6366f1','#ef4444','#0070f3','#ec4899','#8b5cf6','#14b8a6']
const FOLDER_EMOJIS = ['📁','📂','💼','🗂','📚','🎨','🔬','💡','🚀','🎯','⭐','🔒']

// ── Main Component ─────────────────────────────────────────────────────
export default function DriveClient({ initialFolders, initialFiles }: { initialFolders: DFolder[]; initialFiles: DFile[] }) {
  const [currentId,  setCurrentId]  = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<Crumb[]>([])
  const [folders,    setFolders]    = useState<DFolder[]>(initialFolders)
  const [files,      setFiles]      = useState<DFile[]>(initialFiles)
  const [loading,    setLoading]    = useState(false)
  const [selected,   setSelected]   = useState<{ type: 'folder' | 'file'; id: string } | null>(null)
  const [view,       setView]       = useState<'grid' | 'list'>('grid')

  // Modals
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderEmoji, setNewFolderEmoji] = useState('📁')
  const [newFolderColor, setNewFolderColor] = useState('#f59e0b')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [urlOpen,    setUrlOpen]    = useState(false)
  const [urlName,    setUrlName]    = useState('')
  const [urlVal,     setUrlVal]     = useState('')
  const [renameId,   setRenameId]   = useState<string | null>(null)
  const [renameName, setRenameName] = useState('')
  const [renameType, setRenameType] = useState<'folder' | 'file'>('folder')
  const [shareFile,  setShareFile]  = useState<DFile | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Navigate into folder
  const openFolder = useCallback(async (id: string | null, crumbs: Crumb[]) => {
    setLoading(true)
    setSelected(null)
    const res  = await fetch(`/api/drive/folders?parentId=${id ?? ''}`)
    const data = await res.json()
    setFolders(data.folders)
    setFiles(data.files)
    setCurrentId(id)
    setBreadcrumb(crumbs)
    setLoading(false)
  }, [])

  const refresh = useCallback(() => openFolder(currentId, breadcrumb), [openFolder, currentId, breadcrumb])

  // Create folder
  const createFolder = async () => {
    if (!newFolderName.trim()) return
    const res = await fetch('/api/drive/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName.trim(), parentId: currentId, emoji: newFolderEmoji, color: newFolderColor }),
    })
    if (res.ok) { setNewFolderOpen(false); setNewFolderName(''); refresh() }
  }

  // Upload file
  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert('Maksimal 5MB per file'); return }
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = (e.target?.result as string).split(',')[1]
      await fetch('/api/drive/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, mimeType: file.type, size: file.size, data, folderId: currentId }),
      })
      setUploadOpen(false)
      refresh()
    }
    reader.readAsDataURL(file)
  }

  // Add URL
  const addUrl = async () => {
    if (!urlName.trim() || !urlVal.trim()) return
    await fetch('/api/drive/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: urlName.trim(), mimeType: 'url/link', url: urlVal.trim(), folderId: currentId }),
    })
    setUrlOpen(false); setUrlName(''); setUrlVal('')
    refresh()
  }

  // Delete
  const deleteItem = async () => {
    if (!selected) return
    if (!confirm('Hapus item ini?')) return
    if (selected.type === 'folder') {
      await fetch(`/api/drive/folders/${selected.id}`, { method: 'DELETE' })
    } else {
      await fetch(`/api/drive/files/${selected.id}`, { method: 'DELETE' })
    }
    setSelected(null)
    refresh()
  }

  // Rename
  const doRename = async () => {
    if (!renameId || !renameName.trim()) return
    if (renameType === 'folder') {
      await fetch(`/api/drive/folders/${renameId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: renameName.trim() }) })
    } else {
      await fetch(`/api/drive/files/${renameId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: renameName.trim() }) })
    }
    setRenameId(null); setRenameName('')
    refresh()
  }

  // Share
  const toggleShare = async (file: DFile) => {
    const res = await fetch(`/api/drive/files/${file.id}/share`, { method: 'POST' })
    const data = await res.json()
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, ...data.file } : f))
    const updated = { ...file, ...data.file }
    setShareFile(updated)
  }

  const copyShareUrl = (token: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/share/${token}`)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const selectedFolder = selected?.type === 'folder' ? folders.find(f => f.id === selected.id) : null
  const selectedFile   = selected?.type === 'file'   ? files.find(f => f.id === selected.id)   : null

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '500px' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <button onClick={() => openFolder(null, [])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: currentId ? '#6e6a65' : '#1a1a1a', fontWeight: currentId ? 400 : 700, padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
            📁 Drive
          </button>
          {breadcrumb.map((c, i) => (
            <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#d0c9b8', fontSize: '0.75rem' }}>›</span>
              <button onClick={() => openFolder(c.id, breadcrumb.slice(0, i + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: i === breadcrumb.length - 1 ? '#1a1a1a' : '#6e6a65', fontWeight: i === breadcrumb.length - 1 ? 700 : 400, padding: '0.25rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                {c.name}
              </button>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
          <button onClick={() => setNewFolderOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f0ede8', border: 'none', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#3d3a36' }}>
            📁 Folder
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f0ede8', border: 'none', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#3d3a36' }}>
            ↑ Upload
          </button>
          <button onClick={() => setUrlOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: '#f0ede8', border: 'none', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#3d3a36' }}>
            🔗 URL
          </button>
          <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} style={{ background: '#f0ede8', border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer', color: '#6e6a65' }}>
            {view === 'grid' ? '☰' : '⊞'}
          </button>
        </div>

        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = '' }} />
      </div>

      {/* Action bar for selected item */}
      {selected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1a1a1a', borderRadius: '10px', padding: '0.625rem 1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: '#f7f5f2', fontWeight: 600, flex: 1 }}>
            {selectedFolder?.name ?? selectedFile?.name}
          </span>
          <button onClick={() => { setRenameId(selected.id); setRenameType(selected.type); setRenameName(selectedFolder?.name ?? selectedFile?.name ?? '') }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: '#f7f5f2', cursor: 'pointer' }}>✎ Rename</button>
          {selected.type === 'file' && selectedFile && (
            <button onClick={() => { setShareFile(selectedFile); toggleShare(selectedFile) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: '#f7f5f2', cursor: 'pointer' }}>
              {selectedFile.isPublic ? '🔓 Shared' : '🔗 Share'}
            </button>
          )}
          {selected.type === 'file' && selectedFile && !selectedFile.url && (
            <a href={`/api/drive/files/${selected.id}`} download={selectedFile.name} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: '#f7f5f2', textDecoration: 'none' }}>↓ Unduh</a>
          )}
          <button onClick={deleteItem} style={{ background: 'rgba(220,38,38,0.3)', border: 'none', borderRadius: '6px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: '#fca5a5', cursor: 'pointer' }}>🗑 Hapus</button>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '1rem', padding: '0 0.25rem' }}>✕</button>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', padding: '0.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skel" style={{ height: '110px', borderRadius: '12px' }} />)}
          </div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#9c9690' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3d3a36', marginBottom: '0.375rem' }}>Folder ini kosong</div>
            <div style={{ fontSize: '0.875rem' }}>Buat folder baru atau upload file</div>
          </div>
        ) : view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', padding: '0.25rem' }}>
            {/* Folders */}
            {folders.map(f => (
              <div key={f.id}
                onClick={() => setSelected(s => s?.id === f.id ? null : { type: 'folder', id: f.id })}
                onDoubleClick={() => openFolder(f.id, [...breadcrumb, { id: f.id, name: f.name }])}
                style={{ background: selected?.id === f.id ? '#f0ede8' : '#fff', border: `2px solid ${selected?.id === f.id ? '#1a1a1a' : '#f0ede8'}`, borderRadius: '12px', padding: '1rem 0.75rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.1s', userSelect: 'none' }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{f.emoji}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: '0.625rem', color: '#9c9690', marginTop: '2px' }}>
                  {f._count.children + f._count.files} item
                </div>
              </div>
            ))}
            {/* Files */}
            {files.map(f => (
              <div key={f.id}
                onClick={() => setSelected(s => s?.id === f.id ? null : { type: 'file', id: f.id })}
                style={{ background: selected?.id === f.id ? '#f0ede8' : '#fff', border: `2px solid ${selected?.id === f.id ? '#1a1a1a' : '#f0ede8'}`, borderRadius: '12px', padding: '1rem 0.75rem', cursor: 'pointer', textAlign: 'center', transition: 'all 0.1s', userSelect: 'none', position: 'relative' }}
              >
                {f.isPublic && <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.6rem', background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '10px', fontWeight: 700 }}>SHARED</span>}
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{fileIcon(f.mimeType)}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: '0.625rem', color: '#9c9690', marginTop: '2px' }}>{fmtSize(f.size)}</div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div style={{ border: '1px solid #f0ede8', borderRadius: '12px', overflow: 'hidden' }}>
            {[...folders.map(f => ({ ...f, _type: 'folder' as const })), ...files.map(f => ({ ...f, _type: 'file' as const }))].map((item, i, arr) => (
              <div key={item.id}
                onClick={() => setSelected(s => s?.id === item.id ? null : { type: item._type, id: item.id })}
                onDoubleClick={() => item._type === 'folder' && openFolder(item.id, [...breadcrumb, { id: item.id, name: item.name }])}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: selected?.id === item.id ? '#f7f5f2' : '#fff', borderBottom: i < arr.length - 1 ? '1px solid #f7f5f2' : 'none', cursor: 'pointer', userSelect: 'none' }}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                  {item._type === 'folder' ? (item as DFolder).emoji : fileIcon((item as DFile).mimeType)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>
                    {item._type === 'folder'
                      ? `${(item as DFolder)._count.children + (item as DFolder)._count.files} item · ${fmtDate(item.createdAt)}`
                      : `${fmtSize((item as DFile).size)} · ${fmtDate(item.createdAt)}`
                    }
                  </div>
                </div>
                {item._type === 'file' && (item as DFile).isPublic && (
                  <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '10px', fontWeight: 700, flexShrink: 0 }}>SHARED</span>
                )}
                {item._type === 'folder' && <span style={{ color: '#d0c9b8', fontSize: '0.75rem' }}>›</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}

      {/* New Folder */}
      {newFolderOpen && (
        <Modal onClose={() => setNewFolderOpen(false)} title="Folder Baru">
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>Nama Folder</label>
            <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Nama folder..." style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>Emoji</label>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {FOLDER_EMOJIS.map(e => (
                <button key={e} onClick={() => setNewFolderEmoji(e)} style={{ border: `2px solid ${newFolderEmoji === e ? '#1a1a1a' : 'transparent'}`, background: newFolderEmoji === e ? '#f0ede8' : 'none', borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', fontSize: '1.125rem' }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Warna</label>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {FOLDER_COLORS.map(c => (
                <button key={c} onClick={() => setNewFolderColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: `3px solid ${newFolderColor === c ? '#1a1a1a' : 'transparent'}`, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={createFolder} disabled={!newFolderName.trim()} style={{ flex: 1, ...btnPrimary }}>Buat Folder</button>
            <button onClick={() => setNewFolderOpen(false)} style={btnSecondary}>Batal</button>
          </div>
        </Modal>
      )}

      {/* Add URL */}
      {urlOpen && (
        <Modal onClose={() => setUrlOpen(false)} title="Tambah Link">
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>Nama</label>
            <input autoFocus value={urlName} onChange={e => setUrlName(e.target.value)} placeholder="Nama link..." style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>URL</label>
            <input value={urlVal} onChange={e => setUrlVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUrl()} placeholder="https://..." style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={addUrl} disabled={!urlName.trim() || !urlVal.trim()} style={{ flex: 1, ...btnPrimary }}>Simpan</button>
            <button onClick={() => setUrlOpen(false)} style={btnSecondary}>Batal</button>
          </div>
        </Modal>
      )}

      {/* Rename */}
      {renameId && (
        <Modal onClose={() => setRenameId(null)} title="Rename">
          <div style={{ marginBottom: '1.25rem' }}>
            <input autoFocus value={renameName} onChange={e => setRenameName(e.target.value)} onKeyDown={e => e.key === 'Enter' && doRename()} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={doRename} disabled={!renameName.trim()} style={{ flex: 1, ...btnPrimary }}>Simpan</button>
            <button onClick={() => setRenameId(null)} style={btnSecondary}>Batal</button>
          </div>
        </Modal>
      )}

      {/* Share */}
      {shareFile && (
        <Modal onClose={() => { setShareFile(null); setShareCopied(false) }} title="Bagikan File">
          <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{fileIcon(shareFile.mimeType)}</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '1.5rem' }}>{shareFile.name}</div>

            {shareFile.isPublic && shareFile.shareToken ? (
              <>
                <div style={{ background: '#f7f5f2', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#6e6a65', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', textAlign: 'left' }}>
                  {BASE_URL}/share/{shareFile.shareToken}
                </div>
                <button onClick={() => copyShareUrl(shareFile.shareToken!)} style={{ ...btnPrimary, width: '100%', marginBottom: '0.5rem' }}>
                  {shareCopied ? '✓ Tersalin!' : '📋 Salin Link'}
                </button>
                <button onClick={() => toggleShare(shareFile)} style={{ ...btnSecondary, width: '100%' }}>
                  🔒 Cabut Akses
                </button>
              </>
            ) : (
              <button onClick={() => toggleShare(shareFile)} style={{ ...btnPrimary, width: '100%' }}>
                🔗 Buat Link Berbagi
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────────────
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div className="modal-box" style={{ maxWidth: '380px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9c9690', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', color: '#6e6a65', marginBottom: '0.375rem', fontWeight: 500 }
const inputStyle: React.CSSProperties = { width: '100%', background: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }
const btnPrimary: React.CSSProperties = { background: '#1a1a1a', color: '#f7f5f2', border: 'none', borderRadius: '10px', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { background: '#f0ede8', color: '#3d3a36', border: 'none', borderRadius: '10px', padding: '0.625rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }
