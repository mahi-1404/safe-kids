import { useEffect, useState } from 'react'
import { AlertTriangle, MapPin, Globe, UserPlus, Battery, Bell, ShieldAlert, Check, CheckCheck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { alertApi } from '../services/api'
import socketService from '../services/socket'

const typeIcon: Record<string, any> = {
  geofence_breach:  MapPin,
  blocked_content:  Globe,
  unknown_contact:  UserPlus,
  low_battery:      Battery,
  suspicious_app:   ShieldAlert,
  distress_keyword: AlertTriangle,
  grooming:         AlertTriangle,
  cyberbullying:    AlertTriangle,
  sos:              AlertTriangle,
}
const severityColor: Record<string, string> = {
  critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#3b82f6',
}
const timeAgo = (d: string | Date) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

type Severity = 'all' | 'critical' | 'high' | 'medium' | 'low'
const LIMIT = 20

export default function Alerts() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [alerts, setAlerts]     = useState<any[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Severity>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const pages = Math.max(1, Math.ceil(total / LIMIT))

  const load = (p: number, sev: Severity) => {
    setLoading(true)
    alertApi.getAll({
      childId,
      severity: sev === 'all' ? undefined : sev,
      page: p,
      limit: LIMIT,
    }).then(r => {
      setAlerts(r.data.alerts ?? [])
      setTotal(r.data.total ?? 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    setPage(1)
    load(1, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, filter])

  useEffect(() => {
    socketService.on('alert:new', (alert: any) => {
      setAlerts(prev => [alert, ...prev])
      setTotal(t => t + 1)
    })
    return () => { socketService.off('alert:new') }
  }, [])

  const markRead = (id: string) => {
    alertApi.markRead(id).then(() => {
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a))
    }).catch(() => {})
  }

  const markAllRead = () => {
    alertApi.markAllRead(childId).then(() => {
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
    }).catch(() => {})
  }

  const deleteAlert = (id: string) => {
    setDeleting(id)
    alertApi.delete(id).then(() => {
      setAlerts(prev => prev.filter(a => a._id !== id))
      setTotal(t => Math.max(0, t - 1))
    }).catch(() => {}).finally(() => setDeleting(null))
  }

  const unread = alerts.filter(a => !a.isRead).length

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Alerts</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            {activeChild ? `All safety alerts for ${activeChild.name}` : 'No child paired'}
            {unread > 0 && (
              <span style={{ marginLeft: 8, background: '#ef444422', color: '#ef4444', fontSize: 12, padding: '2px 8px', borderRadius: 20 }}>
                {unread} unread
              </span>
            )}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, border: '1px solid #334155',
            background: '#1e293b', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
          }}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Severity filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'critical', 'high', 'medium', 'low'] as Severity[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === f ? (f === 'all' ? '#3b82f6' : (severityColor[f] ?? '#3b82f6')) : '#1e293b',
            color: filter === f ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 500,
            textTransform: 'capitalize',
            opacity: filter === f ? 1 : 0.8,
          }}>
            {f === 'all' ? `All (${total})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
          <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>No alerts found</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a: any) => {
              const color = severityColor[a.severity] ?? '#64748b'
              const Icon = typeIcon[a.type] ?? AlertTriangle
              return (
                <div key={a._id} style={{
                  background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                  border: `1px solid ${a.isRead ? '#334155' : color + '44'}`,
                  display: 'flex', alignItems: 'center', gap: 16,
                  opacity: a.isRead ? 0.7 : 1,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: color + '22',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{a.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{a.message}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20,
                      background: color + '22', color, fontWeight: 600,
                      display: 'block', marginBottom: 6, textTransform: 'capitalize',
                    }}>{a.severity}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{timeAgo(a.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!a.isRead && (
                      <button onClick={() => markRead(a._id)} title="Mark as read" style={{
                        background: '#22c55e22', border: 'none', borderRadius: 6,
                        padding: '6px', cursor: 'pointer',
                      }}>
                        <Check size={14} color="#22c55e" />
                      </button>
                    )}
                    <button onClick={() => deleteAlert(a._id)} title="Delete"
                      disabled={deleting === a._id}
                      style={{
                        background: '#ef444422', border: 'none', borderRadius: 6,
                        padding: '6px', cursor: 'pointer', opacity: deleting === a._id ? 0.5 : 1,
                      }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <button onClick={() => { const p = page - 1; setPage(p); load(p, filter); }}
                disabled={page === 1}
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid #334155',
                  background: '#1e293b', color: page === 1 ? '#475569' : '#94a3b8',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Page {page} of {pages}</span>
              <button onClick={() => { const p = page + 1; setPage(p); load(p, filter); }}
                disabled={page === pages}
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid #334155',
                  background: '#1e293b', color: page === pages ? '#475569' : '#94a3b8',
                  cursor: page === pages ? 'not-allowed' : 'pointer',
                }}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
