import { Sk } from '@/components/Skeleton'
import Navbar from '@/components/Navbar'

function CardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '0.875rem', display: 'flex', gap: '0.875rem' }}>
      <Sk w={72} h={72} r="8px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Sk w="30%" h="0.75rem" />
        <Sk w="90%" h="1rem" />
        <Sk w="70%" h="1rem" />
        <Sk w="50%" h="0.7rem" />
      </div>
    </div>
  )
}

export default function HomeLoading() {
  return (
    <>
      <Navbar />
      {/* Filter bar placeholder */}
      <div style={{ height: 44, borderBottom: '1px solid #e5e0d8', background: 'rgba(247,245,242,0.92)' }} />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '1.25rem 1rem' }}>
        {/* Featured */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Sk w="58%" h={280} r="14px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Sk h={130} r="12px" />
              <Sk h={130} r="12px" />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </main>
    </>
  )
}
