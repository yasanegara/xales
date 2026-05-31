export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
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

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const file = await db.driveFile.findUnique({
    where: { shareToken: token },
    include: { user: { select: { username: true, name: true, profilePic: true } } },
  })

  if (!file || !file.isPublic) notFound()

  const isImage  = file.mimeType.startsWith('image/')
  const isLink   = file.url && !file.data
  const previewUrl = file.url && isImage ? file.url : null

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Shared by */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0ede8', border: '1px solid #e5e0d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#6e6a65', overflow: 'hidden', flexShrink: 0 }}>
            {file.user.profilePic
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={file.user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (file.user.name?.[0] ?? file.user.username[0]).toUpperCase()
            }
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6e6a65' }}>
            Dibagikan oleh <Link href={`/@${file.user.username}`} style={{ color: '#1a1a1a', fontWeight: 600, textDecoration: 'none' }}>
              {file.user.name ?? `@${file.user.username}`}
            </Link>
          </div>
        </div>

        {/* File card */}
        <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

          {/* Image preview */}
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={file.name} style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', background: '#f7f5f2', display: 'block' }} />
          )}

          <div style={{ padding: '1.75rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{fileIcon(file.mimeType)}</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.375rem', wordBreak: 'break-word' }}>
              {file.name}
            </h1>
            {file.size > 0 && (
              <div style={{ fontSize: '0.8125rem', color: '#9c9690', marginBottom: '1.5rem' }}>
                {fmtSize(file.size)} · {file.mimeType}
              </div>
            )}

            {isLink && file.url ? (
              <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1a1a1a', color: '#f7f5f2', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600 }}>
                ↗ Buka Link
              </a>
            ) : (
              <a href={`/api/drive/files/${file.id}`} download={file.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1a1a1a', color: '#f7f5f2', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600 }}>
                ↓ Unduh File
              </a>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8125rem', color: '#b0aca6' }}>
          Dibagikan lewat <Link href="/" style={{ color: '#6e6a65', textDecoration: 'none', fontWeight: 500 }}>Tweak Drive</Link>
        </p>
      </div>
    </>
  )
}
