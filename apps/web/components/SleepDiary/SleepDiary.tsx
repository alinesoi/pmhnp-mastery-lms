'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Moon, Check } from 'lucide-react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import {
  SleepDiaryEntry,
  getSleepDiaryEntries,
  upsertSleepDiaryEntry,
} from '@services/sleepdiary/sleepdiary'

const SERIF: React.CSSProperties = { fontFamily: "'Lora', Georgia, serif" }
const NAVY = '#1F3251'
const GOLD = '#E3A63B'
const CARD_BORDER = '#EDE7DA'
const BODY_TEXT = '#5C5A52'
const MUTED = '#8B887D'
const SAGE = '#8FA98F'
const ROSE = '#D89A8E'

const QUALITY_COLORS: Record<number, string> = {
  1: ROSE,
  2: '#DBB49A',
  3: '#E3C88B',
  4: '#ADBE9C',
  5: SAGE,
}
const QUALITY_LABELS: Record<number, string> = {
  1: 'Rough night',
  2: 'Restless',
  3: 'Okay',
  4: 'Rested',
  5: 'Deeply rested',
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function sleepHours(entry: SleepDiaryEntry): number | null {
  if (!entry.bedtime || !entry.waketime) return null
  const [bh, bm] = entry.bedtime.split(':').map(Number)
  const [wh, wm] = entry.waketime.split(':').map(Number)
  let mins = wh * 60 + wm - (bh * 60 + bm)
  if (mins <= 0) mins += 24 * 60
  return mins / 60
}

function formatHours(h: number): string {
  const hours = Math.floor(h)
  const mins = Math.round((h - hours) * 60)
  return mins === 0 ? `${hours}h` : `${hours}h ${String(mins).padStart(2, '0')}m`
}

export default function SleepDiary() {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token as string | undefined

  const [entries, setEntries] = useState<SleepDiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const today = toDateStr(new Date())

  const [entryDate, setEntryDate] = useState(today)
  const [bedtime, setBedtime] = useState('')
  const [waketime, setWaketime] = useState('')
  const [quality, setQuality] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState('')

  const refresh = async (token: string) => {
    const res = await getSleepDiaryEntries(60, token)
    if (res.success && Array.isArray(res.data)) setEntries(res.data)
    setLoading(false)
  }

  useEffect(() => {
    if (accessToken) refresh(accessToken)
  }, [accessToken])

  // Prefill the form when picking a date that already has an entry
  useEffect(() => {
    const existing = entries.find((e) => e.entry_date === entryDate)
    setBedtime(existing?.bedtime || '')
    setWaketime(existing?.waketime || '')
    setQuality(existing?.quality ?? null)
    setNote(existing?.note || '')
  }, [entryDate, entries])

  const save = async () => {
    if (!accessToken) return
    setSaving(true)
    setError('')
    const res = await upsertSleepDiaryEntry(
      {
        entry_date: entryDate,
        bedtime: bedtime || null,
        waketime: waketime || null,
        quality: quality,
        note: note || null,
      },
      accessToken
    )
    setSaving(false)
    if (res.success) {
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
      refresh(accessToken)
    } else {
      setError('Could not save your entry. Please try again.')
    }
  }

  const byDate = useMemo(() => {
    const map: Record<string, SleepDiaryEntry> = {}
    entries.forEach((e) => {
      map[e.entry_date] = e
    })
    return map
  }, [entries])

  const last14 = useMemo(() => {
    const days: { date: string; label: string; entry: SleepDiaryEntry | null }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = toDateStr(d)
      days.push({
        date: ds,
        label: 'SMTWTFS'[d.getDay()],
        entry: byDate[ds] || null,
      })
    }
    return days
  }, [byDate])

  const stats = useMemo(() => {
    const last7 = last14.slice(7)
    const durations = last7
      .map((d) => (d.entry ? sleepHours(d.entry) : null))
      .filter((h): h is number => h !== null)
    const qualities = last7
      .map((d) => d.entry?.quality)
      .filter((q): q is number => typeof q === 'number')
    const avgSleep = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null
    const avgQuality = qualities.length
      ? qualities.reduce((a, b) => a + b, 0) / qualities.length
      : null

    let streak = 0
    const cursor = new Date()
    if (!byDate[toDateStr(cursor)]) cursor.setDate(cursor.getDate() - 1)
    while (byDate[toDateStr(cursor)]) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return { avgSleep, avgQuality, streak }
  }, [last14, byDate])

  const hasEntryToday = Boolean(byDate[today])
  const maxHours = 12

  return (
    <div
      className="bg-white shadow-sm"
      style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}
    >
      {/* Entry form */}
      <div className="px-5 sm:px-6 pt-5 pb-6" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold" style={{ ...SERIF, color: NAVY }}>
              {hasEntryToday && entryDate === today
                ? 'Last night is logged'
                : 'How did you sleep last night?'}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
              Thirty seconds each morning builds your sleep picture.
            </p>
          </div>
          <input
            type="date"
            value={entryDate}
            max={today}
            onChange={(e) => setEntryDate(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{ border: `1px solid ${CARD_BORDER}`, color: BODY_TEXT, backgroundColor: '#FDFCF8' }}
            aria-label="Diary date"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-[11px] font-medium" style={{ color: MUTED }}>
              Went to bed
            </span>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="mt-1 w-full text-sm px-2.5 py-2 rounded-lg outline-none"
              style={{ border: `1px solid ${CARD_BORDER}`, color: NAVY, backgroundColor: '#FDFCF8' }}
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium" style={{ color: MUTED }}>
              Woke up
            </span>
            <input
              type="time"
              value={waketime}
              onChange={(e) => setWaketime(e.target.value)}
              className="mt-1 w-full text-sm px-2.5 py-2 rounded-lg outline-none"
              style={{ border: `1px solid ${CARD_BORDER}`, color: NAVY, backgroundColor: '#FDFCF8' }}
            />
          </label>
          <div className="col-span-2">
            <span className="text-[11px] font-medium" style={{ color: MUTED }}>
              How rested do you feel?
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((q) => {
                const active = quality !== null && q <= quality
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    aria-label={`${q} out of 5: ${QUALITY_LABELS[q]}`}
                    title={QUALITY_LABELS[q]}
                    className="flex items-center justify-center w-9 h-9 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: active ? NAVY : '#F1EDE3',
                    }}
                  >
                    <Moon
                      size={16}
                      style={{ color: active ? GOLD : '#C9C4B8' }}
                      fill={active ? GOLD : 'none'}
                    />
                  </button>
                )
              })}
              {quality !== null && (
                <span className="ml-2 text-xs" style={{ color: BODY_TEXT }}>
                  {QUALITY_LABELS[quality]}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything on your mind? (optional)"
            className="flex-1 min-w-[220px] text-sm px-3 py-2 rounded-lg outline-none"
            style={{ border: `1px solid ${CARD_BORDER}`, color: NAVY, backgroundColor: '#FDFCF8' }}
          />
          <button
            type="button"
            onClick={save}
            disabled={saving || (!bedtime && !waketime && quality === null && !note)}
            className="text-sm font-medium px-5 py-2 rounded-full text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: NAVY }}
          >
            {saving ? 'Saving...' : savedFlash ? 'Saved' : byDate[entryDate] ? 'Update entry' : 'Save entry'}
          </button>
          {savedFlash && (
            <span className="flex items-center gap-1 text-xs" style={{ color: SAGE }}>
              <Check size={13} strokeWidth={3} /> Sleep logged. Well done.
            </span>
          )}
          {error && (
            <span className="text-xs" style={{ color: ROSE }}>
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Trends */}
      <div className="px-5 sm:px-6 py-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-semibold" style={{ ...SERIF, color: NAVY }}>
            Your last two weeks
          </p>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: MUTED }}>
            <span>
              7-day sleep{' '}
              <strong style={{ color: NAVY }}>
                {stats.avgSleep !== null ? formatHours(stats.avgSleep) : '--'}
              </strong>
            </span>
            <span>
              7-day rest{' '}
              <strong style={{ color: NAVY }}>
                {stats.avgQuality !== null ? `${stats.avgQuality.toFixed(1)} / 5` : '--'}
              </strong>
            </span>
            <span>
              Streak{' '}
              <strong style={{ color: NAVY }}>
                {stats.streak} {stats.streak === 1 ? 'night' : 'nights'}
              </strong>
            </span>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-xs" style={{ color: MUTED }}>
            Loading your diary...
          </p>
        ) : entries.length === 0 ? (
          <p className="mt-6 text-xs" style={{ color: MUTED }}>
            No entries yet. Log your first night above and your sleep trends will
            appear here.
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-end gap-1.5 sm:gap-2 h-[120px]">
              {last14.map((day) => {
                const hours = day.entry ? sleepHours(day.entry) : null
                const q = day.entry?.quality ?? null
                const heightPct =
                  hours !== null ? Math.min(100, (hours / maxHours) * 100) : 0
                const barColor = q !== null ? QUALITY_COLORS[q] : '#D8D3C6'
                const tooltip = day.entry
                  ? `${day.date}: ${hours !== null ? formatHours(hours) : 'time not logged'}${q !== null ? `, ${QUALITY_LABELS[q].toLowerCase()}` : ''}${day.entry.note ? ` - "${day.entry.note}"` : ''}`
                  : `${day.date}: not logged`
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                    title={tooltip}
                  >
                    {day.entry && hours === null && (
                      <div
                        className="w-full max-w-[22px] rounded-full"
                        style={{ height: 8, backgroundColor: barColor }}
                      />
                    )}
                    {hours !== null && (
                      <div
                        className="w-full max-w-[22px] rounded-t-md"
                        style={{
                          height: `${Math.max(heightPct, 6)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    )}
                    {!day.entry && (
                      <div
                        className="w-full max-w-[22px] rounded-full"
                        style={{ height: 3, backgroundColor: '#EFEAE0' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-1.5 flex gap-1.5 sm:gap-2">
              {last14.map((day) => (
                <p
                  key={day.date}
                  className="flex-1 text-center text-[10px]"
                  style={{ color: day.date === today ? NAVY : MUTED }}
                >
                  {day.label}
                </p>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap text-[10px]" style={{ color: MUTED }}>
              <span>Bar height: time asleep.</span>
              <span className="flex items-center gap-1.5">
                Color: how rested
                {[1, 2, 3, 4, 5].map((q) => (
                  <span
                    key={q}
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: QUALITY_COLORS[q] }}
                    title={QUALITY_LABELS[q]}
                  />
                ))}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
