// SmartOps Academy brand tokens + WT1 course data.
// Derived from DESIGN_SPEC.md (deep navy sidebar, water cyan accents, gold CEU,
// green success). Clean utility/industrial-but-approachable tone.
import React from 'react'
import data from './modules.json'

export const SERIF: React.CSSProperties = {
  fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
}

// Core palette (DESIGN_SPEC brand token table)
export const NAVY = '#0b2a4a' // deep navy sidebar / headings
export const NAVY_DEEP = '#062033'
export const NAVY_SOFT = '#12385c'
export const BLUE = '#1763a6' // primary buttons, links, active nav
export const BLUE_ALT = '#0f7ab5'
export const CYAN = '#2e9bd6' // the drop, accents, journey highlights
export const CYAN_ALT = '#1ea7c5'
export const GOLD = '#c98a14' // CEU / certificate accents
export const GOLD_HOVER = '#a96d08'
export const GREEN = '#1f9d6b' // passed / completed
export const GREEN_ALT = '#127a51'
export const WASH = '#eef6fc' // page background, tiles
export const WASH_ALT = '#cfe2f0'
export const CARD = '#ffffff'
export const CARD_BORDER = '#d7e6f2'
export const BODY_TEXT = '#243b4a'
export const MUTED = '#5b7488'
export const CREAM = WASH // alias so shared page code reads naturally

// Soft tiles for option cards / icons
export const TILE = {
  blue: { bg: '#e3eff8', fg: '#1763a6' },
  cyan: { bg: '#dcf1f8', fg: '#1477a0' },
  gold: { bg: '#f7edd6', fg: '#a96d08' },
  green: { bg: '#dff2ea', fg: '#127a51' },
  navy: { bg: '#e0e9f1', fg: '#0b2a4a' },
  slate: { bg: '#eaf1f7', fg: '#4a6076' },
}

// ---- WT1 course data (single source of truth: _soa/modules.json) ----
export type LevelStatus = 'unlocked' | 'locked'
export type Level = {
  level: number
  code: string
  name: string
  slug: string
  title: string
  status: LevelStatus
  blurb: string
  ceu: number | null
}
export type Chapter = {
  num: number
  title: string
  purpose: string
  interaction: string
  in_production?: boolean
}
export type KnowledgeCheck = {
  pass_mark: number
  questions: string[]
  in_production?: boolean
}
export type ModuleDef = {
  index: number
  slug: string
  title: string
  note?: string
  hero_video?: string | null
  chapters: Chapter[]
  knowledge_check: KnowledgeCheck
}
export type CourseMeta = {
  slug: string
  title: string
  level: number
  ceu: number
  total_modules: number
}

export const COURSE: CourseMeta = (data as any).course
export const LEVELS: Level[] = (data as any).levels
export const MODULES: ModuleDef[] = (data as any).modules

export const PASS_MARK = 70
export const FINAL_PASS_MARK = 80
export const CEU_TOTAL = COURSE.ceu

export function moduleByIndex(index: number): ModuleDef | undefined {
  return MODULES.find((m) => m.index === index)
}
