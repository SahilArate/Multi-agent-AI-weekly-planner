'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useStore } from '@/lib/store'

type PlannerSettings = {
  defaultView: 'week' | 'day'
  weekStartsOn: 'monday' | 'sunday'
  timeFormat: '12-hour' | '24-hour'
}

type Notice = { type: 'success' | 'error'; text: string }

const STORAGE_KEY = 'weeklyai-settings'

const defaultSettings: PlannerSettings = {
  defaultView: 'week',
  weekStartsOn: 'monday',
  timeFormat: '12-hour',
}

const cardStyle = {
  padding: '22px 24px',
  border: '1px solid #242428',
  borderRadius: '14px',
  background: '#111113',
}

const selectStyle = {
  width: '100%',
  maxWidth: '260px',
  padding: '10px 12px',
  border: '1px solid #303036',
  borderRadius: '8px',
  background: '#0a0a0a',
  color: '#fafafa',
  fontSize: '13px',
  fontFamily: 'inherit',
}

function isPlannerSettings(value: unknown): value is PlannerSettings {
  if (typeof value !== 'object' || value === null) return false
  const settings = value as Record<string, unknown>
  return (
    (settings.defaultView === 'week' || settings.defaultView === 'day')
    && (settings.weekStartsOn === 'monday' || settings.weekStartsOn === 'sunday')
    && (settings.timeFormat === '12-hour' || settings.timeFormat === '24-hour')
  )
}

export default function SettingsPage() {
  const { user } = useStore()
  const router = useRouter()
  const [settings, setSettings] = useState<PlannerSettings>(defaultSettings)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === null) return

      const parsed: unknown = JSON.parse(saved)
      if (isPlannerSettings(parsed)) {
        setSettings(parsed)
      } else {
        setNotice({ type: 'error', text: 'Your saved settings could not be read. Choose your preferences and save again.' })
      }
    } catch (error) {
      console.error('Unable to load saved planner settings:', error)
      setNotice({ type: 'error', text: 'Unable to load your saved settings. You can still update and save your preferences.' })
    }
  }, [user, router])

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(null)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setNotice({ type: 'success', text: 'Your planner preferences have been saved on this device.' })
    } catch (error) {
      console.error('Unable to save planner settings:', error)
      setNotice({ type: 'error', text: 'Unable to save your settings. Check your browser storage and try again.' })
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setNotice(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      setNotice({ type: 'success', text: 'Your planner preferences have been reset to the defaults.' })
    } catch (error) {
      console.error('Unable to reset planner settings:', error)
      setNotice({ type: 'error', text: 'Unable to reset your saved settings. Check your browser storage and try again.' })
    }
  }

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
            Settings
          </h1>
          <p style={{ color: '#71717a', fontSize: '13px', marginTop: '8px' }}>
            Customize how your weekly planner looks and works.
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

        <form onSubmit={handleSave}>
          <section style={cardStyle} aria-labelledby="planner-preferences-heading">
            <div style={{ marginBottom: '20px' }}>
              <h2 id="planner-preferences-heading" style={{ color: '#fafafa', fontSize: '15px', margin: '0 0 6px' }}>
                Planner preferences
              </h2>
              <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
                Choose how your schedule is presented by default.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <label style={{ display: 'grid', gap: '8px', color: '#e4e4e7', fontSize: '13px' }}>
                Default planner view
                <select
                  value={settings.defaultView}
                  onChange={event => setSettings(current => ({
                    ...current,
                    defaultView: event.target.value as PlannerSettings['defaultView'],
                  }))}
                  style={selectStyle}
                >
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </select>
                <span style={{ color: '#71717a', fontSize: '11px' }}>
                  Choose the view you prefer when opening your planner.
                </span>
              </label>

              <label style={{ display: 'grid', gap: '8px', color: '#e4e4e7', fontSize: '13px' }}>
                First day of the week
                <select
                  value={settings.weekStartsOn}
                  onChange={event => setSettings(current => ({
                    ...current,
                    weekStartsOn: event.target.value as PlannerSettings['weekStartsOn'],
                  }))}
                  style={selectStyle}
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
                <span style={{ color: '#71717a', fontSize: '11px' }}>
                  Set which day appears first in your weekly schedule.
                </span>
              </label>

              <label style={{ display: 'grid', gap: '8px', color: '#e4e4e7', fontSize: '13px' }}>
                Time format
                <select
                  value={settings.timeFormat}
                  onChange={event => setSettings(current => ({
                    ...current,
                    timeFormat: event.target.value as PlannerSettings['timeFormat'],
                  }))}
                  style={selectStyle}
                >
                  <option value="12-hour">12-hour (AM/PM)</option>
                  <option value="24-hour">24-hour</option>
                </select>
                <span style={{ color: '#71717a', fontSize: '11px' }}>
                  Choose how times should be displayed in your planner.
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '20px',
              marginTop: '22px',
              borderTop: '1px solid #242428',
            }}>
              <p style={{ color: '#71717a', fontSize: '11px', margin: 0 }}>
                These preferences are saved in this browser on this device.
              </p>
              <div style={{ display: 'flex', gap: '9px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #303036',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#a1a1aa',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Reset defaults
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    border: 0,
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save settings
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  )
}
