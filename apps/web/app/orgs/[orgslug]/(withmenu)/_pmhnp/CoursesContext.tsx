'use client'
// Read-through "sync" layer for the custom PMHNP UI.
//
// Course content (module titles, the interactive video, the note, the "In this
// lesson" outline, and the knowledge-check questions) lives as NATIVE LearnHouse
// objects in Postgres. Admins edit them in /dash; this provider reads them back
// live via GET /courses/course_{uuid}/meta and merges them over the static
// structure in theme.ts (which supplies purely presentational polish: the AI
// interaction badges, chapter "purpose" copy, CLARITY spine, catalog badges,
// and CE totals). Net effect: a /dash edit shows up on the member side on the
// next load, with no separate sync job -- the same pattern MomMastery uses.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCourseMetadata } from '@services/courses/courses'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { COURSES, CATALOG, catalogByUuid, CourseDef, ModuleDef, Chapter } from './theme'

type ParsedActivity = {
  title?: string
  video?: string
  note?: string
  outline: { num: number; title: string }[]
  questions: string[]
}

function textFromNode(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (Array.isArray(node.content)) return node.content.map(textFromNode).join('')
  return ''
}

// Parse the tiptap `content` doc written by seed_native_courses.py / edited in
// /dash back into the pieces the custom UI renders.
function parseActivity(doc: any, fallbackTitle: string): ParsedActivity {
  const out: ParsedActivity = { title: fallbackTitle, outline: [], questions: [] }
  if (!doc || !Array.isArray(doc.content)) return out
  let section: 'head' | 'note' | 'outline' | 'kc' = 'head'
  const noteParts: string[] = []

  for (const node of doc.content) {
    if (node.type === 'heading') {
      const t = textFromNode(node).trim()
      const tl = t.toLowerCase()
      if (tl.startsWith('in this lesson')) { section = 'outline'; continue }
      if (tl.startsWith('knowledge check')) { section = 'kc'; continue }
      if (node.attrs?.level === 2 && !fallbackTitle && t) out.title = t
      if (section === 'head') section = 'note'
      continue
    }
    if (node.type === 'blockEmbed') {
      const u = node.attrs?.embedUrl
      if (u) out.video = u
      if (section === 'head') section = 'note'
      continue
    }
    if (node.type === 'paragraph') {
      const t = textFromNode(node).trim()
      if (!t) continue
      if (section === 'outline') {
        const m = t.match(/^(\d+)\.\s*(.*)$/)
        if (m) out.outline.push({ num: parseInt(m[1], 10), title: m[2].trim() })
        else out.outline.push({ num: out.outline.length + 1, title: t })
      } else if (section === 'kc') {
        out.questions.push(t)
      } else {
        noteParts.push(t)
      }
      continue
    }
    if ((node.type === 'orderedList' || node.type === 'bulletList') && section === 'kc') {
      for (const li of node.content || []) {
        const t = textFromNode(li).trim()
        if (t) out.questions.push(t)
      }
      continue
    }
  }
  if (noteParts.length) out.note = noteParts.join('\n\n')
  return out
}

// Merge the native /meta payload for one course over its static CourseDef. The
// DB is authoritative for module count + editable text; static supplies the
// per-chapter `purpose`/`ai` polish (matched by position) and course slug/code.
function mergeCourse(staticCourse: CourseDef, meta: any): CourseDef {
  const acts: any[] = (meta?.chapters || []).flatMap((ch: any) => ch?.activities || [])
  if (!acts.length) return staticCourse

  const modules: ModuleDef[] = acts.map((a, i) => {
    const sm = staticCourse.modules[i]
    const p = parseActivity(a?.content, a?.name || sm?.title || '')
    const base: ModuleDef = sm || {
      index: i + 1,
      id: `${staticCourse.slug}-m${i + 1}`,
      slug: `${staticCourse.slug}-m${i + 1}`,
      tag: '',
      title: '',
      chapters: [],
      knowledge_check: { pass_mark: 70, questions: [] },
    }
    const chapters: Chapter[] = p.outline.length
      ? p.outline.map((o, ci) => ({
          ...(base.chapters[ci] || { num: o.num, title: '', purpose: '' }),
          num: o.num,
          title: o.title || base.chapters[ci]?.title || '',
        }))
      : base.chapters
    return {
      ...base,
      index: i + 1,
      title: p.title || base.title,
      video: p.video ?? base.video,
      note: p.note ?? base.note,
      chapters,
      knowledge_check: {
        ...base.knowledge_check,
        questions: p.questions.length ? p.questions : base.knowledge_check.questions,
      },
    }
  })

  return {
    ...staticCourse,
    title: meta?.name || staticCourse.title,
    total_modules: modules.length,
    modules,
  }
}

type CoursesCtx = {
  courses: CourseDef[]
  courseBySlug: (slug: string) => CourseDef | undefined
  moduleByIndex: (slug: string, index: number) => ModuleDef | undefined
  loading: boolean
}

const Ctx = createContext<CoursesCtx | null>(null)

export function PmhnpCoursesProvider({ children }: { children: React.ReactNode }) {
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token
  // Seed from the static structure so the first paint is instant and never
  // crashes on `courseBySlug(...)!`; live DB data replaces it once fetched.
  const [courses, setCourses] = useState<CourseDef[]>(COURSES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const results = await Promise.all(
        CATALOG.map(async (cat) => {
          try {
            const meta = await getCourseMetadata(cat.course_uuid, {}, accessToken)
            const staticCourse = COURSES.find((c) => c.slug === cat.slug)
            if (!staticCourse) return null
            return mergeCourse(staticCourse, meta)
          } catch {
            return COURSES.find((c) => c.slug === cat.slug) || null
          }
        })
      )
      if (cancelled) return
      const merged = results.filter(Boolean) as CourseDef[]
      // preserve CATALOG order and fall back to static for any that failed
      const ordered = CATALOG.map(
        (cat) =>
          merged.find((c) => c.slug === cat.slug) ||
          COURSES.find((c) => c.slug === cat.slug)
      ).filter(Boolean) as CourseDef[]
      setCourses(ordered)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const value = useMemo<CoursesCtx>(() => {
    const bySlug = new Map(courses.map((c) => [c.slug, c]))
    return {
      courses,
      loading,
      courseBySlug: (slug: string) => bySlug.get(slug),
      moduleByIndex: (slug: string, index: number) =>
        bySlug.get(slug)?.modules.find((m) => m.index === index),
    }
  }, [courses, loading])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCourses(): CoursesCtx {
  const ctx = useContext(Ctx)
  if (!ctx) {
    // Fallback to static data if a consumer renders outside the provider.
    const bySlug = new Map(COURSES.map((c) => [c.slug, c]))
    return {
      courses: COURSES,
      loading: false,
      courseBySlug: (slug: string) => bySlug.get(slug),
      moduleByIndex: (slug: string, index: number) =>
        bySlug.get(slug)?.modules.find((m) => m.index === index),
    }
  }
  return ctx
}
