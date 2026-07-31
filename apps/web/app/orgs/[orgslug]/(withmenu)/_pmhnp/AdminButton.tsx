'use client'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import useAdminStatus from '@components/Hooks/useAdminStatus'

/* Sidebar entry into the org admin dashboard (/dash), rendered just above the
   Account tab. NOT /admin: that route is the LearnHouse superadmin dashboard,
   disabled in OSS deployments. /dash is the real org management portal.
   Admins only — useAdminStatus returns isAdmin=false for learners, so this
   never mounts for them. */
export default function AdminButton({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useAdminStatus()
  if (!isAdmin) return null

  return (
    <Link
      href="/dash"
      onClick={onNavigate}
      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13.5px] font-medium transition-colors"
      style={{ color: 'rgba(246,243,251,0.6)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      title="Admin Dashboard"
    >
      <ShieldCheck size={17} strokeWidth={1.8} />
      <span>Admin Dashboard</span>
    </Link>
  )
}
