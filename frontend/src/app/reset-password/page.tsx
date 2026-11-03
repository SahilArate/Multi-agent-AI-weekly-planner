'use client'
import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type PageState = 'checking' | 'ready' | 'invalid' | 'success'

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let recoveryEventSeen = false
    const url = new URL(window.location.href)
    const recoveryLink = url.searchParams.get('type') === 'recovery'
      || new URLSearchParams(url.hash.slice(1)).get('type') === 'recovery'
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryEventSeen = true
        sessionStorage.setItem('password_recovery_pending', 'true')
        if (active) setPageState('ready')
      }
    })

    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return
      if (sessionError) {
        console.error('Unable to verify password recovery session:', sessionError)
        setPageState('invalid')
        return
      }
      const pendingRecovery = sessionStorage.getItem('password_recovery_pending') === 'true'
      setPageState(data.session && (recoveryLink || recoveryEventSeen || pendingRecovery)
        ? 'ready'
        : 'invalid')
    }

    void checkRecoverySession()
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Your password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      sessionStorage.removeItem('password_recovery_pending')
      setPageState('success')
    } catch (updateError) {
      console.error('Unable to update password:', updateError)
      setError('Unable to update your password. Please request a new reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', marginBottom: '32px',
        }}>
          <div style={{
            width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>🧠</div>
          <span style={{
            fontWeight: '700', fontSize: '18px', color: '#fafafa', letterSpacing: '-0.4px',
          }}>WeeklyAI</span>
        </div>

        <section style={{
          background: '#111111', border: '1px solid #1a1a1a',
          borderRadius: '16px', padding: '32px',
        }}>
          <h1 style={{
            fontSize: '20px', fontWeight: '700', color: '#fafafa',
            letterSpacing: '-0.4px', marginBottom: '8px',
          }}>
            {pageState === 'success' ? 'Password updated' : 'Choose a new password'}
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px', lineHeight: 1.6 }}>
            {pageState === 'checking' ? 'Verifying your password reset link…'
              : pageState === 'invalid' ? 'This reset link is invalid or has expired.'
              : pageState === 'success' ? 'Your password has been changed. You can now sign in with it.'
              : 'Enter and confirm the new password for your account.'}
          </p>

          {error && (
            <div role="alert" style={{
              background: '#1c0a0a', border: '1px solid #450a0a', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#f87171',
            }}>{error}</div>
          )}

          {pageState === 'ready' && (
            <form onSubmit={handleSubmit}>
              <label htmlFor="new-password" style={{
                fontSize: '12px', fontWeight: '500', color: '#a1a1aa',
                display: 'block', marginBottom: '6px',
              }}>New password</label>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #222',
                  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
                  color: '#fafafa', outline: 'none', marginBottom: '16px',
                }}
              />
              <label htmlFor="confirm-password" style={{
                fontSize: '12px', fontWeight: '500', color: '#a1a1aa',
                display: 'block', marginBottom: '6px',
              }}>Confirm new password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Enter your new password again"
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #222',
                  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
                  color: '#fafafa', outline: 'none', marginBottom: '12px',
                }}
              />
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', color: '#a1a1aa', marginBottom: '20px',
              }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={event => setShowPassword(event.target.checked)}
                />
                Show password
              </label>
              <button type="submit" disabled={loading} style={{
                width: '100%', background: loading ? '#1a1a1a' : '#3b82f6',
                color: loading ? '#71717a' : '#fff', fontSize: '14px', fontWeight: '600',
                padding: '11px', borderRadius: '8px', border: 'none',
                cursor: loading ? 'wait' : 'pointer',
              }}>{loading ? 'Updating…' : 'Update password'}</button>
            </form>
          )}

          {(pageState === 'invalid' || pageState === 'success') && (
            <Link href={pageState === 'success' ? '/login' : '/forgot-password'} style={{
              display: 'block', textAlign: 'center', background: '#3b82f6', color: '#fff',
              fontSize: '14px', fontWeight: '600', padding: '11px', borderRadius: '8px',
              textDecoration: 'none',
            }}>{pageState === 'success' ? 'Go to sign in' : 'Request a new reset link'}</Link>
          )}
        </section>
      </div>
    </main>
  )
}
