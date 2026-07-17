'use client'
import React from 'react'
import Link from 'next/link'
import { getUriWithOrg } from '@services/config/config'
import { ArrowRight, Award, BadgeCheck, BookOpen, Sparkles } from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, MAGENTA, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  CATALOG, courseBySlug, TILE, TAGLINE,
} from '../_pmhnp/theme'

export default function Courses({ orgslug }: { orgslug: string }) {
  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <p className="text-sm font-medium" style={{ color: PURPLE }}>Course Catalog</p>
        <h1 className="pmhnp-serif mt-1 text-3xl sm:text-4xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>
          PMHNP Mastery Academy
        </h1>
        <p className="mt-3 text-base max-w-2xl" style={{ color: INK }}>
          Two flagship blueprints and a focused mini course, built on structured, evidence-based
          frameworks for psychiatric assessment, treatment, and safe deprescribing.
        </p>
        <p className="pmhnp-serif mt-2 text-[15px] italic" style={{ ...SERIF, color: MAGENTA }}>
          {TAGLINE}
        </p>

        <div className="mt-8 space-y-4">
          {CATALOG.map((cat) => {
            const course = courseBySlug(cat.slug)
            const tile = TILE[cat.color]
            const isMini = cat.badge === 'MINI COURSE'
            return (
              <Link key={cat.slug} href={getUriWithOrg(orgslug, `/course/${cat.slug}`)}
                className="block bg-white shadow-sm transition-all hover:shadow-md"
                style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
                <div className="flex items-stretch">
                  <div className="w-2 rounded-l-[18px]" style={{ backgroundColor: tile.fg }} />
                  <div className="flex-1 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 font-bold text-[15px]"
                          style={{ backgroundColor: tile.bg, color: tile.fg, ...SERIF }}>
                          {cat.code === 'E.D.I.T.' ? 'EDIT' : cat.code}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
                              style={{ backgroundColor: isMini ? TILE.magenta.bg : TILE.purple.bg, color: isMini ? TILE.magenta.fg : TILE.purple.fg }}>
                              {isMini ? <Sparkles size={11} /> : <BookOpen size={11} />} {cat.badge}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
                              style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
                              <BadgeCheck size={11} /> Accredited CE
                            </span>
                            <span className="text-[11px] font-medium" style={{ color: MUTED }}>{cat.level}</span>
                          </div>
                          <p className="pmhnp-serif mt-2 text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>
                            {course?.title}
                          </p>
                          <p className="mt-1 text-sm max-w-xl leading-relaxed" style={{ color: INK }}>
                            {cat.blurb}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: MUTED }}>
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: TILE.gold.bg, color: TILE.gold.fg }}>
                              <Award size={12} /> {cat.ce_total} CE contact hours
                            </span>
                            <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: '#f1ecf9' }}>
                              {course?.total_modules} modules
                            </span>
                            <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: '#f1ecf9' }}>
                              Sequential unlock, 70% checks
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium shrink-0 self-center" style={{ color: PURPLE }}>
                        Open <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <p className="mt-8 text-xs" style={{ color: MUTED }}>
          Accreditation is pending Pinnacle Education review of the full courses. Every module is built
          exportable (video, deck, script, audio) and carries learning objectives, outcomes, and an
          evaluation form.
        </p>
      </div>
    </div>
  )
}
