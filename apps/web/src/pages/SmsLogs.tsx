import { useEffect, useState } from 'react'
import { MessageSquare, AlertTriangle, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { smslogApi } from '../services/api'

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(d).toLocaleDateString()
}

const LIMIT = 30

export default function SmsLogs() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [logs, setLogs]         = useState<any[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [search, setSearch]     = useState('')

  const pages = Math.max(1, Math.ceil(total / LIMIT))

  const load = (p: number, flagged: boolean) => {
    if (!childId) return
    setLoading(true)
    smslogApi.getAll(childId, { page: p, limit: LIMIT, flaggedOnly: flagged || undefined })
      .then(r => {
        setLogs(r.data.logs ?? [])
        setTotal(r.data.total ?? 0)
      }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    setPage(1)
    load(1, flaggedOnly)
  }, [childId, flaggedOnly])

  const displayed = search
    ? logs.filter(l => l.phoneNumber.includes(search) || (l.contactName ?? '').toLowerCase().includes(search.toLowerCase()) || l.body.toLowerCase().includes(search.toLowerCase()))
    : logs

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>SMS Logs</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            {activeChild ? `${activeChild.name}'s text messages` : 'No child paired'}
            {total > 0 && <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12 }}>{total} total</span>}
          </p>
        </div>
        <button onClick={() => setFlaggedOnly(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, border: '1px solid #334155',
          background: flaggedOnly ? '#ef444422' : '#1e293b',
          color: flaggedOnly ? '#ef4444' : '#94a3b8',
          fontSize: 13, cursor: 'pointer',
        }}>
          <Filter size={14} />
          {flaggedOnly ? 'Flagged only' : 'All messages'}
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by contact, number or message..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box',
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Loading SMS logs...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
          <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>{flaggedOnly ? 'No flagged messages' : 'No SMS logs yet'}</div>
        </div>
      ) : (
        <>
          <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
            {displayed.map((log, i) => (
              <div key={log._id} style={{
                padding: '14px 20px',
                borderBottom: i < displayed.length - 1 ? '1px solid #0f172a' : 'none',
                background: log.isFlagged ? '#ef444408' : i % 2 === 0 ? '#1e293b' : '#1a2540',
                borderLeft: log.isFlagged ? '3px solid #ef4444' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Direction badge */}
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: log.direction === 'incoming' ? '#3b82f622' : '#22c55e22',
                      color: log.direction === 'incoming' ? '#3b82f6' : '#22c55e',
                    }}>
                      {log.direction === 'incoming' ? '↓ Received' : '↑ Sent'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {log.contactName || log.phoneNumber}
                    </span>
                    {log.contactName && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>{log.phoneNumber}</span>
                    )}
                    {log.isFlagged && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#ef4444' }}>
                        <AlertTriangle size={12} /> Flagged
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>{timeAgo(log.timestamp)}</span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{log.body}</div>
                {log.isFlagged && log.flagReason && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>⚠ {log.flagReason}</div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <button onClick={() => { const p = page - 1; setPage(p); load(p, flaggedOnly) }}
                disabled={page === 1}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: page === 1 ? '#475569' : '#94a3b8', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Page {page} of {pages}</span>
              <button onClick={() => { const p = page + 1; setPage(p); load(p, flaggedOnly) }}
                disabled={page === pages}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: page === pages ? '#475569' : '#94a3b8', cursor: page === pages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
