import { Sk } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Sk w={120} h="1.5rem" />
          <Sk w={200} h="0.875rem" />
        </div>
        <Sk w={100} h={36} r="8px" />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Sk w="60%" h="1.75rem" />
            <Sk w="80%" h="0.8rem" />
            <Sk w="50%" h="0.75rem" />
          </div>
        ))}
      </div>

      {/* Recent posts list */}
      <Sk w={140} h="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Sk w="70%" h="0.9rem" />
              <Sk w="40%" h="0.75rem" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Sk w={50} h="0.8rem" />
              <Sk w={50} h="0.8rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
