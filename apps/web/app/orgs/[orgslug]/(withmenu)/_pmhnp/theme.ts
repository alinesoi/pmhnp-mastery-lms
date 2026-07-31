// PMHNP Mastery Academy brand tokens + three-course catalog data.
// Derived from DESIGN_SPEC.md (deep plum-navy sidebar, brand purple, periwinkle,
// magenta accent, pale lilac page bg). Calm, clinical, credible, warm-but-authoritative.
// Single source of truth for course structure: _pmhnp/courses.json (from LuAnn's
// data.js, cross-checked vs her Gamma decks + Drive Knowledge Bank).
import React from 'react'
import data from './courses.json'

export const SERIF: React.CSSProperties = {
  fontFamily: "'Fraunces', 'Georgia', serif",
}

// Core palette (DESIGN_SPEC brand token table)
export const PLUM = '#2a1e4a'       // deep plum-navy sidebar / headings
export const PLUM_DEEP = '#1f1638'
export const PLUM_SOFT = '#38295e'
export const PURPLE = '#5b3d8c'     // primary buttons, links, active nav
export const PURPLE_ALT = '#6d4aa6'
export const PERI = '#7c9fd6'       // periwinkle: secondary accents, progress fills
export const PERI_ALT = '#5f86c6'
export const MAGENTA = '#b0568a'    // AI badges, highlights, CTA hover
export const MAGENTA_ALT = '#96406f'
export const GOLD = '#c08a3e'       // CE / certificate accents (warm, credible)
export const GOLD_HOVER = '#a26f26'
export const GREEN = '#3f9d76'      // passed / completed
export const GREEN_ALT = '#2c7d5c'
export const LILAC = '#f6f3fb'      // page background, tiles
export const LILAC_ALT = '#e7dff5'
export const CARD = '#ffffff'
export const CARD_BORDER = '#e5ddf1'
export const INK = '#1f1830'        // body text
// Concept A: darkened from #6b6280 toward WCAG AA on white/lilac (~6.5:1).
export const MUTED = '#585065'
export const CREAM = LILAC          // alias so shared page code reads naturally

// ---- Concept A ("Refined & airy") shared design language ------------------
// One spacing / type / card system applied across every learner screen so the
// pages share a single rhythm. Purely additive: nothing above changes meaning,
// only MUTED was darkened for contrast. Import these where a screen needs them.

// Spacing scale (px): section gaps, card padding, stack gaps.
export const SPACE = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const

// Corner radii — one soft family everywhere.
export const RADIUS = { sm: 12, md: 16, lg: 20, pill: 999 } as const

// Elevation — subtle and layered, never heavy.
export const SHADOW = {
  card: '0 1px 2px rgba(31,24,48,0.04), 0 6px 20px rgba(31,24,48,0.06)',
  cardHover: '0 2px 6px rgba(31,24,48,0.06), 0 14px 34px rgba(31,24,48,0.10)',
  focus: '0 0 0 3px rgba(91,61,140,0.30)',
} as const

// Comfortable reading column so pages breathe.
export const CONTENT_MAX = 1040

// One card style everywhere (softer radius, subtle shadow, consistent border).
export const CARD_STYLE: React.CSSProperties = {
  background: CARD,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: RADIUS.lg,
  boxShadow: SHADOW.card,
}

// Airy page shell for learner routes.
export const PAGE_STYLE: React.CSSProperties = {
  maxWidth: CONTENT_MAX,
  margin: '0 auto',
  padding: '44px 40px 64px',
}

// Serif heading helpers — a stronger, consistent type scale.
export const H1: React.CSSProperties = { ...SERIF, color: PLUM, fontWeight: 600, fontSize: 36, lineHeight: 1.12 }
export const H2: React.CSSProperties = { ...SERIF, color: PLUM, fontWeight: 600, fontSize: 22, lineHeight: 1.25 }
export const EYEBROW: React.CSSProperties = { color: PURPLE, fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }

// Actions — one obvious primary per screen; secondary is quieter.
export const BTN_PRIMARY: React.CSSProperties = {
  background: PURPLE, color: '#fff', fontWeight: 600, fontSize: 15,
  borderRadius: RADIUS.md, padding: '12px 22px', border: 'none', cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(91,61,140,0.28)', display: 'inline-flex',
  alignItems: 'center', gap: 8, transition: 'filter .15s, box-shadow .15s',
}
export const BTN_SECONDARY: React.CSSProperties = {
  background: '#fff', color: PURPLE, fontWeight: 600, fontSize: 15,
  borderRadius: RADIUS.md, padding: '11px 20px', border: `1px solid ${CARD_BORDER}`,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
}

// LuAnn's tagline — she asked for this across all materials + the login page.
export const TAGLINE = 'Think Critically. Diagnose Confidently. Prescribe with Purpose.'

// Soft tiles for option cards / icons
export const TILE = {
  purple: { bg: '#ece3f8', fg: '#5b3d8c' },
  peri: { bg: '#e4ecf9', fg: '#3f66a8' },
  magenta: { bg: '#f6e4ef', fg: '#96406f' },
  gold: { bg: '#f6ecd9', fg: '#a26f26' },
  green: { bg: '#dff0e8', fg: '#2c7d5c' },
  plum: { bg: '#e6e0f0', fg: '#2a1e4a' },
  slate: { bg: '#eee9f5', fg: '#5a5170' },
}

// ---- Course catalog types (single source of truth: _pmhnp/courses.json) ----
export type AiFlag = { kind: string; desc: string }
export type Chapter = {
  num: number
  title: string
  purpose: string
  visual?: string
  interaction?: string
  ai?: AiFlag | null
  in_production?: boolean
}
export type KnowledgeCheck = {
  pass_mark: number
  questions: string[]
  in_production?: boolean
  note?: string
}
export type ModuleDef = {
  index: number
  id: string
  slug: string
  tag: string
  title: string
  note?: string
  // Full play URL of the module's interactive video on app-video.nesoi.ai.
  // Present only for modules whose video has been produced; embedded as an iframe.
  video?: string
  chapters: Chapter[]
  knowledge_check: KnowledgeCheck
}
export type CourseDef = {
  slug: string
  code: string
  title: string
  ce_total: number
  total_modules: number
  modules: ModuleDef[]
}

export const COURSES: CourseDef[] = (data as any).courses

// Catalog display metadata (blurbs, badges, lock state) layered on top of the
// structural courses.json. DAB is the flagship + unlocked; TAB seeded; E.D.I.T.
// is the mini pilot. All three visible by default.
export type CatalogMeta = {
  slug: string
  code: string
  badge: string           // "CORE PROGRAM" | "MINI COURSE"
  level: string           // "Intermediate" | "Advanced" | "Foundational"
  blurb: string
  status: 'unlocked' | 'coming-soon'
  ce_total: number
  color: keyof typeof TILE
  // UUID of the native LearnHouse course in Postgres (from seed_native_courses.py
  // -> seed_map.json). The custom UI reads live content for this course via
  // GET /courses/course_{uuid}/meta, so /dash edits sync to the member side.
  // Stable across /dash renames (unlike name/slug), which is why we key on it.
  course_uuid: string
}

export const CATALOG: CatalogMeta[] = [
  {
    slug: 'diagnostic-accuracy-blueprint',
    code: 'DAB',
    badge: 'CORE PROGRAM',
    level: 'Intermediate',
    blurb:
      'Sharpen diagnostic precision through a structured, evidence-based framework. Improve accuracy, confidence, and patient outcomes in psychiatric assessment — powered by the CLARITY Method.',
    status: 'unlocked',
    ce_total: 15,
    color: 'purple',
    course_uuid: '8bcfa06d-3829-4dd9-9980-45bf10177dee',
  },
  {
    slug: 'treatment-accuracy-blueprint',
    code: 'TAB',
    badge: 'CORE PROGRAM',
    level: 'Intermediate',
    blurb:
      'Select the right treatment with confidence. An evidence-informed approach to psychopharmacology, integrative strategies, and measurable outcomes — the sister course to DAB.',
    status: 'unlocked',
    ce_total: 15,
    color: 'peri',
    course_uuid: 'fca88a0e-fc30-44dc-ae21-b74a1c79d74c',
  },
  {
    slug: 'edit-protocol',
    code: 'E.D.I.T.',
    badge: 'MINI COURSE',
    level: 'Advanced',
    blurb:
      'A practical, patient-centered framework for evaluating, deprescribing, and minimizing psychotropic polypharmacy safely and effectively. Evaluate → Discuss → Initiate → Track.',
    status: 'unlocked',
    ce_total: 3,
    color: 'magenta',
    course_uuid: '11a0d510-e00a-4731-9b1e-87edb0c8cc29',
  },
]

export function catalogByUuid(uuid: string): CatalogMeta | undefined {
  return CATALOG.find((c) => c.course_uuid === uuid)
}

export const PASS_MARK = 70
export const FINAL_PASS_MARK = 80

export function courseBySlug(slug: string): CourseDef | undefined {
  return COURSES.find((c) => c.slug === slug)
}
export function catalogBySlug(slug: string): CatalogMeta | undefined {
  return CATALOG.find((c) => c.slug === slug)
}
export function moduleByIndex(courseSlug: string, index: number): ModuleDef | undefined {
  return courseBySlug(courseSlug)?.modules.find((m) => m.index === index)
}

// The CLARITY Method spine — the signature DAB course map (mockup 06).
export type ClarityNode = { letter: string; word: string; sub: string }
export const CLARITY: ClarityNode[] = [
  { letter: 'C', word: 'Clarify', sub: 'context' },
  { letter: 'L', word: 'Locate', sub: 'timeline' },
  { letter: 'A', word: 'Assess', sub: 'anchors' },
  { letter: 'R', word: 'Rule out', sub: 'red flags' },
  { letter: 'I', word: 'Integrate', sub: 'patterns' },
  { letter: 'T', word: 'Translate', sub: 'to plan' },
  { letter: 'Y', word: 'Yield', sub: 'documentation' },
]

// AI interaction taxonomy (from the 44 AI-flagged chapters). The `kind` strings
// come verbatim from LuAnn's data.js. Used to render the in-theme AI badges and
// describe the intended interaction on each activity. These are the interactivity
// differentiator (case walk-throughs, patient roleplays, rapid-fire differential
// drills, differential builder, spot-the-red-flags).
export const AI_KINDS: Record<string, { label: string; color: keyof typeof TILE }> = {
  'case walk-through': { label: 'AI Case Walk-through', color: 'magenta' },
  roleplay: { label: 'AI Patient Roleplay', color: 'magenta' },
  'rapid-fire': { label: 'Rapid-Fire Differential Drill', color: 'peri' },
  drill: { label: 'Rapid-Fire Differential Drill', color: 'peri' },
  'differential coach': { label: 'Differential Builder', color: 'purple' },
  'decision coach': { label: 'Decision Coach', color: 'purple' },
  coach: { label: 'AI Coach', color: 'purple' },
}
export function aiKindMeta(kind?: string) {
  if (!kind) return { label: 'AI Interaction', color: 'magenta' as const }
  const key = kind.toLowerCase().trim()
  return AI_KINDS[key] || { label: `AI: ${kind}`, color: 'magenta' as const }
}
