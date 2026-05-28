'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'

interface User {
  id: string
  username: string
  name: string | null
  email: string
  role: string
  banned: boolean
  createdAt: string
  _count: { posts: number; followers: number; purchases: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'admin' | 'banned'>('all')
  const [page, setPage] = useState(1)
  const [acting, setActing] = useState<string | null>(null)
  const PER_PAGE = 20

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE), search, filter })
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search, filter])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { setPage(1) }, [search, filter])

  const action = async (userId: string, type: 'ban' | 'unban' | 'promote' | 'demote') => {
    setActing(userId)
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: type }),
    })
    setActing(null)
    fetch_()
  }

  const pages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a' }}>Users</h1>
        <p style={{ color: '#6e6a65', marginTop: '0.25rem', fontSize: '0.875rem' }}>{total} total users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari username atau email..."
          style={{ flex: '1', minWidth: '200px', background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.875rem', color: '#1a1a1a', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['all', 'admin', 'banned'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', border: `1px solid ${filter === f ? '#1a1a1a' : '#e5e0d8'}`, background: filter === f ? '#1a1a1a' : '#ffffff', color: filter === f ? '#f7f5f2' : '#6e6a65' }}>
              {f === 'all' ? 'Semua' : f === 'admin' ? 'Admin' : 'Banned'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e0d8', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto auto auto auto', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #e5e0d8', fontSize: '0.75rem', color: '#9c9690', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>User</span><span>Email</span><span>Posts</span><span>Followers</span><span>Status</span><span>Aksi</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6e6a65' }}>Loading...</div>
        ) : users.map((u, i) => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto auto auto auto', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < users.length - 1 ? '1px solid #f0ede8' : 'none', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }}>@{u.username}</div>
              <div style={{ fontSize: '0.75rem', color: '#9c9690' }}>{formatDate(u.createdAt)}</div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6e6a65', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65', textAlign: 'center' }}>{u._count.posts}</span>
            <span style={{ fontSize: '0.8125rem', color: '#6e6a65', textAlign: 'center' }}>{u._count.followers}</span>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {u.role === 'admin' && <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '3px', fontWeight: 600, whiteSpace: 'nowrap' }}>ADMIN</span>}
              {u.banned && <span style={{ fontSize: '0.65rem', background: '#fef2f2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '3px', fontWeight: 600 }}>BANNED</span>}
              {!u.role || u.role === 'user' && !u.banned ? <span style={{ fontSize: '0.65rem', color: '#9c9690' }}>User</span> : null}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {u.banned ? (
                <button onClick={() => action(u.id, 'unban')} disabled={acting === u.id}
                  style={{ fontSize: '0.75rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  Unban
                </button>
              ) : (
                <button onClick={() => action(u.id, 'ban')} disabled={acting === u.id}
                  style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  Ban
                </button>
              )}
              {u.role !== 'admin' ? (
                <button onClick={() => action(u.id, 'promote')} disabled={acting === u.id}
                  style={{ fontSize: '0.75rem', color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  → Admin
                </button>
              ) : (
                <button onClick={() => action(u.id, 'demote')} disabled={acting === u.id}
                  style={{ fontSize: '0.75rem', color: '#6e6a65', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  → User
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: '36px', height: '36px', borderRadius: '6px', border: `1px solid ${page === p ? '#1a1a1a' : '#e5e0d8'}`, background: page === p ? '#1a1a1a' : '#ffffff', color: page === p ? '#f7f5f2' : '#6e6a65', fontSize: '0.875rem', cursor: 'pointer', fontWeight: page === p ? 600 : 400 }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
