'use client'

import Link from 'next/link'
import { useState } from 'react'

const SPINE_COLORS = [
  '#8B3A2A', '#2A4A7F', '#2A6B3A', '#6B4A1A', '#4A2A6B',
  '#7A3A5A', '#1A5A6B', '#6B5A1A', '#3A6B5A', '#5A2A3A',
]
const HEIGHTS = [188, 204, 168, 212, 176, 196, 162, 208, 182, 192]
const WIDTHS  = [58, 52, 66, 54, 62, 50, 68, 56, 60, 64]
const BOOKS_PER_SHELF = 10

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

interface GridPost {
  id: string
  slug: string
  title: string
  description?: string | null
  type: string
  coverImage?: string | null
  isPremium: boolean
  viewCount: number
  likeCount: number
}

interface Props {
  posts: GridPost[]
  username: string
}

function Book({ post, idx, username, onHover, onLeave }: {
  post: GridPost
  idx: number
  username: string
  onHover: () => void
  onLeave: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color  = SPINE_COLORS[idx % SPINE_COLORS.length]
  const height = HEIGHTS[idx % HEIGHTS.length]
  const width  = WIDTHS[idx % WIDTHS.length]

  return (
    <Link
      href={`/@${username}/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}
      onMouseEnter={() => { setHovered(true); onHover() }}
      onMouseLeave={() => { setHovered(false); onLeave() }}
      title={post.title}
    >
      <div style={{
        width,
        height,
        borderRadius: '3px 4px 4px 3px',
        background: post.coverImage
          ? `url(${post.coverImage}) center/cover no-repeat`
          : color,
        boxShadow: hovered
          ? 'inset 4px 0 6px rgba(0,0,0,0.32), inset -1px 0 0 rgba(0,0,0,0.18), 5px 8px 20px rgba(0,0,0,0.38)'
          : 'inset 4px 0 6px rgba(0,0,0,0.22), inset -1px 0 0 rgba(0,0,0,0.12), 2px 3px 8px rgba(0,0,0,0.22)',
        transform: hovered ? 'translateY(-14px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}>

        {/* Page-edge strip (right side) */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 5,
          background: 'linear-gradient(to right, rgba(235,228,210,0.0), rgba(235,228,210,0.55))',
          borderRadius: '0 4px 4px 0',
          pointerEvents: 'none',
        }} />

        {/* Spine highlight line */}
        <div style={{
          position: 'absolute', left: 4, top: 0, bottom: 0, width: 1,
          background: 'rgba(255,255,255,0.18)',
          pointerEvents: 'none',
        }} />

        {!post.coverImage && (
          <>
            {/* Top band */}
            <div style={{ width: '70%', height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2, flexShrink: 0 }} />

            {/* Rotated title */}
            <div style={{
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.3,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: '4px 2px',
              textShadow: '0 1px 3px rgba(0,0,0,0.55)',
              overflow: 'hidden',
              maxHeight: height - 44,
            }}>
              {post.title.length > 48 ? post.title.slice(0, 48) + '…' : post.title}
            </div>

            {/* Icon */}
            <div style={{ fontSize: 11, flexShrink: 0, opacity: 0.85 }}>
              {post.isPremium ? '★' : post.type === 'html' ? '🔗' : '📝'}
            </div>

            {/* Bottom band */}
            <div style={{ width: '70%', height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
          </>
        )}
      </div>
    </Link>
  )
}

export default function ProfileGrid({ posts, username }: Props) {
  const [hovered, setHovered] = useState<GridPost | null>(null)
  const shelves = chunk(posts, BOOKS_PER_SHELF)

  return (
    <div style={{
      background: '#ede8de',
      borderRadius: '12px',
      padding: '1rem 1.5rem 0',
      border: '1px solid #d5c9b0',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
    }}>

      {/* Status bar */}
      <div style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        marginBottom: '0.875rem',
        minWidth: 0,
      }}>
        {hovered ? (
          <>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
              background: hovered.type === 'html' ? '#ecfdf5' : '#eff6ff',
              color: hovered.type === 'html' ? '#059669' : '#2563eb',
              padding: '0.15rem 0.45rem', borderRadius: '4px',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {hovered.type === 'html' ? 'App' : 'Artikel'}
            </span>
            <span style={{
              fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>
              {hovered.title}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65', flexShrink: 0, whiteSpace: 'nowrap' }}>
              👁 {hovered.viewCount.toLocaleString()} · ♥ {hovered.likeCount.toLocaleString()}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '0.8125rem', color: '#9c9690' }}>
            📚 {posts.length} buku · arahkan kursor ke buku
          </span>
        )}
      </div>

      {/* Shelves */}
      {shelves.map((shelf, si) => (
        <div key={si}>
          {/* Row of books, bottom-aligned */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 5,
            minHeight: 220,
            paddingTop: 16,
          }}>
            {shelf.map((post, i) => (
              <Book
                key={post.id}
                post={post}
                idx={si * BOOKS_PER_SHELF + i}
                username={username}
                onHover={() => setHovered(post)}
                onLeave={() => setHovered(null)}
              />
            ))}
          </div>

          {/* Wooden shelf board */}
          <div style={{
            height: 15,
            background: 'linear-gradient(to bottom, #c8944a 0%, #9e6a22 50%, #7c5218 100%)',
            borderRadius: 3,
            position: 'relative',
            boxShadow: '0 6px 16px rgba(0,0,0,0.32), 0 2px 4px rgba(0,0,0,0.18)',
            marginBottom: si < shelves.length - 1 ? '2.5rem' : '1.5rem',
          }}>
            {/* Wood highlight */}
            <div style={{
              position: 'absolute', top: 2, left: 10, right: 10, height: 2,
              background: 'rgba(255,255,255,0.22)', borderRadius: 1,
            }} />
            {/* Wood grain shadow */}
            <div style={{
              position: 'absolute', top: 7, left: 40, right: 60, height: 1,
              background: 'rgba(0,0,0,0.12)', borderRadius: 1,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}
