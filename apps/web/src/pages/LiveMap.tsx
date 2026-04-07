import { MapPin, Navigation, RefreshCw } from 'lucide-react'

export default function LiveMap() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Live Map</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Aryan's real-time location</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: '#3b82f6', border: 'none', borderRadius: 8,
          color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Map placeholder */}
      <div style={{
        background: '#1e293b', borderRadius: 14, border: '1px solid #334155',
        height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden'
      }}>
        {/* Fake map grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <Navigation size={48} color="#3b82f6" />
        <div style={{ fontWeight: 600, fontSize: 16 }}>Google Maps Integration</div>
        <div style={{ color: '#64748b', fontSize: 13 }}>Add your Google Maps API key to enable live tracking</div>
        <div style={{
          background: '#22c55e22', border: '1px solid #22c55e',
          borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <MapPin size={14} color="#22c55e" />
          <span style={{ color: '#22c55e', fontSize: 13 }}>Last known: Home — 5 mins ago</span>
        </div>
      </div>

      {/* Location info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        {[
          { label: 'Current Location', value: 'Home (Safe Zone)', color: '#22c55e' },
          { label: 'Last Updated', value: '5 minutes ago', color: '#94a3b8' },
          { label: 'Today\'s Distance', value: '2.4 km', color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#1e293b', borderRadius: 12, padding: 16,
            border: '1px solid #334155'
          }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>{label}</div>
            <div style={{ color, fontWeight: 600, fontSize: 15 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
