'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldCheck,
  KeyRound,
  FileWarning,
  ScrollText,
  LayoutDashboard,
  Lock,
  Bot,
  ListTodo,
  Cpu,
  Globe,
  Monitor,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAccessRequests } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'

const monitorItems = [
  {
    href: '/dashboard',
    label: 'sidebar.overview',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/agents',
    label: 'sidebar.agents',
    icon: Bot,
  },
  {
    href: '/dashboard/jobs',
    label: 'sidebar.jobs',
    icon: ListTodo,
  },
  {
    href: '/dashboard/models',
    label: 'sidebar.models',
    icon: Cpu,
  },
  {
    href: '/dashboard/network',
    label: 'sidebar.network',
    icon: Globe,
  },
  {
    href: '/dashboard/system',
    label: 'sidebar.system',
    icon: Monitor,
  },
]

const securityItems = [
  {
    href: '/dashboard/policies',
    label: 'sidebar.policies',
    icon: ShieldCheck,
  },
  {
    href: '/dashboard/credentials',
    label: 'sidebar.credentials',
    icon: KeyRound,
  },
  {
    href: '/dashboard/requests',
    label: 'sidebar.requests',
    icon: FileWarning,
  },
  {
    href: '/dashboard/audit',
    label: 'sidebar.audit',
    icon: ScrollText,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { requests } = useAccessRequests()
  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const { t } = useTranslation()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function renderItems(items: typeof monitorItems) {
    return (
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item.href, 'exact' in item ? item.exact : false)
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={active} tooltip={t(item.label)}>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{t(item.label)}</span>
                </Link>
              </SidebarMenuButton>
              {item.href === '/dashboard/requests' && pendingCount > 0 && (
                <SidebarMenuBadge className="bg-destructive/10 text-destructive text-[10px]">
                  {pendingCount}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    )
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-3"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Lock className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">OpenNeo</span>
            <span className="text-[10px] text-muted-foreground">
              {t('sidebar.securityConsole')}
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.monitor')}</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(monitorItems)}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.security')}</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(securityItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-[10px] text-muted-foreground">
          {t('sidebar.version')}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
