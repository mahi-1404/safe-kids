import { useEffect, useState } from 'react'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { calllogApi } from '../services/api'

const fmtDuration = (secs: number) => {
  if (secs === 0) return 'Missed'
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(d).toLocaleDateString()
}

const dirIcon: Record<string, any> = {
  incoming: PhoneIncoming,
  outgoing: PhoneOutgoing,
  missed:   PhoneMissed,
}
const dirColor: Record<string, string> = {
  incoming: '#3b82f6',
  outgoing: '#22c55e',
  missed:   '#ef4444',
}

const LIMIT = 30

export default function CallLogs() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [calls, setCalls]       = useState<any[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState<any>(null)
  const [dirFilter, setDirFilter] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all')
  const [search, setSearch]     = useState('')

  const pages = Math.max(1, Math.ceil(total / LIMIT))

  const load = (p: number, dir: typeof dirFilter) => {
    if (!childId) return
    setLoading(true)
    calllogApi.getAll(childId, {
      page: p, limit: LIMIT,
      direction: dir === 'all' ? undefined : dir,
    }).then(r => {
      setCalls(r.data.calls ?? [])
      setTotal(r.data.total ?? 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!childId) return
    setPage(1)
    load(1, dirFilter)
    calllogApi.getStats(childId, 7).then(r => setStats(r.data)).catch(() => {})
  }, [childId, dirFilter])

  const displayed = search
    ? calls.filter(c => c.phoneNumber.includes(search) || (c.contactName ?? '').toLowerCase().includes(search.toLowerCase()))
    : calls

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Call Logs</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          {activeChild ? `${activeChild.name}'s call history` : 'No child paired'}
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total (7d)', value: String(stats.total), color: '#94a3b8' },
            { label: 'Incoming',   value: String(stats.incoming), color: '#3b82f6' },
            { label: 'Outgoing',   value: String(stats.outgoing), color: '#22c55e' },
            { label: 'Unknown',    value: String(stats.unknownContacts), color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: '14px 18px', border: '1px solid #334155' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'incoming', 'outgoing', 'missed'] as const).map(f => (
          <button key={f} onClick={() => setDirFilter(f)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: dirFilter === f ? (f === 'all' ? '#3b82f6' : dirColor[f] ?? '#3b82f6') : '#1e293b',
            color: dirFilter === f ? 'white' : '#94a3b8',
            fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by contact or number..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box',
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Loading call logs...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
          <Phone size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>No call logs found</div>
        </div>
      ) : (
        <>
          <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
            {displayed.map((call, i) => {
              const Icon = dirIcon[call.direction] ?? Phone
              const color = dirColor[call.direction] ?? '#94a3b8'
              return (
                <div key={call._id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                  borderBottom: i < displayed.length - 1 ? '1px solid #0f172a' : 'none',
                  background: i % 2 === 0 ? '#1e293b' : '#1a2540',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={20} color={color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {call.contactName || call.phoneNumber}
                      {!call.contactName && (
                        <span style={{ fontSize: 11, color: '#ef4444', marginLeft: 8 }}>Unknown</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {call.contactName && <span>{call.phoneNumber} · </span>}
                      {timeAgo(call.timestamp)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: call.direction === 'missed' ? '#ef4444' : '#f1f5f9' }}>
                      {fmtDuration(call.durationSeconds)}
                    </div>
                    <div style={{ fontSize: 11, color, textTransform: 'capitalize', marginTop: 2 }}>
                      {call.direction}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <button onClick={() => { const p = page - 1; setPage(p); load(p, dirFilter) }}
                disabled={page === 1}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: page === 1 ? '#475569' : '#94a3b8', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                ‹
              </button>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Page {page} of {pages}</span>
              <button onClick={() => { const p = page + 1; setPage(p); load(p, dirFilter) }}
                disabled={page === pages}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: page === pages ? '#475569' : '#94a3b8', cursor: page === pages ? 'not-allowed' : 'pointer' }}>
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
