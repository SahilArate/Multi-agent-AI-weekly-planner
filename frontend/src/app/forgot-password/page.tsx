'use client'
import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (e: any) {
      setError('Something went wrong. Please try again.')
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
          }}>Reset your password</h1>
          <p style={{
            fontSize: '13px',
            color: '#52525b',
            marginBottom: '28px',
          }}>Enter your email and we'll send you a reset link</p>

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

          {success ? (
            <div style={{
              background: '#0a1c0a',
              border: '1px solid #14532d',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '13px',
              color: '#4ade80',
              textAlign: 'center',
            }}>
              ✅ Check your email! A password reset link has been sent.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '12px', fontWeight: '500',
                  color: '#a1a1aa', display: 'block', marginBottom: '6px',
                }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{
                    width: '100%', background: '#0a0a0a',
                    border: '1px solid #222222', borderRadius: '8px',
                    padding: '10px 12px', fontSize: '13px',
                    color: '#fafafa', outline: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !email}
                style={{
                  width: '100%',
                  background: loading || !email ? '#1a1a1a' : '#3b82f6',
                  color: loading || !email ? '#52525b' : '#fff',
                  fontSize: '14px', fontWeight: '600',
                  padding: '11px', borderRadius: '8px',
                  border: 'none',
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.2px',
                }}
              >
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </>
          )}
        </div>

        <p style={{
          textAlign: 'center', fontSize: '13px',
          color: '#52525b', marginTop: '20px',
        }}>
          Remember your password?{' '}
          <Link href="/login" style={{
            color: '#3b82f6', textDecoration: 'none', fontWeight: '500',
          }}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}