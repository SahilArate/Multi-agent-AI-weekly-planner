'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function Navbar() {
  const { user, logout } = useStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href
    return (
      <Link href={href} style={{
        fontSize: '13px',
        fontWeight: '500',
        color: active ? '#fafafa' : '#52525b',
        textDecoration: 'none',
        padding: '5px 10px',
        borderRadius: '6px',
        background: active ? '#1a1a1a' : 'transparent',
        transition: 'color 0.15s',
      }}>{label}</Link>
    )
  }

  return (
    <nav style={{
      borderBottom: '1px solid #1a1a1a',
      background: '#0a0a0a',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <div style={{
            width: '26px', height: '26px',
            background: '#2563eb',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
          }}>🧠</div>
          <span style={{
            fontWeight: '700',
            fontSize: '14px',
            color: '#fafafa',
            letterSpacing: '-0.3px',
          }}>WeeklyAI</span>
        </Link>

        {/* Center nav — only show when logged in */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}>
            {navLink('/today', 'Today')}
            {navLink('/plan', 'Plan')}
            {navLink('/templates', 'Templates')}
            {navLink('/analytics', 'Analytics')}
            {navLink('/chat', 'AI Chat')}
            {navLink('/dashboard', 'Dashboard')}
          </div>
        )}

        {/* Right */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}>
          {user ? (
            <>
              <span style={{
                fontSize: '12px',
                color: '#333333',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{user.email}</span>
              <button onClick={handleLogout} style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#52525b',
                background: 'none',
                border: '1px solid #1a1a1a',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#52525b',
                textDecoration: 'none',
                padding: '5px 12px',
              }}>Login</Link>
              <Link href="/signup" style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#fff',
                textDecoration: 'none',
                padding: '5px 14px',
                borderRadius: '6px',
                background: '#2563eb',
              }}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}