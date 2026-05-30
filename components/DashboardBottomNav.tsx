'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const BOTTOM_NAV = [
  { href: '/dashboard',           label: 'Home',    icon: '⊞' },
  { href: '/dashboard/posts',     label: 'Konten',  icon: '✍️' },
  { href: '/dashboard/earnings',  label: 'Saldo',   icon: '💰' },
  { href: '/dashboard/orders',    label: 'Pesanan', icon: '📦' },
  { href: '/dashboard/settings',  label: 'Settings', icon: '⚙' },
]

export default function DashboardBottomNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <nav style={{
      display: 'none',
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#ffffff', borderTop: '1px solid #e5e0d8',
      padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
    }}
    className="dashboard-bottom-nav"
    >
      {BOTTOM_NAV.map(item => {
        const active = isActive(item.href)
        return (
          <Link key={item.href} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '2px', textDecoration: 'none', padding: '0.25rem 0',
            color: active ? '#1a1a1a' : '#9c9690',
          }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: '0.625rem', fontWeight: active ? 700 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
