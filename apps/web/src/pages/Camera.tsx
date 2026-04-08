import { useState } from 'react'
import { Camera, Mic, MicOff, CameraOff, Monitor, PhoneOff, Volume2, VolumeX, RefreshCw, Loader, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { streamingApi } from '../services/api'
import socketService from '../services/socket'

type Mode = 'camera' | 'screen' | 'audio'

interface SessionInfo {
  token: string
  channelName: string
  appId: string
  uid: number
  expiresAt: string
}

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', ...style }}>
    {children}
  </div>
)

export default function CameraPage() {
  const { activeChild } = useAuth()

  const [active, setActive]           = useState(false)
  const [mode, setMode]               = useState<Mode>('camera')
  const [micOn, setMicOn]             = useState(true)
  const [speakerOn, setSpeakerOn]     = useState(true)
  const [cameraOn, setCameraOn]       = useState(true)
  const [frontCamera, setFrontCamera] = useState(true)
  const [starting, setStarting]       = useState(false)
  const [session, setSession]         = useState<SessionInfo | null>(null)
  const [error, setError]             = useState('')

  const startSession = async () => {
    if (!activeChild) return
    setStarting(true)
    setError('')
    try {
      const res = await streamingApi.getToken(activeChild._id, mode === 'audio' ? 'audio' : mode)
      setSession(res.data)
      setActive(true)
      // Backend already emitted streaming:start to child via socket
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Failed to start session'
      setError(msg)
    }
    setStarting(false)
  }

  const endSession = async () => {
    if (!activeChild) return
    try { await streamingApi.stop(activeChild._id, mode) } catch {}
    setActive(false)
    setSession(null)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Live View</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Camera, microphone and screen monitoring</p>
      </div>

      {!activeChild && (
        <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 10, padding: '14px 20px', marginBottom: 20, color: '#ef4444', fontSize: 14 }}>
          No child device paired. Pair a device first.
        </div>
      )}

      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ color: '#ef4444', fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {([
          ['camera', Camera, 'Live Camera'],
          ['screen', Monitor, 'Screen Share'],
          ['audio',  Mic,    'Audio Only'],
        ] as [Mode, any, string][]).map(([m, Icon, label]) => (
          <button key={m} onClick={() => !active && setMode(m)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, cursor: active ? 'not-allowed' : 'pointer',
            background: mode === m ? '#3b82f6' : '#1e293b',
            color: mode === m ? 'white' : '#94a3b8',
            fontWeight: 600, fontSize: 14,
            border: mode === m ? 'none' : '1px solid #334155',
            opacity: active && mode !== m ? 0.4 : 1,
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
            position: 'relative',
          }}>
            {active ? (
              <>
                {/* LIVE badge */}
                <div style={{
                  position: 'absolute', top: 16, left: 16,
                  background: '#ef4444', borderRadius: 6,
                  padding: '4px 10px', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                  LIVE
                </div>

                {!cameraOn && mode === 'camera' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <CameraOff size={48} color="#334155" />
                    <span style={{ color: '#475569', fontSize: 14 }}>Camera paused</span>
                  </div>
                ) : (
                  <div style={{ color: '#334155', textAlign: 'center' }}>
                    {mode === 'camera' ? <Camera size={64} /> : mode === 'screen' ? <Monitor size={64} /> : <Mic size={64} />}
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 12 }}>
                      {mode === 'audio' ? 'Audio session active' : 'WebRTC stream ready'}
                    </div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>
                      Connect via Agora SDK using channel: <strong style={{ color: '#94a3b8' }}>{session?.channelName}</strong>
                    </div>
                  </div>
                )}

                {/* Bottom label */}
                <div style={{
                  position: 'absolute', bottom: 16, right: 16,
                  background: '#00000088', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, color: '#94a3b8',
                }}>
                  {mode === 'camera' ? (frontCamera ? 'Front Camera' : 'Rear Camera') : mode === 'screen' ? 'Screen Share' : 'Audio Only'}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                {mode === 'camera' ? <Camera size={56} color="#334155" /> : mode === 'screen' ? <Monitor size={56} color="#334155" /> : <Mic size={56} color="#334155" />}
                <div style={{ color: '#475569', fontSize: 14, marginTop: 16 }}>
                  {mode === 'camera' ? 'Camera feed not active' : mode === 'screen' ? 'Screen share not active' : 'Audio not active'}
                </div>
                <div style={{ color: '#334155', fontSize: 12, marginTop: 6 }}>
                  Click Start to begin
                </div>
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div style={{
            padding: '16px 20px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid #334155',
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setMicOn(v => !v)} title="Toggle mic" style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: micOn ? '#1e3a5f' : '#3f1515',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {micOn ? <Mic size={18} color="#3b82f6" /> : <MicOff size={18} color="#ef4444" />}
              </button>
              <button onClick={() => setSpeakerOn(v => !v)} title="Toggle speaker" style={{
                width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: speakerOn ? '#1e3a5f' : '#3f1515',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {speakerOn ? <Volume2 size={18} color="#3b82f6" /> : <VolumeX size={18} color="#ef4444" />}
              </button>
              {mode === 'camera' && active && (
                <>
                  <button onClick={() => setCameraOn(v => !v)} title="Toggle camera" style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: cameraOn ? '#1e3a5f' : '#3f1515',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cameraOn ? <Camera size={18} color="#3b82f6" /> : <CameraOff size={18} color="#ef4444" />}
                  </button>
                  <button onClick={() => setFrontCamera(v => !v)} title="Flip camera" style={{
                    width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                    background: '#1e293b', border: '1px solid #334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <RefreshCw size={18} color="#94a3b8" />
                  </button>
                </>
              )}
            </div>

            <button onClick={active ? endSession : startSession}
              disabled={starting || !activeChild}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10, border: 'none',
                cursor: activeChild ? 'pointer' : 'not-allowed',
                background: active ? '#ef4444' : '#22c55e',
                color: 'white', fontWeight: 700, fontSize: 14,
                opacity: starting ? 0.7 : 1,
              }}>
              {starting ? (
                <><Loader size={16} /> Connecting...</>
              ) : active ? (
                <><PhoneOff size={16} /> End Session</>
              ) : (
                <><Camera size={16} /> Start Live View</>
              )}
            </button>
          </div>
        </Card>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Session info */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Session Info</div>
            {[
              { label: 'Status',      value: active ? 'Live' : 'Inactive',                       color: active ? '#22c55e' : '#94a3b8' },
              { label: 'Mode',        value: mode === 'camera' ? 'Camera' : mode === 'screen' ? 'Screen' : 'Audio', color: '#f1f5f9' },
              { label: 'Child',       value: activeChild?.name ?? '—',                            color: '#f1f5f9' },
              { label: 'Connection',  value: active ? 'Agora WebRTC' : '—',                       color: active ? '#3b82f6' : '#475569' },
              { label: 'Channel',     value: session?.channelName ?? '—',                         color: '#94a3b8' },
              { label: 'Microphone',  value: micOn ? 'On' : 'Muted',                              color: micOn ? '#22c55e' : '#ef4444' },
              { label: 'Speaker',     value: speakerOn ? 'On' : 'Off',                            color: speakerOn ? '#22c55e' : '#ef4444' },
              ...(session ? [{ label: 'Expires', value: new Date(session.expiresAt).toLocaleTimeString(), color: '#64748b' }] : []),
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color, fontWeight: 500, fontSize: 12, textAlign: 'right', maxWidth: 120, wordBreak: 'break-all' }}>{value}</span>
              </div>
            ))}
          </Card>

          {/* Agora SDK note */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#f59e0b', marginBottom: 8 }}>Agora SDK Required</div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              To render the live video, integrate the Agora Web SDK using the <strong style={{ color: '#94a3b8' }}>channelName</strong>, <strong style={{ color: '#94a3b8' }}>appId</strong>, and <strong style={{ color: '#94a3b8' }}>token</strong> from this session. The child app receives the <code>streaming:start</code> socket event automatically.
            </div>
          </Card>

          {/* Privacy notice */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
              All sessions are encrypted end-to-end via WebRTC. The child's device shows a recording indicator when live view is active.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
