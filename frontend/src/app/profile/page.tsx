'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import {
  deleteProfileAvatar,
  getMyProfile,
  updateMyProfile,
  uploadProfileAvatar,
  UserProfile,
  UserProfileUpdate,
} from '@/lib/api'
import { useStore } from '@/lib/store'

type Notice = { type: 'success' | 'error'; text: string }

const emptyDetails: UserProfileUpdate = {
  full_name: '',
  phone: '',
  location: '',
  website: '',
  timezone: '',
  bio: '',
}

const inputStyle = {
  width: '100%',
  background: '#0a0a0a',
  border: '1px solid #303036',
  borderRadius: '8px',
  padding: '11px 12px',
  fontSize: '13px',
  color: '#fafafa',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  marginBottom: '7px',
  color: '#a1a1aa',
  fontSize: '12px',
  fontWeight: '500' as const,
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
  ) {
    const response = error.response
    if (
      typeof response === 'object'
      && response !== null
      && 'data' in response
      && typeof response.data === 'object'
      && response.data !== null
      && 'detail' in response.data
      && typeof response.data.detail === 'string'
    ) {
      return response.data.detail
    }
  }
  return error instanceof Error ? error.message : fallback
}

export default function ProfilePage() {
  const { user } = useStore()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [details, setDetails] = useState<UserProfileUpdate>(emptyDetails)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    let active = true
    const loadProfile = async () => {
      setLoading(true)
      try {
        const data = await getMyProfile()
        if (!active) return
        setProfile(data)
        setDetails({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || '',
          timezone: data.timezone || '',
          bio: data.bio || '',
        })
      } catch (error) {
        if (active) {
          setNotice({ type: 'error', text: getErrorMessage(error, 'Unable to load your profile.') })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [user, router])

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const updated = await updateMyProfile(details)
      setProfile(updated)
      setNotice({ type: 'success', text: 'Your profile has been saved.' })
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error, 'Unable to save your profile.') })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !profile) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice({ type: 'error', text: 'Choose a JPEG, PNG, or WebP image.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'Profile images must be 5 MB or smaller.' })
      return
    }

    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    setUploading(true)
    setNotice(null)
    try {
      const result = await uploadProfileAvatar(file)
      setProfile(current => current ? { ...current, avatar_url: result.avatar_url } : current)
      setAvatarPreview(null)
      window.dispatchEvent(new CustomEvent('weeklyai-profile-updated', {
        detail: { avatarUrl: result.avatar_url },
      }))
      setNotice({ type: 'success', text: 'Your profile picture has been updated.' })
    } catch (error) {
      setAvatarPreview(null)
      setNotice({ type: 'error', text: getErrorMessage(error, 'Unable to upload your profile picture.') })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return
    setUploading(true)
    setNotice(null)
    try {
      await deleteProfileAvatar()
      setProfile(current => current ? { ...current, avatar_url: null } : current)
      window.dispatchEvent(new CustomEvent('weeklyai-profile-updated', {
        detail: { avatarUrl: null },
      }))
      setNotice({ type: 'success', text: 'Your profile picture has been removed.' })
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error, 'Unable to remove your profile picture.') })
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = avatarPreview || profile?.avatar_url || null

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 64px' }}>
        <header style={{ marginBottom: '28px' }}>
          <p style={{
            color: '#71717a',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>Account</p>
          <h1 style={{ color: '#fafafa', fontSize: '28px', letterSpacing: '-0.6px', margin: 0 }}>
            Your profile
          </h1>
          <p style={{ color: '#71717a', fontSize: '13px', marginTop: '8px' }}>
            Manage your personal information and profile picture.
          </p>
        </header>

        {notice && (
          <div
            role={notice.type === 'error' ? 'alert' : 'status'}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '18px',
              color: notice.type === 'error' ? '#fca5a5' : '#86efac',
              background: notice.type === 'error' ? '#2a1114' : '#102118',
              border: `1px solid ${notice.type === 'error' ? '#5b2027' : '#1d5032'}`,
              fontSize: '13px',
            }}
          >
            {notice.text}
          </div>
        )}

        {loading ? (
          <section style={{
            padding: '40px',
            border: '1px solid #242428',
            borderRadius: '14px',
            background: '#111113',
            color: '#a1a1aa',
            textAlign: 'center',
            fontSize: '13px',
          }}>Loading your profile…</section>
        ) : profile ? (
          <>
            <section style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              padding: '22px',
              marginBottom: '18px',
              border: '1px solid #242428',
              borderRadius: '14px',
              background: '#111113',
            }}>
              <div
                role="img"
                aria-label={profile.full_name ? `${profile.full_name}'s profile picture` : 'Profile picture'}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  border: '2px solid #303036',
                  background: avatarUrl
                    ? `center / cover no-repeat url("${avatarUrl}")`
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: '700',
                }}
              >
                {!avatarUrl && (profile.full_name || profile.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: '1 1 220px' }}>
                <h2 style={{ color: '#fafafa', fontSize: '16px', margin: '0 0 5px' }}>
                  Profile picture
                </h2>
                <p style={{ color: '#71717a', fontSize: '12px', margin: '0 0 14px' }}>
                  JPEG, PNG, or WebP. Maximum file size: 5 MB.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '9px 13px',
                    borderRadius: '8px',
                    background: uploading ? '#27272a' : '#2563eb',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: uploading ? 'wait' : 'pointer',
                    opacity: uploading ? 0.7 : 1,
                  }}>
                    {uploading ? 'Uploading…' : avatarUrl ? 'Change picture' : 'Upload picture'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      disabled={uploading}
                      style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        clip: 'rect(0, 0, 0, 0)',
                        whiteSpace: 'nowrap',
                      }}
                    />
                  </label>
                  {profile.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploading}
                      style={{
                        padding: '9px 13px',
                        border: '1px solid #3f3034',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#fca5a5',
                        fontSize: '12px',
                        cursor: uploading ? 'wait' : 'pointer',
                      }}
                    >
                      Remove picture
                    </button>
                  )}
                </div>
              </div>
            </section>

            <form onSubmit={handleSave}>
              <section style={{
                padding: '24px',
                border: '1px solid #242428',
                borderRadius: '14px',
                background: '#111113',
              }}>
                <h2 style={{ color: '#fafafa', fontSize: '15px', margin: '0 0 20px' }}>
                  Personal information
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
                  gap: '18px',
                }}>
                  <label style={labelStyle}>
                    Full name
                    <input
                      autoComplete="name"
                      maxLength={100}
                      value={details.full_name}
                      onChange={event => setDetails(current => ({ ...current, full_name: event.target.value }))}
                      placeholder="Your name"
                      style={{ ...inputStyle, display: 'block', marginTop: '7px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Email address
                    <input
                      value={profile.email}
                      readOnly
                      aria-describedby="email-account-status"
                      style={{ ...inputStyle, display: 'block', marginTop: '7px', color: '#71717a' }}
                    />
                    <span id="email-account-status" style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: profile.email_verified ? '#4ade80' : '#fbbf24' }}>
                      {profile.email_verified ? 'Email verified' : 'Email not verified'}
                    </span>
                  </label>
                  <label style={labelStyle}>
                    Phone
                    <input
                      type="tel"
                      autoComplete="tel"
                      maxLength={32}
                      value={details.phone}
                      onChange={event => setDetails(current => ({ ...current, phone: event.target.value }))}
                      placeholder="Add a phone number"
                      style={{ ...inputStyle, display: 'block', marginTop: '7px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Location
                    <input
                      autoComplete="address-level2"
                      maxLength={120}
                      value={details.location}
                      onChange={event => setDetails(current => ({ ...current, location: event.target.value }))}
                      placeholder="City, country"
                      style={{ ...inputStyle, display: 'block', marginTop: '7px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Website
                    <input
                      type="url"
                      autoComplete="url"
                      maxLength={200}
                      value={details.website}
                      onChange={event => setDetails(current => ({ ...current, website: event.target.value }))}
                      placeholder="https://example.com"
                      style={{ ...inputStyle, display: 'block', marginTop: '7px' }}
                    />
                  </label>
                  <label style={labelStyle}>
                    Time zone
                    <input
                      maxLength={64}
                      value={details.timezone}
                      onChange={event => setDetails(current => ({ ...current, timezone: event.target.value }))}
                      placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone || 'e.g. Asia/Kolkata'}
                      style={{ ...inputStyle, display: 'block', marginTop: '7px' }}
                    />
                  </label>
                </div>
                <label style={{ ...labelStyle, marginTop: '18px' }}>
                  About
                  <textarea
                    maxLength={500}
                    rows={4}
                    value={details.bio}
                    onChange={event => setDetails(current => ({ ...current, bio: event.target.value }))}
                    placeholder="A short introduction about yourself"
                    style={{ ...inputStyle, display: 'block', marginTop: '7px', resize: 'vertical', lineHeight: 1.5 }}
                  />
                  <span style={{ display: 'block', marginTop: '5px', color: '#52525b', fontSize: '11px', textAlign: 'right' }}>
                    {details.bio.length}/500
                  </span>
                </label>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingTop: '20px',
                  marginTop: '16px',
                  borderTop: '1px solid #242428',
                }}>
                  <p style={{ color: '#71717a', fontSize: '11px', margin: 0 }}>
                    Account created {profile.account_created_at
                      ? new Date(profile.account_created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                      : 'date unavailable'}
                  </p>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '10px 16px',
                      border: 0,
                      borderRadius: '8px',
                      background: saving ? '#27272a' : '#2563eb',
                      color: saving ? '#a1a1aa' : '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: saving ? 'wait' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </section>
            </form>
          </>
        ) : (
          <section style={{
            padding: '28px',
            border: '1px solid #242428',
            borderRadius: '14px',
            background: '#111113',
            color: '#a1a1aa',
            fontSize: '13px',
          }}>
            Your profile could not be loaded. Please try again.
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                display: 'block',
                marginTop: '14px',
                padding: '9px 13px',
                border: '1px solid #303036',
                borderRadius: '8px',
                background: 'transparent',
                color: '#fafafa',
                cursor: 'pointer',
              }}
            >
              Reload profile
            </button>
          </section>
        )}
      </div>
    </main>
  )
}
