// Mom Mastery University brand tokens.
// Derived from the Build Spec V5 (gold #B08442, 6 pillars) and the approved
// walkthrough panels (deep navy sidebar, warm cream, editorial serif headings).
import React from 'react'

export const SERIF: React.CSSProperties = { fontFamily: "'Fraunces', Georgia, serif" }

export const NAVY = '#16283F'        // deep navy sidebar / headings
export const NAVY_SOFT = '#22374F'
export const CREAM = '#F7F3EB'       // app background
export const CARD = '#FFFFFF'
export const CARD_BORDER = '#ECE4D6'
export const GOLD = '#B08442'        // brand gold (Build Spec V5)
export const GOLD_HOVER = '#9C7436'
export const BODY_TEXT = '#4E4A42'
export const MUTED = '#8B857A'

// Soft pastel tiles used for option cards / icons
export const TILE = {
  sage: { bg: '#EAF0E8', fg: '#6F8A6C' },
  gold: { bg: '#F6EBD6', fg: '#B0843F' },
  rose: { bg: '#F7E7DF', fg: '#BE7A5F' },
  navy: { bg: '#E7ECF2', fg: '#16283F' },
  plum: { bg: '#EFE8F0', fg: '#8A6E93' },
  teal: { bg: '#E2EFED', fg: '#5E8F86' },
}

// The 6 Master Mom Certification pillars (Build Spec V5)
export type Pillar = { key: string; name: string; color: string; tile: { bg: string; fg: string }; blurb: string }
export const PILLARS: Pillar[] = [
  { key: 'freedom', name: 'Freedom', color: '#5E8F86', tile: TILE.teal, blurb: 'Release the overwhelm and reclaim your time.' },
  { key: 'faith', name: 'Faith', color: '#B0843F', tile: TILE.gold, blurb: 'Anchor your days in something steady.' },
  { key: 'fitness', name: 'Fitness', color: '#6F8A6C', tile: TILE.sage, blurb: 'Care for the body that carries it all.' },
  { key: 'family', name: 'Family', color: '#BE7A5F', tile: TILE.rose, blurb: 'Connect without losing yourself.' },
  { key: 'fortress', name: 'Fortress', color: '#6E86A8', tile: TILE.navy, blurb: 'Build a home that feels like relief.' },
  { key: 'finances', name: 'Finances', color: '#8A6E93', tile: TILE.plum, blurb: 'Bring calm and confidence to money.' },
]

// The 4 Mom Brain Types (Voice Lens, Build Spec V5). Placeholder copy.
export type BrainType = {
  key: string
  name: string
  tagline: string
  description: string
  tile: { bg: string; fg: string }
}
export const BRAIN_TYPES: Record<string, BrainType> = {
  nurturer: {
    key: 'nurturer',
    name: 'The Overwhelmed Nurturer',
    tagline: 'You pour into everyone. It is your turn.',
    description:
      'You feel everything deeply and give without limit, which is beautiful, and exhausting. Your path starts by refilling your own cup so the love you give comes from overflow, not empty.',
    tile: TILE.rose,
  },
  scanner: {
    key: 'scanner',
    name: 'The Always-On Scanner',
    tagline: 'Your mind never fully clocks out.',
    description:
      'You are three steps ahead, tracking everyone and everything. That radar keeps your family safe, but it rarely rests. Your path begins with quieting the noise so you can hear yourself again.',
    tile: TILE.navy,
  },
  reactor: {
    key: 'reactor',
    name: 'The Big-Hearted Reactor',
    tagline: 'You care so much it comes out sideways.',
    description:
      'You move fast and feel fast. When the day tips over, so do you, and then comes the guilt. Your path is about building a pause between the moment and the reaction.',
    tile: TILE.gold,
  },
  juggler: {
    key: 'juggler',
    name: 'The Steady Juggler',
    tagline: 'So many balls in the air, all at once.',
    description:
      'You keep it all moving, and mostly no one sees the effort. But quietly, you are tired. Your path is about setting a few balls down on purpose, without the world falling apart.',
    tile: TILE.teal,
  },
}
