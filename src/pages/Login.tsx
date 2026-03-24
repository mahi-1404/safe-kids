import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login failed. Check your credentials.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f172a'
    }}>
      <div style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>SafeKids</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Parent Control Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: '#1e293b', borderRadius: 16, padding: 32, border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Sign in to your account</h2>

          {error && (
            <div style={{
              background: '#ef444422', border: '1px solid #ef444444',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              color: '#ef4444', fontSize: 13
            }}>{error}</div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="parent@email.com" required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: '#0f172a', border: '1px solid #334155',
                color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8,
                  background: '#0f172a', border: '1px solid #334155',
                  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button type="button" onClick={() => setShow(!show)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
              }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: loading ? '#334155' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
