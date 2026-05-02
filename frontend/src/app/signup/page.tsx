'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup } from '@/lib/api'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    if (!email || !password || !fullName) return
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signup(email, password, fullName)
      setSuccess(true)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          background: '#111111',
          border: '1px solid #1a1a1a',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '380px',
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#fafafa',
            marginBottom: '8px',
          }}>Check your email!</h2>
          <p style={{
            fontSize: '13px',
            color: '#52525b',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            We sent a verification link to{' '}
            <strong style={{ color: '#a1a1aa' }}>{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login" style={{
            background: '#3b82f6',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
          }}>Go to login →</Link>
        </div>
      </div>
    )
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
          }}>Create account</h1>
          <p style={{
            fontSize: '13px',
            color: '#52525b',
            marginBottom: '28px',
          }}>Start planning smarter today</p>

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
            }}>Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your full name"
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
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
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
            onClick={handleSignup}
            disabled={loading || !email || !password || !fullName}
            style={{
              width: '100%',
              background: loading || !email || !password || !fullName ? '#1a1a1a' : '#3b82f6',
              color: loading || !email || !password || !fullName ? '#52525b' : '#fff',
              fontSize: '14px', fontWeight: '600',
              padding: '11px', borderRadius: '8px',
              border: 'none',
              cursor: loading || !email || !password || !fullName ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.2px',
            }}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '13px',
          color: '#52525b', marginTop: '20px',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: '#3b82f6', textDecoration: 'none', fontWeight: '500',
          }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}