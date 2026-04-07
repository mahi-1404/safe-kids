import { User, Bell, Shield, CreditCard } from 'lucide-react'

export default function Settings() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Manage your account and child profiles</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        {[
          { icon: User, label: 'Parent Profile', desc: 'Update your name, email and password', color: '#3b82f6' },
          { icon: Bell, label: 'Alert Preferences', desc: 'Choose which alerts to receive and how', color: '#f59e0b' },
          { icon: Shield, label: 'Child Profile — Aryan', desc: 'Age preset, screen time, bedtime, geofences', color: '#22c55e' },
          { icon: CreditCard, label: 'Subscription', desc: 'Current plan: Free — Upgrade to Premium', color: '#8b5cf6' },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} style={{
            background: '#1e293b', borderRadius: 12, padding: '16px 20px',
            border: '1px solid #334155', display: 'flex', alignItems: 'center',
            gap: 16, cursor: 'pointer'
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{label}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: '#475569', fontSize: 18 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
