'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e0d8',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1a1a1a',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          XALES
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {session ? (
            <>
              <Link
                href="/dashboard/new"
                style={{
                  background: '#1a1a1a',
                  color: '#f7f5f2',
                  padding: '0.375rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                + New Post
              </Link>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    background: '#f0ede8',
                    border: '1px solid #e5e0d8',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#1a1a1a',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {session.user.name?.[0]?.toUpperCase() ?? session.user.username?.[0]?.toUpperCase()}
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '40px',
                      background: '#ffffff',
                      border: '1px solid #e5e0d8',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      minWidth: '160px',
                      zIndex: 100,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  >
                    {[
                      { href: `/@${session.user.username}`, label: 'Profile' },
                      { href: '/dashboard', label: 'Dashboard' },
                      { href: '/dashboard/library', label: '★ Library' },
                      { href: '/dashboard/discounts', label: '% Kode Diskon' },
                      { href: '/dashboard/affiliate', label: '↗ Affiliate' },
                      { href: '/dashboard/settings', label: 'Settings' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '0.5rem 0.75rem',
                          color: '#1a1a1a',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          borderRadius: '4px',
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid #e5e0d8', margin: '0.25rem 0' }} />
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.75rem',
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ color: '#6e6a65', fontSize: '0.875rem', textDecoration: 'none' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  background: '#1a1a1a',
                  color: '#f7f5f2',
                  padding: '0.375rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
