import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #e5e0d8',
      background: '#ffffff',
      marginTop: '4rem',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '2.5rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        alignItems: 'start',
      }}>
        {/* Brand */}
        <div>
          <Link href="/" style={{
            fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a',
            textDecoration: 'none', letterSpacing: '-0.01em',
            fontFamily: 'var(--font-brand, system-ui, sans-serif)',
            display: 'block', marginBottom: '0.5rem',
          }}>
            Tweak
          </Link>
          <p style={{ fontSize: '0.8125rem', color: '#9c9690', lineHeight: 1.6, maxWidth: '280px', margin: 0 }}>
            Platform publishing untuk kreator Indonesia. Tulis, bagikan, dan hasilkan dari karya kamu.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9c9690', marginBottom: '0.75rem' }}>
              Platform
            </div>
            {[
              { href: '/', label: 'Jelajahi' },
              { href: '/register', label: 'Daftar' },
              { href: '/login', label: 'Masuk' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: '0.875rem', color: '#6e6a65', textDecoration: 'none', marginBottom: '0.5rem' }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9c9690', marginBottom: '0.75rem' }}>
              Kreator
            </div>
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/dashboard/new', label: 'Tulis Artikel' },
              { href: '/dashboard/earnings', label: 'Penghasilan' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: '0.875rem', color: '#6e6a65', textDecoration: 'none', marginBottom: '0.5rem' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #f0ede8' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#b0a898' }}>
            © {new Date().getFullYear()} Tweak. Dibuat untuk kreator Indonesia.
          </span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {[
              { href: '/privacy', label: 'Privasi' },
              { href: '/terms', label: 'Ketentuan' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: '0.75rem', color: '#b0a898', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
