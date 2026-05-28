import { Sk } from '@/components/Skeleton'
import Navbar from '@/components/Navbar'

export default function ArticleLoading() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '760px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Sk w={60} h="1.25rem" />
              <Sk w={80} h="1.25rem" />
            </div>
            <Sk w={160} h="1.25rem" />
          </div>

          {/* Title */}
          <Sk w="95%" h="2.25rem" style={{ marginBottom: '0.625rem' }} />
          <Sk w="70%" h="2.25rem" style={{ marginBottom: '1.25rem' }} />

          {/* Description */}
          <Sk w="100%" h="1rem" style={{ marginBottom: '0.375rem' }} />
          <Sk w="80%" h="1rem" style={{ marginBottom: '1.5rem' }} />

          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #e5e0d8', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sk w={34} h={34} r="7px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <Sk w={100} h="0.875rem" />
                <Sk w={140} h="0.75rem" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[40, 36, 36, 36, 36, 36].map((w, i) => <Sk key={i} w={w} h={30} r="6px" />)}
            </div>
          </div>

          {/* Content lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[100, 95, 100, 88, 100, 92, 100, 75, 100, 90, 60].map((w, i) => (
              <Sk key={i} w={`${w}%`} h="1rem" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
