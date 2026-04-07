import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MapPin, Clock, Shield, Battery, AlertTriangle, Lock, MessageSquare, Phone, Wifi } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reportsApi, alertApi, screenTimeApi, commandApi } from '../services/api'
import socketService from '../services/socket'

const fmt = (min: number) => min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`
const timeAgo = (d: string | Date) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
const severityColor: Record<string, string> = {
  critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', info: '#8b5cf6'
}

const Card = ({ children, style = {} }: { children: React.ReactNode, style?: React.CSSProperties }) => (
  <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155', ...style }}>{children}</div>
)

export default function Dashboard() {
  const { parent, activeChild } = useAuth()
  const childId = activeChild?._id

  const [stats, setStats] = useState<any>(null)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [weekData, setWeekData] = useState<any[]>([])
  const [topApps, setTopApps] = useState<any[]>([])
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    if (!childId) return
    reportsApi.getDashboard(childId).then(r => setStats(r.data)).catch(() => {})
    alertApi.getAll().then(r => setRecentAlerts(r.data.slice(0, 3))).catch(() => {})
    screenTimeApi.getWeek(childId).then(r => {
      setWeekData(r.data.map((d: any) => ({
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        hours: +(d.totalMinutes / 60).toFixed(1),
      })))
    }).catch(() => {})
    reportsApi.getWeekly(childId).then(r => setTopApps(r.data.screenTime.topApps.slice(0, 4))).catch(() => {})
  }, [childId])

  useEffect(() => {
    socketService.on('location:update', (data: any) => {
      if (data.childId === childId) {
        setStats((s: any) => s ? { ...s, lastLocation: data } : s)
      }
    })
    socketService.on('screentime:update', (data: any) => {
      if (data.childId === childId) {
        setStats((s: any) => s ? { ...s, screenTime: { ...s.screenTime, todayMinutes: data.totalMinutes } } : s)
      }
    })
    socketService.on('alert:new', (alert: any) => {
      setRecentAlerts(prev => [alert, ...prev].slice(0, 3))
    })
    return () => {
      socketService.off('location:update')
      socketService.off('screentime:update')
      socketService.off('alert:new')
    }
  }, [childId])

  const sendCommand = async (type: string) => {
    if (!childId) return
    setSending(type)
    try { await commandApi.send(childId, type) } catch {}
    setSending(null)
  }

  const riskScore = stats?.riskScore ?? 0
  const riskColor = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#f59e0b' : '#ef4444'
  const riskLabel = riskScore < 30 ? 'Low Risk' : riskScore < 60 ? 'Medium Risk' : 'High Risk'
  const todayMin = stats?.screenTime?.todayMinutes ?? 0
  const limitMin = stats?.screenTime?.limitMinutes ?? 180
  const battery = stats?.batteryLevel ?? 0
  const isOnline = stats?.isOnline ?? activeChild?.isOnline ?? false
  const locText = stats?.lastLocation
    ? `${stats.lastLocation.latitude?.toFixed(4)}, ${stats.lastLocation.longitude?.toFixed(4)}`
    : 'No data'

  const appColors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']
  const maxApp = Math.max(...topApps.map((a: any) => a.totalMinutes), 1)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {parent?.name?.split(' ')[0] ?? 'Parent'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          {activeChild ? `Here's ${activeChild.name}'s activity overview for today` : 'No child device paired yet'}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Risk Score', value: String(riskScore), sub: riskLabel, icon: Shield, color: riskColor, bg: '#14532d' },
          { label: 'Screen Time', value: fmt(todayMin), sub: `Limit: ${fmt(limitMin)}`, icon: Clock, color: '#3b82f6', bg: '#1e3a5f' },
          { label: 'Location', value: stats?.lastLocation ? 'Tracked' : 'Unknown', sub: locText, icon: MapPin, color: '#8b5cf6', bg: '#3b0764' },
          { label: 'Battery', value: `${battery}%`, sub: isOnline ? 'Online' : 'Offline', icon: Battery, color: '#f59e0b', bg: '#451a03' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 12, color }}>{sub}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts + Alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Screen Time This Week</div>
          {weekData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              No screen time data yet
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15, display: 'flex', justifyContent: 'space-between' }}>
            Recent Alerts
            <span style={{ fontSize: 12, color: '#3b82f6', cursor: 'pointer' }}>View all</span>
          </div>
          {recentAlerts.length > 0 ? recentAlerts.map((a: any, i: number) => {
            const color = severityColor[a.severity] ?? '#64748b'
            return (
              <div key={a._id ?? i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: i < recentAlerts.length - 1 ? '1px solid #334155' : 'none'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{timeAgo(a.createdAt)}</div>
                </div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: color + '22', color, fontWeight: 600, textTransform: 'capitalize' }}>{a.severity}</span>
              </div>
            )
          }) : (
            <div style={{ textAlign: 'center', color: '#475569', padding: '20px 0' }}>No alerts</div>
          )}
          {recentAlerts.length > 0 && (
            <div style={{ marginTop: 16, padding: '10px 16px', background: '#ef444422', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
                {recentAlerts.filter((a: any) => !a.isRead).length} unread alerts
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* App usage + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>App Usage Today</div>
          {topApps.length > 0 ? topApps.map((app: any, i: number) => (
            <div key={app.name} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{fmt(app.totalMinutes)}</span>
              </div>
              <div style={{ height: 6, background: '#334155', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${Math.round((app.totalMinutes / maxApp) * 100)}%`, background: appColors[i % appColors.length], borderRadius: 3 }} />
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: '#475569', padding: '20px 0' }}>No app usage data yet</div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: Lock, label: 'Lock Device', color: '#ef4444', bg: '#ef444422', cmd: 'lock_device' },
              { icon: MessageSquare, label: 'Send Message', color: '#3b82f6', bg: '#3b82f622', cmd: 'send_message' },
              { icon: Phone, label: 'Call Check-in', color: '#22c55e', bg: '#22c55e22', cmd: 'call_checkin' },
              { icon: Wifi, label: 'Block WiFi', color: '#f59e0b', bg: '#f59e0b22', cmd: 'block_wifi' },
            ].map(({ icon: Icon, label, color, bg, cmd }) => (
              <button key={label} onClick={() => sendCommand(cmd)} disabled={!childId || sending === cmd} style={{
                padding: '14px 10px', borderRadius: 10, border: 'none',
                background: bg, cursor: childId ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                opacity: sending === cmd ? 0.6 : 1
              }}>
                <Icon size={22} color={color} />
                <span style={{ fontSize: 12, color, fontWeight: 600 }}>{sending === cmd ? 'Sending...' : label}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 16, background: '#0f172a', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Safety Risk Score</span>
              <span style={{ fontSize: 13, color: riskColor, fontWeight: 700 }}>{riskScore} / 100</span>
            </div>
            <div style={{ height: 8, background: '#334155', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${riskScore}%`, background: riskColor, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: riskColor, marginTop: 6 }}>{riskLabel}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
