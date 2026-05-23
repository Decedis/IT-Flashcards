import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/auth'

export function LoginView() {
  const { login, register } = useAuth()
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = mode === 'login'
      ? await login(username.trim(), password)
      : await register(username.trim(), password)
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'var(--mono)',
    }}>
      <div style={{
        width: 420, background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 32,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: 'var(--accent)' }}>[</span>
              <span style={{ color: 'var(--fg)' }}>IT</span>
              <span style={{ color: 'var(--accent)' }}>]</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
                flashcards<span style={{ color: 'var(--accent)', animation: 'blink 1s steps(2) infinite' }}>_</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>v0.4.2 · comptia track</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            <span style={{ color: 'var(--accent)' }}>$</span>{' '}
            <span style={{ color: 'var(--fg-2)' }}>
              auth.{mode === 'login' ? 'login' : 'register'} --interactive
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--accent)', display: 'block', marginBottom: 6 }}>
              // username
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '8px 12px',
            }}>
              <span style={{ color: 'var(--accent)', fontSize: 12 }}>›</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="student"
                autoComplete="username"
                autoFocus
                required
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--fg)', fontFamily: 'var(--mono)', fontSize: 13,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--accent)', display: 'block', marginBottom: 6 }}>
              // password
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '8px 12px',
            }}>
              <span style={{ color: 'var(--accent)', fontSize: 12 }}>›</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--fg)', fontFamily: 'var(--mono)', fontSize: 13,
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--bad)', padding: '6px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.2)' }}>
              // error: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, background: 'var(--accent)', color: 'var(--bg-0)',
              padding: '10px 16px', borderRadius: 'var(--radius)', border: 'none',
              fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '// authenticating…' : `› ${mode === 'login' ? 'authenticate' : 'create account'}`}
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--border)', fontSize: 12 }}>
          {mode === 'login' ? (
            <span style={{ color: 'var(--muted)' }}>
              No account?{' '}
              <button onClick={() => { setMode('register'); setError(null) }}
                style={{ color: 'var(--accent)', textDecoration: 'underline', fontFamily: 'var(--mono)', fontSize: 12 }}>
                register instead
              </button>
            </span>
          ) : (
            <span style={{ color: 'var(--muted)' }}>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(null) }}
                style={{ color: 'var(--accent)', textDecoration: 'underline', fontFamily: 'var(--mono)', fontSize: 12 }}>
                login instead
              </button>
            </span>
          )}
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--fg-3)' }}>
          # demo: student / password
        </div>
      </div>
    </div>
  )
}
