import { useEffect, useState } from 'react'
import { AlertTriangle, MapPin, Globe, UserPlus, Battery, Bell, ShieldAlert, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { alertApi } from '../services/api'
import socketService from '../services/socket'

const typeIcon: Record<string, any> = {
  geofence_breach: MapPin,
  blocked_content: Globe,
  unknown_contact: UserPlus,
  low_battery: Battery,
  suspicious_app: ShieldAlert,
}
const severityColor: Record<string, string> = {
  critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', info: '#8b5cf6'
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

export default function Alerts() {
  const { activeChild } = useAuth()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Severity>('all')

  useEffect(() => {
    setLoading(true)
    alertApi.getAll().then(r => {
      setAlerts(r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [activeChild?._id])

  useEffect(() => {
    socketService.on('alert:new', (alert: any) => {
      setAlerts(prev => [alert, ...prev])
    })
    return () => { socketService.off('alert:new') }
  }, [])

  const markRead = (id: string) => {
    alertApi.markRead(id).then(() => {
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a))
    }).catch(() => {})
  }

  const displayed = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)
  const unread = alerts.filter(a => !a.isRead).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Alerts</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          {activeChild ? `All safety alerts for ${activeChild.name}` : 'No child paired'}
          {unread > 0 && <span style={{ marginLeft: 8, background: '#ef444422', color: '#ef4444', fontSize: 12, padding: '2px 8px', borderRadius: 20 }}>{unread} unread</span>}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {(['all', 'high', 'medium', 'low'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f === 'all' ? 'all' : f)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === f ? '#3b82f6' : '#1e293b',
            color: filter === f ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 500,
            textTransform: 'capitalize'
          }}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Loading alerts...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
          <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>No alerts found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map((a: any) => {
            const color = severityColor[a.severity] ?? '#64748b'
            const Icon = typeIcon[a.type] ?? AlertTriangle
            return (
              <div key={a._id} style={{
                background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                border: `1px solid ${a.isRead ? '#334155' : color + '44'}`,
                display: 'flex', alignItems: 'center', gap: 16,
                opacity: a.isRead ? 0.7 : 1
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: color + '22', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                    display: 'block', marginBottom: 6, textTransform: 'capitalize'
                  }}>{a.severity}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{timeAgo(a.createdAt)}</span>
                </div>
                {!a.isRead && (
                  <button onClick={() => markRead(a._id)} title="Mark as read" style={{
                    background: '#22c55e22', border: 'none', borderRadius: 6,
                    padding: '6px', cursor: 'pointer', flexShrink: 0
                  }}>
                    <Check size={14} color="#22c55e" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
