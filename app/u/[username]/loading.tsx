import { Sk } from '@/components/Skeleton'
import Navbar from '@/components/Navbar'

export default function ProfileLoading() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '935px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, width: 110 }}>
            <Sk w={110} h={110} r="12px" />
            <div style={{ display: 'flex', gap: '5px' }}>
              <Sk w="33%" h={34} r="8px" />
              <Sk w="33%" h={34} r="8px" />
              <Sk w="33%" h={34} r="8px" />
            </div>
            <Sk h={30} r="8px" />
            <Sk h={30} r="8px" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Sk w={120} h="1.25rem" />
              <Sk w={70} h={30} r="6px" />
            </div>
            <div style={{ display: 'flex', gap: '1.75rem' }}>
              {[45, 60, 70].map((w, i) => <Sk key={i} w={w} h={40} />)}
            </div>
            <Sk w="60%" h="1rem" />
            <Sk w="90%" h="0.875rem" />
            <Sk w="80%" h="0.875rem" />
            <Sk w="50%" h="0.75rem" />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e0d8', marginBottom: '1.25rem' }}>
          <Sk w={100} h={36} r="0" style={{ marginRight: '0.5rem' }} />
          <Sk w={80} h={36} r="0" />
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Sk key={i} style={{ aspectRatio: '1', borderRadius: '10px' }} />
          ))}
        </div>
      </main>
    </>
  )
}
