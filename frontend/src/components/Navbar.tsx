'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function Navbar() {
  const { user, logout, updateActivity } = useStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Intentional one-time mount flag to avoid SSR/client hydration
    // mismatches on auth-dependent UI — not a cascading state update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) updateActivity()
  }, [user, pathname, updateActivity])

  const showLoggedIn = mounted && !!user
  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href
    return (
      <Link href={href} style={{
        fontSize: '12px',
        fontWeight: '500',
        color: active ? '#f4f4f5' : '#a1a1aa',
        textDecoration: 'none',
        padding: '8px 11px',
        borderRadius: '8px',
        background: active ? 'rgba(63, 63, 70, 0.55)' : 'transparent',
        transition: 'color 150ms ease, background 150ms ease',
      }} aria-current={active ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>
    )
  }

  return (
    <nav className="site-nav" style={{
      borderBottom: '1px solid rgba(63, 63, 70, 0.45)',
      background: 'rgba(10, 10, 10, 0.86)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    }}>
      <div className="site-nav__inner" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 28px',
        minHeight: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(145deg, #3b82f6, #7c3aed)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.22)',
          }}>🧠</div>
          <div>
            <span style={{
              display: 'block',
              fontWeight: '700',
              fontSize: '15px',
              color: '#fafafa',
              letterSpacing: '-0.4px',
              lineHeight: '1.1',
            }}>WeeklyAI</span>
            <span className="site-nav__tagline" style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '9px',
              fontWeight: '600',
              color: '#71717a',
              letterSpacing: '0.12em',
            }}>PLAN WITH AI</span>
          </div>
        </Link>

        {/* Center nav — only show when logged in */}
        {showLoggedIn && (
          <div className={`site-nav__links${menuOpen ? ' site-nav__links--open' : ''}`} style={{
            alignItems: 'center',
            gap: '3px',
            padding: '4px',
            border: '1px solid rgba(63, 63, 70, 0.5)',
            borderRadius: '12px',
            background: 'rgba(24, 24, 27, 0.68)',
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
        <div className="site-nav__actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          {showLoggedIn ? (
            <>
              <div
                aria-label="User profile"
                title="User profile"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#fff',
                  flexShrink: 0,
              }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#a1a1aa',
                background: 'none',
                border: '1px solid #303036',
                padding: '8px 12px',
                borderRadius: '9px',
                cursor: 'pointer',
              }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="site-nav__login">Login</Link>
              <Link href="/signup" style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
                boxShadow: '0 5px 16px rgba(59, 130, 246, 0.2)',
              }}><span className="site-nav__signup-label">Get started</span><span className="site-nav__signup-mobile">Sign up</span> <span aria-hidden="true">→</span></Link>
            </>
          )}
          {showLoggedIn && (
            <button
              className="site-nav__menu-toggle"
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                color: '#e4e4e7',
                background: '#18181b',
                border: '1px solid #303036',
                borderRadius: '9px',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >{menuOpen ? '×' : '☰'}</button>
          )}
        </div>
      </div>
    </nav>
  )
}