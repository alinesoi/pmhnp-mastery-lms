'use client'
import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { useOrg } from '@components/Contexts/OrgContext'
import { getUriWithOrg } from '@services/config/config'
import { getCertificate, getMyProgress } from '@services/progress/progress'
import { Award, Printer, ArrowLeft } from 'lucide-react'
import {
  SERIF, PLUM, PLUM_DEEP, PURPLE, PERI, GOLD, CARD_BORDER, INK, MUTED,
  catalogBySlug, courseBySlug,
} from '../../(withmenu)/_pmhnp/theme'

export default function CertificatePage(props: { params: Promise<{ orgslug: string; courseslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const courseslug = params.courseslug

  const session = useLHSession() as any
  const org = useOrg() as any
  const accessToken = session?.data?.tokens?.access_token

  const catalog = catalogBySlug(courseslug)
  const course = courseBySlug(courseslug)

  const sessionName = `${session?.data?.user?.first_name || ''} ${session?.data?.user?.last_name || ''}`.trim()

  const [cert, setCert] = useState<any>(null)
  const [eligible, setEligible] = useState<boolean | null>(null)

  useEffect(() => {
    if (!accessToken || !course) return
    getCertificate(accessToken, courseslug).then((res: any) => {
      if (res?.status === 200 && res?.data) setCert(res.data)
    }).catch(() => {})
    getMyProgress(accessToken, courseslug).then((res: any) => {
      if (res?.status === 200 && res?.data?.summary) {
        setEligible(!!res.data.summary.certificate_eligible)
      } else {
        setEligible(false)
      }
    }).catch(() => setEligible(false))
  }, [accessToken, courseslug, course])

  if (!course || !catalog) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p style={{ color: MUTED }}>Certificate not found.</p>
      </div>
    )
  }

  const learnerName = cert?.learner_name || sessionName || 'PMHNP Learner'
  const orgName = org?.name || 'PMHNP Mastery Academy'
  const accreditation = cert?.accreditation || 'Pinnacle Education (accreditation pending review)'
  const issuedDate = cert?.created_at
    ? new Date(cert.created_at)
    : new Date()
  const dateStr = issuedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const certId = cert?.certificate_uuid || cert?.user_certification_uuid || null

  const notEligible = eligible === false && !cert

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .cert-print-area, .cert-print-area * { visibility: visible !important; }
          .cert-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { size: landscape; margin: 0; }
        }
      `}</style>

      <div className="min-h-[calc(100vh-56px)] py-8 px-4 sm:px-8" style={{ backgroundColor: '#efeaf6' }}>
        <div className="max-w-4xl mx-auto">
          {/* action bar (not printed) */}
          <div className="no-print flex items-center justify-between gap-3 mb-6">
            <Link href={getUriWithOrg(orgslug, '/progress')} className="inline-flex items-center gap-1.5 text-sm" style={{ color: PURPLE }}>
              <ArrowLeft size={15} /> Back to progress
            </Link>
            {!notEligible && (
              <button type="button" onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: PLUM, color: '#ffffff' }}>
                <Printer size={15} /> Print / Save as PDF
              </button>
            )}
          </div>

          {notEligible ? (
            <div className="bg-white shadow-sm px-8 py-12 text-center" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
              <p className="pmhnp-serif text-xl font-semibold" style={{ ...SERIF, color: PLUM }}>Certificate not yet available</p>
              <p className="mt-2 text-sm" style={{ color: INK }}>
                Pass all {course.total_modules} modules of {course.title} to unlock your certificate.
              </p>
              <Link href={getUriWithOrg(orgslug, `/course/${courseslug}`)}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: PURPLE }}>
                Continue course
              </Link>
            </div>
          ) : (
            /* THE CERTIFICATE */
            <div className="cert-print-area bg-white shadow-lg mx-auto"
              style={{ border: `2px solid ${PLUM}`, borderRadius: 8, padding: 0, aspectRatio: '297 / 210', maxWidth: 960 }}>
              <div className="w-full h-full flex flex-col items-center justify-center text-center"
                style={{ border: `1px solid ${GOLD}`, margin: 12, height: 'calc(100% - 24px)', width: 'calc(100% - 24px)', padding: '5% 8%' }}>

                <p className="text-xs sm:text-sm font-semibold uppercase" style={{ color: PURPLE, letterSpacing: '0.28em' }}>
                  {orgName}
                </p>

                <div className="mt-4 flex items-center justify-center w-14 h-14 rounded-full" style={{ backgroundColor: 'rgba(124,159,214,0.18)' }}>
                  <Award size={30} style={{ color: GOLD }} />
                </div>

                <h1 className="pmhnp-serif mt-4 text-2xl sm:text-4xl font-semibold" style={{ ...SERIF, color: PLUM_DEEP }}>
                  Certificate of Completion
                </h1>

                <p className="mt-5 text-xs sm:text-sm" style={{ color: MUTED }}>This certifies that</p>
                <p className="pmhnp-serif mt-1 text-xl sm:text-3xl font-semibold" style={{ ...SERIF, color: PLUM }}>
                  {learnerName}
                </p>

                <p className="mt-4 text-xs sm:text-sm max-w-xl" style={{ color: INK }}>
                  has successfully completed all {course.total_modules} modules of
                </p>
                <p className="pmhnp-serif mt-1 text-lg sm:text-2xl font-semibold" style={{ ...SERIF, color: PURPLE }}>
                  {course.title}
                </p>

                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: GOLD }}>
                  <Award size={16} /> {catalog.ce_total} CE Contact Hours
                </p>

                {/* footer row */}
                <div className="mt-auto w-full flex items-end justify-between pt-6 text-left" style={{ gap: 24 }}>
                  <div>
                    <p className="text-[11px] sm:text-xs font-semibold" style={{ color: PLUM }}>{dateStr}</p>
                    <div className="mt-1 w-32 border-t" style={{ borderColor: CARD_BORDER }} />
                    <p className="mt-1 text-[10px] sm:text-[11px]" style={{ color: MUTED }}>Date of issue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-[11px]" style={{ color: MUTED }}>Accredited by</p>
                    <p className="text-[11px] sm:text-xs font-semibold mt-0.5 max-w-[220px]" style={{ color: PLUM }}>{accreditation}</p>
                  </div>
                  <div className="text-right">
                    <p className="pmhnp-serif text-base sm:text-lg" style={{ ...SERIF, color: PERI }}>LuAnn Damiani-Grochowski</p>
                    <div className="mt-1 w-32 border-t ml-auto" style={{ borderColor: CARD_BORDER }} />
                    <p className="mt-1 text-[10px] sm:text-[11px]" style={{ color: MUTED }}>Program Director</p>
                  </div>
                </div>

                {certId && (
                  <p className="mt-3 text-[9px]" style={{ color: MUTED }}>Certificate ID: {certId}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
