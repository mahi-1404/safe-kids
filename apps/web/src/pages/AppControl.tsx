import { useState } from 'react'
import { Search, Shield, Clock, Ban, CheckCircle, ChevronDown } from 'lucide-react'

type AppStatus = 'allowed' | 'blocked' | 'limited'

interface App {
  name: string
  category: string
  usage: string
  status: AppStatus
  icon: string
  timeLimit?: string
}

const initialApps: App[] = [
  { name: 'YouTube', category: 'Entertainment', usage: '1h 20m today', status: 'limited', icon: '▶️', timeLimit: '1h 30m' },
  { name: 'WhatsApp', category: 'Social', usage: '45m today', status: 'allowed', icon: '💬' },
  { name: 'PUBG Mobile', category: 'Gaming', usage: '0m today', status: 'blocked', icon: '🎮' },
  { name: 'Instagram', category: 'Social', usage: '0m today', status: 'blocked', icon: '📸' },
  { name: 'Chrome', category: 'Browser', usage: '30m today', status: 'allowed', icon: '🌐' },
  { name: 'Netflix', category: 'Entertainment', usage: '0m today', status: 'blocked', icon: '🎬' },
  { name: 'Spotify', category: 'Music', usage: '22m today', status: 'allowed', icon: '🎵' },
  { name: 'TikTok', category: 'Social', usage: '0m today', status: 'blocked', icon: '🎵' },
  { name: 'Snapchat', category: 'Social', usage: '0m today', status: 'blocked', icon: '👻' },
  { name: 'Khan Academy', category: 'Education', usage: '40m today', status: 'allowed', icon: '📚' },
  { name: 'Calculator', category: 'Utility', usage: '5m today', status: 'allowed', icon: '🧮' },
  { name: 'Camera', category: 'Utility', usage: '10m today', status: 'allowed', icon: '📷' },
]

const categories = ['All', 'Social', 'Entertainment', 'Gaming', 'Browser', 'Education', 'Music', 'Utility']

const statusColors: Record<AppStatus, { bg: string; color: string; label: string }> = {
  allowed:  { bg: '#14532d', color: '#22c55e', label: 'Allowed' },
  blocked:  { bg: '#3f1515', color: '#ef4444', label: 'Blocked' },
  limited:  { bg: '#451a03', color: '#f59e0b', label: 'Limited' },
}

export default function AppControl() {
  const [apps, setApps] = useState<App[]>(initialApps)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [filter, setFilter] = useState<'all' | AppStatus>('all')

  const toggle = (name: string, newStatus: AppStatus) => {
    setApps(prev => prev.map(a => a.name === name ? { ...a, status: newStatus } : a))
  }

  const filtered = apps.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || a.category === category
    const matchFilter = filter === 'all' || a.status === filter
    return matchSearch && matchCat && matchFilter
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
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Block, allow, or set time limits on Aryan's apps</p>
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

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search apps..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              background: category === cat ? '#3b82f6' : '#1e293b',
              color: category === cat ? 'white' : '#94a3b8',
              border: category === cat ? 'none' : '1px solid #334155',
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* App list */}
      <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
        {filtered.map((app, i) => (
          <div key={app.name} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
            borderBottom: i < filtered.length - 1 ? '1px solid #1e293b' : 'none',
            background: i % 2 === 0 ? '#1e293b' : '#1a2540'
          }}>
            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
            }}>{app.icon}</div>

            {/* Name + category */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{app.category} · {app.usage}</div>
            </div>

            {/* Time limit badge */}
            {app.status === 'limited' && app.timeLimit && (
              <div style={{
                background: '#451a03', borderRadius: 6, padding: '3px 10px',
                fontSize: 12, color: '#f59e0b', fontWeight: 500, flexShrink: 0
              }}>
                Limit: {app.timeLimit}
              </div>
            )}

            {/* Status badge */}
            <div style={{
              background: statusColors[app.status].bg, borderRadius: 6,
              padding: '3px 10px', fontSize: 12,
              color: statusColors[app.status].color, fontWeight: 500, flexShrink: 0
            }}>
              {statusColors[app.status].label}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => toggle(app.name, 'allowed')} style={{
                padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: app.status === 'allowed' ? '#14532d' : '#0f172a',
                color: app.status === 'allowed' ? '#22c55e' : '#64748b',
                border: `1px solid ${app.status === 'allowed' ? '#22c55e44' : '#334155'}`
              }}>Allow</button>
              <button onClick={() => toggle(app.name, 'limited')} style={{
                padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: app.status === 'limited' ? '#451a03' : '#0f172a',
                color: app.status === 'limited' ? '#f59e0b' : '#64748b',
                border: `1px solid ${app.status === 'limited' ? '#f59e0b44' : '#334155'}`
              }}>Limit</button>
              <button onClick={() => toggle(app.name, 'blocked')} style={{
                padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: app.status === 'blocked' ? '#3f1515' : '#0f172a',
                color: app.status === 'blocked' ? '#ef4444' : '#64748b',
                border: `1px solid ${app.status === 'blocked' ? '#ef444444' : '#334155'}`
              }}>Block</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
            No apps found matching your filters
          </div>
        )}
      </div>
    </div>
  )
}
