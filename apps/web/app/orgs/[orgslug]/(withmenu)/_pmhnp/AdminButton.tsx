'use client'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import useAdminStatus from '@components/Hooks/useAdminStatus'
import { PURPLE, PERI } from './theme'

/* Top-right shortcut into the org admin dashboard (/dash).
   NOT /admin: that route is the LearnHouse superadmin dashboard, which is
   disabled in OSS deployments ("Not Available in OSS Mode"). /dash is the real
   org management portal (courses, users, org settings, analytics).
   Rendered for admins only — useAdminStatus returns isAdmin=false for learners,
   so the button never mounts for them. */
export default function AdminButton() {
  const { isAdmin } = useAdminStatus()
  if (!isAdmin) return null

  return (
    <Link
      href="/dash"
      className="fixed z-[65] flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold text-white shadow-md transition-transform hover:scale-[1.03] top-2.5 right-16 md:top-4 md:right-6"
      style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PERI})` }}
      title="Admin Dashboard"
    >
      <ShieldCheck size={16} strokeWidth={2} />
      <span className="hidden sm:inline">Admin Dashboard</span>
    </Link>
  )
}
