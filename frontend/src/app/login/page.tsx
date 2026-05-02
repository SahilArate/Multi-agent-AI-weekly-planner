'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { useStore } from '@/lib/store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useStore()
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      setUser(res.user, res.access_token)
      router.push('/dashboard')
    } catch (e: any) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '40px',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>🧠</div>
          <span style={{
            fontWeight: '700',
            fontSize: '18px',
            color: '#fafafa',
            letterSpacing: '-0.4px',
          }}>WeeklyAI</span>
        </div>

        <div style={{
          background: '#111111',
          border: '1px solid #1a1a1a',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#fafafa',
            letterSpacing: '-0.4px',
            marginBottom: '4px',
          }}>Welcome back</h1>
          <p style={{
            fontSize: '13px',
            color: '#52525b',
            marginBottom: '28px',
          }}>Sign in to your account</p>

          {error && (
            <div style={{
              background: '#1c0a0a',
              border: '1px solid #450a0a',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#f87171',
            }}>{error}</div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '12px', fontWeight: '500',
              color: '#a1a1aa', display: 'block', marginBottom: '6px',
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
              style={{
                width: '100%', background: '#0a0a0a',
                border: '1px solid #222222', borderRadius: '8px',
                padding: '10px 12px', fontSize: '13px',
                color: '#fafafa', outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '12px', fontWeight: '500',
              color: '#a1a1aa', display: 'block', marginBottom: '6px',
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', background: '#0a0a0a',
                  border: '1px solid #222222', borderRadius: '8px',
                  padding: '10px 40px 10px 12px', fontSize: '13px',
                  color: '#fafafa', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '14px',
                  color: '#52525b', padding: '0',
                }}
              >{showPassword ? '🙈' : '👁'}</button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              background: loading || !email || !password ? '#1a1a1a' : '#3b82f6',
              color: loading || !email || !password ? '#52525b' : '#fff',
              fontSize: '14px', fontWeight: '600',
              padding: '11px', borderRadius: '8px',
              border: 'none',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.2px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '13px',
          color: '#52525b', marginTop: '20px',
        }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{
            color: '#3b82f6', textDecoration: 'none', fontWeight: '500',
          }}>Sign up</Link>
        </p>

        <p style={{
          textAlign: 'center', fontSize: '13px',
          color: '#333333', marginTop: '12px',
        }}>
          <Link href="/plan" style={{
            color: '#333333', textDecoration: 'none',
          }}>← Continue without account</Link>
        </p>
      </div>
    </div>
  )
}