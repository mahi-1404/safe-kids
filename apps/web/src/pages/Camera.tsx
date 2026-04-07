import { useState } from 'react'
import { Camera, Mic, MicOff, CameraOff, Monitor, PhoneOff, Volume2, VolumeX, RefreshCw } from 'lucide-react'

type Mode = 'camera' | 'screen'

export default function CameraPage() {
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState<Mode>('camera')
  const [micOn, setMicOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [frontCamera, setFrontCamera] = useState(true)

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', ...style }}>
      {children}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Live View</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Camera, microphone and screen monitoring</p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {([['camera', Camera, 'Live Camera'], ['screen', Monitor, 'Screen Share']] as const).map(([m, Icon, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
            background: mode === m ? '#3b82f6' : '#1e293b',
            color: mode === m ? 'white' : '#94a3b8',
            fontWeight: 600, fontSize: 14,
            border: mode === m ? 'none' : '1px solid #334155',
          }}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Video feed */}
        <Card style={{ overflow: 'hidden' }}>
          <div style={{
            aspectRatio: '16/9', background: '#0f172a',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}>
            {active ? (
              <>
                {/* Live indicator */}
                <div style={{
                  position: 'absolute', top: 16, left: 16,
                  background: '#ef4444', borderRadius: 6,
                  padding: '4px 10px', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                  LIVE
                </div>
                {/* Camera off overlay */}
                {!cameraOn && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: '#0f172a', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
                  }}>
                    <CameraOff size={48} color="#334155" />
                    <span style={{ color: '#475569', fontSize: 14 }}>Camera paused</span>
                  </div>
                )}
                {cameraOn && (
                  <div style={{ color: '#334155', textAlign: 'center' }}>
                    <Camera size={64} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 13, color: '#475569' }}>WebRTC stream active</div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>
                      {mode === 'camera' ? (frontCamera ? 'Front camera' : 'Rear camera') : "Child's screen"}
                    </div>
                  </div>
                )}
                {/* Camera label */}
                <div style={{
                  position: 'absolute', bottom: 16, right: 16,
                  background: '#00000088', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, color: '#94a3b8'
                }}>
                  {mode === 'camera' ? (frontCamera ? 'Front Camera' : 'Rear Camera') : 'Screen Share'}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                {mode === 'camera' ? <Camera size={56} color="#334155" /> : <Monitor size={56} color="#334155" />}
                <div style={{ color: '#475569', fontSize: 14, marginTop: 16 }}>
                  {mode === 'camera' ? 'Camera feed not active' : 'Screen share not active'}
                </div>
                <div style={{ color: '#334155', fontSize: 12, marginTop: 6 }}>
                  Click Start to begin live view
                </div>
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div style={{
            padding: '16px 20px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {/* Mic toggle */}
              <button onClick={() => setMicOn(v => !v)} title="Toggle mic" style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: micOn ? '#1e3a5f' : '#3f1515',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {micOn ? <Mic size={18} color="#3b82f6" /> : <MicOff size={18} color="#ef4444" />}
              </button>
              {/* Speaker toggle */}
              <button onClick={() => setSpeakerOn(v => !v)} title="Toggle speaker" style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: speakerOn ? '#1e3a5f' : '#3f1515',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {speakerOn ? <Volume2 size={18} color="#3b82f6" /> : <VolumeX size={18} color="#ef4444" />}
              </button>
              {/* Camera toggle (only in camera mode) */}
              {mode === 'camera' && active && (
                <>
                  <button onClick={() => setCameraOn(v => !v)} title="Toggle camera" style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: cameraOn ? '#1e3a5f' : '#3f1515',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {cameraOn ? <Camera size={18} color="#3b82f6" /> : <CameraOff size={18} color="#ef4444" />}
                  </button>
                  <button onClick={() => setFrontCamera(v => !v)} title="Flip camera" style={{
                    width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                    background: '#1e293b', border: '1px solid #334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <RefreshCw size={18} color="#94a3b8" />
                  </button>
                </>
              )}
            </div>

            {/* Start / End button */}
            <button onClick={() => setActive(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: active ? '#ef4444' : '#22c55e',
              color: 'white', fontWeight: 700, fontSize: 14
            }}>
              {active ? <><PhoneOff size={16} /> End Session</> : <><Camera size={16} /> Start Live View</>}
            </button>
          </div>
        </Card>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Session Info</div>
            {[
              { label: 'Status', value: active ? 'Live' : 'Inactive', color: active ? '#22c55e' : '#94a3b8' },
              { label: 'Mode', value: mode === 'camera' ? 'Camera' : 'Screen Share', color: '#f1f5f9' },
              { label: 'Connection', value: 'WebRTC P2P', color: '#3b82f6' },
              { label: 'Child Device', value: 'Aryan\'s Phone', color: '#f1f5f9' },
              { label: 'Microphone', value: micOn ? 'On' : 'Muted', color: micOn ? '#22c55e' : '#ef4444' },
              { label: 'Speaker', value: speakerOn ? 'On' : 'Off', color: speakerOn ? '#22c55e' : '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 10, fontSize: 13
              }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </Card>

          {/* Audio only call */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Two-Way Voice</div>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>
              Start an audio call with the child without video
            </div>
            <button style={{
              width: '100%', padding: '10px', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: '#1e3a5f', color: '#3b82f6',
              fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <Mic size={15} /> Start Voice Call
            </button>
          </Card>

          {/* Privacy notice */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
              All sessions are encrypted end-to-end via WebRTC. Recordings require explicit consent under COPPA/GDPR-K.
              The child's device shows a recording indicator when live view is active.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
