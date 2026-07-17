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
export const MUTED = '#6b6280'
export const CREAM = LILAC          // alias so shared page code reads naturally

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
  },
]

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
