'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV = [
  { href: '/dashboard',             label: 'Dashboard',          icon: '⊞' },
  { href: '/dashboard/posts',       label: 'Konten Saya',        icon: '✍️' },
  { href: '/dashboard/earnings',    label: 'Saldo & Penghasilan', icon: '💰' },
  { href: '/dashboard/orders',      label: 'Pesanan',            icon: '📦' },
  { href: '/dashboard/library',     label: 'Library',            icon: '★' },
  { href: '/dashboard/gifts',       label: 'Gift Diterima',      icon: '🎁' },
  { href: '/dashboard/gift-wallet', label: 'Gift Wallet',        icon: '💳' },
  { href: '/dashboard/bundles',     label: 'Bundle',             icon: '🗂' },
  { href: '/dashboard/discounts',   label: 'Kode Diskon',        icon: '%' },
  { href: '/dashboard/affiliate',   label: 'Affiliate',          icon: '↗' },
  { href: '/dashboard/settings',    label: 'Settings',           icon: '⚙' },
]

const ADMIN_NAV = [
  { href: '/admin',              label: 'Admin Panel',      icon: '🛡' },
  { href: '/admin/withdrawals',  label: 'Pencairan Dana',   icon: '💸' },
  { href: '/admin/gifts',        label: 'Katalog Hadiah',   icon: '🎁' },
]

export default function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <aside className="dashboard-sidebar">
      {/* Avatar + name */}
      {session && (
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #f0ede8', marginBottom: '0.5rem' }}>
          <Link href={`/@${session.user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#f0ede8', border: '1px solid #e5e0d8',
              overflow: 'hidden', flexShrink: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#6e6a65',
            }}>
              {session.user.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              ) : (
                (session.user.name?.[0] ?? session.user.username?.[0] ?? '?').toUpperCase()
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.user.name ?? session.user.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9c9690' }}>@{session.user.username}</div>
            </div>
          </Link>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ padding: '0 0.5rem' }}>
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} className={active ? '' : 'sidebar-link'} style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              textDecoration: 'none', marginBottom: '1px',
              background: active ? '#f0ede8' : 'transparent',
              color: active ? '#1a1a1a' : '#6e6a65',
              fontWeight: active ? 600 : 400,
              fontSize: '0.875rem',
              transition: 'background 0.1s, color 0.1s',
            }}>
              <span style={{ fontSize: '0.9rem', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        {/* Admin section */}
        {session?.user?.role === 'admin' && (
          <>
            <div style={{ margin: '0.75rem 0.75rem 0.25rem', fontSize: '0.6875rem', fontWeight: 600, color: '#b0aca6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Admin
            </div>
            {ADMIN_NAV.map(item => {
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} className={active ? '' : 'sidebar-link'} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderRadius: '8px',
                  textDecoration: 'none', marginBottom: '1px',
                  background: active ? '#fef2f2' : 'transparent',
                  color: active ? '#dc2626' : '#6e6a65',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem',
                  transition: 'background 0.1s, color 0.1s',
                }}>
                  <span style={{ fontSize: '0.9rem', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </aside>
  )
}
