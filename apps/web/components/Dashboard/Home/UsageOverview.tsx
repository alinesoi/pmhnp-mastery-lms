'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import {
  BookOpen,
  Users,
  ShieldCheck,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useOrg } from '@components/Contexts/OrgContext'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { OrgUsageResponse, getOrgUsage } from '@services/orgs/usage'
import { usePlan } from '@components/Hooks/usePlan'

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free: { bg: 'bg-gray-100', text: 'text-gray-600' },
  oss: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  standard: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pro: { bg: 'bg-purple-100', text: 'text-purple-700' },
  enterprise: { bg: 'bg-amber-100', text: 'text-amber-700' },
}

function getBarColor(usage: number, limit: number | 'unlimited'): string {
  if (limit === 'unlimited') return 'bg-green-500'
  const pct = (usage / (limit as number)) * 100
  if (pct > 90) return 'bg-red-500'
  if (pct > 70) return 'bg-amber-500'
  return 'bg-green-500'
}

function getBarPercent(usage: number, limit: number | 'unlimited'): number {
  if (limit === 'unlimited') return Math.min(usage > 0 ? 30 : 0, 100)
  return Math.min((usage / (limit as number)) * 100, 100)
}

const METER_ICONS: Record<string, React.ComponentType<any>> = {
  Courses: BookOpen,
  Members: Users,
  'Admin Seats': ShieldCheck,
}

export default function UsageOverview() {
  const { t } = useTranslation()
  const org = useOrg() as any
  const session = useLHSession() as any
  const token = session?.data?.tokens?.access_token
  const orgId = org?.id

  const { data: usageData, isLoading } = useQuery<OrgUsageResponse>({
    queryKey: queryKeys.org.usage(orgId),
    queryFn: () => getOrgUsage(orgId, token),
    enabled: !!token && !!orgId,
    staleTime: 60_000,
  })

  const ossMode = usageData?.oss_mode ?? false
  const plan = usePlan()
  const planStyle = PLAN_COLORS[plan] || PLAN_COLORS.free
  const features = usageData?.features

  const meters = features
    ? [
        { key: 'Courses', label: t('dashboard.home.courses'), ...features.courses },
        { key: 'Members', label: t('dashboard.home.members'), ...features.members },
        { key: 'Admin Seats', label: t('dashboard.home.admin_seats'), ...features.admin_seats },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Usage card */}
      <div className="bg-white rounded-xl nice-shadow p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-700">{t('dashboard.home.plan_and_usage')}</h3>
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${planStyle.bg} ${planStyle.text}`}
          >
            {plan === 'oss' ? 'OSS' : plan}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
                <div className="h-2 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {meters.map((meter) => {
              const isUnlimited = ossMode || meter.limit === 'unlimited'
              const limitText = isUnlimited ? t('dashboard.home.unlimited') : String(meter.limit)
              const barColor = isUnlimited
                ? 'bg-green-500'
                : getBarColor(meter.usage, meter.limit)
              const barPercent = isUnlimited
                ? 30
                : getBarPercent(meter.usage, meter.limit)
              const Icon = METER_ICONS[meter.key] || BookOpen

              return (
                <div key={meter.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={13}
                        weight="duotone"
                        className="text-gray-400"
                      />
                      <span className="text-xs font-medium text-gray-600">
                        {meter.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 tabular-nums">
                      {meter.usage} / {limitText}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                  {!isUnlimited && meter.limit_reached && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {t('dashboard.home.limit_reached')}
                    </p>
                  )}
                  {!isUnlimited && !meter.limit_reached && (
                    <p className="text-[10px] text-gray-300 mt-1">
                      {meter.remaining} {t('dashboard.home.remaining')}
                    </p>
                  )}
                </div>
              )
            })}

            {meters.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                {t('dashboard.home.usage_data_unavailable')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
