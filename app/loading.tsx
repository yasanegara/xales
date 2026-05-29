import { Sk } from '@/components/Skeleton'
import Navbar from '@/components/Navbar'

// Skeleton for a single DiscoverCard (4:3 cover + body)
function CardSkeleton() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
      {/* Cover — 4:3 aspect ratio */}
      <div className="skel" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 0 }} />
      {/* Body */}
      <div style={{ padding: '0.875rem 1rem 1rem' }}>
        <Sk w="38%" h="0.6rem" style={{ marginBottom: '0.5rem' }} />
        <Sk w="92%" h="0.875rem" style={{ marginBottom: '0.35rem' }} />
        <Sk w="65%" h="0.875rem" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.625rem', borderTop: '1px solid #f0ede8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sk w={22} h={22} r="5px" />
            <Sk w={64} h="0.625rem" />
          </div>
          <Sk w={52} h="0.75rem" />
        </div>
      </div>
    </div>
  )
}

// Skeleton cluster — staggered square avatars suggesting the interactive cluster
const CLUSTER = [
  { l: 'calc(50% - 190px)', t: 'calc(50% - 38px)', sz: 76 },
  { l: 'calc(50% - 112px)', t: 'calc(50% - 64px)', sz: 58 },
  { l: 'calc(50% -  44px)', t: 'calc(50% - 52px)', sz: 52 },
  { l: 'calc(50% +  28px)', t: 'calc(50% - 62px)', sz: 82 },
  { l: 'calc(50% + 100px)', t: 'calc(50% - 48px)', sz: 64 },
  { l: 'calc(50% + 170px)', t: 'calc(50% - 35px)', sz: 70 },
  { l: 'calc(50% - 128px)', t: 'calc(50% + 18px)', sz: 82 },
  { l: 'calc(50% -  54px)', t: 'calc(50% + 36px)', sz: 64 },
  { l: 'calc(50% +  18px)', t: 'calc(50% + 28px)', sz: 52 },
  { l: 'calc(50% +  90px)', t: 'calc(50% + 42px)', sz: 76 },
  { l: 'calc(50% + 162px)', t: 'calc(50% + 22px)', sz: 58 },
]

// Float keyframe paths — each avatar picks one
const FLOAT_KF = ['sk-fl-a', 'sk-fl-b', 'sk-fl-c', 'sk-fl-d']
const DURATIONS = ['4.1s','5.0s','3.7s','4.8s','5.3s','3.5s','4.4s','5.1s','3.9s','4.6s','5.2s']
const DELAYS    = ['0s','-1.3s','-2.1s','-0.7s','-1.9s','-2.8s','-0.4s','-1.7s','-3.2s','-0.9s','-2.4s']

function ClusterSkeleton() {
  return (
    <>
      <style>{`
        @keyframes sk-fl-a {
          0%,100% { transform:translate(0,0);    }
          30%     { transform:translate( 5px,-9px);  }
          65%     { transform:translate(-3px,-6px);  }
        }
        @keyframes sk-fl-b {
          0%,100% { transform:translate(0,0);    }
          40%     { transform:translate(-6px,-8px);  }
          70%     { transform:translate( 4px,-11px); }
        }
        @keyframes sk-fl-c {
          0%,100% { transform:translate(0,0);    }
          25%     { transform:translate( 7px,-5px);  }
          60%     { transform:translate( 2px,-12px); }
        }
        @keyframes sk-fl-d {
          0%,100% { transform:translate(0,0);    }
          45%     { transform:translate(-5px,-10px); }
          75%     { transform:translate( 6px,-4px);  }
        }
      `}</style>
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        {CLUSTER.map((c, i) => (
          // Outer div handles float movement; inner .skel handles pulse opacity
          <div key={i} style={{
            position: 'absolute',
            left: c.l,
            top:  c.t,
            transform: 'translate(-50%, -50%)',
            animation: `${FLOAT_KF[i % 4]} ${DURATIONS[i]} ease-in-out infinite`,
            animationDelay: DELAYS[i],
          }}>
            <div className="skel" style={{
              width:  c.sz,
              height: c.sz,
              borderRadius: '10px',
              border: '2.5px solid rgba(255,255,255,0.9)',
            }} />
          </div>
        ))}
      </div>
    </>
  )
}

export default function HomeLoading() {
  return (
    <>
      <Navbar />

      {/* Filter strip placeholder */}
      <div style={{
        borderBottom: '1px solid #e5e0d8',
        background: 'rgba(247,245,242,0.96)',
        padding: '0.5rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[60, 72, 56, 4, 52, 64, 48, 56, 70, 52].map((w, i) => (
            i === 3
              ? <div key={i} style={{ width: 1, height: 16, background: '#e5e0d8', flexShrink: 0 }} />
              : <Sk key={i} w={w} h={28} r="20px" style={{ flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* Creator showcase placeholder */}
      <div style={{ borderBottom: '1px solid #e5e0d8', background: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <ClusterSkeleton />
          {/* Stats row below cluster */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
            <Sk w={180} h="0.875rem" />
            <Sk w={140} h="0.75rem" />
          </div>
        </div>
      </div>

      {/* Feed section */}
      <main style={{ maxWidth: '1100px', margin: '0 auto' }} className="home-main">
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Sk w={80} h="1.125rem" />
          <Sk w={56} h="0.8rem" />
        </div>

        {/* Feed grid — matches .feed-grid responsive class */}
        <div className="feed-grid">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </main>
    </>
  )
}
