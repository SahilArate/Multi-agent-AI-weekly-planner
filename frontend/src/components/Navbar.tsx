'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function Navbar() {
  const { user, logout } = useStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}>🧠</div>
          <span style={{
            fontWeight: '600',
            fontSize: '15px',
            color: 'var(--text)',
            letterSpacing: '-0.3px',
          }}>WeeklyAI</span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <span style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginRight: '8px',
              }}>{user.email}</span>
              <Link href="/dashboard" style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
              }}>Dashboard</Link>
              <button onClick={handleLogout} style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                background: 'none',
                border: '1px solid var(--border)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
              }}>Login</Link>
              <Link href="/plan" style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#fff',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'var(--accent)',
              }}>Try free →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}