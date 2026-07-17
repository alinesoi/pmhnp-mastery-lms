'use client'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getUriWithOrg } from '@services/config/config'
import { getAllProgress, getMyProgress, getCertificate, AllProgressResponse, ProgressResponse } from '@services/progress/progress'
import { Award, Check, Lock, ArrowRight, GraduationCap, BadgeCheck, Download } from 'lucide-react'
import {
  SERIF, PLUM, PLUM_DEEP, PURPLE, PERI, MAGENTA, GOLD, LILAC, CARD_BORDER, INK, MUTED,
  CATALOG, courseBySlug, catalogBySlug, TILE, FINAL_PASS_MARK, TAGLINE,
} from '../_pmhnp/theme'

export default function ProgressPage(props: { params: Promise<{ orgslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  const learnerName = `${session?.data?.user?.first_name || ''} ${session?.data?.user?.last_name || ''}`.trim() || 'PMHNP Learner'

  const [all, setAll] = useState<AllProgressResponse | null>(null)
  const [detail, setDetail] = useState<Record<string, ProgressResponse>>({})
  const [certs, setCerts] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!accessToken) return
    getAllProgress(accessToken).then((res: any) => {
      if (res?.status === 200 && res?.data) setAll(res.data)
    }).catch(() => {})
    // per-course detail + certificate shells
    CATALOG.forEach((cat) => {
      getMyProgress(accessToken, cat.slug).then((res: any) => {
        if (res?.status === 200 && res?.data) setDetail((d) => ({ ...d, [cat.slug]: res.data }))
      }).catch(() => {})
      getCertificate(accessToken, cat.slug).then((res: any) => {
        if (res?.status === 200 && res?.data) setCerts((c) => ({ ...c, [cat.slug]: res.data }))
      }).catch(() => {})
    })
  }, [accessToken])

  const ceEarned = all?.ce_earned_total ?? 0
  const ceAvailable = all?.ce_available_total ?? CATALOG.reduce((a, c) => a + c.ce_total, 0)
  const byCourse = new Map((all?.courses ?? []).map((s) => [s.course_slug, s]))
  const totalModules = CATALOG.reduce((a, c) => a + (courseBySlug(c.slug)?.total_modules ?? 0), 0)
  const totalPassed = (all?.courses ?? []).reduce((a, s) => a + s.passed_count, 0)
  const overallPct = totalModules > 0 ? Math.round((100 * totalPassed) / totalModules) : 0

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
        <p className="text-sm font-medium" style={{ color: PURPLE }}>Progress &amp; Certificate</p>
        <h1 className="pmhnp-serif mt-1 text-3xl sm:text-4xl leading-tight font-semibold" style={{ ...SERIF, color: PLUM }}>
          Your Personal Training Record
        </h1>
        <p className="mt-3 text-base max-w-2xl" style={{ color: INK }}>
          Track module completion and CE contact hours across all three courses, and issue each
          certificate once its modules are passed.
        </p>

        {/* summary tiles */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white px-5 py-4 shadow-sm" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
            <p className="text-[12px]" style={{ color: MUTED }}>Overall completion</p>
            <p className="pmhnp-serif mt-1 text-2xl font-semibold" style={{ ...SERIF, color: PLUM }}>{overallPct}%</p>
            <p className="text-[12px]" style={{ color: MUTED }}>{totalPassed} of {totalModules} modules passed</p>
          </div>
          <div className="bg-white px-5 py-4 shadow-sm" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
            <p className="text-[12px]" style={{ color: MUTED }}>CE contact hours</p>
            <p className="pmhnp-serif mt-1 text-2xl font-semibold inline-flex items-center gap-1.5" style={{ ...SERIF, color: GOLD }}>
              <Award size={20} /> {ceEarned}
            </p>
            <p className="text-[12px]" style={{ color: MUTED }}>of {ceAvailable} total hours</p>
          </div>
          <div className="bg-white px-5 py-4 shadow-sm" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
            <p className="text-[12px]" style={{ color: MUTED }}>Final assessment</p>
            <p className="pmhnp-serif mt-1 text-2xl font-semibold" style={{ ...SERIF, color: PLUM }}>{FINAL_PASS_MARK}%</p>
            <p className="text-[12px]" style={{ color: MUTED }}>target to certify (in production)</p>
          </div>
        </div>

        {/* Per-course record + certificate shells */}
        {CATALOG.map((cat) => {
          const course = courseBySlug(cat.slug)!
          const s = byCourse.get(cat.slug)
          const cert = certs[cat.slug]
          const eligible = s?.certificate_eligible ?? false
          const rows = detail[cat.slug]?.modules ?? []
          const byIndex = new Map(rows.map((r) => [r.module_index, r]))
          const tile = TILE[cat.color]
          return (
            <div key={cat.slug} className="mt-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 font-bold text-[12px]"
                  style={{ backgroundColor: tile.bg, color: tile.fg, ...SERIF }}>
                  {cat.code === 'E.D.I.T.' ? 'EDIT' : cat.code}
                </div>
                <h2 className="pmhnp-serif text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>{course.title}</h2>
              </div>

              {/* certificate card */}
              <div className="mt-3 rounded-2xl px-6 py-5" style={{ backgroundColor: eligible ? PLUM : '#ffffff', border: eligible ? 'none' : `1px solid ${CARD_BORDER}` }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: eligible ? PERI : GOLD }}>
                      <GraduationCap size={15} /> Certificate of Completion
                    </p>
                    <p className="pmhnp-serif mt-2 text-lg font-semibold" style={{ ...SERIF, color: eligible ? '#efe9fb' : PLUM }}>
                      {course.title}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: eligible ? 'rgba(239,233,251,0.78)' : INK }}>
                      {eligible
                        ? `Awarded to ${cert?.learner_name || learnerName}. ${cat.ce_total} CE contact hours.`
                        : `Pass all ${course.total_modules} modules to unlock. ${s?.passed_count ?? 0} of ${course.total_modules} done.`}
                    </p>
                    <p className="mt-2 text-[11.5px] inline-flex items-center gap-1.5" style={{ color: eligible ? 'rgba(239,233,251,0.6)' : MUTED }}>
                      <BadgeCheck size={12} /> {cert?.accreditation || 'Pinnacle Education (accreditation pending review)'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl shrink-0" style={{ backgroundColor: eligible ? 'rgba(124,159,214,0.22)' : TILE.gold.bg }}>
                    {eligible ? <Award size={30} style={{ color: PERI }} /> : <Lock size={26} style={{ color: GOLD }} />}
                  </div>
                </div>
                {eligible ? (
                  <button type="button"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: PERI, color: PLUM_DEEP }}>
                    <Download size={15} /> Download certificate (in production)
                  </button>
                ) : (
                  <Link href={getUriWithOrg(orgslug, `/course/${cat.slug}`)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: PURPLE }}>
                    Continue course <ArrowRight size={15} />
                  </Link>
                )}
              </div>

              {/* per-module record */}
              <div className="mt-3 space-y-2">
                {course.modules.map((m) => {
                  const row = byIndex.get(m.index)
                  const passed = !!row?.passed
                  const score = row?.check_score
                  return (
                    <div key={m.slug} className="bg-white px-5 py-3 shadow-sm flex items-center gap-4"
                      style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 14 }}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: passed ? TILE.green.bg : tile.bg }}>
                        {passed ? <Check size={15} style={{ color: TILE.green.fg }} strokeWidth={3} /> : <span className="text-[12px] font-bold" style={{ color: tile.fg }}>{m.index}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: PLUM }}>{m.title}</p>
                        <p className="text-[12px]" style={{ color: MUTED }}>
                          {passed ? `Passed${typeof score === 'number' ? ` · best score ${score}%` : ''}` : 'Not yet passed'}
                        </p>
                      </div>
                      <Link href={getUriWithOrg(orgslug, `/module/${cat.slug}/${m.index}`)} className="text-sm font-medium shrink-0" style={{ color: PURPLE }}>
                        {passed ? 'Review' : 'Open'}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* CE transcript */}
        <h2 className="pmhnp-serif mt-10 text-lg font-semibold" style={{ ...SERIF, color: PLUM }}>CE transcript</h2>
        <div className="mt-3 bg-white shadow-sm overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 16 }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#f3eefb', color: MUTED }}>
                <th className="text-left font-semibold px-5 py-2.5 text-[12px] uppercase tracking-wide">Course</th>
                <th className="text-right font-semibold px-5 py-2.5 text-[12px] uppercase tracking-wide">Earned</th>
                <th className="text-right font-semibold px-5 py-2.5 text-[12px] uppercase tracking-wide">Available</th>
              </tr>
            </thead>
            <tbody>
              {CATALOG.map((cat) => {
                const s = byCourse.get(cat.slug)
                return (
                  <tr key={cat.slug} style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                    <td className="px-5 py-3" style={{ color: PLUM }}>{courseBySlug(cat.slug)?.title}</td>
                    <td className="px-5 py-3 text-right font-semibold" style={{ color: GOLD }}>{s?.ce_earned ?? 0}</td>
                    <td className="px-5 py-3 text-right" style={{ color: MUTED }}>{cat.ce_total}</td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: `2px solid ${CARD_BORDER}`, backgroundColor: '#faf8fd' }}>
                <td className="px-5 py-3 font-semibold" style={{ color: PLUM }}>Total</td>
                <td className="px-5 py-3 text-right font-bold" style={{ color: GOLD }}>{ceEarned}</td>
                <td className="px-5 py-3 text-right font-semibold" style={{ color: MUTED }}>{ceAvailable}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs" style={{ color: MUTED }}>
          CE contact hours accrue as you pass modules. The final assessment, certificate issuance, and
          the official CE transcript export are scaffolded here and finalized in production once Pinnacle
          Education completes its accreditation review.
        </p>
      </div>
    </div>
  )
}
