'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { Users, Plus, Sparkles, Heart, X } from 'lucide-react'
import { SERIF, NAVY, GOLD, CARD, CARD_BORDER, BODY_TEXT, MUTED, TILE } from '../_mmu/theme'

type Campus = {
  id: string
  name: string
  forWho: string
  creator: string
  members: number
  seeded?: boolean
}

const STORAGE_KEY = 'mmu_campuses'

const SEED: Campus[] = [
  { id: 'seed-special-needs', name: 'Moms of Special-Needs Kids', forWho: 'For mamas navigating therapies, IEPs, and fierce love.', creator: 'Hannah', members: 214, seeded: true },
  { id: 'seed-toddlers', name: 'Tired Toddler Moms', forWho: 'For the ones in the trenches of nap strikes and big feelings.', creator: 'Hannah', members: 389, seeded: true },
]

const TILES = [TILE.rose, TILE.teal, TILE.gold, TILE.navy, TILE.plum, TILE.sage]

function loadCampuses(): Campus[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return SEED
}

function CreateCampusModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (name: string, forWho: string) => void
}) {
  const [name, setName] = useState('')
  const [forWho, setForWho] = useState('')
  if (!open) return null
  const canSubmit = name.trim().length > 1
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(22,40,63,0.45)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-7 shadow-xl" style={{ backgroundColor: CARD }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: GOLD }}>Start a campus</p>
            <h3 className="mt-1 text-xl font-semibold" style={{ ...SERIF, color: NAVY }}>Gather your people</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-black/5">
            <X size={18} style={{ color: MUTED }} />
          </button>
        </div>
        <p className="mt-2 text-[13px]" style={{ color: BODY_TEXT }}>
          Create a space for moms in your season. Hannah will welcome each new member as they join.
        </p>

        <label className="block mt-5 text-[13px] font-semibold" style={{ color: NAVY }}>Campus name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Homeschooling Mamas"
          className="mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ border: `1px solid ${CARD_BORDER}`, color: BODY_TEXT }}
        />

        <label className="block mt-4 text-[13px] font-semibold" style={{ color: NAVY }}>Who is it for?</label>
        <input
          type="text"
          value={forWho}
          onChange={(e) => setForWho(e.target.value)}
          placeholder="e.g. For moms teaching at home and craving community"
          className="mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ border: `1px solid ${CARD_BORDER}`, color: BODY_TEXT }}
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold"
            style={{ border: `1px solid ${CARD_BORDER}`, color: NAVY, backgroundColor: 'transparent' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => { onCreate(name.trim(), forWho.trim()); setName(''); setForWho('') }}
            className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: canSubmit ? GOLD : '#C9C4B8' }}
          >
            Create campus
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MomCampuses() {
  const session = useLHSession() as any
  const firstName: string = session?.data?.user?.first_name || 'You'
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => { setCampuses(loadCampuses()) }, [])

  const persist = (next: Campus[]) => {
    setCampuses(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const createCampus = (name: string, forWho: string) => {
    const next: Campus[] = [
      { id: `c-${Date.now()}`, name, forWho: forWho || 'A space for moms like you.', creator: firstName, members: 1 },
      ...campuses,
    ]
    persist(next)
    setModalOpen(false)
  }

  const tileFor = useMemo(() => (i: number) => TILES[i % TILES.length], [])

  return (
    <div className="mb-10">
      <div className="rounded-3xl px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center gap-5 justify-between" style={{ backgroundColor: NAVY }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#E7C27D' }}>Community</p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-semibold" style={{ ...SERIF, color: '#F7F3EB' }}>Campuses</h2>
          <p className="mt-2 text-sm max-w-xl" style={{ color: 'rgba(247,243,235,0.72)' }}>
            Start a campus for moms in your exact season, from special-needs parenting to homeschooling to tough
            toddler years. When someone joins, Hannah introduces them so no one walks in alone.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shrink-0"
          style={{ backgroundColor: GOLD, color: '#FFFFFF' }}
        >
          <Plus size={16} /> Start a campus
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campuses.map((c, i) => {
          const tile = tileFor(i)
          return (
            <div key={c.id} className="flex flex-col gap-3 p-5 shadow-sm" style={{ backgroundColor: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style={{ backgroundColor: tile.bg }}>
                  <Users size={20} style={{ color: tile.fg }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold truncate" style={{ color: NAVY }}>{c.name}</p>
                  <p className="text-[12px]" style={{ color: MUTED }}>{c.members.toLocaleString()} member{c.members === 1 ? '' : 's'}</p>
                </div>
              </div>
              <p className="text-[13px] leading-snug" style={{ color: BODY_TEXT }}>{c.forWho}</p>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: GOLD }}>
                  <Sparkles size={13} /> Hannah welcomes new members
                </span>
                {c.seeded ? (
                  <span className="text-[11px]" style={{ color: MUTED }}>Featured</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: MUTED }}>
                    <Heart size={11} style={{ color: '#BE7A5F' }} /> by {c.creator}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <CreateCampusModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={createCampus} />
    </div>
  )
}
