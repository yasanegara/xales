'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Note {
  id: string
  postSlug: string
  postTitle: string
  postAuthorUsername: string
  quote: string
  comment: string | null
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function groupByPost(notes: Note[]) {
  const map = new Map<string, { slug: string; title: string; authorUsername: string; notes: Note[] }>()
  for (const note of notes) {
    if (!map.has(note.postSlug)) {
      map.set(note.postSlug, { slug: note.postSlug, title: note.postTitle, authorUsername: note.postAuthorUsername, notes: [] })
    }
    map.get(note.postSlug)!.notes.push(note)
  }
  return Array.from(map.values())
}

export default function NotesClient({ notes: initial }: { notes: Note[] }) {
  const [notes, setNotes] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const deleteNote = async (id: string) => {
    setDeleting(id)
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
    setDeleting(null)
  }

  const groups = groupByPost(notes)

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.25rem' }}>
          Catatan Saya
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#9c9690' }}>
          Quote dan catatan yang kamu simpan dari artikel yang sudah dibaca.
        </p>
      </div>

      {notes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: '#faf7f2', borderRadius: '14px',
          border: '1px solid #e5e0d8',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✏️</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Belum ada catatan
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9c9690', lineHeight: 1.6 }}>
            Saat membaca artikel, pilih teks dan klik <strong>Simpan Catatan</strong>,<br />
            atau klik tombol ✏ di sisi kanan halaman artikel.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groups.map(group => (
            <div key={group.slug}>
              {/* Article header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '0.875rem',
                paddingBottom: '0.625rem',
                borderBottom: '1px solid #e5e0d8',
              }}>
                <span style={{ fontSize: '0.9rem' }}>📄</span>
                <Link
                  href={`/@${group.authorUsername}/${group.slug}`}
                  style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}
                >
                  {group.title}
                </Link>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.75rem', color: '#9c9690',
                  background: '#f0ede8', borderRadius: '20px',
                  padding: '0.1rem 0.625rem',
                }}>
                  {group.notes.length} catatan
                </span>
              </div>

              {/* Notes in this article */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {group.notes.map(note => (
                  <div
                    key={note.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e5e0d8',
                      borderRadius: '10px',
                      padding: '1rem 1.125rem',
                      position: 'relative',
                    }}
                  >
                    {/* Quote */}
                    <blockquote style={{
                      margin: 0,
                      borderLeft: '3px solid #d4cfc7',
                      paddingLeft: '0.875rem',
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.9375rem',
                      color: '#3d3a36',
                      lineHeight: 1.65,
                      fontStyle: 'italic',
                    }}>
                      {note.quote}
                    </blockquote>

                    {/* Personal comment */}
                    {note.comment && (
                      <div style={{
                        marginTop: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#6e6a65',
                        lineHeight: 1.6,
                        paddingTop: '0.625rem',
                        borderTop: '1px solid #f0ede8',
                      }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.5rem' }}>
                          Catatan:
                        </span>
                        {note.comment}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{
                      marginTop: '0.75rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#b0aca6' }}>
                        {formatDate(note.createdAt)}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        disabled={deleting === note.id}
                        style={{
                          background: 'none', border: 'none', cursor: deleting === note.id ? 'default' : 'pointer',
                          fontSize: '0.8rem', color: '#c4bfb8',
                          padding: '0.25rem 0.375rem', borderRadius: '4px',
                          transition: 'color 0.15s',
                        }}
                        title="Hapus catatan"
                      >
                        {deleting === note.id ? '…' : 'Hapus'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
