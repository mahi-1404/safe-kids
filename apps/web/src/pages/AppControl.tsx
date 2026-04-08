import { useEffect, useState } from 'react'
import { Search, Clock, Ban, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { screenTimeApi, appRuleApi } from '../services/api'
import socketService from '../services/socket'

type AppStatus = 'allowed' | 'blocked' | 'limited'

interface AppEntry {
  ruleId?: string
  packageName: string
  name: string
  category: string
  durationMinutes: number
  status: AppStatus
  dailyLimitMinutes?: number
}

const statusColors: Record<AppStatus, { bg: string; color: string; label: string }> = {
  allowed: { bg: '#14532d', color: '#22c55e', label: 'Allowed' },
  blocked: { bg: '#3f1515', color: '#ef4444', label: 'Blocked' },
  limited: { bg: '#451a03', color: '#f59e0b', label: 'Limited' },
}
const fmt = (min: number) => {
  if (min === 0) return '0m'
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

export default function AppControl() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [apps, setApps]             = useState<AppEntry[]>([])
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<'all' | AppStatus>('all')
  const [loading, setLoading]       = useState(true)
  const [sending, setSending]       = useState<string | null>(null)
  const [limitPkg, setLimitPkg]     = useState<string | null>(null)
  const [limitMins, setLimitMins]   = useState('60')

  // Merge today's usage with persisted rules
  const loadData = async () => {
    if (!childId) return
    setLoading(true)
    try {
      const [usageRes, rulesRes] = await Promise.all([
        screenTimeApi.getToday(childId),
        appRuleApi.getAll(childId),
      ])

      const usageApps: any[] = usageRes.data.apps ?? []
      const rules: any[] = rulesRes.data ?? []
      const ruleMap = new Map(rules.map((r: any) => [r.packageName, r]))

      // Start with apps seen today
      const entries: AppEntry[] = usageApps.map(a => {
        const rule = ruleMap.get(a.packageName)
        const status: AppStatus = rule
          ? rule.isBlocked ? 'blocked' : rule.dailyLimitMinutes > 0 ? 'limited' : 'allowed'
          : 'allowed'
        return {
          ruleId: rule?._id,
          packageName: a.packageName,
          name: a.appName,
          category: a.category ?? 'App',
          durationMinutes: a.durationMinutes,
          status,
          dailyLimitMinutes: rule?.dailyLimitMinutes ?? 0,
        }
      })

      // Add blocked/limited apps not seen today (from rules)
      rules.forEach((r: any) => {
        if (!entries.find(e => e.packageName === r.packageName)) {
          const status: AppStatus = r.isBlocked ? 'blocked' : r.dailyLimitMinutes > 0 ? 'limited' : 'allowed'
          entries.push({
            ruleId: r._id,
            packageName: r.packageName,
            name: r.appName,
            category: r.category ?? 'App',
            durationMinutes: 0,
            status,
            dailyLimitMinutes: r.dailyLimitMinutes ?? 0,
          })
        }
      })

      setApps(entries)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadData() }, [childId])

  // Real-time policy push from backend
  useEffect(() => {
    socketService.on('policy:apprules', (data: any) => {
      setApps(prev => prev.map(a =>
        a.packageName === data.packageName
          ? { ...a, status: data.isBlocked ? 'blocked' : data.dailyLimitMinutes > 0 ? 'limited' : 'allowed', dailyLimitMinutes: data.dailyLimitMinutes }
          : a
      ))
    })
    return () => { socketService.off('policy:apprules') }
  }, [])

  const toggle = async (app: AppEntry, newStatus: AppStatus, limitMinutes?: number) => {
    if (!childId) return
    setSending(app.packageName)
    try {
      await appRuleApi.upsert({
        childId,
        packageName: app.packageName,
        appName: app.name,
        category: app.category,
        isBlocked: newStatus === 'blocked',
        dailyLimitMinutes: newStatus === 'limited' ? (limitMinutes ?? 60) : 0,
      })
      setApps(prev => prev.map(a =>
        a.packageName === app.packageName
          ? { ...a, status: newStatus, dailyLimitMinutes: newStatus === 'limited' ? (limitMinutes ?? 60) : 0 }
          : a
      ))
    } catch {}
    setSending(null)
    setLimitPkg(null)
  }

  const removeRule = async (app: AppEntry) => {
    if (!app.ruleId || !childId) return
    setSending(app.packageName)
    try {
      await appRuleApi.delete(app.ruleId)
      setApps(prev => prev.map(a =>
        a.packageName === app.packageName ? { ...a, status: 'allowed', ruleId: undefined } : a
      ))
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
          {activeChild ? `Block or limit ${activeChild.name}'s apps` : 'No child paired'}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {(['allowed', 'blocked', 'limited'] as AppStatus[]).map(key => {
          const icons = { allowed: CheckCircle, blocked: Ban, limited: Clock }
          const labels = { allowed: 'Allowed', blocked: 'Blocked', limited: 'Time Limited' }
          const Icon = icons[key]
          return (
            <div key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
              style={{
                background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                border: `1px solid ${filter === key ? statusColors[key].color + '66' : '#334155'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: statusColors[key].bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={statusColors[key].color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{counts[key]}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{labels[key]}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box',
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {/* Daily limit input */}
      {limitPkg && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #f59e0b44' }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
            Daily limit for <strong style={{ color: '#f1f5f9' }}>{apps.find(a => a.packageName === limitPkg)?.name}</strong>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="number" min="1" max="480" value={limitMins}
              onChange={e => setLimitMins(e.target.value)}
              style={{
                width: 80, padding: '8px 12px', borderRadius: 8,
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', fontSize: 14, outline: 'none',
              }}
            />
            <span style={{ color: '#94a3b8', fontSize: 13 }}>minutes/day</span>
            <button onClick={() => {
              const app = apps.find(a => a.packageName === limitPkg)!
              toggle(app, 'limited', parseInt(limitMins))
            }} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#f59e0b', color: 'black', fontWeight: 600, fontSize: 13,
            }}>Set Limit</button>
            <button onClick={() => setLimitPkg(null)} style={{
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: 13,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* App list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Loading apps...</div>
      ) : (
        <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
              {apps.length === 0 ? 'No app usage recorded yet' : 'No apps match your search'}
            </div>
          ) : filtered.map((app, i) => (
            <div key={app.packageName} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #0f172a' : 'none',
              background: i % 2 === 0 ? '#1e293b' : '#1a2540',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#3b82f6', flexShrink: 0,
              }}>{app.name[0]}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {app.category} · {fmt(app.durationMinutes)} today
                  {app.status === 'limited' && app.dailyLimitMinutes ? ` · limit: ${fmt(app.dailyLimitMinutes)}` : ''}
                </div>
              </div>

              <div style={{
                background: statusColors[app.status].bg, borderRadius: 6,
                padding: '3px 10px', fontSize: 12, color: statusColors[app.status].color,
                fontWeight: 500, flexShrink: 0,
              }}>
                {statusColors[app.status].label}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggle(app, 'allowed')} disabled={!!sending}
                  style={{
                    padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: app.status === 'allowed' ? '#14532d' : '#0f172a',
                    color: app.status === 'allowed' ? '#22c55e' : '#64748b',
                    border: `1px solid ${app.status === 'allowed' ? '#22c55e44' : '#334155'}`,
                    opacity: sending === app.packageName ? 0.6 : 1,
                  }}>Allow</button>
                <button onClick={() => toggle(app, 'blocked')} disabled={!!sending}
                  style={{
                    padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: app.status === 'blocked' ? '#3f1515' : '#0f172a',
                    color: app.status === 'blocked' ? '#ef4444' : '#64748b',
                    border: `1px solid ${app.status === 'blocked' ? '#ef444444' : '#334155'}`,
                    opacity: sending === app.packageName ? 0.6 : 1,
                  }}>Block</button>
                <button onClick={() => { setLimitPkg(app.packageName); setLimitMins(String(app.dailyLimitMinutes || 60)) }}
                  disabled={!!sending}
                  style={{
                    padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: app.status === 'limited' ? '#451a03' : '#0f172a',
                    color: app.status === 'limited' ? '#f59e0b' : '#64748b',
                    border: `1px solid ${app.status === 'limited' ? '#f59e0b44' : '#334155'}`,
                  }}>
                  <Plus size={10} style={{ marginRight: 3 }} />Limit</button>
                {app.ruleId && (
                  <button onClick={() => removeRule(app)} disabled={!!sending} title="Remove rule"
                    style={{
                      padding: '6px 8px', borderRadius: 7, cursor: 'pointer',
                      background: '#0f172a', border: '1px solid #334155',
                      opacity: sending === app.packageName ? 0.6 : 1,
                    }}>
                    <Trash2 size={12} color="#64748b" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
