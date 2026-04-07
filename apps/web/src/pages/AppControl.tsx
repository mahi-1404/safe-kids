import { useEffect, useState } from 'react'
import { Search, Clock, Ban, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { screenTimeApi, commandApi } from '../services/api'

type AppStatus = 'allowed' | 'blocked' | 'limited'

interface AppEntry {
  packageName: string
  name: string
  category: string
  durationMinutes: number
  status: AppStatus
}

const statusColors: Record<AppStatus, { bg: string; color: string; label: string }> = {
  allowed: { bg: '#14532d', color: '#22c55e', label: 'Allowed' },
  blocked: { bg: '#3f1515', color: '#ef4444', label: 'Blocked' },
  limited: { bg: '#451a03', color: '#f59e0b', label: 'Limited' },
}

const BLOCKED_KEY = 'sk_blocked_apps'
const loadBlocked = (): Record<string, AppStatus> => {
  try { return JSON.parse(localStorage.getItem(BLOCKED_KEY) ?? '{}') } catch { return {} }
}
const saveBlocked = (m: Record<string, AppStatus>) => localStorage.setItem(BLOCKED_KEY, JSON.stringify(m))

const fmt = (min: number) => {
  if (min === 0) return '0m'
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

export default function AppControl() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [apps, setApps] = useState<AppEntry[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | AppStatus>('all')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    const blocked = loadBlocked()
    screenTimeApi.getToday(childId).then(r => {
      const raw: any[] = r.data.apps ?? []
      const entries: AppEntry[] = raw.map(a => ({
        packageName: a.packageName,
        name: a.appName,
        category: a.category ?? 'App',
        durationMinutes: a.durationMinutes,
        status: blocked[a.packageName] ?? 'allowed',
      }))
      setApps(entries)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [childId])

  const toggle = async (pkg: string, newStatus: AppStatus) => {
    if (!childId) return
    setSending(pkg)
    const cmdType = newStatus === 'blocked' ? 'block_app' : 'unblock_app'
    try {
      await commandApi.send(childId, cmdType, { packageName: pkg })
      setApps(prev => prev.map(a => a.packageName === pkg ? { ...a, status: newStatus } : a))
      const blocked = loadBlocked()
      if (newStatus === 'allowed') { delete blocked[pkg] } else { blocked[pkg] = newStatus }
      saveBlocked(blocked)
    } catch {}
    setSending(null)
  }

  const filtered = apps.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || a.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    allowed: apps.filter(a => a.status === 'allowed').length,
    blocked: apps.filter(a => a.status === 'blocked').length,
    limited: apps.filter(a => a.status === 'limited').length,
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>App Control</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          {activeChild ? `Block or allow ${activeChild.name}'s apps` : 'No child paired'}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {([
          ['allowed', CheckCircle, 'Allowed'],
          ['blocked', Ban, 'Blocked'],
          ['limited', Clock, 'Time Limited'],
        ] as const).map(([key, Icon, label]) => (
          <div key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
            style={{
              background: '#1e293b', borderRadius: 12, padding: '16px 20px',
              border: `1px solid ${filter === key ? statusColors[key].color + '66' : '#334155'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: statusColors[key].bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={20} color={statusColors[key].color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{counts[key]}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search apps..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box',
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none'
          }}
        />
      </div>

      {/* App list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Loading app usage data...</div>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
              {apps.length === 0 ? 'No app usage recorded today' : 'No apps match your search'}
            </div>
          ) : filtered.map((app, i) => (
            <div key={app.packageName} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #0f172a' : 'none',
              background: i % 2 === 0 ? '#1e293b' : '#1a2540'
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#3b82f6', flexShrink: 0
              }}>{app.name[0]}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{app.category} · {fmt(app.durationMinutes)} today</div>
              </div>

              <div style={{
                background: statusColors[app.status].bg, borderRadius: 6,
                padding: '3px 10px', fontSize: 12,
                color: statusColors[app.status].color, fontWeight: 500, flexShrink: 0
              }}>
                {statusColors[app.status].label}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => toggle(app.packageName, 'allowed')}
                  disabled={sending === app.packageName}
                  style={{
                    padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: app.status === 'allowed' ? '#14532d' : '#0f172a',
                    color: app.status === 'allowed' ? '#22c55e' : '#64748b',
                    border: `1px solid ${app.status === 'allowed' ? '#22c55e44' : '#334155'}`,
                    opacity: sending === app.packageName ? 0.6 : 1
                  }}>Allow</button>
                <button
                  onClick={() => toggle(app.packageName, 'blocked')}
                  disabled={sending === app.packageName}
                  style={{
                    padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: app.status === 'blocked' ? '#3f1515' : '#0f172a',
                    color: app.status === 'blocked' ? '#ef4444' : '#64748b',
                    border: `1px solid ${app.status === 'blocked' ? '#ef444444' : '#334155'}`,
                    opacity: sending === app.packageName ? 0.6 : 1
                  }}>Block</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
