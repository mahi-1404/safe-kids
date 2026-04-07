import { AlertTriangle, MapPin, Globe, UserPlus, Battery } from 'lucide-react'

const alerts = [
  { icon: MapPin, type: 'Geofence Breach', msg: 'Aryan left the school zone at 3:45 PM', time: '2h ago', severity: 'high', color: '#ef4444' },
  { icon: Globe, type: 'Blocked Site Attempt', msg: 'Tried to access blocked website: gaming-site.com', time: '4h ago', severity: 'medium', color: '#f59e0b' },
  { icon: UserPlus, type: 'Unknown Contact', msg: 'New unknown contact added: +91 98765 43210', time: '6h ago', severity: 'medium', color: '#f59e0b' },
  { icon: Battery, type: 'Low Battery', msg: 'Device battery at 15%', time: '8h ago', severity: 'low', color: '#3b82f6' },
  { icon: Globe, type: 'Blocked Site Attempt', msg: 'Tried to access: adult-content.com', time: 'Yesterday', severity: 'high', color: '#ef4444' },
]

export default function Alerts() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Alerts</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>All safety alerts for Aryan</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['All', 'High', 'Medium', 'Low'].map((f, i) => (
          <button key={f} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: i === 0 ? '#3b82f6' : '#1e293b',
            color: i === 0 ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 500
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            background: '#1e293b', borderRadius: 12, padding: '16px 20px',
            border: `1px solid ${a.color}44`,
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: a.color + '22', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <a.icon size={20} color={a.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{a.type}</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{a.msg}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                background: a.color + '22', color: a.color, fontWeight: 600,
                display: 'block', marginBottom: 6, textTransform: 'capitalize'
              }}>{a.severity}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
