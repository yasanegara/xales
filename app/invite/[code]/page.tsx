export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { db } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const invite = await db.invite.findUnique({
    where: { code: code.toUpperCase() },
    include: { owner: { select: { username: true, name: true, profilePic: true, bio: true } } },
  })

  if (!invite) notFound()

  // If already used, redirect to register anyway (user will see normal register)
  const used = !!invite.invitedUserId

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Inviter card */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: '#f0ede8', border: '1px solid #e5e0d8', overflow: 'hidden', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#6e6a65' }}>
              {invite.owner.profilePic
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={invite.owner.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                : (invite.owner.name?.[0] ?? invite.owner.username[0]).toUpperCase()
              }
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#9c9690', marginBottom: '0.5rem' }}>
              Kamu diundang oleh
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
              {invite.owner.name ?? `@${invite.owner.username}`}
            </div>
            {invite.owner.bio && (
              <div style={{ fontSize: '0.875rem', color: '#6e6a65', lineHeight: 1.6 }}>
                {invite.owner.bio}
              </div>
            )}
          </div>

          {/* CTA */}
          {used ? (
            <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '14px', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#854d0e', marginBottom: '0.5rem' }}>
                Kode undangan sudah digunakan
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#92400e', marginBottom: '1.25rem' }}>
                Kamu tetap bisa daftar tanpa kode undangan.
              </div>
              <Link href="/register" style={{ display: 'block', background: '#1a1a1a', color: '#f7f5f2', padding: '0.75rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>
                Daftar Sekarang
              </Link>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  Bergabung ke Tweak
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6e6a65', lineHeight: 1.6 }}>
                  Platform kreator Indonesia — tulis artikel, publish tools, dan monetisasi karya dari satu tempat.
                </p>
              </div>

              {/* Invite code badge */}
              <div style={{ background: 'linear-gradient(135deg, #f0ede8, #e5e0d8)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9c9690', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Kode Undangan</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.1em' }}>{invite.code}</div>
                </div>
                <div style={{ fontSize: '1.5rem' }}>✉️</div>
              </div>

              <Link href={`/register?invite=${invite.code}`} style={{ display: 'block', background: '#1a1a1a', color: '#f7f5f2', padding: '0.875rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', textAlign: 'center', letterSpacing: '-0.01em' }}>
                Daftar Gratis →
              </Link>

              <p style={{ fontSize: '0.75rem', color: '#9c9690', textAlign: 'center', marginTop: '1rem' }}>
                Sudah punya akun?{' '}
                <Link href="/login" style={{ color: '#6e6a65', textDecoration: 'none', fontWeight: 500 }}>Masuk</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
