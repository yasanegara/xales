import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/purchases', label: 'Purchases' },
  { href: '/admin/withdrawals', label: 'Pencairan' },
  { href: '/admin/fees', label: 'Pengaturan' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f2' }}>
      {/* Admin navbar */}
      <nav style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2724', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f0ede8', letterSpacing: '0.05em' }}>
              Tweak <span style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(217,119,6,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', letterSpacing: '0.08em' }}>ADMIN</span>
            </span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ color: 'rgba(240,237,232,0.7)', fontSize: '0.875rem', textDecoration: 'none', padding: '0.375rem 0.75rem', borderRadius: '6px' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'rgba(240,237,232,0.5)', fontSize: '0.8125rem' }}>
              @{session.user.username}
            </span>
            <Link href="/" style={{ color: 'rgba(240,237,232,0.5)', fontSize: '0.8125rem', textDecoration: 'none' }}>
              ← Kembali ke site
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  )
}
