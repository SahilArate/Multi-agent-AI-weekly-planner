'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getMyProfile } from '@/lib/api'
import { useStore } from '@/lib/store'

export default function Navbar() {
  const { user, logout, updateActivity } = useStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Intentional one-time mount flag to avoid SSR/client hydration
    // mismatches on auth-dependent UI — not a cascading state update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) updateActivity()
  }, [user, pathname, updateActivity])

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null)
      return
    }

    let active = true
    const handleProfileUpdate = (event: Event) => {
      const update = event as CustomEvent<{ avatarUrl: string | null }>
      setAvatarUrl(update.detail.avatarUrl)
    }

    window.addEventListener('weeklyai-profile-updated', handleProfileUpdate)
    getMyProfile()
      .then(profile => {
        if (active) setAvatarUrl(profile.avatar_url)
      })
      .catch(error => {
        console.error('Unable to load the profile picture for navigation:', error)
      })

    return () => {
      active = false
      window.removeEventListener('weeklyai-profile-updated', handleProfileUpdate)
    }
  }, [user?.id])

  useEffect(() => {
    if (!profileMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

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
              <div ref={profileMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  aria-controls="profile-menu"
                  onClick={() => setProfileMenuOpen(open => !open)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: 'none',
                    padding: 0,
                    background: avatarUrl
                      ? `center / cover no-repeat url("${avatarUrl}")`
                      : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#fff',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {!avatarUrl && user.email?.charAt(0).toUpperCase()}
                </button>
                {profileMenuOpen && (
                  <div
                    id="profile-menu"
                    role="menu"
                    aria-label="Profile menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: '220px',
                      padding: '8px',
                      border: '1px solid #303036',
                      borderRadius: '12px',
                      background: '#18181b',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                      zIndex: 60,
                    }}
                  >
                    <div
                      title={user.email}
                      style={{
                        padding: '10px 12px',
                        color: '#a1a1aa',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                    </div>
                    <div style={{ height: '1px', background: '#303036', margin: '4px 0' }} />
                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        color: '#e4e4e7',
                        fontSize: '13px',
                        textDecoration: 'none',
                      }}
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      disabled
                      title="Settings is not available yet"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: 0,
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#71717a',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'not-allowed',
                      }}
                    >
                      Settings
                    </button>
                    <div style={{ height: '1px', background: '#303036', margin: '4px 0' }} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        handleLogout()
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: 0,
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#f87171',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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