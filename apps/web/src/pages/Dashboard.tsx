import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MapPin, Clock, Shield, Battery, AlertTriangle, Lock, MessageSquare, Phone, Wifi } from 'lucide-react'

const screenData = [
  { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 }, { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 3.5 }, { day: 'Sat', hours: 5.2 },
  { day: 'Sun', hours: 2.9 },
]

const alerts = [
  { type: 'Geofence breach', time: '2h ago', color: '#ef4444', severity: 'High' },
  { type: 'Blocked site attempt', time: '4h ago', color: '#f59e0b', severity: 'Medium' },
  { type: 'Unknown contact added', time: '6h ago', color: '#f59e0b', severity: 'Medium' },
]

const apps = [
  { name: 'YouTube', time: '1h 20m', color: '#ef4444', pct: 70 },
  { name: 'WhatsApp', time: '45m', color: '#22c55e', pct: 37 },
  { name: 'Chrome', time: '30m', color: '#3b82f6', pct: 25 },
  { name: 'PUBG', time: '25m', color: '#f59e0b', pct: 20 },
]

const Card = ({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) => (
  <div style={{
    background: '#1e293b', borderRadius: 14, padding: 24,
    border: '1px solid #334155', ...style
  }}>{children}</div>
)

export default function Dashboard() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Good morning, Mahi 👋</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Here's Aryan's activity overview for today</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Risk Score', value: '23', sub: 'Low Risk', icon: Shield, color: '#22c55e', bg: '#14532d' },
          { label: 'Screen Time', value: '2h 40m', sub: 'Limit: 4h', icon: Clock, color: '#3b82f6', bg: '#1e3a5f' },
          { label: 'Location', value: 'Home', sub: 'Safe zone ✓', icon: MapPin, color: '#8b5cf6', bg: '#3b0764' },
          { label: 'Battery', value: '68%', sub: 'Charging', icon: Battery, color: '#f59e0b', bg: '#451a03' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 12, color }}>{sub}</div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 10, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts + Alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 24 }}>
        {/* Screen time chart */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Screen Time This Week</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={screenData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent alerts */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15, display: 'flex', justifyContent: 'space-between' }}>
            Recent Alerts
            <span style={{ fontSize: 12, color: '#3b82f6', cursor: 'pointer' }}>View all</span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0', borderBottom: i < alerts.length - 1 ? '1px solid #334155' : 'none'
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{a.type}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{a.time}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: a.color + '22', color: a.color, fontWeight: 600
              }}>{a.severity}</span>
            </div>
          ))}
          <div style={{
            marginTop: 16, padding: '10px 16px', background: '#ef444422',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8
          }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>3 unread alerts today</span>
          </div>
        </Card>
      </div>

      {/* App usage + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        {/* App usage */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>App Usage Today</div>
          {apps.map((app, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{app.time}</span>
              </div>
              <div style={{ height: 6, background: '#334155', borderRadius: 3 }}>
                <div style={{
                  height: '100%', width: `${app.pct}%`,
                  background: app.color, borderRadius: 3,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Quick actions */}
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: Lock, label: 'Lock Device', color: '#ef4444', bg: '#ef444422' },
              { icon: MessageSquare, label: 'Send Message', color: '#3b82f6', bg: '#3b82f622' },
              { icon: Phone, label: 'Call Check-in', color: '#22c55e', bg: '#22c55e22' },
              { icon: Wifi, label: 'Block WiFi', color: '#f59e0b', bg: '#f59e0b22' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <button key={label} style={{
                padding: '14px 10px', borderRadius: 10, border: 'none',
                background: bg, cursor: 'pointer', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 8
              }}>
                <Icon size={22} color={color} />
                <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Risk score meter */}
          <div style={{ marginTop: 20, padding: 16, background: '#0f172a', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Safety Risk Score</span>
              <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>23 / 100</span>
            </div>
            <div style={{ height: 8, background: '#334155', borderRadius: 4 }}>
              <div style={{
                height: '100%', width: '23%',
                background: 'linear-gradient(90deg, #22c55e, #84cc16)',
                borderRadius: 4
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 6 }}>Low Risk — All good today</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
