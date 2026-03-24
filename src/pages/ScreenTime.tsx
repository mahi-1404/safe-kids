import { Clock, Plus } from 'lucide-react'

const apps = [
  { name: 'YouTube', time: '1h 20m', pct: 70, color: '#ef4444', blocked: false },
  { name: 'WhatsApp', time: '45m', pct: 37, color: '#22c55e', blocked: false },
  { name: 'Chrome', time: '30m', pct: 25, color: '#3b82f6', blocked: false },
  { name: 'PUBG Mobile', time: '25m', pct: 20, color: '#f59e0b', blocked: true },
  { name: 'Instagram', time: '0m', pct: 0, color: '#8b5cf6', blocked: true },
]

export default function ScreenTime() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Screen Time</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Manage daily limits for Aryan</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Daily limit */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Clock size={18} color="#3b82f6" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Daily Screen Time</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 4 }}>2h 40m</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>of 4h limit used</div>
          <div style={{ height: 10, background: '#334155', borderRadius: 5, marginBottom: 8 }}>
            <div style={{ height: '100%', width: '66%', background: '#3b82f6', borderRadius: 5 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
            <span>1h 20m remaining</span>
            <span>Limit: 4h</span>
          </div>
        </div>

        {/* Bedtime */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Bedtime Schedule</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {['Bedtime', 'Wake up'].map((label, i) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
                <div style={{
                  background: '#0f172a', borderRadius: 8, padding: '10px 14px',
                  fontSize: 20, fontWeight: 700, color: i === 0 ? '#8b5cf6' : '#22c55e'
                }}>{i === 0 ? '9:00 PM' : '7:00 AM'}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: '#8b5cf622', borderRadius: 8, padding: '8px 12px',
            fontSize: 12, color: '#8b5cf6'
          }}>
            Device locks automatically at bedtime
          </div>
        </div>
      </div>

      {/* App usage */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>App Usage & Controls</span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: '#3b82f6', border: 'none', borderRadius: 8,
            color: 'white', fontSize: 13, cursor: 'pointer'
          }}>
            <Plus size={14} /> Add Block
          </button>
        </div>
        {apps.map((app, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '12px 0', borderBottom: i < apps.length - 1 ? '1px solid #334155' : 'none'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: app.color + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: app.color, flexShrink: 0
            }}>{app.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{app.name}</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{app.time}</span>
              </div>
              <div style={{ height: 4, background: '#334155', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${app.pct}%`, background: app.color, borderRadius: 2 }} />
              </div>
            </div>
            <span style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 20,
              background: app.blocked ? '#ef444422' : '#22c55e22',
              color: app.blocked ? '#ef4444' : '#22c55e',
              fontWeight: 600, flexShrink: 0
            }}>{app.blocked ? 'Blocked' : 'Allowed'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
