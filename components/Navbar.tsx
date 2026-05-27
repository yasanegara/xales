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
        background: '#111111',
        borderBottom: '1px solid #222222',
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
            color: '#ffffff',
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
                  background: '#0070f3',
                  color: '#fff',
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
                    background: '#1a1a1a',
                    border: '1px solid #222222',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ededed',
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
                      background: '#111111',
                      border: '1px solid #222222',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      minWidth: '160px',
                      zIndex: 100,
                    }}
                  >
                    <Link
                      href={`/@${session.user.username}`}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.5rem 0.75rem',
                        color: '#ededed',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        borderRadius: '4px',
                      }}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.5rem 0.75rem',
                        color: '#ededed',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        borderRadius: '4px',
                      }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.5rem 0.75rem',
                        color: '#ededed',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        borderRadius: '4px',
                      }}
                    >
                      Settings
                    </Link>
                    <hr style={{ border: 'none', borderTop: '1px solid #222222', margin: '0.25rem 0' }} />
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.75rem',
                        color: '#ff4444',
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
                style={{ color: '#888888', fontSize: '0.875rem', textDecoration: 'none' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  background: '#0070f3',
                  color: '#fff',
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
